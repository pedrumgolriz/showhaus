'use strict';

/**
 * @ngdoc function
 * @name showhausAngApp.controller:SuccessCtrl
 * @description
 * # SuccessCtrl
 * Controller of the showhausAngApp
 */
var preUrl = 'http://v2.showhaus.org/';
angular.module('showhaus')
  .controller('SuccessCtrl', function ($scope, $resource, $location) {
	var postnumber = $location.$$search.post;
	var jsonQuery = preUrl + 'assets/events.php?post=' + postnumber;
	$scope.events = $resource(jsonQuery, {}, {query: {method: 'JSONP', params: {callback: 'JSON_CALLBACK'}, isArray: true}}).query();
  });