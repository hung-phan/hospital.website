define(['angular'], function(angular) {
    'use strict';
    /* Services */

    angular.module('hospitalServices', ['ngResource']).
        factory('Phone', function($resource){
      return $resource('phones/:phoneId.json', {}, {
        query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
      });
    });
});
