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
