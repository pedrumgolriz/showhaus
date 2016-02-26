'use strict';
/*global $:false*/
/**
 * @ngdoc function
 * @name showhausAngApp.controller:ShowpageCtrl
 * @description
 * # ShowpageCtrl
 * Controller of the showhausAngApp
 */
var FB;//just to shutup jshint
window.onerror = function () {
  return true;
};
window.fbAsyncInit = function () {
  FB.init({
    appId: '204851123020578',
    status: true,
    xfbml: true
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
angular.module('showhaus')
  .controller('ShowpageCtrl', function ($scope, $resource, $location, getSetCity, getSetVenue, $http) {
	$(".ui-dialog-content").dialog("destroy");
	if($location.$$search.post === ''){
		$location.path('/main');
	}
    var postnumber = $location.$$search.post;
    var jsonQuery = preUrl + 'eventlist.php?post=' + postnumber;
    $scope.events = $resource(jsonQuery, {}, {query: {method: 'JSONP', params: {callback: 'JSON_CALLBACK'}, isArray: true}}).query();
    $scope.fbshare = function(postnumber){
      FB.ui({
        method: 'share',
        href: 'http://showhaus.org/#!/?post='+postnumber,
      });
    };
    /* jshint ignore:start */
    $scope.tweet = function(postnumber){
      !function(d,s,id){
        var js,
          fjs=d.getElementsByTagName(s)[0],
          p=/^http:/.test(d.location)?'http':'https';
        console.log(d+s+id);
        if(!d.getElementById(id)){
          js=d.createElement(s);
          js.id=id;js.src=p+'://platform.twitter.com/widgets.js';
          fjs.parentNode.insertBefore(js,fjs);
        }
      }(document, 'script', 'twitter-wjs');
    };
    /* jshint ignore:end */
    $scope.setCity = function(city){
      getSetCity.set(city);
    };
    $scope.setVenue = function(venue){
      getSetVenue.set(venue);
    };
	$scope.edit = function(postnumber){
		$('#dialog').dialog({
			width: 400,
			height: 315,
			buttons: {
				'Ok': function() {
					$scope.editPost();
				},
				'Cancel': function() {
					$(this).dialog('close');
				}
			}
		});
	};
	$scope.editPost = function(){
		$scope.data = {
			'id': $location.$$search.post,
			'password': $scope.password
		};
		$http.post(
				preUrl + 'edit.php',
			$scope.data
		).success(function (data, status) {
				if(data=="success"){
					$('#dialog').dialog('close');
					localStorage.setItem('temp_p', $scope.data.password);
					$location.path('/edit').search('post', $scope.data.id);
				}else {
					$('#passwordCheck').text('Please check your password and try again.');
					$('#dialog input').addClass('postshow_error');
				}
				//console.log(data);
			}).error(function (status) {
				$('#passwordCheck').text('Please check your password and try again.');
				$('#dialog input').addClass('postshow_error');
			});
	};
  });
