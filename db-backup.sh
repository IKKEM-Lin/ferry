#!/bin/bash
cd $(dirname "$0")
set -e

if [ -z "$DB_PASSWORD" ]; then
    read -s -p "Please enter the db password: " DB_PASSWORD
    echo  # Move to a new line after reading the password
fi


TODAY=$(date +%Y-%m-%d)
BACKUP_DIR=/tmp/backup/$TODAY

docker compose run -T -u 999 mysql_backup bash <<EOF
set -e

if [ -d "$BACKUP_DIR" ]; then
    echo "The directory $BACKUP_DIR already exists. Exiting."
    exit 0
fi

mkdir -p $BACKUP_DIR
cd $BACKUP_DIR
xtrabackup --backup --host=ferry_mysql --target-dir=$BACKUP_DIR --datadir=/var/lib/mysql --user=root --password=$DB_PASSWORD

tar -cf ../$TODAY.tar .
chmod 666 ../$TODAY.tar
( cd .. && rm -rf $BACKUP_DIR )
EOF

( cd ./backup && xz -z $TODAY.tar )
