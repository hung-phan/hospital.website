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
        '$route',
        'LoginService', 
        function($scope, $route, LoginService) {

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
                // uncomment later
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
                    // uncomment later
                    // signup.$save();
                    alertify.log('Account successfully created');
                    $location.path('/login'); 
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
