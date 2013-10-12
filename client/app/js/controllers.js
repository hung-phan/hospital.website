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
        function($scope, $route) {
            
            //initialize
            $scope.signup = {
                username : '',
                password : '',
                confirmation : '',
                info : '',
                error : false,
                passwordIdentical : true,
                usernameExist : false
            };

            /* create account with username and password */
            $scope.createAccount = function() {
                (function() {
                    /* validation */ 
                    $scope.signup.passwordIdentical = $scope.signup.password == $scope.signup.confirmation;
                    // implement server later
                    $scope.signup.usernameExist = false;
                    $scope.signup.error = !$scope.signup.passwordIdentical || $scope.signup.usernameExist;
                }());
                if (!$scope.signup.error) {
                    /* insert account into the server database */
                    var signup = {
                        username : $scope.signup.username,
                        password : $scope.signup.password,
                        info : $scope.signup.info,
                    }
                    alertify.log('Account sucessfully created');
                }
            }
        }
    ]);
});
