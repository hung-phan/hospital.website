define([
    'angular',
    'jquery',
    'alertify',
    'services'
], function(angular, $, alertify) {
    'use strict';

    /* Controllers */

    return angular.module('hospitalControllers', [
        'hospitalServices'
    ]).controller('Login', [
        '$scope',
        '$route',
        'LoginService', 
        function($scope, $route, LoginService) {

        }
    ]).controller('CreateAccount', [
        '$scope', 
        '$route',
        'CreateAccountService',
        function($scope, $route, CreateAccountService) {
            
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
            
            CreateAccountService.ws.onmessage = function(message) {
                var data = JSON.parse(message);

                /* identify message type */
                switch (data.type) {
                    case 'validation' :
                        $scope.signup.usernameExist = data.usernameExist;
                        break;
                    case 'successCreateAccount':
                        $scope.signup.success = data.success;
                        alertify.log('Account successfully created');
                        $route.current.templateUrl = 'partials/home.html'; 
                        break;
                }
            };

            /* create account with username and password */
            $scope.createAccount = function() {
                (function() {
                    /* validation */ 
                    $scope.signup.passwordIdentical = $scope.signup.password == $scope.signup.confirmation;
                    /* implement server later */
                    $scope.signup.usernameExist = false;
                    $scope.signup.error = !$scope.signup.passwordIdentical || $scope.signup.usernameExist;
                }());
                if (!$scope.signup.error) {
                    /* insert account into the server database */
                    var signup = {
                        type : 'CreateAccount',
                        firstName : $scope.signup.firstName,
                        lastName : $scope.signup.lastName,
                        username : $scope.signup.username,
                        password : $scope.signup.password
                    }
                    CreateAccountService.send(signup);
                }
            }
        }
    ]);
});
