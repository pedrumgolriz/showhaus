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
		if(FB) {
			FB.login();
		}
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
						query: 'SELECT eid, pic_big, ticket_uri FROM event WHERE CONTAINS("'+$scope.search+' '+$scope.citySelect+'") ORDER BY start_time ASC',
						access_token: $scope.authToken
					},
					function (response) {
						if(localStorage.getItem('fb_response')) {
							localStorage.setItem('fb_response', parseInt(localStorage.getItem('fb_response'))+1);
						}
						else{
							localStorage.setItem('fb_response',1);
						}
						$scope.events = [];
						for (var i = 0; i < response.length; i++) {
							var eid = response[i]['eid'];
							FB.api(eid, function (nested) {
								for(var q = 0; q < response.length; q++){
								    if(response[q].eid == nested.id){
								        if(response[q]['pic_big']) {
								            nested.image = response[q]['pic_big'];
								        }
									    if(response[q]['ticket_uri']) {
										    nested.image = response[q]['ticket_uri'];
									    }
								    }
								 }
								$scope.$apply(function () {
									$scope.events.push(nested);
								});
								console.log($scope.events);
								localStorage.setItem('fb_response', parseInt(localStorage.getItem('fb_response'))+1);
							});
						}
					}
				);
			}
		};
		$scope.parseInt = function(string){
			return parseInt(string);
		}
  });
