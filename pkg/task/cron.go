package task

import (
	"ferry/global/orm"
	"ferry/models/process"
	"ferry/models/system"
	"ferry/pkg/logger"
	"ferry/pkg/notify"
	"strconv"
	"time"
	"encoding/json"

	"github.com/robfig/cron/v3"
	"github.com/spf13/viper"
)

var cronManager *cron.Cron

// 初始化定时任务
func InitCron() {
	// 调试输出，检查配置
	enableValue := viper.GetBool("settings.workorder.notify.enable")
	logger.Infof("工单通知配置状态: settings.workorder.notify.enable = %v", enableValue)
	
	// 检查是否启用工单通知功能
	if !enableValue {
		logger.Info("工单通知功能未启用")
		return
	}

	cronManager = cron.New(cron.WithSeconds())
	
	// 从配置文件读取cron表达式
	cronExpression := viper.GetString("settings.workorder.notify.cron")
	if cronExpression == "" {
		cronExpression = "0 0 10 * * 3" // 默认每周三中午10点执行(注意是docker容器的时区，可能为0时区)
	}
	
	// 添加定时任务
	_, err := cronManager.AddFunc(cronExpression, notifyPendingWorkOrders)
	if err != nil {
		logger.Errorf("添加工单通知定时任务失败: %v", err)
		return
	}
	
	// 启动定时任务
	cronManager.Start()
	logger.Info("工单通知定时任务已启动，cron表达式: " + cronExpression)
}

// 通知待处理的工单
func notifyPendingWorkOrders() {
	// 从配置文件读取超时天数
	timeoutDays := viper.GetInt("settings.workorder.notify.timeout_days")
	if timeoutDays < 0 {
		timeoutDays = 3 // 默认3天
	}
	
	// 计算超时日期
	timeoutDate := time.Now().AddDate(0, 0, -timeoutDays)
	lastYearDate := time.Now().AddDate(0, 0, -365)
	
	logger.Infof("CRON: 开始检查超过%d天未处理的工单", timeoutDays)
	
	var workOrders []process.WorkOrderInfo
	err := orm.Eloquent.Model(&process.WorkOrderInfo{}).
		Where("is_end = ?", 0).  // 未结束的工单
		Where("update_time < ?", timeoutDate). // 超过指定天数的工单
		Where("update_time > ?", lastYearDate). // 只查询最近一年的工单
		Find(&workOrders).Error
	
	if err != nil {
		logger.Errorf("CRON: 查询超时工单失败: %v", err)
		return
	}

	workOrderCounts := len(workOrders)
	
	logger.Info("CRON: 找到 ", workOrderCounts, " 个超时未结束工单待筛选")
	
	if workOrderCounts == 0 {
		return
	}
	
	filteredWorkOrders := make([]process.WorkOrderInfo, 0)
	// 遍历工单列表，筛选出需要发送通知的工单
	for _, workOrder := range workOrders {
		workOrderCreator := workOrder.Creator

		// workOrder.State 是一个 JSON 字符串，反序列化为 []map[string]interface{}
		var stateList []map[string]interface{}
		err = json.Unmarshal([]byte(workOrder.State), &stateList)
		if err != nil {
			logger.Errorf("CRON: 反序列化工单状态失败, 工单ID: %d, 错误: %v", workOrder.Id, err)
			continue
		}
		// 获取工单创建者的ID
		skipOrder := true
		for _, stateItem := range stateList {
			if stateItem["process_method"] == "person" {
				processorList := stateItem["processor"].([]interface{})
				for _, processor := range processorList {
					// 比较processor与workOrderCreator，注意类型
					// processor 是 interface{} 类型，需要转换为 int
					processorID, ok := processor.(float64)
					if !ok {
						logger.Errorf("CRON: 处理人ID转换失败, 工单ID: %d, 处理人: %v", workOrder.Id, processor)
						continue
					}
					// 如果处理人ID与工单创建者ID相同，则跳过该工单
					if int(processorID) == workOrderCreator {
						skipOrder = false
						break
					}
				}
			}
			if !skipOrder {
				break
			}
		}
		if skipOrder {
			continue
		}
		filteredWorkOrders = append(filteredWorkOrders, workOrder)
	}
	if len(filteredWorkOrders) == 0 {
		logger.Info("CRON: 没有需要发送通知的工单")
		return
	}
	// 按照人员进行归类
	workOrderMap := make(map[int][]process.WorkOrderInfo)
	for _, workOrder := range filteredWorkOrders {
		workOrderCreator := workOrder.Creator
		if _, ok := workOrderMap[workOrderCreator]; !ok {
			workOrderMap[workOrderCreator] = make([]process.WorkOrderInfo, 0)
		}
		workOrderMap[workOrderCreator] = append(workOrderMap[workOrderCreator], workOrder)
	}
	sentOrderCache := make(map[string][]process.WorkOrderInfo)
	// 遍历工单列表，发送通知
	for workOrderCreator, workOrders := range workOrderMap {
		if len(workOrders) == 0 {
			continue
		}
		workOrder := workOrders[0] // 取第一个工单作为代表
		// 获取工单创建者信息
		var creator system.SysUser
		err = orm.Eloquent.Model(&system.SysUser{}).
			Where("user_id = ?", workOrderCreator).
			Find(&creator).Error
		
		if err != nil {
			logger.Errorf("CRON: 查询工单创建者信息失败, 工单ID: %d, 错误: %v", workOrder.Id, err)
			continue
		}
		// 发送通知
		sendNotificationToCreator(workOrders, creator, timeoutDays)
		sentOrderCache[creator.NickName] = workOrders
	}
	
	managerEmail := viper.GetString("settings.workorder.notify.manager_email")
	if managerEmail != "" {
		sendNotificationToManager(sentOrderCache, managerEmail, timeoutDays)
	}
}

func workOrdersToTickets (workOrders []process.WorkOrderInfo, nickName string) []notify.Ticket {
	tickets := make([]notify.Ticket, 0)
	for _, workOrder := range workOrders {
		PriorityValue := "正常"
		switch workOrder.Priority {
		case 1:
			PriorityValue = "正常"
		case 2:
			PriorityValue = "紧急"
		case 3:
			PriorityValue = "非常紧急"
		}
		ticket := notify.Ticket{
			Id:            workOrder.Id,
			Title:         workOrder.Title,
			Creator:       nickName,
			PriorityValue: PriorityValue,
			CreatedAt:     workOrder.CreatedAt.Format("2006-01-02 15:04:05"),
		}
		tickets = append(tickets, ticket)
	}
	return tickets
}

func sendNotificationToManager(workOrdersCache map[string][]process.WorkOrderInfo, managerEmail string, timeoutDays int) {
	tickets := make([]notify.Ticket, 0)
	// 遍历workOrdersCache用于生成tickets
	for nickName, workOrders := range workOrdersCache {
		userTickets := workOrdersToTickets(workOrders, nickName)
		tickets = append(tickets, userTickets...)
	}
	ticketLen := len(tickets)

	// 创建通知内容
	bodyData := notify.BodyData{
		SendTo: map[string]interface{}{
			"emailList": []string{managerEmail},
		},
		EmailCcTo:     []string{},
		Subject:       "系统超时工单统计",
		Description:   "当前系统有 " + strconv.Itoa(ticketLen) + " 条工单已超过" + strconv.Itoa(timeoutDays) + "天未处理（在创建者名下等待处理），请及时关注",
		Classify:      []int{1}, // 只通过邮件发送
		Tickets:       tickets,
	}
	
	// 发送通知
	err := bodyData.SendNotify()
	if err != nil {
		logger.Errorf("CRON: 发送超时工单统计失败, 错误: %v", err)
		return
	}
	
	logger.Infof("CRON: 已发送超时工单统计, 管理者邮箱: %s", managerEmail)
}

// 发送通知给工单创建者
func sendNotificationToCreator(workOrders []process.WorkOrderInfo, creator system.SysUser, timeoutDays int) {
	if creator.Email == "" {
		logger.Warnf("CRON: 创建者邮箱为空，无法发送通知, 创建者ID: %d", creator.UserId)
		return
	}

	orderLen := len(workOrders)
	tickets := workOrdersToTickets(workOrders, creator.NickName)
	// 创建通知内容
	bodyData := notify.BodyData{
		SendTo: map[string]interface{}{
			"userList": []system.SysUser{creator},
		},
		EmailCcTo:     []string{},
		Subject:       "工单超时提醒",
		Description:   "您有 " + strconv.Itoa(orderLen) + " 条工单已超过" + strconv.Itoa(timeoutDays) + "天未处理（由您创建并在您名下等待处理），请及时关注",
		Classify:      []int{1}, // 只通过邮件发送
		Tickets:       tickets,
	}
	
	// 发送通知
	err := bodyData.SendNotify()
	if err != nil {
		logger.Errorf("CRON: 发送超时工单通知失败, 创建者ID: %d, 错误: %v", creator.UserId, err)
		return
	}
	
	logger.Infof("CRON: 已发送超时工单通知, 创建者ID: %d, 创建者: %s, 邮箱: %s", creator.UserId, creator.NickName, creator.Email)
}