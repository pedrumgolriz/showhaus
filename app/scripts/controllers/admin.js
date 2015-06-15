'use strict';
/*global $:false*/
/**
 * @ngdoc function
 * @name showhausAngApp.controller:AdminCtrl
 * @description
 * # AdminCtrl
 * Controller of the showhausAngApp
 */
var FB;
window.fbAsyncInit = function () {
	FB.init({
		appId: '204851123020578',
		status: true,
		xfbml: true
		//version: 'v2.'
	});
};
(function (d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement(s);
	js.id = id;
	js.src = 'https://connect.facebook.net/en_US/all.js';
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

angular.module('showhaus')
  .controller('AdminCtrl', function ($scope, $http) {
		//
		FB.login();
		$scope.events = [];
		$(".ui-dialog-content").dialog("destroy");
		$scope.executeSearch = function(){
			if($scope.citySelect == undefined){
				alert('please select a city first');
			}
			else {
				FB.getLoginStatus(function (response) {
					$scope.authToken = response.authResponse.accessToken;
				});
				FB.api({
						method: 'fql.query',
						query: 'SELECT eid FROM event WHERE CONTAINS("'+$scope.search+' '+$scope.citySelect+'")',
						access_token: $scope.authToken
					},
					function (response) {
						$scope.events = [];
						for (var i = 0; i < response.length; i++) {
							var eid = response[i]['eid'];
							FB.api(eid, function (response) {
								$scope.$apply(function () {
									$scope.events.push(response);
								});
								console.log(response);
							});
						}
					}
				);
			}
		};
  });
