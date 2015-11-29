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
var preUrl = 'http://v3.showhaus.org/assets/';//set to blank for release
var feeds = [];
angular.module('showhaus')
	.factory('feedsFactory', function($resource) {
		var jsonQuery = preUrl+'feeds.php';
		return $resource(jsonQuery, {},{query: {method:'JSONP', params:{callback: 'JSON_CALLBACK'}, isArray:true}});
	})
	.run(function($http, feedsFactory) {
		//$interval(function() {
		feeds = feedsFactory.query();
		//}, 30000);
	})
	.controller('FeedsCtrl', function ($scope, $http, $route) {
		//
		$scope.events = [];
		$scope.feeds = feeds;
		$(".ui-dialog-content").dialog("destroy");
		$scope.executeSearch = function(){
			if(FB) {
				FB.login();
			}
				FB.getLoginStatus(function (response) {
					$scope.authToken = response.authResponse.accessToken;
				});
				var facebookTitle = $scope.search.split('facebook.com/')[1].split(/\W/g)[0];
				$scope.search = "http://www.facebook.com/"+facebookTitle;
				FB.api({
						method: 'fql.query',
						query: 'SELECT name, page_url FROM page WHERE page_id IN (SELECT page_id FROM page WHERE username = "'+facebookTitle+'")',
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
							$scope.owner = response[i].name;
							$scope.url = response[i].page_url;
							/*var eid = response[i]['eid'];
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
								$scope.owner = $scope.events[0].name;
								console.log($scope.owner);
								localStorage.setItem('fb_response', parseInt(localStorage.getItem('fb_response'))+1);
							});*/
						}
						$scope.check();
					}
				);
		};
		$scope.parseInt = function(string){
			return parseInt(string);
		}
		$scope.check = function(){
			var pageNames = [];
			for(var i = 0; i < feeds.length; i++){
				pageNames.push(feeds[i][0]);
			}
			if(pageNames.indexOf($scope.owner) > -1){
				$('.feedserror').show();
			}
			else{
				var today = new Date();
	            var dd = today.getDate();
	            var mm = today.getMonth()+1; //January is 0!
	            var yyyy = today.getFullYear();

	            if(dd<10) {
	                dd='0'+dd
	            }

	            if(mm<10) {
	                mm='0'+mm
	            }

	            today = mm+'/'+dd+'/'+yyyy;
				var data = {
	                'page': $scope.owner,
	                'date': today,
	                'url': $scope.url
	            };
				$http.post(
	                preUrl + 'newfeed.php',
	                data
	            ).success(function (data) {
	                    alert('Successfuly added');
	                    $('feedserror').hide();
	                    $route.reload();
	                }).error(function (status) {
	                    $('feedserror').show();
	                });
			}
		}
  });
