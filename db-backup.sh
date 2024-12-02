#!/bin/bash
set -e 

if [ -z "$DB_PASSWORD" ]; then
    read -s -p "Please enter the db password: " DB_PASSWORD
    echo  # Move to a new line after reading the password
fi

docker compose run -T -u 999 mysql_backup bash <<EOF
set -e 

mkdir -p /tmp/backup/data
cd /tmp/backup/data
xtrabackup --backup --host=ferry_mysql --target-dir=/tmp/backup/data --datadir=/var/lib/mysql --user=root --password=$DB_PASSWORD

EOF
