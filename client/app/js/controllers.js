define([
    'angular',
    'jquery',
    'alertify',
    'bootstrap',
    'functional',
    'services'
], function(angular, $, alertify, bootstrap, func) {
    'use strict';

    /* Controllers */

    angular.module('hospitalControllers', [
        'hospitalServices'
    ]).controller('Login', [
        '$scope',
        '$location',
        'LoginService', 
        function($scope, $location, LoginService) {
            /* initialize */
            $scope.signin = {
                username : '',
                password : '',
                remember : false
            };

            /* login function */
            $scope.login = function() {
                var signin = new LoginService();
                signin.$save({
                    username : $scope.signin.username,
                    password : $scope.signin.password
                }, function(data) {
                    if (data.validUser == 'true') {
                        var role = data.role;
                        // remember me
                        $location.path('/home');
                    } else {
                        alertify.log('Wrong username or password');
                    }
                }, function(data) {
                    alertify.error('Server down, try again later'); 
                });

            }
        }
    ]).controller('CreateAccount', [
        '$scope', 
        '$location',
        'CreateAccountService',
        function($scope, $location, CreateAccountService) {
            
            /* initialize */
            $scope.signup = {
                firstName : '',
                lastName : '',
                username : '',
                password : '',
                confirmation : '',
                error : false,
                passwordIdentical : true
            };

            $scope.change = function() {
                /* validation */ 
                $scope.signup.passwordIdentical = $scope.signup.password == $scope.signup.confirmation;
                $scope.signup.error = !$scope.signup.passwordIdentical;
            };

            /* create account with username and password */
            $scope.createAccount = function() {
                if (!$scope.signup.error) {
                    /* insert account into the server database */
                    var signup = new CreateAccountService();
                    signup.$save({
                        type : 'CreateAccount',
                        firstName : $scope.signup.firstName,
                        lastName : $scope.signup.lastName,
                        username : $scope.signup.username,
                        password : $scope.signup.password
                    }, function(data) {
                        /* successfully create account */
                        if (data.success == 'true') {
                            alertify.success('Account successfully created');
                            $location.path('/login');
                        } else {
                            alertify.error('This account has been registered')
                        }
                    }, function(data) {
                        alertify.error('Server down, try again later');
                    });
                }
            }
        }
    ]).controller('Home', [
        '$scope',
        '$location',
        'WebSocketService',
        function($scope, $location, socket) {
            /* create shared template */
            $scope.sharedTemplate = {
                url : 'partials/main.html'
            };
            $scope.changeTemplateUrl = function(link) {
                $scope.sharedTemplate.url = 'partials/' + link;
            };
        }
    ]).controller('DoctorController', [
        '$scope',
        '$location',
        'WebSocketService',
        function($scope, $location, socket) {
            /* init */
            var MAX_ITEM_PER_PAGE = 15;
            
            $scope.noElements = 0;
            $scope.doctors = [];
            $scope.query = '';
            $scope.new = {
                name : '', 
                address : '', 
                phone_number : '', 
                working_hour : '', 
                specialist : '', 
                notice : '',
                reset : function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) && 
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id : -1, 
                name : '', 
                address : '', 
                phone_number : '', 
                working_hour : '', 
                specialist : '', 
                notice : ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'doctor_handler') {
                    switch(data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.doctors = data.elements;
                            break;
                        case 'create':
                            $scope.doctors.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function(){
                                var doctor = $scope.doctors.filter(function(o) { 
                                    return o.id == data.elements[0].id
                                })[0];
                                if (doctor) {
                                    func.simpleExtend(doctor, data.elements[0]);
                                }    
                            }());
                            break;
                        case 'filter':
                            $scope.noElements = data.noElements;
                            $scope.doctors = data.elements;
                            break;
                        case 'delete':
                            (function(){
                                var index = func.findIndexByKeyValue(
                                    $scope.doctors, 'id', data.elements[0].id
                                );
                                $scope.doctors.splice(index, 1);
                            }());
                            break;
                    }
                }
                $scope.$apply();
            });

            $scope.toggleEdit = function(doctorID) {
                func.simpleExtend($scope.current, 
                    $scope.doctors.filter(function(o) { return o.id == doctorID; })[0]);
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                angular.element('#create-modal').modal('toggle');
            };

            $scope.create = function() {
                socket.send({
                    type : 'doctor_handler',
                    method : 'create',
                    elements : [
                        {
                            name : $scope.new.name, 
                            address : $scope.new.address, 
                            phone_number : $scope.new.phone_number, 
                            working_hour : $scope.new.working_hour, 
                            specialist : $scope.new.specialist, 
                            notice : $scope.new.notice
                        }
                    ]
                });
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(doctorID) {
                if (!func.simpleCompare(
                    $scope.current, 
                    $scope.doctors.filter(function(o) { return o.id == doctorID; })[0])
                ) {
                    socket.send({
                        type : 'doctor_handler',
                        method : 'update',
                        elements : [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(doctorID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type : 'doctor_handler',
                            method : 'delete',
                            elements : [{ id : doctorID }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type : 'doctor_handler',
                    method : 'filter',
                    page : 1,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type : 'doctor_handler',
                    method : ($scope.query == '') ? 'query' : 'filter',
                    page : pageNumber,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            socket.send({
                type : 'doctor_handler',
                method : 'query',
                page : 1,
                max : MAX_ITEM_PER_PAGE,
            });
        }
    ]).controller('PatientController', [
        '$scope',
        '$location',
        'WebSocketService',
        function($scope, $location, socket) {
            /* init */
            var MAX_ITEM_PER_PAGE = 15;
            
            $scope.noElements = 0;
            $scope.patients = [];
            $scope.query = '';
            $scope.new = {
                name : '', 
                age : '', 
                gender : '', 
                address : '', 
                phone_number : '', 
                reset : function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) && 
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id : -1, 
                name : '', 
                age : '', 
                gender : '', 
                address : '', 
                phone_number : ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'patient_handler') {
                    switch(data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.patients = data.elements;
                            break;
                        case 'create':
                            $scope.patients.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function(){
                                var patient = $scope.patients.filter(function(o) { 
                                    return o.id == data.elements[0].id
                                })[0];
                                if (patient) {
                                    func.simpleExtend(patient, data.elements[0]);
                                }    
                            }());
                            break;
                        case 'filter':
                            $scope.noElements = data.noElements;
                            $scope.patients = data.elements;
                            break;
                        case 'delete':
                            (function(){
                                var index = func.findIndexByKeyValue(
                                    $scope.patients, 'id', data.elements[0].id
                                );
                                $scope.patients.splice(index, 1);
                            }());
                            break;
                    }
                }
                $scope.$apply();
            });

            $scope.toggleEdit = function(patientID) {
                func.simpleExtend($scope.current, 
                    $scope.patients.filter(function(o) { return o.id == patientID; })[0]);
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                angular.element('#create-modal').modal('toggle');
            };

            $scope.create = function() {
                if (isNaN($scope.new.age)) {
                    alertify.error('Invalid submission form!');
                } else {
                    socket.send({
                        type : 'patient_handler',
                        method : 'create',
                        elements : [
                            {
                                name : $scope.new.name, 
                                age : $scope.new.age, 
                                gender : $scope.new.gender, 
                                address : $scope.new.address, 
                                phone_number : $scope.new.phone_number
                            }
                        ]
                    });
                }
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(patientID) {
                if (!func.simpleCompare(
                    $scope.current, 
                    $scope.patients.filter(function(o) { return o.id == patientID; })[0])
                ) {
                    socket.send({
                        type : 'patient_handler',
                        method : 'update',
                        elements : [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(patientID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type : 'patient_handler',
                            method : 'delete',
                            elements : [{ id : patientID }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type : 'patient_handler',
                    method : 'filter',
                    page : 1,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type : 'patient_handler',
                    method : ($scope.query == '') ? 'query' : 'filter',
                    page : pageNumber,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            socket.send({
                type : 'patient_handler',
                method : 'query',
                page : 1,
                max : MAX_ITEM_PER_PAGE,
            });
        }
    ]).controller('ICDController', [
        '$scope',
        '$location',
        'WebSocketService',
        function($scope, $location, socket) {
            /* init */
            var MAX_ITEM_PER_PAGE = 15;
            
            $scope.noElements = 0;
            $scope.icds = [];
            $scope.query = '';
            $scope.new = {
                name : '', 
                code : '', 
                reset : function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) && 
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id : -1, 
                name : '', 
                code : ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'icd_handler') {
                    switch(data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.icds = data.elements;
                            break;
                        case 'create':
                            $scope.icds.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function(){
                                var icd = $scope.icds.filter(function(o) { 
                                    return o.id == data.elements[0].id
                                })[0];
                                if (icd) {
                                    func.simpleExtend(icd, data.elements[0]);
                                }    
                            }());
                            break;
                        case 'filter':
                            $scope.noElements = data.noElements;
                            $scope.icds = data.elements;
                            break;
                        case 'delete':
                            (function(){
                                var index = func.findIndexByKeyValue(
                                    $scope.icds, 'id', data.elements[0].id
                                );
                                $scope.icds.splice(index, 1);
                            }());
                            break;
                    }
                }
                $scope.$apply();
            });

            $scope.toggleEdit = function(icdID) {
                func.simpleExtend($scope.current, 
                    $scope.icds.filter(function(o) { return o.id == icdID; })[0]);
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                angular.element('#create-modal').modal('toggle');
            };

            $scope.create = function() {
                socket.send({
                    type : 'icd_handler',
                    method : 'create',
                    elements : [
                        {
                            name : $scope.new.name, 
                            code : $scope.new.code
                        }
                    ]
                });
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(icdID) {
                if (!func.simpleCompare(
                    $scope.current, 
                    $scope.icds.filter(function(o) { return o.id == icdID; })[0])
                ) {
                    socket.send({
                        type : 'icd_handler',
                        method : 'update',
                        elements : [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(icdID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type : 'icd_handler',
                            method : 'delete',
                            elements : [{ id : icdID }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type : 'icd_handler',
                    method : 'filter',
                    page : 1,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type : 'icd_handler',
                    method : ($scope.query == '') ? 'query' : 'filter',
                    page : pageNumber,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            socket.send({
                type : 'icd_handler',
                method : 'query',
                page : 1,
                max : MAX_ITEM_PER_PAGE,
            });
        }
    ]).controller('DrugController', [
        '$scope',
        '$location',
        'WebSocketService',
        function($scope, $location, socket) {
            /* init */
            var MAX_ITEM_PER_PAGE = 15;
            
            $scope.noElements = 0;
            $scope.drugs = [];
            $scope.query = '';
            $scope.new = {
                name : '', 
                unit : '', 
                price : '', 
                reset : function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) && 
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id : -1, 
                name : '', 
                unit : '', 
                price : ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'drug_handler') {
                    switch(data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.drugs = data.elements;
                            break;
                        case 'create':
                            $scope.drugs.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function(){
                                var drug = $scope.drugs.filter(function(o) { 
                                    return o.id == data.elements[0].id
                                })[0];
                                if (drug) {
                                    func.simpleExtend(drug, data.elements[0]);
                                }    
                            }());
                            break;
                        case 'filter':
                            $scope.noElements = data.noElements;
                            $scope.drugs = data.elements;
                            break;
                        case 'delete':
                            (function(){
                                var index = func.findIndexByKeyValue(
                                    $scope.drugs, 'id', data.elements[0].id
                                );
                                $scope.drugs.splice(index, 1);
                            }());
                            break;
                    }
                }
                $scope.$apply();
            });

            $scope.toggleEdit = function(drugID) {
                func.simpleExtend($scope.current, 
                    $scope.drugs.filter(function(o) { return o.id == drugID; })[0]);
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                angular.element('#create-modal').modal('toggle');
            };

            $scope.create = function() {
                if (isNaN($scope.new.price)) {
                    alertify.error('Invalid submission form!');
                } else {
                    socket.send({
                        type : 'drug_handler',
                        method : 'create',
                        elements : [
                            {
                                name : $scope.new.name, 
                                unit : $scope.new.unit, 
                                price : $scope.new.price
                            }
                        ]
                    });
                }
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(drugID) {
                if (!func.simpleCompare(
                    $scope.current, 
                    $scope.drugs.filter(function(o) { return o.id == drugID; })[0])
                ) {
                    socket.send({
                        type : 'drug_handler',
                        method : 'update',
                        elements : [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(drugID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type : 'drug_handler',
                            method : 'delete',
                            elements : [{ id : drugID }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type : 'drug_handler',
                    method : 'filter',
                    page : 1,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type : 'drug_handler',
                    method : ($scope.query == '') ? 'query' : 'filter',
                    page : pageNumber,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            socket.send({
                type : 'drug_handler',
                method : 'query',
                page : 1,
                max : MAX_ITEM_PER_PAGE,
            });
        }
    ]).controller('MedicalServiceController', [
        '$scope',
        '$location',
        'WebSocketService',
        function($scope, $location, socket) {
            /* init */
            var MAX_ITEM_PER_PAGE = 15;
            
            $scope.noElements = 0;
            $scope.medicalServices = [];
            $scope.query = '';
            $scope.new = {
                name : '', 
                unit : '', 
                price : '', 
                reset : function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) && 
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id : -1, 
                name : '', 
                unit : '', 
                price : ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'medical_service_handler') {
                    switch(data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.medicalServices = data.elements;
                            break;
                        case 'create':
                            $scope.medicalServices.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function(){
                                var medicalService = $scope.medicalServices.filter(function(o) { 
                                    return o.id == data.elements[0].id
                                })[0];
                                if (medicalService) {
                                    func.simpleExtend(medicalService, data.elements[0]);
                                }    
                            }());
                            break;
                        case 'filter':
                            $scope.noElements = data.noElements;
                            $scope.medicalServices = data.elements;
                            break;
                        case 'delete':
                            (function(){
                                var index = func.findIndexByKeyValue(
                                    $scope.medicalServices, 'id', data.elements[0].id
                                );
                                $scope.medicalServices.splice(index, 1);
                            }());
                            break;
                    }
                }
                $scope.$apply();
            });

            $scope.toggleEdit = function(medicalServiceID) {
                func.simpleExtend($scope.current, 
                    $scope.medicalServices.filter(function(o) { return o.id == medicalServiceID; })[0]);
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                angular.element('#create-modal').modal('toggle');
            };

            $scope.create = function() {
                if (isNaN($scope.new.price)) {
                    alertify.error('Invalid submission form!');
                } else {
                    socket.send({
                        type : 'medical_service_handler',
                        method : 'create',
                        elements : [
                            {
                                name : $scope.new.name, 
                                unit : $scope.new.unit, 
                                price : $scope.new.price
                            }
                        ]
                    });
                }
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(medicalServiceID) {
                if (!func.simpleCompare(
                    $scope.current, 
                    $scope.medicalServices.filter(function(o) { return o.id == medicalServiceID; })[0])
                ) {
                    socket.send({
                        type : 'medical_service_handler',
                        method : 'update',
                        elements : [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(medicalServiceID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type : 'medical_service_handler',
                            method : 'delete',
                            elements : [{ id : medicalServiceID }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type : 'medical_service_handler',
                    method : 'filter',
                    page : 1,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type : 'medical_service_handler',
                    method : ($scope.query == '') ? 'query' : 'filter',
                    page : pageNumber,
                    max : MAX_ITEM_PER_PAGE,
                    keyword : $scope.query
                });
            };

            socket.send({
                type : 'medical_service_handler',
                method : 'query',
                page : 1,
                max : MAX_ITEM_PER_PAGE,
            });
        }
    ]).controller('MedicalHistoryController', [
        '$scope',
        '$location',
        '$q',
        'WebSocketService',
        function($scope, $location, $q, socket) {
            /* function */
            function fillValue(value, object, type) {
                for (var p in object) {
                    if (typeof(object[p]) == type) {
                        object[p] = value;
                    } 
                }
            }
            
            function returnObject(object, type) {
                var o = {};
                for (var p in object) {
                    if (typeof(object[p]) == type) {
                        o[p] = object[p];
                    }
                }
                return o;
            }

            var patientsDeferred = $q.defer(), 
                doctorsDeferred = $q.defer(), 
                drugsDeferred = $q.defer(),
                medicalServicesDeferred = $q.defer();
            
            /* initilize datepicker */
            angular.element("input[name='datepicker']").datepicker();
            
            /* initialize */
            $scope.create = {
                toggle : true,
                visitDate : '',
                patientID : '',
                patientName : '',
                prescriptions : {
                    doctorID : '',
                    doctorName : '',
                    data : [],
                    new : {
                        show : false,
                        drugID : '',
                        drugName : '',
                        quantity : '',
                        dose : '',
                        notice : '',
                        toggleShow : function() {
                            this.show = !this.show;
                        },
                        reset : function() {
                            fillValue('', this, 'string');
                            this.data = [];
                        }
                    }
                },
                labOrders : {
                    doctorID : '',
                    doctorName : '',
                    data : [],
                    new : {
                        show : false,
                        result : '',
                        toggleShow : function() {
                            this.show = !this.show;
                        },
                        reset : function() {
                            fillValue('', this, 'string');
                            this.data = [];
                        }
                    }
                },
                services : {
                    type : '',
                    data : [],
                    new : {
                        show : false,
                        medicalServiceID : '',
                        medicalServiceName : '',
                        toggleShow : function() {
                            this.show = !this.show;
                        },
                        reset : function() {
                            fillValue('', this, 'string');
                            this.data = [];
                        }
                    }
                },
                reset : function() {
                    fillValue('', this, 'string');
                }
            };

            $scope.patients = [
                { id : 1, name : 'Phan Minh Dang' },
                { id : 2, name : 'Phan Quang Hung' },
                { id : 3, name : 'Tran Ngoc Nghi' }
            ];
            $scope.doctors = [{ id : 1, name : 'Phan Quang Hung' }];
            $scope.drugs = [{ id : 1, name : 'Paradon' }];
            $scope.medicalServices = [{ id : 1, name : 'Tam rua' }];

            $scope.enter = function(dataObject) {
                dataObject.reset();
                dataObject.toggleShow();
            };

            $scope.input = function(dataObject) {
                dataObject.data.push(returnObject(dataObject.new, 'string'));
                $scope.enter(dataObject.new);
            };

            $scope.typeaheadOnSelect = function(object, property, $item) {
                object[property] = $item.id;
            };

            $scope.patientOnEdit = function(data, searchValue) {
                // socket.send({
                //     type : 'medical_history_handler',
                //     method : 'patient_lookup',
                //     value : searchValue
                // });
                // $scope.patients = patientsDeferred.promise;
            };

            $scope.doctorOnEdit = function(data, searchValue) {
                // socket.send({
                //     type : 'medical_history_handler',
                //     method : 'doctor_lookup',
                //     value : searchValue
                // });
                // $scope.doctors = doctorsDeferred.promise;
            };

            $scope.drugOnEdit = function(data, searchValue) {
                // socket.send({
                //     type : 'medical_history_handler',
                //     method : 'drug_lookup',
                //     value : searchValue
                // });
                // $scope.drugs = drugsDeferred.promise;
            };

            $scope.medicalServiceOnEdit = function(data, searchValue) {
                // socket.send({
                //     type : 'medical_history_handler',
                //     method : 'medicalService_lookup',
                //     value : searchValue
                // });
                // $scope.medicalServices = medicalServicesDeferred.promise;
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                // if (data.type == 'medical_service_handler') {
                //     switch(data.method) {
                //         case 'query':
                //             $scope.noElements = data.noElements;
                //             $scope.medicalServices = data.elements;
                //             break;
                //         case 'create':
                //             $scope.medicalServices.unshift(data.elements[0]);
                //             break;
                //         case 'update':
                //             (function(){
                //                 var medicalService = $scope.medicalServices.filter(function(o) { 
                //                     return o.id == data.elements[0].id
                //                 })[0];
                //                 if (medicalService) {
                //                     func.simpleExtend(medicalService, data.elements[0]);
                //                 }    
                //             }());
                //             break;
                //         case 'filter':
                //             $scope.noElements = data.noElements;
                //             $scope.medicalServices = data.elements;
                //             break;
                //         case 'delete':
                //             (function(){
                //                 var index = func.findIndexByKeyValue(
                //                     $scope.medicalServices, 'id', data.elements[0].id
                //                 );
                //                 $scope.medicalServices.splice(index, 1);
                //             }());
                //             break;
                //     }
                // }
                $scope.$apply();
            });
        }       
    ]); 
});
