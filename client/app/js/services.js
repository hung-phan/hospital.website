define(['angular'], function(angular) {
    'use strict';

    /* Services */
    angular.module('hospitalServices', [])
    .factory('LoginService', [
        'ngResource', 
        function($resource) {
            return $resource('login');
        }
    ])
    .factory('CreateAccountService', [
        'ngResource', 
        function($resource) {
            return $resource('create-account');   
        }
    ])
    .factory('WebSocketService', [
        '$q', 
        '$rootScope', 
        function($q, $rootScope) {
            var url = 'ws://localhost:12345/home';
            var ws = (window.MozWebSocket) ? new MozWebSocket(url) : new WebSocket(url);
            var callbacks = {};
            var currentCallbackId = 0;
            var service = {
                callback : function(message) { }
            };
 
            ws.onopen = function() {
                console.log('open WebSocket');
            };
            ws.onclose = function() {
                console.log('close WebSocket');
                window.onbeforeunload = function() { ws.close(); };
            };
            ws.onmessage = function(message) { 
                service.callback(JSON.parse(message.data));
            };

            service.registerCallBack = function(callback) { service.callback = callback; };

            service.send = function(message) { ws.send(JSON.stringify(request)); };

            return service;
        }
    ]);
});
