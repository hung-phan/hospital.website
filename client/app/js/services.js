define(['angular'], function(angular) {
    'use strict';
    /* Services */

    function CustomWebSocketService(url) {
        this.ws = (window.MozWebSocket) ? new MozWebSocket(path) : new WebSocket(path);
        this.ws.onopen = function() { /* empty function but it can be overriden later */ };
        this.ws.onmessage = function(message) { /* empty function but it can be overriden later */ };
        this.ws.onclose = function() { /* empty function but it can be overriden later */ };
    }
    
    CustomWebSocketService.prototype = {
        send : function(data) {
            console.log(data);
            this.ws.send(JSON.stringify(data));
        }
    };

    angular.module('hospitalServices', ['ngResource'])
        .factory('LoginService', function($resource) {
            return $resource('login');
        })
        .factory('CreateAccountService', function($resource) {
              return $resource('create_account');   
        });
});
