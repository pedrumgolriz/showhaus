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
		version: 'v2.5'
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
	.controller('FeedsCtrl', function ($scope, $http, $route, $rootScope, $window, $location) {
		//
		$scope.events = [];
		$scope.feeds = feeds;
		$(".ui-dialog-content").dialog("destroy");
		$rootScope.$on('$routeChangeSuccess', function(){
		    $window.ga('send', 'pageview', { page: 'Feeds' });
		});
		$scope.tabView = false;
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
		};
		$scope.sendFBMessage = function(page){
			var parsePage = page.url.split("https://www.facebook.com/");
			page = parsePage[1];
			page = FB.api(
	            page,
	            function (response) {
	              if (response && !response.error) {
	                /*FB.ui({
                      method: 'send',
                      link: 'http://www.showhaus.org/#!/feeds',
                      app_id: '204851123020578',
                      to: response.id,
                      feedform_user_message: "Hey! I'm Pedrum with Showhaus.org. I'm writing to let you know that your page has been added to our list of feeds. Anytime you post an event, it will automatically show up on our list."
                    });*/
                    var request = {
	                    "sender":{
	                      "id":"showhaus"
	                    },
	                    "recipient":{
	                      "id": response.id
	                    },
	                    "timestamp":Date.now(),
	                    "message":{
	                      "text":"Hey! I'm Pedrum with Showhaus.org. I'm writing to let you know that your page has been added to our list of feeds. Anytime you post an event, it will automatically show up on our list."
	                    }
	                  };

                    $http.post(
                        'https://graph.facebook.com/v2.6/showhaus/messages?access_token=EAAC6T55rYyIBAKiKxg26dG1iGdm7osQCJVhDdcBhRCZAszxyTiwqxx4fdjEd96PzKR6C884ZC4ZA6lldEvFAuj4AU81FtsfF9K0W9zYjZCbx2G0GZCwPAIZBGgQLp7xTGEPR2LIINbzNU4vRu2QNdtmkLLy6bozWVonOWhGlRsiuOXFJlMMKe4eFoB649cdJQZD',
                        JSON.stringify(request)
                    ).success(function(data){
                        console.log(data);
                    });
                    var data = {
                        'id': page.ai
                    };
                    /*$http.post(
                        preUrl + 'messageFeed.php',
                        data
                    )*/
	              }
	            }
	        );
		};
  });
