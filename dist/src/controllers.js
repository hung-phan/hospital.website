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
                username: '',
                password: '',
                remember: false
            };

            /* login function */
            $scope.login = function() {
                var signin = new LoginService();
                signin.$save({
                    username: $scope.signin.username,
                    password: $scope.signin.password
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
                firstName: '',
                lastName: '',
                username: '',
                password: '',
                confirmation: '',
                error: false,
                passwordIdentical: true
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
                        type: 'CreateAccount',
                        firstName: $scope.signup.firstName,
                        lastName: $scope.signup.lastName,
                        username: $scope.signup.username,
                        password: $scope.signup.password
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
                url: 'partials/main.html'
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
                name: '',
                address: '',
                phone_number: '',
                working_hour: '',
                specialist: '',
                notice: '',
                reset: function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) &&
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id: -1,
                name: '',
                address: '',
                phone_number: '',
                working_hour: '',
                specialist: '',
                notice: ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'doctor_handler') {
                    switch (data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.doctors = data.elements;
                            break;
                        case 'create':
                            $scope.doctors.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function() {
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
                            (function() {
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
                    $scope.doctors.filter(function(o) {
                        return o.id == doctorID;
                    })[0]);
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                angular.element('#create-modal').modal('toggle');
            };

            $scope.create = function() {
                socket.send({
                    type: 'doctor_handler',
                    method: 'create',
                    elements: [{
                        name: $scope.new.name,
                        address: $scope.new.address,
                        phone_number: $scope.new.phone_number,
                        working_hour: $scope.new.working_hour,
                        specialist: $scope.new.specialist,
                        notice: $scope.new.notice
                    }]
                });
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(doctorID) {
                if (!func.simpleCompare(
                    $scope.current,
                    $scope.doctors.filter(function(o) {
                        return o.id == doctorID;
                    })[0])) {
                    socket.send({
                        type: 'doctor_handler',
                        method: 'update',
                        elements: [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(doctorID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type: 'doctor_handler',
                            method: 'delete',
                            elements: [{
                                id: doctorID
                            }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type: 'doctor_handler',
                    method: 'filter',
                    page: 1,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type: 'doctor_handler',
                    method: ($scope.query == '') ? 'query' : 'filter',
                    page: pageNumber,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            socket.send({
                type: 'doctor_handler',
                method: 'query',
                page: 1,
                max: MAX_ITEM_PER_PAGE,
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
                name: '',
                age: '',
                gender: '',
                address: '',
                phone_number: '',
                reset: function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) &&
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id: -1,
                name: '',
                age: '',
                gender: '',
                address: '',
                phone_number: ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'patient_handler') {
                    switch (data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.patients = data.elements;
                            break;
                        case 'create':
                            $scope.patients.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function() {
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
                            (function() {
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
                    $scope.patients.filter(function(o) {
                        return o.id == patientID;
                    })[0]);
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
                        type: 'patient_handler',
                        method: 'create',
                        elements: [{
                            name: $scope.new.name,
                            age: $scope.new.age,
                            gender: $scope.new.gender,
                            address: $scope.new.address,
                            phone_number: $scope.new.phone_number
                        }]
                    });
                }
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(patientID) {
                if (!func.simpleCompare(
                    $scope.current,
                    $scope.patients.filter(function(o) {
                        return o.id == patientID;
                    })[0])) {
                    socket.send({
                        type: 'patient_handler',
                        method: 'update',
                        elements: [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(patientID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type: 'patient_handler',
                            method: 'delete',
                            elements: [{
                                id: patientID
                            }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type: 'patient_handler',
                    method: 'filter',
                    page: 1,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type: 'patient_handler',
                    method: ($scope.query == '') ? 'query' : 'filter',
                    page: pageNumber,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            socket.send({
                type: 'patient_handler',
                method: 'query',
                page: 1,
                max: MAX_ITEM_PER_PAGE,
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
                name: '',
                code: '',
                reset: function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) &&
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id: -1,
                name: '',
                code: ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'icd_handler') {
                    switch (data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.icds = data.elements;
                            break;
                        case 'create':
                            $scope.icds.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function() {
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
                            (function() {
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
                    $scope.icds.filter(function(o) {
                        return o.id == icdID;
                    })[0]);
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                angular.element('#create-modal').modal('toggle');
            };

            $scope.create = function() {
                socket.send({
                    type: 'icd_handler',
                    method: 'create',
                    elements: [{
                        name: $scope.new.name,
                        code: $scope.new.code
                    }]
                });
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(icdID) {
                if (!func.simpleCompare(
                    $scope.current,
                    $scope.icds.filter(function(o) {
                        return o.id == icdID;
                    })[0])) {
                    socket.send({
                        type: 'icd_handler',
                        method: 'update',
                        elements: [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(icdID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type: 'icd_handler',
                            method: 'delete',
                            elements: [{
                                id: icdID
                            }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type: 'icd_handler',
                    method: 'filter',
                    page: 1,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type: 'icd_handler',
                    method: ($scope.query == '') ? 'query' : 'filter',
                    page: pageNumber,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            socket.send({
                type: 'icd_handler',
                method: 'query',
                page: 1,
                max: MAX_ITEM_PER_PAGE,
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
                name: '',
                unit: '',
                price: '',
                reset: function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) &&
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id: -1,
                name: '',
                unit: '',
                price: ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'drug_handler') {
                    switch (data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.drugs = data.elements;
                            break;
                        case 'create':
                            $scope.drugs.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function() {
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
                            (function() {
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
                    $scope.drugs.filter(function(o) {
                        return o.id == drugID;
                    })[0]);
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
                        type: 'drug_handler',
                        method: 'create',
                        elements: [{
                            name: $scope.new.name,
                            unit: $scope.new.unit,
                            price: $scope.new.price
                        }]
                    });
                }
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(drugID) {
                if (!func.simpleCompare(
                    $scope.current,
                    $scope.drugs.filter(function(o) {
                        return o.id == drugID;
                    })[0])) {
                    socket.send({
                        type: 'drug_handler',
                        method: 'update',
                        elements: [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(drugID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type: 'drug_handler',
                            method: 'delete',
                            elements: [{
                                id: drugID
                            }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type: 'drug_handler',
                    method: 'filter',
                    page: 1,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type: 'drug_handler',
                    method: ($scope.query == '') ? 'query' : 'filter',
                    page: pageNumber,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            socket.send({
                type: 'drug_handler',
                method: 'query',
                page: 1,
                max: MAX_ITEM_PER_PAGE,
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
                name: '',
                unit: '',
                price: '',
                reset: function() {
                    for (var prop in this) {
                        if (this.hasOwnProperty(prop) &&
                            typeof this[prop] != 'function') {
                            this[prop] = '';
                        }
                    }
                }
            };

            $scope.current = {
                id: -1,
                name: '',
                unit: '',
                price: ''
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'medical_service_handler') {
                    switch (data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.medicalServices = data.elements;
                            break;
                        case 'create':
                            $scope.medicalServices.unshift(data.elements[0]);
                            break;
                        case 'update':
                            (function() {
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
                            (function() {
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
                    $scope.medicalServices.filter(function(o) {
                        return o.id == medicalServiceID;
                    })[0]);
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
                        type: 'medical_service_handler',
                        method: 'create',
                        elements: [{
                            name: $scope.new.name,
                            unit: $scope.new.unit,
                            price: $scope.new.price
                        }]
                    });
                }
                angular.element('#create-modal').modal('toggle');
            };

            $scope.update = function(medicalServiceID) {
                if (!func.simpleCompare(
                    $scope.current,
                    $scope.medicalServices.filter(function(o) {
                        return o.id == medicalServiceID;
                    })[0])) {
                    socket.send({
                        type: 'medical_service_handler',
                        method: 'update',
                        elements: [$scope.current]
                    });
                }
                angular.element('#edit-modal').modal('toggle');
            };

            $scope.delete = function(medicalServiceID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type: 'medical_service_handler',
                            method: 'delete',
                            elements: [{
                                id: medicalServiceID
                            }]
                        });
                    }
                });
            };

            $scope.filter = function() {
                socket.send({
                    type: 'medical_service_handler',
                    method: 'filter',
                    page: 1,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type: 'medical_service_handler',
                    method: ($scope.query == '') ? 'query' : 'filter',
                    page: pageNumber,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            socket.send({
                type: 'medical_service_handler',
                method: 'query',
                page: 1,
                max: MAX_ITEM_PER_PAGE,
            });
        }
    ]).controller('MedicalHistoryController', [
        '$scope',
        '$location',
        '$q',
        'WebSocketService',
        function($scope, $location, $q, socket) {

            var MAX_ITEM_PER_PAGE = 15;

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

            function getData(method, searchValue, deferred) {
                socket.send({
                    'type': 'medical_history_handler',
                    'method': method,
                    'value': searchValue
                });
                return deferred.promise;
            }

            /* initilize datepicker */
            angular.element("input[name='datepicker']").datepicker()
            .on('changeDate', function(ev) {
                $scope.$apply(function() {
                    $scope.create.visit_date = ev.currentTarget.value;
                });
            });

            /* initialize */
            $scope.medicalHistories = [];
            $scope.noElements = 0;

            $scope.create = {
                toggle: false,
                visit_date: '',
                outcome: '',
                patient_id: '',
                patient_name: '',
                icd: {
                    code: '',
                    id: ''
                },
                prescriptions: {
                    doctor_id: '',
                    doctor_name: '',
                    data: [],
                    new: {
                        show: false,
                        drug_id: '',
                        drug_name: '',
                        quantity: '',
                        dose: '',
                        notice: '',
                        toggleShow: function() {
                            this.show = !this.show;
                        },
                        reset: function() {
                            fillValue('', this, 'string');
                        }
                    }
                },
                lab_orders: {
                    doctor_id: '',
                    doctor_name: '',
                    data: [],
                    new: {
                        show: false,
                        result: '',
                        toggleShow: function() {
                            this.show = !this.show;
                        },
                        reset: function() {
                            fillValue('', this, 'string');
                        }
                    }
                },
                services: {
                    type: '',
                    data: [],
                    new: {
                        show: false,
                        medical_service_id: '',
                        medical_service_name: '',
                        toggleShow: function() {
                            this.show = !this.show;
                        },
                        reset: function() {
                            fillValue('', this, 'string');
                        }
                    }
                },
                reset: function() {
                    fillValue('', this, 'string');
                    fillValue('', this.icd, 'string');

                    fillValue('', this.prescriptions, 'string');
                    this.prescriptions.new.show = false;
                    this.prescriptions.data.length = 0;

                    fillValue('', this.lab_orders, 'string');
                    this.lab_orders.new.show = false;
                    this.lab_orders.data.length = 0;

                    fillValue('', this.services, 'string');
                    this.services.new.show = false;
                    this.services.data.length = 0;

                }
            };

            $scope.edit = {
                toggle: false,
                visit_date: '',
                outcome: '',
                patient_id: '',
                patient_name: '',
                icd: {
                    code: '',
                    id: ''
                },
                prescriptions: {
                    doctor_id: '',
                    doctor_name: '',
                    data: [],
                    new: {
                        show: false,
                        drug_id: '',
                        drug_name: '',
                        quantity: '',
                        dose: '',
                        notice: '',
                        toggleShow: function() {
                            this.show = !this.show;
                        },
                        reset: function() {
                            fillValue('', this, 'string');
                        }
                    }
                },
                lab_orders: {
                    doctor_id: '',
                    doctor_name: '',
                    data: [],
                    new: {
                        show: false,
                        result: '',
                        toggleShow: function() {
                            this.show = !this.show;
                        },
                        reset: function() {
                            fillValue('', this, 'string');
                        }
                    }
                },
                services: {
                    type: '',
                    data: [],
                    new: {
                        show: false,
                        medical_service_id: '',
                        medical_service_name: '',
                        toggleShow: function() {
                            this.show = !this.show;
                        },
                        reset: function() {
                            fillValue('', this, 'string');
                        }
                    }
                },
                reset: function() {
                    fillValue('', this, 'string');
                    fillValue('', this.icd, 'string');

                    fillValue('', this.prescriptions, 'string');
                    this.prescriptions.new.show = false;
                    this.prescriptions.data.length = 0;

                    fillValue('', this.lab_orders, 'string');
                    this.lab_orders.new.show = false;
                    this.lab_orders.data.length = 0;

                    fillValue('', this.services, 'string');
                    this.services.new.show = false;
                    this.services.data.length = 0;

                }
            };

            /* autocomplete function */
            $scope.enter = function(dataObject) {
                dataObject.reset();
                dataObject.toggleShow();
            };

            $scope.input = function(dataObject) {
                /* make edit mode for object */
                var object = returnObject(dataObject.new, 'string');
                object.editMode = false;

                /* push the object into data */
                dataObject.data.push(object);
                $scope.enter(dataObject.new);
            };

            $scope.typeaheadOnSelect = function(object, property, $item) {
                object[property] = $item.id.toString();
            };

            /* defer and promise */
            var patientsDeferred = $q.defer(),
                doctorsDeferred = $q.defer(),
                drugsDeferred = $q.defer(),
                medicalServicesDeferred = $q.defer(),
                icdsDeferred = $q.defer();

            $scope.getPatients = function(searchValue) {
                return getData('patient_lookup', searchValue, patientsDeferred);
            };

            $scope.getDoctors = function(searchValue) {
                return getData('doctor_lookup', searchValue, doctorsDeferred);
            };

            $scope.getDrugs = function(searchValue) {
                return getData('drug_lookup', searchValue, drugsDeferred);
            };

            $scope.getMedicalServices = function(searchValue) {
                return getData('medical_service_lookup', searchValue, medicalServicesDeferred);
            };

            $scope.getICDs = function(searchValue) {
                return getData('icd_lookup', searchValue, icdsDeferred);
            };

            /* utility */
            $scope.deleteElement = function(object, index, numberOfElement) {
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        object.splice(index, numberOfElement);
                        $scope.$apply();
                    }
                });
            };

            $scope.createSubmit = function() {
                var prescriptionsData = [];
                $scope.create.prescriptions.data.forEach(function(item) {
                    prescriptionsData.push({
                        drug_id: item.drug_id,
                        drug_name: item.drug_name,
                        quantity: item.quantity,
                        dose: item.dose,
                        notice: item.notice
                    });
                });

                var labOrdersData = [];
                $scope.create.lab_orders.data.forEach(function(item) {
                    labOrdersData.push({
                        result: item.result
                    });
                });

                var servicesData = [];
                $scope.create.services.data.forEach(function(item) {
                    servicesData.push({
                        medical_service_id: item.medical_service_id,
                        medical_service_name: item.medical_service_name
                    });
                });

                socket.send({
                    'type': 'medical_history_handler',
                    'method': 'create',
                    'elements': [{
                        visit_date: $scope.create.visit_date,
                        outcome: $scope.create.outcome,
                        patient_id: $scope.create.patient_id,
                        patient_name : $scope.create.patient_name,
                        icd: {
                            id: $scope.create.icd.id,
                            code: $scope.create.icd.code
                        },
                        prescriptions: {
                            doctor_id: $scope.create.prescriptions.doctor_id,
                            doctor_name : $scope.create.prescriptions.doctor_name,
                            data: prescriptionsData
                        },
                        lab_orders: {
                            doctor_id: $scope.create.lab_orders.doctor_id,
                            doctor_name : $scope.create.lab_orders.doctor_name,
                            data: labOrdersData
                        },
                        services: {
                            service_type: $scope.create.services.type,
                            data: servicesData
                        }
                    }]
                });
                $scope.create.toggle = false;
                $scope.create.reset();
            };

            $scope.filter = function() {

            };

            $scope.toPage = function(pageNumber) {
                socket.send({
                    type: 'medical_history_handler',
                    method: ($scope.query == '') ? 'query' : 'filter',
                    page: pageNumber,
                    max: MAX_ITEM_PER_PAGE,
                    keyword: $scope.query
                });
            };

            /* init web socket */
            socket.registerCallBack(function(e) {
                var data = JSON.parse(e);
                if (data.type == 'medical_history_handler') {
                    switch (data.method) {
                        case 'query':
                            $scope.noElements = data.noElements;
                            $scope.medicalHistories = data.elements;
                            break;
                        case 'create':
                            $scope.medicalHistories.unshift(data.elements[0]);
                            break;
                        case 'update':
                            // (function(){
                            //     var medicalService = $scope.medicalServices.filter(function(o) { 
                            //         return o.id == data.elements[0].id
                            //     })[0];
                            //     if (medicalService) {
                            //         func.simpleExtend(medicalService, data.elements[0]);
                            //     }    
                            // }());
                            break;
                        case 'filter':
                            // $scope.noElements = data.noElements;
                            // $scope.medicalServices = data.elements;
                            break;
                        case 'delete':
                            // (function(){
                            //     var index = func.findIndexByKeyValue(
                            //         $scope.medicalServices, 'id', data.elements[0].id
                            //     );
                            //     $scope.medicalServices.splice(index, 1);
                            // }());
                            break;
                        case 'patient_lookup':
                            patientsDeferred.resolve(data.elements);
                            patientsDeferred = $q.defer();
                            break;
                        case 'doctor_lookup':
                            doctorsDeferred.resolve(data.elements);
                            doctorsDeferred = $q.defer();
                            break;
                        case 'drug_lookup':
                            drugsDeferred.resolve(data.elements);
                            drugsDeferred = $q.defer();
                            break;
                        case 'medical_service_lookup':
                            medicalServicesDeferred.resolve(data.elements);
                            medicalServicesDeferred = $q.defer();
                            break;
                        case 'icd_lookup':
                            icdsDeferred.resolve(data.elements);
                            icdsDeferred = $q.defer();
                            break;
                    }
                }
                $scope.$apply();
            });

            socket.send({
                type: 'medical_history_handler',
                method: 'query',
                page: 1,
                max: MAX_ITEM_PER_PAGE,
            });
        }
    ]);
});