#!/usr/bin/python
"""Model template"""

class ModelTemplate:
    """Model template"""
    
    def __init__(self, table_, handler_, args_list_):
        self.table = table_
        self.handler = handler_
        self.args_list = args_list_

    def query(self, db_, data):
        """Query all models"""
        elements = db_.get_database().getAll(
            self.table,
            self.args_list,
            None,
            ['id', 'desc'],
            [(data['page'] - 1) * data['max'], data['max']]
        )

        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'query'
        msg['noElements'] = db_.get_no_of_elements(self.table)
        msg['elements'] = list()
        if elements:
            for e in elements:
                model = dict()
                for i in range(len(self.args_list)):
                    model[self.args_list[i]] = e[i]
                msg['elements'].append(model)
        return msg

    def create(self, db_, data):
        """Create model"""
        element = data['elements'][0]
        db_.get_database().insert(
            self.table,
            element
        )
        db_.commit()

        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'create'
        msg['elements'] = list()
        
        model = dict()
        element['id'] = db_.get_last_insert_id(self.table)
        for prop in self.args_list:
            model[prop] = element[prop]
        msg['elements'].append(model)
        return msg

    def update(self, db_, data):
        """Update model"""
        element = data['elements'][0]
        del element['$$hashKey']
        db_.get_database().update(
            self.table,
            element,
            ('id=%s', [element['id']])
        )
        db_.commit()

        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'update'
        msg['elements'] = list()

        model = dict()
        for prop in self.args_list:
            model[prop] = element[prop]
        msg['elements'].append(model)
        return msg

    def filter(self, db_, data):
        """Filter data by keyword"""
        filter_condition = filter_value(
            self.args_list, 
            data['keyword'])
        elements = db_.get_database().getAll(
            self.table,
            self.args_list,
            [filter_condition],
            ['id', 'desc'],
            [(data['page'] - 1) * data['max'], data['max']]
        )

        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'filter'
        msg['noElements'] = db_.get_no_of_elements_filter(
            self.table, 
            filter_condition    
        )
        msg['elements'] = list()
        if elements:
            for e in elements:
                model = dict()
                for i in range(len(self.args_list)):
                    model[self.args_list[i]] = e[i]
                msg['elements'].append(model)
        return msg

    def delete(self, db_, data):
        """Delete model with the given id"""
        element = data['elements'][0]
        db_.get_database().delete(
            self.table,
            ('id=%s', [element['id']])
        )
        db_.commit()
        
        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'delete'
        msg['elements'] = list()

        model = dict()
        model['id'] = element['id']
        msg['elements'].append(model)
        return msg

def filter_value(parms, keyword):
    """return value filter"""
    return "concat({0}) like '%{1}%'".format(
        ', '.join(parms), keyword
    )
