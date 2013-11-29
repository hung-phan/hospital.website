requirejs.config({
    paths: {
        'angular' : 'vendor/angular.min',
        'angular-resource' : 'vendor/angular-resource.min',
        'bootstrap' : 'vendor/bootstrap.min',
        'jquery' : 'vendor/jquery.min',
        'alertify' : 'vendor/alertify.min',
        'functional' : 'vendor/functional',
        'ui-bootstrap' : 'vendor/ui-bootstrap.min',
        'datepicker' : 'vendor/bootstrap-datepicker.min'
    }, shim: {
        'angular' : { exports : 'angular' }, 
        'angular-resource' : ['angular'], 
        'alertify' : { exports : 'alertify' },
        'bootstrap' : ['jquery'],
        'ui-bootstrap' : ['angular', 'angular-resource'],
        'datepicker' : ['bootstrap', 'jquery'],
        'controllers' : ['angular', 'services'],
        'filters' : ['angular'],
        'services' : ['angular'],
        'directives' : ['angular']
    }
});

Window.name = "NG_DEFER_BOOTSTRAP!";

define([
    'angular', 
    'angular-resource',
    'jquery',
    'datepicker',
    'ui-bootstrap',
    'controllers',
    'filters',
    'services',
    'directives'
], function(angular, angular_resource, $) {
    'use strict';

    /* App Module */
    $(document).ready(function() {
        // smart works go here
        var $html = $('html');
        angular.module('hospitalApp', [
                'ui.bootstrap',
                'hospitalControllers', 
                'hospitalFilters', 
                'hospitalServices',
                'hospitalDirectives'
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
