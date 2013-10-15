requirejs.config({
    paths: {
        'angular' : 'vendor/angular.min',
        'angular_resource' : 'vendor/angular-resource.min',
        'bootstrap' : 'vendor/bootstrap.min',
        'jquery' : 'vendor/jquery.min',
        'alertify' : 'vendor/alertify.min',
        'functional' : 'vendor/functional'
    }, shim: {
        'angular' : { exports : 'angular' }, 
        'angular_resource' : ['angular'], 
        'bootstrap' : ['jquery'],
        'alertify' : { exports : 'alertify' },
        'controllers' : ['angular', 'services'],
        'filters' : ['angular'],
        'services' : ['angular']
    }
});

Window.name = "NG_DEFER_BOOTSTRAP!";

define([
    'angular', 
    'angular_resource',
    'jquery',
    'controllers',
    'filters',
    'services'
], function(angular, angular_resource, $) {
    'use strict';

    /* App Module */
    $(document).ready(function() {
        // smart works go here
        var $html = $('html');
        angular.module('hospitalApp', [
                'hospitalControllers', 
                'hospitalFilters', 
                'hospitalServices'
            ]).config(['$routeProvider', '$interpolateProvider', function($routeProvider, $interpolateProvider) {
                $routeProvider.
                    when('/login', {
                        templateUrl: 'partials/login.html', 
                        controller: 'Login'
                    }).
                    when('/create-account', {
                        templateUrl: 'partials/create-account.html', 
                        controller: 'CreateAccount'
                    }).
                    when('/home', {
                        templateUrl: 'partials/home.html',
                        controller: 'Home'
                    }).
                    otherwise({redirectTo: '/home'});
                /* change configure to use [[ to be the interpolation */
                $interpolateProvider.startSymbol('[[');
                $interpolateProvider.endSymbol(']]');
        }]);
        // bootstrap model
        angular.bootstrap($html, ['hospitalApp']);
    });
});
