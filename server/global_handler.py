#!/usr/bin/python
"""Global handler"""
from observer_pattern import Observable
from model.model_template import ModelTemplate
from model.medical_histories import MedicalHistory

class GlobalHandler(Observable):
    """GlobalHandler class"""

    def __init__(self, database_):
        """Init"""
        super(GlobalHandler, self).__init__()
        self.database = database_

        # create handler
        doctor_handler = ModelTemplate(
            'doctor_table',
            'doctor_handler',
            [
                'id',
                'name',
                'address',
                'phone_number',
                'working_hour',
                'specialist',
                'notice'
            ]
        )
        patient_handler = ModelTemplate(
            'patient_table',
            'patient_handler',
            [
                'id',
                'name',
                'age',
                'gender',
                'address',
                'phone_number'
            ]
        )
        icd_handler = ModelTemplate(
            'icd_table',
            'icd_handler',
            [
                'id',
                'name',
                'code'
            ]
        )
        drug_handler = ModelTemplate(
            'drug_table',
            'drug_handler',
            [
                'id',
                'name',
                'unit',
                'price'
            ]
        )
        medical_service_handler = ModelTemplate(
            'medical_service_table',
            'medical_service_handler',
            [
                'id',
                'name',
                'price'
            ]
        )
        medical_history_handler = MedicalHistory()

        # switch statement
        self.switch = {
        	'doctor_handler' : {
        		'query' : doctor_handler.query,
        		'create' : doctor_handler.create,
        		'update' : doctor_handler.update,
        		'filter' : doctor_handler.filter,
        		'delete' : doctor_handler.delete
        	}, 
            'patient_handler' : {
                'query' : patient_handler.query,
                'create' : patient_handler.create,
                'update' : patient_handler.update,
                'filter' : patient_handler.filter,
                'delete' : patient_handler.delete
            }, 
            'icd_handler' : {
                'query' : icd_handler.query,
                'create' : icd_handler.create,
                'update' : icd_handler.update,
                'filter' : icd_handler.filter,
                'delete' : icd_handler.delete
            }, 
            'drug_handler' : {
                'query' : drug_handler.query,
                'create' : drug_handler.create,
                'update' : drug_handler.update,
                'filter' : drug_handler.filter,
                'delete' : drug_handler.delete
            }, 
            'medical_service_handler' : {
                'query' : medical_service_handler.query,
                'create' : medical_service_handler.create,
                'update' : medical_service_handler.update,
                'filter' : medical_service_handler.filter,
                'delete' : medical_service_handler.delete
            },
            'medical_history_handler' : {
                'query' : medical_history_handler.query,
                'create' : medical_history_handler.create,
                'update' : medical_history_handler.update,
                'patient_lookup' : medical_history_handler.patient_lookup,
                'doctor_lookup' : medical_history_handler.doctor_lookup,
                'drug_lookup' : medical_history_handler.drug_lookup,
                'medical_service_lookup' : medical_history_handler.medical_service_lookup,
                'icd_lookup' : medical_history_handler.icd_lookup
            }
        }

    def handle(self, connection, msg):
        """Handle custom message from client"""
        # try:
        return_data = self.switch[msg['type']][msg['method']](
            self.database, msg
        )
        # print return_data
        if msg['method'] in [
            'query', 
            'filter', 
            'patient_lookup',
            'doctor_lookup',
            'drug_lookup',
            'medicalService_lookup'
        ]:
            connection.update(return_data)
        else:
            self.simple_notify(return_data)
        # except Exception:
        #     # fault tolerence
        #     pass
