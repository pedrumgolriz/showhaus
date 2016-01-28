'use strict';

/**
 * @ngdoc function
 * @name showhausAngApp.controller:SuccessCtrl
 * @description
 * # SuccessCtrl
 * Controller of the showhausAngApp
 */
var preUrl = 'http://showhaus.org/assets/';
angular.module('showhaus')
  .controller('SuccessCtrl', function ($scope, $resource, $location) {
	$(".ui-dialog-content").dialog("destroy");
	var postnumber = $location.$$search.post;
	var jsonQuery = preUrl + 'events.php?post=' + postnumber;
	$scope.events = $resource(jsonQuery, {}, {query: {method: 'JSONP', params: {callback: 'JSON_CALLBACK'}, isArray: true}}).query();
  });
