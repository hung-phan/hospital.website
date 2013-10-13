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
                func.simpleExtend(signin, {
                            username : $scope.signin.username,
                            password : $scope.signin.password
                        });
                signin.$save({}, function(data) {
                    if (data.validUser) {
                        var role = data.role;
                        // remember me
                        $location.path('/home');
                    }
                }, function(data) {
                    alertify.error('Server down, try again later'); 
                });

            }
        }
    ]).controller('CreateAccount', [
        '$scope', 
        '$location',
        'CheckUsernameExistService',
        'CreateAccountService',
        function($scope, $location, CheckUsernameExistService, CreateAccountService) {
            
            /* initialize */
            $scope.signup = {
                firstName : '',
                lastName : '',
                username : '',
                password : '',
                confirmation : '',
                error : false,
                passwordIdentical : true,
                usernameExist : false,
                success : false
            };

            /* create account with username and password */
            $scope.createAccount = function() {
                /* validation */ 
                $scope.signup.passwordIdentical = $scope.signup.password == $scope.signup.confirmation;
                // $scope.signup.usernameExist = CheckUsernameExistService.query().usernameExist;
                $scope.signup.error = !$scope.signup.passwordIdentical || $scope.signup.usernameExist;
                
                if (!$scope.signup.error) {
                    /* insert account into the server database */
                    var signup = new CreateAccountService();
                    func.simpleExtend(signup, {
                                type : 'CreateAccount',
                                firstName : $scope.signup.firstName,
                                lastName : $scope.signup.lastName,
                                username : $scope.signup.username,
                                password : $scope.signup.password
                            });
                    signup.$save({}, function(data) {
                        /* successfully create account */
                        alertify.success('Account successfully created');
                        $location.path('/login'); 
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
            $scope.test = 'test'; 
            console.log('Test');
            var auth = false;
            if (!auth) {
                $location.path('/login');
            }
        }
    ]);
});
