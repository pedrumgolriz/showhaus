'use strict';
/*global $:false*/
/**
 * @ngdoc function
 * @name showhausAngApp.controller:AutoParser
 * @description
 * # AutoParser
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
	FB.login();
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
	.run(function($http, feedsFactory, $interval) {
		feeds = feedsFactory.query();
		$interval(function() {
            feeds = feedsFactory.query();
        }, 80000);
	})
	.controller('AutoParser', function ($scope, $http, $interval) {
		$scope.events = [];
		$scope.feeds = feeds;
		$scope.moveUp = 0;
		$scope.executeSearch = function(facebookTitle){
			facebookTitle = facebookTitle.split('facebook.com/')[1].split(/\W/g)[0];
			FB.getLoginStatus(function (response) {
                $scope.authToken = response.authResponse.accessToken;
            });
			FB.api({
					method: 'fql.query',
					query: 'SELECT eid, start_time, location, name, pic_big, ticket_uri FROM event WHERE creator IN (SELECT page_id FROM page WHERE username = "'+facebookTitle+'") AND start_time >= now() ORDER BY start_time DESC',
					access_token: $scope.authToken
				},
				function (response) {
					if(localStorage.getItem('fb_response')) {
						localStorage.setItem('fb_response', parseInt(localStorage.getItem('fb_response'))+1);
					}
					else{
						localStorage.setItem('fb_response',1);
					}
					for (var i = 0; i < response.length; i++) {
						var responseDate = new Date(response[i].start_time.split('t')[0]);
                        responseDate = responseDate.getMonth()+1+'/'+responseDate.getDate()+'/'+responseDate.getFullYear();
                        var responseTime = response[i].start_time.split('T')[1];
                        if(parseInt(responseTime.split(':')[0])>12){
                            responseTime = parseInt(responseTime.split(':')[0]) - 12 +':'+ responseTime.split(':')[1] +" PM";
                        }
                        else{
                            responseTime+=" AM";
                        }
                        var data = {
                            'city': response[i].location,
                            'venue': response[i].venue,
                            //'newvenue': $scope.newvenuename,
                            //'venue_address': $scope.newvenueaddress,
                            'title': response[i].name.substring(0,80),
                            'subtitle': response[i].name.substring(response[i].name.length - 80),
                            'date': responseDate,
                            'time': responseTime,
                            'fbimage': response[i].pic_big,
                            'fb_event': "https://www.facebook.com/events/"+response[i].eid,
                            'ticket_uri': response[i].ticket_uri
                        };
                        $scope.events.push(response[i]);
					}
					$scope.moveUp++;
                    /*
                    $http.post(
                        preUrl + 'new.php',
                        data
                    ).success(function (data) {
                            $location.path('/success').search('post', data);
                        }).error(function (status) {
                            console.log(status);
                        });
                    };*/
				}
			);
		};
		$scope.parseInt = function(string){
			return parseInt(string);
		}
		$scope.execute = function(up){
            $scope.executeSearch($scope.feeds[up][2]);
		}
		$scope.time = 90000;
		$interval(function() {
			if($scope.moveUp!=$scope.feeds.length){
				$scope.execute($scope.moveUp);
	        }
	        else{
	            $scope.time = 90000;
	        }
        }, 90000);
        $interval(function(){
            $scope.time -=1;
            $('.timer').html($scope.time+"ms to next refresh");
        }, 1);
  });