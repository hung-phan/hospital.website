#!/usr/bin/python
"""Database API script."""

import MySQLdb
import os
import random
import encryption

def sql_s(input_):
    """Change normal string to sql string"""
    return "'{0}'".format(input_)

class Database:
    """Create database from script and handling data input"""

    default_role = 'normal'

    def __init__(self, db_host, db_user, db_passwd, db_name):
        """Initialize database"""
        self.conn = MySQLdb.connect(host = db_host, 
            user = db_user, 
            passwd = db_passwd, 
            db = db_name)
        self.cursor = self.conn.cursor()
        # path to sqlscript.sql 
        script_path = os.path.join(os.path.dirname(
            os.path.abspath(__file__)), 'sqlscript.sql')

        if self.get_data_from('username', 'user_table', '1=1') is None:
            print 'Create new database'
            sql_file = open(script_path, 'r')
            sql_query = ''
            for line in sql_file:
                if line == 'go\n':
                    self.cursor.execute(sql_query)
                    sql_query = ''
                else:
                    sql_query = sql_query + line
            sql_file.close()
        else:
            print 'Database working'     

    def username_exist(self, username):
        """Validate username"""
        username_list = self.get_data_from('username', 'user_table', 
            'username={0}'.format(sql_s(username)))
        return True if username_list is not None else False

    def register_user(self, first_name, last_name, username, raw_password):
        """Register player to the database with username 
        and encrypted password"""
        if self.username_exist(username):
            return False
        algo = 'sha1'
        salt = encryption.get_hexdigest(algo, str(random.random()), 
            str(random.random()))[:5]
        hsh = encryption.get_hexdigest(algo, salt, raw_password)
        password = '{0}${1}${2}'.format(algo, salt, hsh)
        self.insert_data_to('user_table', 'first_name, last_name, \
            username, password, role', '{0}, {1}, {2}, {3}, {4}'.format(
            sql_s(first_name), sql_s(last_name), sql_s(username), 
            sql_s(password), sql_s(Database.default_role)))
        return True

    def login(self, username, password):
        """Check user login data, return true if the
        data is matched with database"""
        password_list = self.get_data_from('password', 'user_table', 
            'username={0}'.format(sql_s(username)))
        if password_list is not None:
            algo, salt, hsh = password_list[0][0].split('$')
            return True if hsh == encryption.get_hexdigest(algo, 
                salt, password) else False
        else:
            return False

    def get_last_insert_id(self, table):
        """Return last insert id"""
        self.cursor.execute("select max(id) from {0}".format(table))
        return self.cursor.fetchone()[0]

    def get_no_of_elements(self, table):
        """Return the number of record in specific table"""
        self.cursor.execute("select count(id) from {0}".format(table))
        return self.cursor.fetchone()[0]

    def get_no_of_elements_filter(self, table, condition):
        """Return the number of record in specific table"""
        self.cursor.execute("select count(id) from {0} \
            where {1}".format(table, condition))
        return self.cursor.fetchone()[0]

    def get_data_from(self, what, table, where):
        """Return data from table where data equals value"""
        self.cursor.execute("select {0} from {1} \
            where {2}".format(what, table, where))
        result_list = self.cursor.fetchall()
        return result_list if len(result_list) > 0 else None

    def insert_data_to(self, table, what, value):
        """Insert data to database"""
        self.cursor.execute("insert into {0}({1}) values({2})".format(
            table, what, value))
        self.conn.commit()

    def update_data_to(self, table, what, where):
        """Update data in database"""
        self.cursor.execute("update {0} set {1} where {2}".format(table, 
            what, where))
        self.conn.commit()

    def delete_data_from(self, table, where):
        """Delete data in database"""
        self.cursor.execute("delete from {0} where {1}".format(table, 
            where))
        self.conn.commit()
