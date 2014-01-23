#!/usr/bin/python
"""MedicalHistory model"""
from collections import namedtuple


class MedicalHistory:

    """Medical historys model"""

    def __init__(self, database_):
        self.handler = 'medical_history_handler'
        self.args_list = [
            'id',
            'visit_date',
            'patient_name',
            'icd_code',
            'outcome'
        ]
        self.prescription_args_list = [
            'id',
            'medical_history_id',
            'doctor_name',
            'drug_name',
            'quantity',
            'dose',
            'notice'
        ]
        self.lab_order_args_list = [
            'id',
            'medical_history_id',
            'doctor_name',
            'result'
        ]
        self.service_args_list = [
            'id',
            'medical_history_id',
            'service_type',
            'medical_service_name'
        ]
        self.database = database_

    def query(self, data):
        """Query all medical histories"""
        medical_histories = self.database.get_database().getAll(
            'medical_history_table',
            self.args_list,
            None,
            ['id', 'desc'],
            [(data['page'] - 1) * data['max'], data['max']]
        )

        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'query'
        msg['elements'] = list()
        msg['noElements'] = self.database.get_no_of_elements(
            'medical_history_table')

        if medical_histories:
            for _element in medical_histories:
                medical_history = dict()
                medical_history['id'] = _element[0]
                medical_history['visit_date'] = _element[1]
                medical_history['patient_name'] = _element[2]
                medical_history['icd_code'] = _element[3]
                medical_history['outcome'] = _element[4]

                # prescriptions
                prescriptions = self.database.get_database().getAll(
                    'prescription_table',
                    self.prescription_args_list,
                    ('medical_history_id=%s', [_element[0]])
                )

                medical_history['prescriptions'] = dict()
                medical_history['prescriptions']['data'] = list()

                if prescriptions:
                    for detail in prescriptions:
                        element = dict()
                        element['id'] = detail[0]
                        medical_history['prescriptions'][
                            'doctor_name'] = detail[2]
                        element['drug_name'] = detail[3]
                        element['quantity'] = detail[4]
                        element['dose'] = detail[5]
                        element['notice'] = detail[6]
                        medical_history['prescriptions']['data'].append(element)

                # labaratories
                labaratory_orders = self.database.get_database().getAll(
                    'labaratory_order_table',
                    self.lab_order_args_list,
                    ('medical_history_id=%s', [_element[0]])
                )

                medical_history['lab_orders'] = dict()
                medical_history['lab_orders']['data'] = list()

                if labaratory_orders:
                    for detail in labaratory_orders:
                        element = dict()
                        element['id'] = detail[0]
                        medical_history['lab_orders']['doctor_name'] = detail[2]
                        element['result'] = detail[3]
                        medical_history['lab_orders']['data'].append(element)

                # services
                services = self.database.get_database().getAll(
                    'service_table',
                    self.service_args_list,
                    ('medical_history_id=%s', [_element[0]])
                )

                medical_history['services'] = dict()
                medical_history['services']['data'] = list()

                if services:
                    for detail in services:
                        element = dict()
                        element['id'] = detail[0]
                        medical_history['services']['service_type'] = detail[2]
                        element['medical_service_name'] = detail[3]
                        medical_history['services']['data'].append(element)

                msg['elements'].append(medical_history)

        return msg

    def create(self, data):
        """Create medical history"""
        element = data['elements'][0]

        # medical_history_table
        self.database.get_database().insert(
            'medical_history_table',
            {
                'visit_date': element['visit_date'],
                'patient_name': element['patient_name'],
                'icd_code': element['icd_code'],
                'outcome': element['outcome']
            }
        )
        medical_history_id = self.database.get_last_insert_id(
            'medical_history_table')

        # prescriptions
        for datum in element['prescriptions']['data']:
            tmp = dict(datum)
            tmp['medical_history_id'] = medical_history_id
            tmp['doctor_name'] = element['prescriptions']['doctor_name']
            self.database.get_database().insert(
                'prescription_table', tmp
            )
            datum['id'] = self.database.get_last_insert_id(
                'prescription_table')

        # lab orders
        for datum in element['lab_orders']['data']:
            tmp = dict(datum)
            tmp['medical_history_id'] = medical_history_id
            tmp['doctor_name'] = element['lab_orders']['doctor_name']
            self.database.get_database().insert(
                'labaratory_order_table', tmp
            )
            datum['id'] = self.database.get_last_insert_id(
                'labaratory_order_table')

        # medical services
        for datum in element['services']['data']:
            tmp = dict(datum)
            tmp['medical_history_id'] = medical_history_id
            tmp['service_type'] = element['services']['service_type']
            self.database.get_database().insert(
                'service_table', tmp
            )
            datum['id'] = self.database.get_last_insert_id(
                'service_table')

        self.database.commit()

        # return message
        msg = dict()

        msg['type'] = self.handler
        msg['method'] = 'create'
        msg['elements'] = list()

        msg['elements'].append({
            'id': medical_history_id,
            'visit_date': element['visit_date'],
            'patient_name': element['patient_name'],
            'icd_code': element['icd_code'],
            'outcome': element['outcome'],
            'prescriptions': {
                'doctor_name': element['prescriptions']['doctor_name'],
                'data': element['prescriptions']['data']
            },
            'lab_orders': {
                'doctor_name': element['lab_orders']['doctor_name'],
                'data': element['lab_orders']['data']
            },
            'services': {
                'service_type': element['services']['service_type'],
                'data': element['services']['data']
            }
        })

        return msg

    def update(self, data):
        """Update medical histories"""
        element = data['elements'][0]

        # medical history
        self.database.get_database().update(
            'medical_history_table',
            {
                'visit_date': element['visit_date'],
                'patient_name': element['patient_name'],
                'icd_code': element['icd_code'],
                'outcome': element['outcome']
            },
            ('id=%s', [element['id']])
        )

        # prescription
        omitted_details = omitted_detail_from(
            self.database.get_database().getAll(
                'prescription_table',
                ['id'],
                ('medical_history_id=%s', [element['id']])
            )
        )
        for datum in element['prescriptions']['data']:
            record = {
                'doctor_name': element['prescriptions']['doctor_name'],
                'drug_name': datum['drug_name'],
                'quantity': datum['quantity'],
                'dose': datum['dose'],
                'notice': datum['notice']
            }
            if datum.has_key('id'):
                omitted_details.discard(datum['id'])
                self.database.get_database().update(
                    'prescription_table',
                    record,
                    ('id=%s', [datum['id']])
                )
            else:
                record['medical_history_id'] = element['id']
                self.database.get_database().insert(
                    'prescription_table',
                    record
                )
                datum['id'] = self.database.get_last_insert_id(
                    'prescription_table')
        remove_from_database(
            self.database, 'prescription_table', omitted_details)

        # lab order
        omitted_details = omitted_detail_from(
            self.database.get_database().getAll(
                'labaratory_order_table',
                ['id'],
                ('medical_history_id=%s', [element['id']])
            )
        )
        for datum in element['lab_orders']['data']:
            record = {
                'doctor_name': element['lab_orders']['doctor_name'],
                'result': datum['result']
            }
            if datum.has_key('id'):
                omitted_details.discard(datum['id'])
                self.database.get_database().update(
                    'labaratory_order_table',
                    record,
                    ('id=%s', [datum['id']])
                )
            else:
                record['medical_history_id'] = element['id']
                self.database.get_database().insert(
                    'labaratory_order_table',
                    record
                )
                datum['id'] = self.database.get_last_insert_id(
                    'labaratory_order_table')
        remove_from_database(
            self.database, 'labaratory_order_table', omitted_details)

        # service
        omitted_details = omitted_detail_from(
            self.database.get_database().getAll(
                'service_table',
                ['id'],
                ('medical_history_id=%s', [element['id']])
            )
        )
        for datum in element['services']['data']:
            record = {
                'service_type': element['services']['service_type'],
                'medical_service_name': datum['medical_service_name']
            }
            if datum.has_key('id'):
                omitted_details.discard(datum['id'])
                self.database.get_database().update(
                    'service_table',
                    record,
                    ('id=%s', [datum['id']])
                )
            else:
                record['medical_history_id'] = element['id']
                self.database.get_database().insert(
                    'service_table',
                    record
                )
                datum['id'] = self.database.get_last_insert_id(
                    'service_table')
        remove_from_database(
            self.database, 'service_table', omitted_details)

        self.database.commit()

        # return message
        msg = dict()

        msg['type'] = self.handler
        msg['method'] = 'update'
        msg['elements'] = list()

        self.database.get_last_insert_id('medical_history_table')
        msg['elements'].append({
            'id': element['id'],
            'visit_date': element['visit_date'],
            'patient_name': element['patient_name'],
            'icd_code': element['icd_code'],
            'outcome': element['outcome'],
            'prescriptions': {
                'doctor_name': element['prescriptions']['doctor_name'],
                'data': element['prescriptions']['data']
            },
            'lab_orders': {
                'doctor_name': element['lab_orders']['doctor_name'],
                'data': element['lab_orders']['data']
            },
            'services': {
                'service_type': element['services']['service_type'],
                'data': element['services']['data']
            }
        })

        return msg

    def filter(self, data):
        """Filter data by keyword"""
        filter_condition = filter_value(
            [
                'medical_history_table.visit_date',
                'medical_history_table.patient_name',
                'medical_history_table.icd_code',
                'medical_history_table.outcome',
                'prescription_table.doctor_name',
                'labaratory_order_table.doctor_name'
            ],
            data['keyword']
        )

        medical_histories = self.leftJoin(
            'medical_history_table',
            self.args_list,
            (
                'prescription_table',
                'labaratory_order_table'
            ),
            (
                'medical_history_table.id = prescription_table.medical_history_id',
                'medical_history_table.id = labaratory_order_table.medical_history_id'
            ),
            [filter_condition],
            ['medical_history_table.id'],
            [(data['page'] - 1) * data['max'], data['max']]
        )
        
        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'filter'
        msg['elements'] = list()
        elements = self.leftJoin(
            'medical_history_table',
            ['id'],
            (
                'prescription_table',
                'labaratory_order_table'
            ),
            (
                'medical_history_table.id = prescription_table.medical_history_id',
                'medical_history_table.id = labaratory_order_table.medical_history_id'
            ),
            [filter_condition],
            ['medical_history_table.id']
        )
        msg['noElements'] = len(elements) if elements else 0
        if medical_histories:
            for _element in medical_histories:
                medical_history = dict()
                medical_history['id'] = _element[0]
                medical_history['visit_date'] = _element[1]
                medical_history['patient_name'] = _element[2]
                medical_history['icd_code'] = _element[3]
                medical_history['outcome'] = _element[4]

                # prescriptions
                prescriptions = self.database.get_database().getAll(
                    'prescription_table',
                    self.prescription_args_list,
                    ('medical_history_id=%s', [_element[0]])
                )

                medical_history['prescriptions'] = dict()
                medical_history['prescriptions']['data'] = list()

                if prescriptions:
                    for detail in prescriptions:
                        element = dict()
                        element['id'] = detail[0]
                        medical_history['prescriptions'][
                            'doctor_name'] = detail[2]
                        element['drug_name'] = detail[3]
                        element['quantity'] = detail[4]
                        element['dose'] = detail[5]
                        element['notice'] = detail[6]
                        medical_history['prescriptions']['data'].append(element)

                # labaratories
                labaratory_orders = self.database.get_database().getAll(
                    'labaratory_order_table',
                    self.lab_order_args_list,
                    ('medical_history_id=%s', [_element[0]])
                )

                medical_history['lab_orders'] = dict()
                medical_history['lab_orders']['data'] = list()

                if labaratory_orders:
                    for detail in labaratory_orders:
                        element = dict()
                        element['id'] = detail[0]
                        medical_history['lab_orders']['doctor_name'] = detail[2]
                        element['result'] = detail[3]
                        medical_history['lab_orders']['data'].append(element)

                # services
                services = self.database.get_database().getAll(
                    'service_table',
                    self.service_args_list,
                    ('medical_history_id=%s', [_element[0]])
                )

                medical_history['services'] = dict()
                medical_history['services']['data'] = list()

                if services:
                    for detail in services:
                        element = dict()
                        element['id'] = detail[0]
                        medical_history['services']['service_type'] = detail[2]
                        element['medical_service_name'] = detail[3]
                        medical_history['services']['data'].append(element)

                msg['elements'].append(medical_history)

        return msg

    def delete(self, data):
        """Delete doctor with the given id"""
        element = data['elements'][0]
        self.database.get_database().delete(
            'medical_history_table',
            ('id=%s', [element['id']])
        )
        self.database.get_database().delete(
            'prescription_table',
            ('medical_history_id=%s', [element['id']])
        )
        self.database.get_database().delete(
            'labaratory_order_table',
            ('medical_history_id=%s', [element['id']])
        )
        self.database.get_database().delete(
            'service_table',
            ('medical_history_id=%s', [element['id']])
        )
        self.database.commit()

        # return message
        msg = dict()
        msg['type'] = self.handler
        msg['method'] = 'delete'
        msg['elements'] = list()

        model = dict()
        model['id'] = element['id']
        msg['elements'].append({
            'id': element['id']
        })
        return msg

    def leftJoin(self, main_table, columns, tables=(), conditions=(),
                 where=None, group_by=None, limit=None):
        """Run an inner left join query
            tables = (table1, table2)
            fields = ([fields from table1], [fields from table 2])  # fields to select
            join_fields = (field1, field2)  # fields to join. field1 belongs to table1 and field2 belongs to table 2
            where = ("parameterizedstatement", [parameters])
                    eg: ("id=%s and name=%s", [1, "test"])
            order = [field, ASC|DESC]
            limit = [limit1, limit2]
        """

        cur = self._select_join(
            main_table, columns, tables, conditions, where, group_by, limit)
        result = cur.fetchall()

        rows = None
        if result:
            Row = namedtuple("Row", [f[0] for f in cur.description])
            rows = [Row(*r) for r in result]

        return rows

    def _select_join(self, main_table, columns, tables=(), conditions=(),
                     where=None, group_by=None, limit=None):
        """Run an inner left join query"""

        fields = ['%s.%s' % (main_table, column)
                  for column in columns]
        join_fields = ['LEFT JOIN %s ON (%s)' %
                       (tables[index], conditions[index])
                       for index in range(len(tables))]

        sql = "SELECT %s FROM %s %s" % \
            (",".join(fields),
             main_table,
             " ".join(join_fields)
             )

        # where conditions
        if where and len(where) > 0:
            sql += " WHERE %s" % where[0]

        # group_by
        if group_by:
            sql += " GROUP BY %s" % group_by[0]
            sql += " ORDER BY %s DESC" % group_by[0]
        
        # limit
        if limit:
            sql += " LIMIT %s" % limit[0]

            if len(limit) > 1:
                sql += ", %s" % limit[1]

        return self.database.get_database().query(
            sql, where[1] if where and len(where) > 1 else None)

    def patient_lookup(self, data):
        """Look up patient with the given name"""
        elements = self.database.get_database().getAll(
            'patient_table',
            ['id', 'name'],
            [filter_value(['name'], data['value'])]
        )
        # return message
        msg = dict()

        msg['type'] = 'medical_history_handler'
        msg['method'] = 'patient_lookup'

        msg['elements'] = list()
        if elements:
            for _element in elements:
                # create patient list
                patient = dict()

                # add attributes to patient
                patient['id'] = _element[0]
                patient['name'] = _element[1]

                # add patient to elements
                msg['elements'].append(patient)
        return msg

    def doctor_lookup(self, data):
        """Look up doctor with the given name"""
        elements = self.database.get_database().getAll(
            'doctor_table',
            ['id', 'name'],
            [filter_value(['name'], data['value'])]
        )

        # return message
        msg = dict()
        msg['type'] = 'medical_history_handler'
        msg['method'] = 'doctor_lookup'
        msg['elements'] = list()
        if elements:
            for _element in elements:
                doctor = dict()
                doctor['id'] = _element[0]
                doctor['name'] = _element[1]
                msg['elements'].append(doctor)
        return msg

    def drug_lookup(self, data):
        """Look up drug with the given name"""
        elements = self.database.get_database().getAll(
            'drug_table',
            ['id', 'name'],
            [filter_value(['name'], data['value'])]
        )

        # return message
        msg = dict()
        msg['type'] = 'medical_history_handler'
        msg['method'] = 'drug_lookup'
        msg['elements'] = list()
        if elements:
            for _element in elements:
                drug = dict()
                drug['id'] = _element[0]
                drug['name'] = _element[1]
                msg['elements'].append(drug)
        return msg

    def medical_service_lookup(self, data):
        """Look up medical service with the given name"""
        elements = self.database.get_database().getAll(
            'medical_service_table',
            ['id', 'name'],
            [filter_value(['name'], data['value'])]
        )
        # return message
        msg = dict()
        msg['type'] = 'medical_history_handler'
        msg['method'] = 'medical_service_lookup'
        msg['elements'] = list()
        if elements:
            for _element in elements:
                medical_service = dict()
                medical_service['id'] = _element[0]
                medical_service['name'] = _element[1]
                msg['elements'].append(medical_service)
        return msg

    def icd_lookup(self, data):
        """Look up ICD with the given name"""
        elements = self.database.get_database().getAll(
            'icd_table',
            ['id', 'name', 'code'],
            [filter_value(['name', 'code'], data['value'])]
        )

        # return message
        msg = dict()
        msg['type'] = 'medical_history_handler'
        msg['method'] = 'icd_lookup'
        msg['elements'] = list()
        if elements:
            for _element in elements:
                icd = dict()
                icd['id'] = _element[0]
                icd['name'] = _element[1]
                icd['code'] = _element[2]
                msg['elements'].append(icd)
        return msg


def omitted_detail_from(data):
    """Delete removed data"""
    return set(x[0] for x in data) if data else set()


def filter_value(parms, keyword):
    """return value filter"""
    return "concat({0}) like '%{1}%'".format(
        ', '.join(parms), keyword
    )


def remove_from_database(database, table, ids):
    """Remove record from db with given id"""
    for element in ids:
        database.get_database().delete(
            table,
            ('id=%s', [element])
        )
