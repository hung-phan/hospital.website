define(function() {
    'use strict';

    /* Controllers */
    var controller = {};
    
    controller.PhoneListCtrl = function($scope, Phone) {
        $scope.phones = Phone.query();
        $scope.orderProp = 'age';
    }

    controller.PhoneDetailCtrl = function($scope, $routeParams, Phone) {
        $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
            $scope.mainImageUrl = phone.images[0];
        });

        $scope.setImage = function(imageUrl) {
            $scope.mainImageUrl = imageUrl;
        }
    }
    console.log('controllers');
    return controller;
});
