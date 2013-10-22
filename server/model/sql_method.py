#!/usr/bin/python

"""Sql method"""

def sql_s(input_):
    """convert to sql string"""
    return "'{0}'".format(input_)

def non_sql_s(input_):
    """Just convert it to string"""
    return str(input_)

def create_value(dispatcher):
    """return the created value after join
    Template: a, b, c, d"""
    return ','.join([dispatcher['method'][i](dispatcher['value'][i]) \
        for i in range(len(dispatcher['value']))])

def update_value(parms, dispatcher):
    """return the updated value after join
    Template: a = b, c = d, e = f"""
    values = [dispatcher['method'][i](dispatcher['value'][i]) \
        for i in range(len(dispatcher['value']))]
    return ','.join([parms[i] + '=' + values[i] for i in range(len(parms))])

def filter_value(parms, keyword):
    """return value filter"""
    return "concat({0}) like concat('%', '{1}', '%')" \
        .format(', '.join(parms), keyword)
