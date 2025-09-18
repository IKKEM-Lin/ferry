package service

import (
	"ferry/models/system"
	"regexp"
	"strconv"
	"strings"
)

func getDirectLeaderId(userInfo system.SysUser) (directLeaderId int) {
	// 获取用户的上级
	directLeaderId = -1
	reUserId := regexp.MustCompile(`DirectLeader: \d+`)
	userIdStr := reUserId.FindString(userInfo.Remark)
	if userIdStr != "" {
		userIdStr = strings.Split(userIdStr, ": ")[1]
		val, _ := strconv.Atoi(userIdStr)
		directLeaderId = val
	}
	return
}

func getDeptLeaderIds(tpls []map[string]interface{}) (leaderIds []int) {
	for _, t := range tpls {
		selected, ok := t["__processor__"].([]interface{})
		if !ok {
			return
		}

		for _, v := range selected {
			value := int(v.(float64))
			if value > 0 {
				leaderIds = append(leaderIds, value)
			}
		}
	}
	return
}
