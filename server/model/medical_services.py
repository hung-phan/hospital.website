#!/usr/bin/python
"""MedicalService model"""

import sql_method
from sql_method import sql_s
from sql_method import non_sql_s

class MedicalService:
    """MedicalServices model"""

    def __init__(self):
        self.args_list = [
            'name',
            'price'
        ]

    def query(self, db_, data):
        """Query all medical_services"""
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 
            'medical_service_table', '1=1 order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max']))
        # return message
        msg = dict()
        
        msg['type'] = 'medical_service_handler'
        msg['method'] = 'query'
        msg['noElements'] = db_.get_no_of_elements('medical_service_table')

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create medical_service list
                medical_service = dict()

                # add attributes to medical_service
                medical_service['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    medical_service[self.args_list[i - 1]] = e[i]
                
                # add medical_service to elements
                msg['elements'].append(medical_service)
        return msg

    def create(self, db_, data):
        """Create medical_service"""
        element = data['elements'][0]
        db_.insert_data_to('medical_service_table', 
            ','.join(self.args_list), 
            sql_method.create_value({
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s, non_sql_s, sql_s, sql_s, sql_s]
            })
        )

        # return message
        msg = dict()
        
        msg['type'] = 'medical_service_handler'
        msg['method'] = 'create'

        msg['elements'] = list()
        # create medical_service list
        medical_service = dict()

        # add attributes to medical_service
        medical_service['id'] = db_.get_last_insert_id('medical_service_table')
        for prop in self.args_list:
            medical_service[prop] = element[prop]
        
        # add medical_service to elements
        msg['elements'].append(medical_service)
        return msg

    def update(self, db_, data):
        """Update medical_service"""
        element = data['elements'][0]
        db_.update_data_to('medical_service_table', 
            sql_method.update_value(self.args_list, {
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s, non_sql_s, sql_s, sql_s, sql_s]
            }) , 'id={0}'.format(element['id'])
        )

        # return message
        msg = dict()
        
        msg['type'] = 'medical_service_handler'
        msg['method'] = 'update'

        msg['elements'] = list()
        # create medical_service list
        medical_service = dict()

        # add attributes to medical_service
        medical_service['id'] = element['id']
        for prop in self.args_list:
            medical_service[prop] = element[prop]
        
        # add medical_service to elements
        msg['elements'].append(medical_service)
        return msg

    def filter(self, db_, data):
        """Filter data by keyword"""
        filter_condition = sql_method.filter_value(
            self.args_list, 
            data['keyword'])
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 'medical_service_table', 
            filter_condition + ' order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max'])
                )

        # return message
        msg = dict()
        
        msg['type'] = 'medical_service_handler'
        msg['method'] = 'filter'
        msg['noElements'] = db_.get_no_of_elements_filter(
            'medical_service_table', 
            filter_condition    
        )

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create medical_service list
                medical_service = dict()

                # add attributes to medical_service
                medical_service['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    medical_service[self.args_list[i - 1]] = e[i]
                
                # add medical_service to elements
                msg['elements'].append(medical_service)
        return msg

    def delete(self, db_, data):
        """Delete medical_service with the given id"""
        element = data['elements'][0]
        db_.delete_data_from('medical_service_table', 'id={0}'.format(element['id']))

        # return message
        msg = dict()
        
        msg['type'] = 'medical_service_handler'
        msg['method'] = 'delete'

        msg['elements'] = list()
        # create medical_service list
        medical_service = dict()

        # add attributes to medical_service
        medical_service['id'] = element['id']
        
        # add medical_service to elements
        msg['elements'].append(medical_service)
        return msg
