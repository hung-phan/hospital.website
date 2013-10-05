requirejs.config({
    paths: {
        vendor: 'vendor'
    }, shim: {
        'vendor/angular.min' : { exports : 'angular' }, 
        'vendor/angular-resource.min' : ['vendor/angular.min'], 
        'vendor/bootstrap.min' : ['vendor/jquery.min'], 
        'controllers' : ['vendor/angular.min'],
        'directives' : ['vendor/angular.min'],
        'filters' : ['vendor/angular.min'],
        'services' : ['vendor/angular.min']
    }
});

define([
    'vendor/angular.min', 
    'vendor/angular-resource.min',
    'vendor/jquery.min',
    'vendor/bootstrap.min',
    'controllers',
    'directives',
    'filters',
    'services'
], function(ng, ngResource, jquery, bootstrap, ctrl) {
    'use strict';

    /* App Module */

    angular.module('hospitalApp', ['phonecatFilters', 'phonecatServices']).
        config(['$routeProvider', function($routeProvider) {
            $routeProvider.
                when('/phones', {templateUrl: 'partials/phone-list.html', controller: ctrl.PhoneListCtrl}).
                when('/phones/:phoneId', {templateUrl: 'partials/phone-detail.html', controller: ctrl.PhoneDetailCtrl}).
               otherwise({redirectTo: '/phones'});
    }]);
});
