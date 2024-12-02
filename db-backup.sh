#!/bin/bash
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
