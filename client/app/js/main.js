requirejs.config({
    paths: {
        'angular' : 'vendor/angular.min',
        'angular_resource' : 'vendor/angular-resource.min',
        'bootstrap' : 'vendor/bootstrap.min',
        'jquery' : 'vendor/jquery.min',
        'domReady' : 'vendor/domReady'
    }, shim: {
        'angular' : { exports : 'angular' }, 
        'angular_resource' : ['angular'], 
        'bootstrap' : ['jquery'], 
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
    
    // smart works go here
    var $html = $('html');
    angular.module('hospitalApp', [
            'hospitalControllers', 
            'hospitalFilters', 
            'hospitalServices'
        ]).config(['$routeProvider', function($routeProvider) {
            $routeProvider.
                when('/phones', {
                    templateUrl: 'partials/phone-list.html', 
                    controller: 'PhoneListCtrl'
                }).
                when('/phones/:phoneId', {
                    templateUrl: 'partials/phone-detail.html', 
                    controller: 'PhoneDetailCtrl'
                }).
               otherwise({redirectTo: '/phones'});
    }]);
    // bootstrap model
    angular.bootstrap($html, ['hospitalApp']);
});
