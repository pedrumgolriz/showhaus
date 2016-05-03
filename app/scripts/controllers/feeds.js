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
var preUrl = 'http://showhaus.org/assets/';//set to blank for release
var feeds = [];
angular.module('showhaus')
	.factory('feedsFactory', function($resource) {
		var jsonQuery = preUrl+'feeds.php';
		return $resource(jsonQuery, {},{query: {method:'JSONP', params:{callback: 'JSON_CALLBACK'}, isArray:true}});
	})
	.run(function($http, feedsFactory) {
		feeds = feedsFactory.query();
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
            FB.api('/'+$scope.search,
                'GET',
                function (response) {
                    if(response.length !== 0 && !response.error && !response.error_code){
                        $scope.owner = response.name;
                        $scope.url = response.link;
                        $scope.check();
                    }
                    else if(!$scope.feedError){
                        $scope.feedError = true;
                    }
                    else if(!$scope.checkUrl){
                        $scope.feedError = false;
                        //$scope.search = $scope.search.substr(0, $scope.search.lastIndexOf("/"));
                        $scope.checkUrl = true;
                        //$scope.executeSearch();
                    }
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
				$scope.feedError = true;
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
	                    window.location.reload();
	                    $route.reload();
	                }).error(function (status) {
	                    $scope.feedError = true;
	                });
			}
		}
  });
