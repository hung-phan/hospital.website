#!/usr/bin/python
"""MedicalHistory model"""

class MedicalHistory:
    """Medical historys model"""
    
    def __init__(self):
        self.handler = 'medical_history_handler'
        self.args_list = [
            'id',
            'visit_date', 
            'patient_id',
            'prescription_id',
            'lab_id',
            'icd_id',
            'service_id',
            'outcome' 
        ]

    def query(self, db_, data):
        """Query all medical histories"""
        medical_histories = db_.get_database().getAll(
            'medical_history_table',
            self.args_list,
            None,
            ['id', 'desc'],
            [(data['page'] - 1) * data['max'], data['max']]
        )

        # return message
        msg = dict()
        msg['type'] = 'medical_history_handler'
        msg['method'] = 'query'
        msg['elements'] = list()
        msg['noElements'] = db_.get_no_of_elements('medical_history_table')

        if medical_histories:
            for e in medical_histories:
                medical_history = dict()
                medical_history['id'] = e[0]
                medical_history['visit_date'] = e[1]
                medical_history['outcome'] = e[7]
                medical_history['patient_id'] = e[2]
                medical_history['patient_name'] = filter_on_return(
                    db_.get_database().getOne(
                        'patient_table', ['name'], ('id=%s', [e[2]])
                    )
                )
                medical_history['icd'] = dict()
                medical_history['icd']['id'] = e[5]
                medical_history['icd']['code'] = filter_on_return(
                    db_.get_database().getOne(
                        'icd_table', ['code'], ('id=%s', [e[5]])
                    )
                )
                # prescriptions
                prescription = db_.get_database().leftJoin(
                    ('prescription_table', 'doctor_table'),
                    (['id', 'doctor_id'], ['name']),
                    ('doctor_id', 'id'),
                    ('prescription_table.id=%s', [e[3]])
                )[0]

                medical_history['prescriptions'] = dict()
                medical_history['prescriptions']['id'] = prescription[0]
                medical_history['prescriptions']['doctor_id'] = prescription[1]
                medical_history['prescriptions']['doctor_name'] = prescription[2]
                medical_history['prescriptions']['data'] = list()
                
                # prescription details
                prescription_details = db_.get_database().leftJoin(
                    ('prescription_detail_table', 'drug_table'),
                    (['id', 'drug_id', 'quantity', 'dose', 'notice'], ['name']),
                    ('drug_id', 'id'),
                    ('prescription_detail_table.prescription_id=%s', [prescription[0]])
                )
                if prescription_details:
                    for detail in prescription_details:
                        element = dict()
                        element['id'] = detail[0]
                        element['drug_id'] = detail[1]
                        element['quantity'] = detail[2]
                        element['dose'] = detail[3]
                        element['notice'] = detail[4]
                        element['drug_name'] = detail[5]
                        medical_history['prescriptions']['data'].append(element)

                # labaratories
                labaratory_orders = db_.get_database().leftJoin(
                    ('labaratory_order_table', 'doctor_table'),
                    (['id', 'doctor_id'], ['name']),
                    ('doctor_id', 'id'),
                    ('labaratory_order_table.id=%s', [e[4]])
                )[0]

                medical_history['lab_orders'] = dict()
                medical_history['lab_orders']['id'] = labaratory_orders[0]
                medical_history['lab_orders']['doctor_id'] = labaratory_orders[1]
                medical_history['lab_orders']['doctor_name'] = labaratory_orders[2]
                medical_history['lab_orders']['data'] = list()
                
                # labaratory order details
                labaratory_order_details = db_.get_database().getAll(
                    'labaratory_order_detail_table',
                    ['id', 'result'],
                    ('labaratory_id=%s', [labaratory_orders[0]])
                )
                if labaratory_order_details:
                    for detail in labaratory_order_details:
                        element = dict()
                        element['id'] = detail[0]
                        element['result'] = detail[1]
                        medical_history['lab_orders']['data'].append(element)

                # services
                services = db_.get_database().getOne(
                    'service_table',
                    ['id', 'service_type'],
                    ['id=%s', [e[6]]]
                )

                medical_history['services'] = dict()
                medical_history['services']['id'] = services[0]
                medical_history['services']['type'] = services[1]
                medical_history['services']['data'] = list()
                
                # service details
                service_details = db_.get_database().leftJoin(
                    ('service_detail_table', 'medical_service_table'),
                    (['id', 'medical_service_id'], ['name']),
                    ('medical_service_id', 'id'),
                    ('service_detail_table.service_id=%s', [services[0]])
                )

                if service_details:
                    for detail in service_details:
                        element = dict()
                        element['id'] = detail[0]
                        element['medical_service_id'] = detail[1]
                        element['medical_service_name'] = detail[2]
                        medical_history['services']['data'].append(element)

                msg['elements'].append(medical_history)

        return msg

    def create(self, db_, data):
        """Create medical history"""
        element = data['elements'][0]

        # prescriptions
        db_.get_database().insert(
            'prescription_table',
            {'doctor_id' : element['prescriptions']['doctor_id']}
        )
        prescription_id = db_.get_last_insert_id('prescription_table')
        for datum in element['prescriptions']['data']:
            datum['prescription_id'] = prescription_id
            db_.get_database().insert(
                'prescription_detail_table', remove_key(datum, 'drug_name')
            )
            datum['id'] = db_.get_last_insert_id('prescription_detail_table')

        # lab orders
        db_.get_database().insert(
            'labaratory_order_table',
            {'doctor_id' : element['lab_orders']['doctor_id']}
        )
        labaratory_id = db_.get_last_insert_id('labaratory_order_table')
        for datum in element['lab_orders']['data']:
            datum['labaratory_id'] = labaratory_id
            db_.get_database().insert(
                'labaratory_order_detail_table', datum
            )
            datum['id'] = db_.get_last_insert_id('labaratory_order_detail_table')

        # medical services
        db_.get_database().insert(
            'service_table', 
            {'service_type' : element['services']['service_type']}
        )
        service_id = db_.get_last_insert_id('service_table')
        for datum in element['services']['data']:
            datum['service_id'] = service_id
            db_.get_database().insert(
                'service_detail_table', 
                remove_key(datum, 'medical_service_name')
            )
            datum['id'] = db_.get_last_insert_id('service_detail_table')

        db_.get_database().insert(
            'medical_history_table', 
            {
                'visit_date' : element['visit_date'], 
                'patient_id' : element['patient_id'],
                'prescription_id' : prescription_id,
                'lab_id' : labaratory_id,
                'icd_id' : element['icd']['id'],
                'service_id' : service_id,
                'outcome' : element['outcome']
            }
        )

        db_.commit()
        
        # return message
        msg = dict()
        
        msg['type'] = 'medical_history_handler'
        msg['method'] = 'create'
        msg['elements'] = list()

        db_.get_last_insert_id('medical_history_table')
        msg['elements'].append({
            'id': db_.get_last_insert_id('medical_history_table'),
            'visit_date': element['visit_date'],
            'outcome': element['outcome'],
            'patient_id': element['patient_id'],
            'patient_name': element['patient_name'],
            'icd': {
                'code': element['icd']['code'],
                'id': element['icd']['id']
            },
            'prescriptions': {
                'id': prescription_id,
                'doctor_id': element['prescriptions']['doctor_id'],
                'doctor_name': element['prescriptions']['doctor_name'],
                'data': element['prescriptions']['data']
            },
            'lab_orders': {
                'id': labaratory_id,
                'doctor_id': element['lab_orders']['doctor_id'],
                'doctor_name': element['lab_orders']['doctor_name'],
                'data': element['lab_orders']['data']
            },
            'services': {
                'id': service_id,
                'type': element['services']['service_type'],
                'data': element['services']['data']
            }
        })

        return msg
        

    def update(self, db_, data):
        """Update medical histories"""
        element = data['elements'][0]
        remove_from(element, ['$$hashKey'])

        # medical history
        db_.get_database().update(
            'medical_history_table',
            {
                'visit_date': element['visit_date'],
                'outcome': element['outcome'],
                'patient_id': element['patient_id'],
                'icd_id': element['icd']['id']
            },
            ('id=%s', [element['id']])
        )

        # prescription
        db_.get_database().insertOrUpdate(
            'prescription_table',
            {
                'id': element['prescriptions']['id'],
                'doctor_id': element['prescriptions']['doctor_id']
            }, ['id']
        )
        
        omitted_details = omitted_detail_from(db_.get_database().getAll(
            'prescription_detail_table', ['id'],
            ('prescription_id=%s', [element['prescriptions']['id']])
        ))
        for datum in element['prescriptions']['data']:
            remove_from(datum, ['$$hashKey', 'editMode'])
            insert_data = {
                'drug_id': datum['drug_id'],
                'quantity': datum['quantity'],
                'dose': datum['dose'],
                'notice': datum['notice']
            }
            if datum.has_key('id'):
                omitted_details.discard(datum['id'])
                db_.get_database().update(
                    'prescription_detail_table',
                    insert_data,
                    ('id=%s', [datum['id']])
                )
            else:
                insert_data['prescription_id'] = element['prescriptions']['id']
                db_.get_database().insert(
                    'prescription_detail_table',
                    insert_data
                )
                datum['id'] = db_.get_last_insert_id('prescription_detail_table')
        remove_from_database(db_, 'prescription_detail_table', omitted_details)
        
        # lab order
        omitted_details = omitted_detail_from(db_.get_database().getAll(
            'labaratory_order_detail_table', ['id'],
            ('labaratory_id=%s', [element['lab_orders']['id']])
        ))
        db_.get_database().insertOrUpdate(
            'labaratory_order_table',
            {
                'id': element['lab_orders']['id'],
                'doctor_id': element['lab_orders']['doctor_id']
            }, ['id']
        )
        
        for datum in element['lab_orders']['data']:
            remove_from(datum, ['$$hashKey', 'editMode'])
            insert_data = { 'result': datum['result'] }
            if datum.has_key('id'):
                omitted_details.discard(datum['id'])
                db_.get_database().update(
                    'labaratory_order_detail_table',
                    insert_data,
                    ('id=%s', [datum['id']])
                )
            else:
                insert_data['labaratory_id'] = element['lab_orders']['id']
                db_.get_database().insert(
                    'labaratory_order_detail_table',
                    insert_data
                )
                datum['id'] = db_.get_last_insert_id('labaratory_order_detail_table')
        remove_from_database(db_, 'labaratory_order_detail_table', omitted_details)

        # service
        omitted_details = omitted_detail_from(db_.get_database().getAll(
            'service_detail_table', ['id'],
            ('service_id=%s', [element['services']['id']])
        ))
        db_.get_database().insertOrUpdate(
            'service_table',
            {
                'id': element['services']['id'],
                'service_type': element['services']['type']
            }, ['id']
        )

        for datum in element['services']['data']:
            remove_from(datum, ['$$hashKey', 'editMode'])
            insert_data = {
                'medical_service_id': datum['medical_service_id']
            }
            if datum.has_key('id'):
                omitted_details.discard(datum['id'])
                db_.get_database().update(
                    'service_detail_table',
                    insert_data,
                    ('id=%s', [datum['id']])
                )
            else:
                insert_data['service_id'] = element['services']['id']
                db_.get_database().insert(
                    'service_detail_table',
                    insert_data
                )
                datum['id'] = db_.get_last_insert_id('service_detail_table')
        remove_from_database(db_, 'service_detail_table', omitted_details)

        db_.commit()
        
        # return message
        msg = dict()
        
        msg['type'] = 'medical_history_handler'
        msg['method'] = 'update'
        msg['elements'] = list()

        db_.get_last_insert_id('medical_history_table')
        msg['elements'].append({
            'id': db_.get_last_insert_id('medical_history_table'),
            'visit_date': element['visit_date'],
            'outcome': element['outcome'],
            'patient_id': element['patient_id'],
            'patient_name': element['patient_name'],
            'icd': {
                'code': element['icd']['code'],
                'id': element['icd']['id']
            },
            'prescriptions': {
                'id': element['prescriptions']['id'],
                'doctor_id': element['prescriptions']['doctor_id'],
                'doctor_name': element['prescriptions']['doctor_name'],
                'data': element['prescriptions']['data']
            },
            'lab_orders': {
                'id': element['lab_orders']['id'],
                'doctor_id': element['lab_orders']['doctor_id'],
                'doctor_name': element['lab_orders']['doctor_name'],
                'data': element['lab_orders']['data']
            },
            'services': {
                'id': element['services']['id'],
                'type': element['services']['type'],
                'data': element['services']['data']
            }
        })

        return msg

    def filter(self, db_, data):
        """Filter data by keyword"""
        pass

    def delete(self, db_, data):
        """Delete doctor with the given id"""
        element = data['elements'][0]
        medical_history = db_.get_database().getOne(
            'medical_history_table',
            self.args_list,
            ('id=%s', [element['id']])
        )
        db_.get_database().delete(
            'prescription_detail_table',
            ('prescription_id=%s', [medical_history[3]])
        )
        db_.get_database().delete(
            'prescription_table',
            ('id=%s', [medical_history[3]])
        )
        db_.get_database().delete(
            'labaratory_order_detail_table',
            ('labaratory_id=%s', [medical_history[4]])
        )
        db_.get_database().delete(
            'labaratory_order_table',
            ('id=%s', [medical_history[4]])
        )
        db_.get_database().delete(
            'service_detail_table',
            ('service_id=%s', [medical_history[4]])
        )
        db_.get_database().delete(
            'service_table',
            ('id=%s', [medical_history[4]])
        )
        db_.get_database().delete(
            'medical_history_table',
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

    def patient_lookup(self, db_, data):
        """Look up patient with the given name"""
        elements = db_.get_database().getAll(
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
            for e in elements:
                # create patient list
                patient = dict()

                # add attributes to patient
                patient['id'] = e[0]
                patient['name'] = e[1]
                
                # add patient to elements
                msg['elements'].append(patient)
        return msg

    def doctor_lookup(self, db_, data):
        """Look up doctor with the given name"""
        elements = db_.get_database().getAll(
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
            for e in elements:
                doctor = dict()
                doctor['id'] = e[0]
                doctor['name'] = e[1]
                msg['elements'].append(doctor)
        return msg

    def drug_lookup(self, db_, data):
        """Look up drug with the given name"""
        elements = db_.get_database().getAll(
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
            for e in elements:
                drug = dict()
                drug['id'] = e[0]
                drug['name'] = e[1]
                msg['elements'].append(drug)
        return msg

    def medical_service_lookup(self, db_, data):
        """Look up medical service with the given name"""
        elements = db_.get_database().getAll(
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
            for e in elements:
                medical_service = dict()
                medical_service['id'] = e[0]
                medical_service['name'] = e[1]
                msg['elements'].append(medical_service)
        return msg

    def icd_lookup(self, db_, data):
        """Look up ICD with the given name"""
        elements = db_.get_database().getAll(
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
            for e in elements:
                icd = dict()
                icd['id'] = e[0]
                icd['name'] = e[1]
                icd['code'] = e[2]
                msg['elements'].append(icd)
        return msg

def omitted_detail_from(data):
    """Delete removed data"""
    if data:
        return set(x[0] for x in data)
    else: 
        return set()

def filter_value(parms, keyword):
    """return value filter"""
    return "concat({0}) like '%{1}%'".format(
        ', '.join(parms), keyword
    )

def filter_on_return(data):
    """Filter value on return"""
    return data[0] if data else ''

def remove_key(d, key):
    """Return copy of a dictionary and remove key"""
    r = dict(d)
    del r[key]
    return r

def remove_from(d, keys):
    """Remove specific property from given dictionary"""
    for key in keys:
        if d.has_key(key):
            del d[key]

def remove_from_database(db_, table, ids):
    """Remove record from db with given id"""
    for id in ids:
        db_.get_database().delete(
            table,
            ('id=%s', [id])
        )
