#!/usr/bin/python
"""Patient model"""

import sql_method
from sql_method import sql_s
from sql_method import non_sql_s

class Patient:
    """Patients model"""

    def __init__(self):
        self.args_list = [
            'name',
            'age',
            'gender',
            'address',
            'phone_number'
        ]

    def query(self, db_, data):
        """Query all patients"""
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 
            'patient_table', '1=1 order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max']))
        # return message
        msg = dict()
        
        msg['type'] = 'patient_handler'
        msg['method'] = 'query'
        msg['noElements'] = db_.get_no_of_elements('patient_table')

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create patient list
                patient = dict()

                # add attributes to patient
                patient['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    patient[self.args_list[i - 1]] = e[i]
                
                # add patient to elements
                msg['elements'].append(patient)
        return msg

    def create(self, db_, data):
        """Create patient"""
        element = data['elements'][0]
        db_.insert_data_to('patient_table', 
            ','.join(self.args_list), 
            sql_method.create_value({
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s, non_sql_s, sql_s, sql_s, sql_s]
            })
        )

        # return message
        msg = dict()
        
        msg['type'] = 'patient_handler'
        msg['method'] = 'create'

        msg['elements'] = list()
        # create patient list
        patient = dict()

        # add attributes to patient
        patient['id'] = db_.get_last_insert_id('patient_table')
        for prop in self.args_list:
            patient[prop] = element[prop]
        
        # add patient to elements
        msg['elements'].append(patient)
        return msg

    def update(self, db_, data):
        """Update patient"""
        element = data['elements'][0]
        db_.update_data_to('patient_table', 
            sql_method.update_value(self.args_list, {
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s, non_sql_s, sql_s, sql_s, sql_s]
            }) , 'id={0}'.format(element['id'])
        )

        # return message
        msg = dict()
        
        msg['type'] = 'patient_handler'
        msg['method'] = 'update'

        msg['elements'] = list()
        # create patient list
        patient = dict()

        # add attributes to patient
        patient['id'] = element['id']
        for prop in self.args_list:
            patient[prop] = element[prop]
        
        # add patient to elements
        msg['elements'].append(patient)
        return msg

    def filter(self, db_, data):
        """Filter data by keyword"""
        filter_condition = sql_method.filter_value(
            self.args_list, 
            data['keyword'])
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 'patient_table', 
            filter_condition + ' order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max'])
                )

        # return message
        msg = dict()
        
        msg['type'] = 'patient_handler'
        msg['method'] = 'filter'
        msg['noElements'] = db_.get_no_of_elements_filter(
            'patient_table', 
            filter_condition    
        )

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create patient list
                patient = dict()

                # add attributes to patient
                patient['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    patient[self.args_list[i - 1]] = e[i]
                
                # add patient to elements
                msg['elements'].append(patient)
        return msg

    def delete(self, db_, data):
        """Delete patient with the given id"""
        element = data['elements'][0]
        db_.delete_data_from('patient_table', 'id={0}'.format(element['id']))

        # return message
        msg = dict()
        
        msg['type'] = 'patient_handler'
        msg['method'] = 'delete'

        msg['elements'] = list()
        # create patient list
        patient = dict()

        # add attributes to patient
        patient['id'] = element['id']
        
        # add patient to elements
        msg['elements'].append(patient)
        return msg
