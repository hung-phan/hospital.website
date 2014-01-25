define("main",[],function(){requirejs.config({paths:{angular:"vendor/angular","angular-resource":"vendor/angular-resource","angular-route":"vendor/angular-route",bootstrap:"vendor/bootstrap",jquery:"vendor/jquery",alertify:"vendor/alertify",functional:"vendor/functional","ui-bootstrap":"vendor/ui-bootstrap","bootstrap-datepicker":"vendor/bootstrap-datepicker",controllers:"controllers/controllers",directives:"directives/directives",filters:"filters/filters",services:"services/services"},shim:{angular:{exports:"angular"},"angular-resource":["angular"],"angular-route":["angular"],alertify:["jquery"],bootstrap:["jquery"],"ui-bootstrap":["angular","angular-resource"],"bootstrap-datepicker":["bootstrap","jquery"],controllers:["angular"],filters:["angular"],services:["angular"],directives:["angular"]}}),Window.name="NG_DEFER_BOOTSTRAP!",requirejs(["angular","jquery","angular-resource","angular-route","bootstrap-datepicker","ui-bootstrap","bootstrap","functional","alertify","controllers","filters","services","directives"],function(r,e){"use strict";e(document).ready(function(){var t=e("html");r.module("hospitalApp",["ngRoute","ngResource","ui.bootstrap","hospitalControllers","hospitalFilters","hospitalServices","hospitalDirectives"]).config(["$routeProvider","$interpolateProvider",function(r,e){r.when("/",{templateUrl:"partials/login.html",controller:"Login"}).when("/create-account",{templateUrl:"partials/create-account.html",controller:"CreateAccount"}).when("/home",{templateUrl:"partials/home.html",controller:"Home"}).when("/404",{templateUrl:"404.html"}).otherwise({redirectTo:"/404"}),e.startSymbol("[["),e.endSymbol("]]")}]),r.bootstrap(t,["hospitalApp"])})})});