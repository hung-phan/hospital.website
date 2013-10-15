define([
    'angular',
    'jquery',
    'alertify',
    'functional',
    'services'
], function(angular, $, alertify, func) {
    'use strict';

    /* Controllers */

    return angular.module('hospitalControllers', [
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
        function($scope, $location) {
            /* init */
            $scope.doctors = [
                { 
                    id : 1, 
                    name : 'Phan Quang Hung', 
                    address : 'Bui Dinh Tuy', 
                    phone_number : '0908 287 253', 
                    working_hour : '6 am to 4 pm', 
                    specialist : 'Surgery', 
                    notice : 'This is notice'
                }, { 
                    id : 2, 
                    name : 'Phan Minh Dang', 
                    address : 'Bui Dinh Tuy', 
                    phone_number : '0908 287 253', 
                    working_hour : '6 am to 4 pm', 
                    specialist : 'Beast', 
                    notice : 'This is notice'
                }, { 
                    id : 3, 
                    name : 'Tran Ngoc Nghi', 
                    address : 'Bui Dinh Tuy', 
                    phone_number : '0908 287 253', 
                    working_hour : '6 am to 4 pm', 
                    specialist : 'Beauty', 
                    notice : 'This is notice'
                }
            ];
            $scope.test = 'test';
            
            $scope.edit = function(text) {
                $scope.test = text;
            };
        }
    ]);
});
