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
angular.module('showhaus')
  .controller('ShowpageCtrl', function ($scope, $resource, $location, getSetCity, getSetVenue, $http, $sce, $sanitize, $rootScope) {
	$(".ui-dialog-content").dialog("destroy");
	var postnumber = $location.url().split('/');
        postnumber = postnumber[postnumber.length-1];
    $scope.eventPicture = null;
    $scope.readMore = false;
    $scope.sharingActive = false;
	$scope.event = null;
	for(var i in $scope.events){
	  if($scope.events[i].id === postnumber){
	    $scope.event = $scope.events[i];
	    var fbEvent = $scope.events[i].fb_event.split('/events/');
	    fbEvent = parseInt(fbEvent[1]);
	    $http.get("https://graph.facebook.com/v2.9/"+fbEvent+"?fields=cover&access_token=204851123020578|0joKWgaSJfM197SAhfZCMAzILhY").success(function(data){
	        $scope.eventPicture = data.cover.source;
	    });
	  }
	}
	console.log($scope.event);
	if($location.$$search.post === ''){
		$location.path('/main');
	}
    $scope.fbshare = function(postnumber){
      FB.ui({
        method: 'share',
        href: $location.path
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
	$scope.toTrustedHTML = function( html ){
		if(html.indexOf(">") > -1){
			html.replace(">", "&gt;")
		}
		else if(html.indexOf("<") > -1){
			html.replace("<", "&lt;")
		}
        return $sce.trustAsHtml(html);
    }
    $scope.fbShare = function(node, event){
        $scope.sharingActive = true;
        node = node.target.parentNode.parentElement.parentElement;
	    domtoimage.toPng(node)
	        .then(function (dataUrl) {
	            var img = new Image();
	            img.src = dataUrl;
	            var data = {
	                data: img.src
	            };
	            $http.post(
	                preUrl+ 'fbshare.php',
	                data
	            ).success(function (data, status) {
	                $scope.sharingActive = false;
	                $rootScope.$broadcast('ogImage', data);
                    FB.ui({
                      method: 'feed',
                      redirect_uri: "http://showhaus.org/"+window.location.hash,
                      link: "http://showhaus.org/"+window.location.hash,
                      from: "showhaus",
                      caption: event.title,
                      name: event.title,
                      picture: data,
                      description: event.description
                    }, function(response){
                        $scope.sharingActive = false;
                    });
                });

	        })
	        .catch(function (error) {
	            console.error('oops, something went wrong!', error);
	        });
	        function dataURItoBlob(dataURI) {
                var byteString = atob(dataURI.split(',')[1]);
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ab], {type: 'image/png'});
            }
    }
    $scope.closePage = function(){
        $location.update_path("/", true);
        $rootScope.$broadcast('showPage', false);
    }
  });
