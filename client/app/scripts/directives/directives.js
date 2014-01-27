define(['angular'], function(angular) {
    'use strict';
	/* Directives */

    angular.module('hospitalDirectives', [])
	.directive('zippy', [
		function() {
	    	return {
	    		restrict : 'E',
	    		replace : true,
	    		templateUrl : 'partials/zippy.html',
	    		scope : { 
	    			label : "@",
	    			value : "="
	    		}
	    	};
		}
	])
	.directive('zippyNumber', [
		function() {
	    	return {
	    		restrict : 'E',
	    		replace : true,
	    		templateUrl : 'partials/zippy-number.html',
	    		scope : { 
	    			label : "@",
	    			value : "="
	    		}
	    	};
		}
	])
	.directive('selectie', [
		function() {
	    	return {
	    		restrict : 'E',
	    		replace : true,
	    		templateUrl : 'partials/selectie.html',
	    		scope : { 
	    			label : "@",
	    			value : "="
	    		}
	    	};
		}
	])
	.directive('paggie', [
		function() {
	    	return {
	    		restrict : 'E',
	    		replace : true,
	    		templateUrl : 'partials/paggie.html',
	    		scope : {
	    			elements : '=',
	    			callback : '&'
	    		}, link : function(scope, element, attrs) {
	    			var MAX_ITEM_PER_PAGE = 15;
	    			var MAX_NUMBER_OF_PAGE = 15;
	    			
	    			/* function */
	    			function init() {
	    				scope.maxPage = Math.ceil(Number(scope.elements) * 1.0 / MAX_ITEM_PER_PAGE);
                        scope.pages = [];
                        if (scope.maxPage <= MAX_NUMBER_OF_PAGE) {
                            for (var i = 1; i <= scope.maxPage; i++) {
                                scope.pages.push(i);
                            }
                        } else {
                            var lowIndex = scope.currentPage, middle = MAX_NUMBER_OF_PAGE / 2 - 1, noOfPage = 0;;
                            while (1 < lowIndex && middle > 0) {
                                lowIndex--;
                                middle--;
                            }
                            for (var i = lowIndex; i <= lowIndex + MAX_NUMBER_OF_PAGE - 1 && i <= scope.maxPage; i++) {
                                noOfPage++;
                                scope.pages.push(i);
                            }
                            while (noOfPage < MAX_NUMBER_OF_PAGE) {
                                noOfPage++;
                                scope.pages.unshift(--lowIndex);
                            }
                        }
	    			}

	    			/* initialize */
	    			scope.currentPage = 1;
	    			scope.goTo = function(page) {
	    				if (page != 0 && page != scope.maxPage + 1 && page != scope.currentPage) {
		    				scope.callback({ 'page' : page });
		    				scope.currentPage = page;
		    				init();
	    				}
	    			};
	    			scope.$watch('elements', function() {
	    				scope.currentPage = 1;
	    				init();
	    			});
	    		}
	    	};
		}
	])
	.directive('inputie', [
		function() {
			return {
				restrict : 'E',
	    		replace : true,
	    		templateUrl : 'partials/inputie.html',
	    		scope : {
	    			type: '@',
	    			data: '=',
	    			editMode: '=',
	    			placeHolder: '@'
	    		}
			};
		}
	]);
});
