#!/bin/bash

# Backup the database using xtrabackup
# In docker-compose.yml, add the following service:
#
# version: '3'
# services:
#
#   mysql_backup:
#     image: perconalab/percona-xtrabackup:8.4.0-1
#     container_name: mysql_backup
#     volumes:
#       - './mysql/db:/var/lib/mysql'
#       - './backup:/tmp/backup'
#     depends_on:
#       - ferry_mysql
#
# add this script to crontab to run daily
# 5 5 * * * DB_PASSWORD=your_db_password /path/to/db-backup.sh

cd $(dirname "$0")
set -e

TODAY=$(date +%Y-%m-%d)

if [ -f ./backup/$TODAY.tar.xz ]; then
    echo "Backup already exists for today"
    exit 0
fi

if [ -z "$DB_PASSWORD" ]; then
    read -s -p "Please enter the db password: " DB_PASSWORD
    echo  # Move to a new line after reading the password
fi

docker compose run -T -u 999 mysql_backup bash <<EOF
set -e

mkdir -p /tmp/backup/data
cd /tmp/backup/data
xtrabackup --backup --host=ferry_mysql --target-dir=./ --datadir=/var/lib/mysql --user=root --password=$DB_PASSWORD

tar -cf ../$TODAY.tar .
chmod 666 ../$TODAY.tar
rm -rf /tmp/backup/data
EOF

( cd ./backup && xz -z $TODAY.tar )
