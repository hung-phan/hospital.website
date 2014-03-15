#!/usr/bin/python
"""Database API script"""

from simplemysql import SimpleMysql
import os
import random
import encryption
import re


class Database:

    """Create database from script and handling data input"""

    def __init__(self, db_host, db_user, db_passwd, db_name):
        """Initialize database"""
        self.db = SimpleMysql(
            host=db_host,
            db=db_name,
            user=db_user,
            passwd=db_passwd,
            keep_alive=True
        )

        self.db.query('SET NAMES utf8;')
        self.db.query('SET CHARACTER SET utf8;')
        self.db.query('SET character_set_connection=utf8;')
        try:
            self.db.getOne('user_table', ['username'])
            print 'Database working'
        except Exception:
            print 'Create new database'
            sql_file = open(
                os.path.join(
                    os.path.dirname(
                        os.path.abspath(__file__)
                    ),
                    'sqlscript.sql'
                ), 'r'
            )
            sql_query = ''
            for line in sql_file:
                if line == 'go\n':
                    self.db.query(sql_query)
                    sql_query = ''
                else:
                    sql_query = sql_query + line
            sql_file.close()
            self.register_user('admin', 'admin', 'admin', 'secret')
            self.commit()

    def commit(self):
        """Commit"""
        self.db.conn.commit()

    def username_exist(self, username):
        """Validate username"""
        return True if self.db.getOne(
            'user_table',
            ['username'],
            ('username=%s', [username])
        ) else False

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

        self.db.insert('user_table', {
            'first_name': first_name,
            'last_name': last_name,
            'username': username,
            'password': password,
            'role': 'normal'
        })
        return True

    def login(self, username, password):
        """Check user login data, return true if the
        data is matched with database"""
        user_password = self.db.getOne(
            'user_table',
            ['password'],
            ('username=%s', [username])
        )
        if user_password:
            algo, salt, hsh = user_password[0].split('$')
            return True if hsh == encryption.get_hexdigest(algo,
                                                           salt, password) else False
        else:
            return False

    def get_last_insert_id(self, table):
        """Return last insert id"""
        return self.db.query(
            'select max(id) from %s' % (table)
        ).fetchone()[0]

    def get_no_of_elements(self, table):
        """Return the number of record in specific table"""
        return self.db.query(
            'select count(id) from %s' % (table)
        ).fetchone()[0]

    def get_no_of_elements_filter(self, table, condition):
        """Return the number of record in specific table"""
        return self.db.query(
            'select count(id) from %s where %s' % (table, condition)
        ).fetchone()[0]

    def get_database(self):
        return self.db

    def input_drug(self):
        sql_file = open(
            os.path.join(
                os.path.dirname(
                    os.path.abspath(__file__)
                ),
                'drug.txt'
            ), 'r'
        )
        for line in sql_file:
            li = re.compile("--").split(line)
            self.db.insert('drug_table',
                {
                    'name': li[0],
                    'unit': li[1]
                }        
            )
        sql_file.close()
        self.commit() 

#if __name__ == '__main__':
    #DB = Database('localhost', 'root', 'admin', 'hospital_schema')
    #DB.input_drug()
