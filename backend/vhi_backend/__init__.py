# Use the pure-Python pymysql driver as a drop-in replacement for mysqlclient,
# so the project runs against MySQL/MariaDB without needing system MySQL dev
# headers installed. This must happen before Django touches the DB backend.
import pymysql

pymysql.install_as_MySQLdb()
