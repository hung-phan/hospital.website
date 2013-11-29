#!/usr/bin/python
"""Global handler"""

from observer_pattern import Observable
from model.doctors import Doctor
from model.patients import Patient
from model.icds import ICD
from model.drugs import Drug
from model.medical_services import MedicalService

class GlobalHandler(Observable):
    """GlobalHandler class"""

    def __init__(self, database_):
        """Init"""
        super(GlobalHandler, self).__init__()
        self.database = database_

        # create handler
        doctor_handler = Doctor()
        patient_handler = Patient()
        icd_handler = ICD()
        drug_handler = Drug()
        medical_service_handler = MedicalService()

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
            }
        }

    def handle(self, msg):
        """Handle custom message from client"""
        # print msg
        try:
            self.simple_notify(
                self.switch[msg['type']][msg['method']](
                    self.database, msg
                )
            )
        except Exception:
            # fault tolerence
            pass
