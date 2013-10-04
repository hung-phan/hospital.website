'use strict';

/* App Module */

var myApp = angular.module('phonecatApp', ['phonecatFilters', 'phonecatServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/phones', {templateUrl: 'partials/phone-list.html',   controller: 'PhoneListCtrl'}).
      when('/phones/:phoneId', {templateUrl: 'partials/phone-detail.html', controller: 'PhoneDetailCtrl'}).
      otherwise({redirectTo: '/phones'});
}]);
