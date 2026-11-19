#!/bin/sh
# Runs once, when the MySQL data volume is first created (docker-entrypoint-initdb.d).
# Creates the isolated database used by the PHPUnit suite and grants the
# application user (MYSQL_USER) access to it. Tests never use the dev database.
set -e

mysql --protocol=socket -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`carshowcase_test\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON \`carshowcase_test\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL
