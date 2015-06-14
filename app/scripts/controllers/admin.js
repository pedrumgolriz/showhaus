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
		xfbml: true,
		version: 'v2.3'
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
		FB.login(function () {}, {
			scope: ''
		});
		$scope.events = [];
		$(".ui-dialog-content").dialog("destroy");
		$scope.executeSearch = function(){
			FB.getLoginStatus(function(response){
				$scope.$apply(function(){
					$scope.authToken = response.authResponse.accessToken;
				});
			});
			FB.api('/search?q=' + $scope.search + '&type=event', {
					access_token: $scope.authToken
				},
				function (response) {
					$scope.$apply(function () {
						for(var i = 0; i< response.data.length; i++){
							var eid = response.data[i]['id'];
							FB.api(eid,function(response){
								$scope.events.push(response);
								console.log(response);
							});
						}
					});
				}
			);
		};
  });
