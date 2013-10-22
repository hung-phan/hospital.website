define(['angular'], function(angular) {
    'use strict';

    /* Services */
    angular.module('hospitalServices', ['ngResource'])
    .factory('LoginService', function($resource) {
        return $resource('login');
    })
    .factory('CreateAccountService', function($resource) {
        return $resource('create-account');   
    })
    .factory('WebSocketService', function($q, $rootScope) {
        var url = 'ws://localhost:12345/home';
        var ws = (window.MozWebSocket) ? new MozWebSocket(url) : new WebSocket(url);
        var service = {
            callback : function(message) { }
        };
        var storedMessage = [];

        ws.onopen = function() { console.log('open WebSocket'); };
        ws.onclose = function() { 
            console.log('close WebSocket');
            window.onbeforeunload = function() { ws.close(); };
        };
        ws.onmessage = function(message) {
            service.callback(message.data);
        };
        service.registerCallBack = function(callback) { service.callback = callback; };
        service.send = function(message) { ws.send(JSON.stringify(message)); };
        return service;
    });
});
