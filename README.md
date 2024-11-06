## 基于Gin + Vue + Element UI前后端分离的工单系统

本项目基于[https://github.com/lanyulei/ferry](https://github.com/lanyulei/ferry)进行修改。

## 常见问题
**如何配置邮件通知**

```config/settings.yml```中改动 domain（用于邮件内跳转） 及 email 相关配置，注意邮箱需开启smtp服务


**排他网关的逻辑处理**

从排他网关引出的所有线条间关系为"或"，单条线内不同条件间的关系为"且"。

注意：从排他网关引出的所有线条逻辑关系需闭合。

单条线内条件表达式示例(支持数值、字符串、布尔值等类型)：

```
[
    {"key":"device_cost","sign":"<","value": 200000},
    {"key":"software_cost","sign":">","value": 200000},
    {"key":"test1_cost","sign":"==","value": 200000},
    {"key":"test2_cost","sign":"!=","value": 200000},
    {"key":"database_cost","sign":"<=","value": 200000},
    {"key":"other_cost","sign":">=","value": 200000}
]
```


**如何用xtrabackup恢复数据库数据**
假定已有数据库xtrabackup备份文件夹./data，则：
```
docker pull percona/percona-xtrabackup

docker run --rm  -v ./data:/backup -v ./mysql/db:/var/lib/mysql percona/percona-xtrabackup xtrabackup  --prepare --target-dir=/backup

docker run --rm  -v ./data:/backup -v ./mysql/db:/var/lib/mysql percona/percona-xtrabackup xtrabackup  --copy-back --target-dir=/backup
```
务必注意./mysql/db必须开放w权限，最好是在docker-compose运行前就建好对应文件夹