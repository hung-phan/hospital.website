#!/usr/bin/python
"""Global handler"""

from observer_pattern import Observable
from model.doctors import Doctor

class GlobalHandler(Observable):
    """GlobalHandler class"""

    def __init__(self, database_):
        """Init"""
        super(GlobalHandler, self).__init__()
        self.database = database_

        # create handler
        doctor_handler = Doctor()

        # switch statement
        self.switch = {
        	'doctor_handler' : {
        		'query' : doctor_handler.query,
        		'create' : doctor_handler.create,
        		'update' : doctor_handler.update,
        		'filter' : doctor_handler.filter,
        		'delete' : doctor_handler.delete
        	}
        }

    def handle(self, msg):
        """Handle custom message from client"""
        # print msg
        self.simple_notify(
        	self.switch[msg['type']][msg['method']](
        		self.database, msg
        	)
        )