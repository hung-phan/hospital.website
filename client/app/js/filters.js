define(['angular'], function(angular) {
    'use strict';
    /* Filters */

    angular.module('hospitalFilters', []).filter('checkmark', function() {
      return function(input) {
        return input ? '\u2713' : '\u2718';
      };
    });
});