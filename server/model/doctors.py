#!/usr/bin/python
"""Doctor model"""

import sql_method
from sql_method import sql_s

class Doctor:
    """Doctors model"""
    
    def __init__(self):
        self.args_list = [
            'name', 
            'address', 
            'phone_number',
            'working_hour',
            'specialist',
            'notice'
        ]

    def query(self, db_, data):
        """Query all doctors"""
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 
            'doctor_table', '1=1 order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max']))
        # return message
        msg = dict()
        
        msg['type'] = 'doctor_handler'
        msg['method'] = 'query'
        msg['noElements'] = db_.get_no_of_elements('doctor_table')

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create doctor list
                doctor = dict()

                # add attributes to doctor
                doctor['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    doctor[self.args_list[i - 1]] = e[i]
                
                # add doctor to elements
                msg['elements'].append(doctor)
        return msg

    def create(self, db_, data):
        """Create doctor"""
        element = data['elements'][0]
        db_.insert_data_to('doctor_table', 
            ','.join(self.args_list), 
            sql_method.create_value({
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s] * len(self.args_list)
            })
        )

        # return message
        msg = dict()
        
        msg['type'] = 'doctor_handler'
        msg['method'] = 'create'

        msg['elements'] = list()
        # create doctor list
        doctor = dict()

        # add attributes to doctor
        doctor['id'] = db_.get_last_insert_id('doctor_table')
        for prop in self.args_list:
            doctor[prop] = element[prop]
        
        # add doctor to elements
        msg['elements'].append(doctor)
        return msg

    def update(self, db_, data):
        """Update doctor"""
        element = data['elements'][0]
        db_.update_data_to('doctor_table', 
            sql_method.update_value(self.args_list, {
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s] * len(self.args_list)
            }) , 'id={0}'.format(element['id'])
        )

        # return message
        msg = dict()
        
        msg['type'] = 'doctor_handler'
        msg['method'] = 'update'

        msg['elements'] = list()
        # create doctor list
        doctor = dict()

        # add attributes to doctor
        doctor['id'] = element['id']
        for prop in self.args_list:
            doctor[prop] = element[prop]
        
        # add doctor to elements
        msg['elements'].append(doctor)
        return msg

    def filter(self, db_, data):
        """Filter data by keyword"""
        filter_condition = sql_method.filter_value(
            self.args_list, 
            data['keyword'])
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 'doctor_table', 
            filter_condition + ' order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max'])
                )

        # return message
        msg = dict()
        
        msg['type'] = 'doctor_handler'
        msg['method'] = 'filter'
        msg['noElements'] = db_.get_no_of_elements_filter(
            'doctor_table', 
            filter_condition    
        )

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create doctor list
                doctor = dict()

                # add attributes to doctor
                doctor['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    doctor[self.args_list[i - 1]] = e[i]
                
                # add doctor to elements
                msg['elements'].append(doctor)
        return msg

    def delete(self, db_, data):
        """Delete doctor with the given id"""
        element = data['elements'][0]
        db_.delete_data_from('doctor_table', 'id={0}'.format(element['id']))

        # return message
        msg = dict()
        
        msg['type'] = 'doctor_handler'
        msg['method'] = 'delete'

        msg['elements'] = list()
        # create doctor list
        doctor = dict()

        # add attributes to doctor
        doctor['id'] = element['id']
        
        # add doctor to elements
        msg['elements'].append(doctor)
        return msg
