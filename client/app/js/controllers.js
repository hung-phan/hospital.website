define([
    'angular', 
    'services'
], function(angular) {
    'use strict';

    /* Controllers */
    
    return angular.module('hospitalControllers', [
        'hospitalServices'
    ]).controller('PhoneListCtrl', [
        '$scope', 
        'Phone', 
        function($scope, Phone) {
           $scope.phones = Phone.query();
           $scope.orderProp = 'age';
    }]).controller('PhoneDetailCtrl', [
        '$scope', 
        '$routeParams', 
        'Phone', 
        function($scope, $routeParams, Phone) {
            $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
                $scope.mainImageUrl = phone.images[0];
            });

            $scope.setImage = function(imageUrl) {
                $scope.mainImageUrl = imageUrl;
            }
    }]);
});
