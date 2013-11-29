#!/usr/bin/python
"""Drug model"""

import sql_method
from sql_method import sql_s
from sql_method import non_sql_s

class Drug:
    """Drugs model"""

    def __init__(self):
        self.args_list = [
            'name',
            'unit',
            'price'
        ]

    def query(self, db_, data):
        """Query all drugs"""
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 
            'drug_table', '1=1 order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max']))
        # return message
        msg = dict()
        
        msg['type'] = 'drug_handler'
        msg['method'] = 'query'
        msg['noElements'] = db_.get_no_of_elements('drug_table')

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create drug list
                drug = dict()

                # add attributes to drug
                drug['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    drug[self.args_list[i - 1]] = e[i]
                
                # add drug to elements
                msg['elements'].append(drug)
        return msg

    def create(self, db_, data):
        """Create drug"""
        element = data['elements'][0]
        db_.insert_data_to('drug_table', 
            ','.join(self.args_list), 
            sql_method.create_value({
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s, sql_s, non_sql_s]
            })
        )

        # return message
        msg = dict()
        
        msg['type'] = 'drug_handler'
        msg['method'] = 'create'

        msg['elements'] = list()
        # create drug list
        drug = dict()

        # add attributes to drug
        drug['id'] = db_.get_last_insert_id('drug_table')
        for prop in self.args_list:
            drug[prop] = element[prop]
        
        # add drug to elements
        msg['elements'].append(drug)
        return msg

    def update(self, db_, data):
        """Update drug"""
        element = data['elements'][0]
        db_.update_data_to('drug_table', 
            sql_method.update_value(self.args_list, {
                'value' : [element[prop] for prop in self.args_list],
                'method' : [sql_s, sql_s, non_sql_s]
            }) , 'id={0}'.format(element['id'])
        )

        # return message
        msg = dict()
        
        msg['type'] = 'drug_handler'
        msg['method'] = 'update'

        msg['elements'] = list()
        # create drug list
        drug = dict()

        # add attributes to drug
        drug['id'] = element['id']
        for prop in self.args_list:
            drug[prop] = element[prop]
        
        # add drug to elements
        msg['elements'].append(drug)
        return msg

    def filter(self, db_, data):
        """Filter data by keyword"""
        filter_condition = sql_method.filter_value(
            self.args_list, 
            data['keyword'])
        elements = db_.get_data_from('{0}, {1}'.format(
            'id', ', '.join(self.args_list)), 'drug_table', 
            filter_condition + ' order by id desc \
                limit {0}, {1}'.format(
                    (data['page'] - 1) * data['max'],
                    data['max'])
                )

        # return message
        msg = dict()
        
        msg['type'] = 'drug_handler'
        msg['method'] = 'filter'
        msg['noElements'] = db_.get_no_of_elements_filter(
            'drug_table', 
            filter_condition    
        )

        msg['elements'] = list()
        if elements is not None:
            for e in elements:
                # create drug list
                drug = dict()

                # add attributes to drug
                drug['id'] = e[0]
                for i in range(1, len(self.args_list) + 1):
                    drug[self.args_list[i - 1]] = e[i]
                
                # add drug to elements
                msg['elements'].append(drug)
        return msg

    def delete(self, db_, data):
        """Delete drug with the given id"""
        element = data['elements'][0]
        db_.delete_data_from('drug_table', 'id={0}'.format(element['id']))

        # return message
        msg = dict()
        
        msg['type'] = 'drug_handler'
        msg['method'] = 'delete'

        msg['elements'] = list()
        # create drug list
        drug = dict()

        # add attributes to drug
        drug['id'] = element['id']
        
        # add drug to elements
        msg['elements'].append(drug)
        return msg
