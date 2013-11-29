#!/usr/bin/python
"""ICD model"""

import sql_method
from sql_method import sql_s

class ICD:
    """ICDs model"""
    
    def __init__(self):
        self.args_list = [
            'name', 
            'code'
        ]

    def query(self, db_, data):
        """Query all icds"""
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 
            'icd_table', '1=1 order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max']))
        # return message
        msg = dict()
        
        msg['type'] = 'icd_handler'
        msg['method'] = 'query'
        msg['noElements'] = db_.get_no_of_elements('icd_table')

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create icd list
                icd = dict()

                # add attributes to icd
                icd['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    icd[self.args_list[i - 1]] = e[i]
                
                # add icd to elements
                msg['elements'].append(icd)
        return msg

    def create(self, db_, data):
        """Create icd"""
        element = data['elements'][0]
        db_.insert_data_to('icd_table', 
            ','.join(self.args_list), 
            sql_method.create_value({
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s] * len(self.args_list)
            })
        )
        # return message
        msg = dict()
        
        msg['type'] = 'icd_handler'
        msg['method'] = 'create'

        msg['elements'] = list()
        # create icd list
        icd = dict()

        # add attributes to icd
        icd['id'] = db_.get_last_insert_id('icd_table')
        for prop in self.args_list:
            icd[prop] = element[prop]
        
        # add icd to elements
        msg['elements'].append(icd)
        return msg

    def update(self, db_, data):
        """Update icd"""
        element = data['elements'][0]
        db_.update_data_to('icd_table', 
            sql_method.update_value(self.args_list, {
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s] * len(self.args_list)
            }) , 'id={0}'.format(element['id'])
        )

        # return message
        msg = dict()
        
        msg['type'] = 'icd_handler'
        msg['method'] = 'update'

        msg['elements'] = list()
        # create icd list
        icd = dict()

        # add attributes to icd
        icd['id'] = element['id']
        for prop in self.args_list:
            icd[prop] = element[prop]
        
        # add icd to elements
        msg['elements'].append(icd)
        return msg

    def filter(self, db_, data):
        """Filter data by keyword"""
        filter_condition = sql_method.filter_value(
            self.args_list, 
            data['keyword'])
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 'icd_table', 
            filter_condition + ' order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max'])
                )

        # return message
        msg = dict()
        
        msg['type'] = 'icd_handler'
        msg['method'] = 'filter'
        msg['noElements'] = db_.get_no_of_elements_filter(
            'icd_table', 
            filter_condition    
        )

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create icd list
                icd = dict()

                # add attributes to icd
                icd['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    icd[self.args_list[i - 1]] = e[i]
                
                # add icd to elements
                msg['elements'].append(icd)
        return msg

    def delete(self, db_, data):
        """Delete icd with the given id"""
        element = data['elements'][0]
        db_.delete_data_from('icd_table', 'id={0}'.format(element['id']))

        # return message
        msg = dict()
        
        msg['type'] = 'icd_handler'
        msg['method'] = 'delete'

        msg['elements'] = list()
        # create icd list
        icd = dict()

        # add attributes to icd
        icd['id'] = element['id']
        
        # add icd to elements
        msg['elements'].append(icd)
        return msg
