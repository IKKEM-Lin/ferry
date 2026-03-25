#!/bin/bash
set -euo pipefail

# 手动处理
# 将文件上传到 static/uploadfile/files/ 目录下，并将文件链接更新到数据库中
# 然后运行以下脚本更新数据库中的文件链接

WORK_ORDER_ID=2424
MYSQL_CMD="mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE --default-character-set=utf8mb4"

$MYSQL_CMD --raw -e "SELECT id, work_order, form_data FROM p_work_order_tpl_data WHERE work_order = $WORK_ORDER_ID"

# 根据返回的数据，更新 form_data 中的文件链接，然后移除 exit 继续
exit 0

$MYSQL_CMD <<EOF
UPDATE p_work_order_tpl_data
SET form_data = '{"file_1729843905000_68409": [{"uid": 1774409008525, "url": "https://iesi-oa.ikkem.com/static/uploadfile/files/cb47451c5d53a17e30415cab13b1098c7d3623be-厦门智储大装置研究院有限公司工资表-3月-手动.xlsx", "name": "厦门智储大装置研究院有限公司工资表-3月-手动.xlsx", "status": "success"}], "editor_1769158255000_64076": "<p>3月五险一金及工资将于3月25日进行发放，现发起付款申请，并于3月25日支出。本次申请金额如下：全职员工实发工资689937.84元、五险一金348036.42元；双聘员工实发工资368930.27元、公积金48488元。综上本次申请金额为1455392.53元。</p>", "select_1729818342000_13892": "行政与基建部", "select_1750236456000_35175": "发改委专项资金"}'
WHERE work_order = $WOKR_ORDER_ID;
EOF

# 再次查询确认更新成功
$MYSQL_CMD --raw -e "SELECT id, work_order, form_data FROM p_work_order_tpl_data WHERE work_order = $WORK_ORDER_ID"