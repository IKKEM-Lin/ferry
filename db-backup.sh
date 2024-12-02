#!/bin/bash
set -e 

docker compose run -T -u 999 mysql_backup bash <<EOF
set -e 

cd /tmp/backup/data
xtrabackup --backup --host=ferry_mysql --target-dir=/tmp/backup/data --data-dir=/var/lib/mysql --user=root --password=$DB_PASSWORD

EOF
