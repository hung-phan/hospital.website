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
                        alertify.log('Wrong username or password')
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
                passwordIdentical : true,
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
        function($scope, $location) {
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
            $scope.doctors = [];
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
                console.log(data);
                if (data.type == 'doctor_handler') {
                    switch(data.method) {
                        case 'query':
                            $scope.doctors = data.elements;
                            break;
                        case 'create':
                            $scope.doctors.push(data.elements);
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
            });

            socket.send({
                type : 'doctor_handler',
                method : 'query'
            });

            $scope.toggleEdit = function(doctorID) {
                func.simpleExtend($scope.current, 
                    $scope.doctors.filter(function(o) { return o.id == doctorID; })[0]);
                $('#edit-modal').modal('toggle');
            };

            $scope.toggleCreate = function() {
                $scope.new.reset();
                $('#create-modal').modal('toggle');
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
                $('#create-modal').modal('toggle');
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
                $('#edit-modal').modal('toggle');
            }

            $scope.delete = function(doctorID) {
                /* confirm dialog */
                alertify.confirm("Delete this row ?", function(ok) {
                    if (ok) {
                        socket.send({
                            type : 'doctor_handler',
                            method : 'delete',
                            elements : [
                                {
                                    id : doctorID
                                }
                            ]
                        });
                    }
                });
            };
        }
    ]);
});
