'use strict';

/**
 * @ngdoc function
 * @name showhausAngApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the showhausAngApp
 */
angular.module('showhaus')
  .controller('AboutCtrl', function ($rootScope, $window, $location) {
		$(".ui-dialog-content").dialog("destroy");
		$rootScope.$on('$routeChangeSuccess', function(){
            $window.ga('send', 'pageview', { page: 'About Page' });
        });
  });
