define([
    'angular',
    'alertify'
], function(angular, alertify) {
    'use strict';

    /* Services */
    angular.module('hospitalServices', ['ngResource'])
    .factory('LoginService', [
        '$resource',
        function($resource) {
            return $resource('login');
        }
    ])
    .factory('CreateAccountService', [
        '$resource',
        function($resource) {
            return $resource('create-account');   
        }
    ])
    .factory('AuthenticationService', [
        function() {
            var authenticationObject = {        
                loginSession: function(username) {
                    sessionStorage.setItem('HospitalAuthenticationSession', username);
                },
                authenticateSession: function() {
                    return sessionStorage.getItem('HospitalAuthenticationSession') != null ? true : false;
                },
                logoutSession: function() {
                    sessionStorage.removeItem('HospitalAuthenticationSession');
                }
            };
            return authenticationObject;
        }    
    ])
    .factory('WebSocketService', [
        '$q',
        '$rootScope',
        function($q, $rootScope) {
            var service = {
                websocket: undefined,
                logout: false,
                connect: function() {
                    try{
                        var url = 'ws://localhost:8000/home', self = this;
                        this.logout = false;
                        this.websocket = (window.MozWebSocket) ? new MozWebSocket(url) : new WebSocket(url);
                        this.websocket.onopen = function() { alertify.success('WebSocket is opened'); };
                        this.websocket.onclose = function() { 
                            self.reconnect();
                        };
                        this.websocket.onmessage = function(message) {
                            self.callback(message.data);
                        };
                    } catch (error) {
                        this.reconnect();
                    }
                },
                reconnect: function() {
                    if (!this.logout) {
                        var self = this;
                        alertify.log('Websocket is closed. Reconnect in 5s');
                        setTimeout(function() { self.connect(); }, 5000);
                    }
                },
                disconnect: function() {
                    this.logout = true;
                    this.websocket.close();
                    alertify.success('Logout success');
                },
                callback : function(message) { },
                registerCallBack: function(callbackFunction) { this.callback = callbackFunction; },
                send: function(message) { this.websocket.send(JSON.stringify(message)); }
            };
            return service;
        }
    ]);
});
