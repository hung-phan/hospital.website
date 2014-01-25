define('main', [], function() {
    // main loader
    requirejs.config({
        paths: {
            'angular': '../bower_components/angular/angular',
            'angular-resource': '../bower_components/angular-resource/angular-resource',
            'angular-route': '../bower_components/angular-route/angular-route',
            'bootstrap': '../bower_components/sass-bootstrap/dist/js/bootstrap',
            'jquery': '../bower_components/jquery/jquery',
            'alertify': '../bower_components/alertify/alertify',
            'functional': 'vendor/functional',
            'ui-bootstrap': '../bower_components/angular-ui-bootstrap/dist/ui-bootstrap',
            'bootstrap-datepicker': '../bower_components/bootstrap-datepicker/js/bootstrap-datepicker',
            'controllers': 'controllers/controllers',
            'directives': 'directives/directives',
            'filters': 'filters/filters',
            'services': 'services/services'
        },
        shim: {
            'angular': {
                exports: 'angular'
            },
            'angular-resource': ['angular'],
            'angular-route': ['angular'],
            'alertify': ['jquery'],
            'bootstrap': ['jquery'],
            'ui-bootstrap': ['angular', 'angular-resource'],
            'bootstrap-datepicker': ['bootstrap', 'jquery'],
            'controllers': ['angular'],
            'filters': ['angular'],
            'services': ['angular'],
            'directives': ['angular']
        }
    });

    Window.name = 'NG_DEFER_BOOTSTRAP!';

    requirejs([
        'angular',
        'jquery',
        'angular-resource',
        'angular-route',
        'bootstrap-datepicker',
        'ui-bootstrap',
        'bootstrap',
        'functional',
        'alertify',
        'controllers',
        'filters',
        'services',
        'directives'
    ], function(angular, $) {
        'use strict';

        /* App Module */
        $(document).ready(function() {
            // smart works go here
            var $html = $('html');
            angular.module('hospitalApp', [
                'ngRoute',
                'ngResource',                
                'ui.bootstrap',
                'hospitalControllers',
                'hospitalFilters',
                'hospitalServices',
                'hospitalDirectives'
            ]).config(['$routeProvider', '$interpolateProvider',
                function($routeProvider, $interpolateProvider) {
                    $routeProvider.
                    when('/', {
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
                    when('/404', {
                        templateUrl: '404.html'
                    }).
                    otherwise({
                        redirectTo: '/404'
                    });
                    /* change configure to use [[ to be the interpolation */
                    $interpolateProvider.startSymbol('[[');
                    $interpolateProvider.endSymbol(']]');
                }
            ]);
            // bootstrap model
            angular.bootstrap($html, ['hospitalApp']);
        });
    });
});
