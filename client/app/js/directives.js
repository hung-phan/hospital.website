define(['angular'], function(angular) {
    'use strict';
	/* Directives */

    angular.module('hospitalDirectives', [])
	.directive('zippy', [
		'$parse', 
		function($parse) {
	    	return {
	    		restrict : 'ACE',
	    		templateUrl : 'partials/zippy.html',
	    		scope : { 
	    			label : "@",
	    			value : "="
	    		}, link : function linkFunction(scope, lElement, attrs) {
	    			/* doing nothing */

	    			/*
		    			scope.$watch(attrs.value, function(value) {
		    				lElement.text(value);
		    			});

		    			lElement.bind('click', function() {
		    				scope.$apply(function() {
		    					$parse(attrs.value).assign(scope, 'Default value');
		    				});
		    			});
					*/
	    		}
	    	};
		}
	]);
});