'use strict';
/*global $:false*/
/**
 * @ngdoc function
 * @name showhausAngApp.controller:PostCtrl
 * @description
 * # PostCtrl
 * Controller of the showhausAngApp
 */
var genreArray = ['list', 'grid', 'limited'];
function getCookie(cname) {
	var name = cname + '=';
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}
var FB;
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
/* jshint ignore:start */
$(window).bind("blur focus focusin focusout load resize scroll unload click " +
	"dblclick mousedown mouseup mousemove mouseover mouseout mouseenter " +
	"mouseleave change select submit keydown keypress keyup error", function () {
	$('select').chosen().trigger('liszt:updated');
	$('select').on('change', function () {
		$('#postshow_venue').trigger('chosen:updated');
	});
});
$('a[name="rulesagreement"]').on('click', function () {
	$('html, body').animate({
		scrollTop: 0
	}, 'slow');
});
/* jshint ignore:end */
var venues = [];
var preUrl = 'http://v2.showhaus.org/';//set to blank for release
angular.module('showhaus')
	.factory('venueCityFactory', function ($resource) {
		var jsonQuery = preUrl + 'assets/venuecity.php';
		return $resource(jsonQuery, {}, {query: {method: 'JSONP', params: {callback: 'JSON_CALLBACK'}, isArray: true}});
	})
	.animation('.rules', function () {
		var NgHideClassName = 'ng-hide';
		return {
			beforeAddClass: function (element, className, done) {
				if (className === NgHideClassName) {
					$(element).slideUp(done); //jshint ignore:line
				}
			},
			removeClass: function (element, className, done) {
				if (className === NgHideClassName) {
					$(element).hide().slideDown(done);//jshint ignore:line
				}
			}
		};
	})
	.run(function ($http, venueCityFactory) {
		venues = venueCityFactory.query();
	})
	.controller('PostCtrl', function ($scope, $http, $location) {
		//facebook stuff
		$scope.citySelect = getCookie('city');
		$scope.venues = venues;
		$scope.resetVenues = function () {
			$scope.venue = '';
		};
		$scope.onFileSelect = function() {
			var file = document.getElementsByName('image')[0].files;
			console.log('file');
			if (file.type.indexOf('image') === -1) {
				$scope.error = 'image extension not allowed, please choose a JPEG or PNG file.';
			}
			if (file.size > 5097152){
				$scope.error ='File size cannot exceed 5 MB';
				document.getElementsByName('image').value = '';
			}
		};
		$scope.postEvent = function () {
			var data = {
				'city': $scope.citySelect,
				'venue': $scope.venue,
				'newvenue': $scope.newvenuename,
				'venue_address': $scope.newvenueaddress,
				'title': $scope.title,
				'subtitle': $scope.subtitle,
				'date': $scope.date,
				'time': $scope.time,
				'price': $scope.price,
				'description': $scope.description,
				'tags': document.getElementById('tags').value,
				'email': $scope.email,
				'fbimage': $scope.fbImage
			};
			$http.post(
				preUrl+'assets/new.php',
				data
			).success(function(data){
				$location.path('/success').search('post', data);
			}).error(function(status){
				console.log(status);
			});
		};
		$scope.fbEvent = function(){
			var facebookEvent = $scope.facebookEvent.toLowerCase();
			facebookEvent = facebookEvent.split('events/').pop().split('/')[0];
			var eventNum = parseInt(facebookEvent.split('events/').pop().split('/')[0]);
			if(!isNaN(eventNum)){
				FB.api(
					{
						method: 'fql.query',
						query: 'SELECT pic_cover FROM event WHERE eid = ' + facebookEvent
					},
					function (response) {
						if (response && !response.error) {
							$scope.$apply(function() {
								var fbImage = response[0].pic_cover.source; //jshint ignore:line
								$scope.fbImage = fbImage;
							});
						}
						else{
							console.log(response.error);
						}
					}
				);
				FB.api(
					{
						method: 'fql.query',
						query: 'SELECT email FROM user WHERE uid=me()'
					},
					function (response){
						$scope.$apply(function() {
							var fbEmail = response[0].email;
							$scope.email = fbEmail;
						});
					}
				);
				FB.api(
					facebookEvent,
					function(response){
						console.log(response);
						$scope.$apply(function(){
							$scope.title = response.name;
							$scope.subtitle = $scope.title.substring(80, 190);
							/* jshint ignore:start */
							CKEDITOR.instances.editor.setData('',function(){
								this.insertText(response.description);
							});
							/* jshint ignore:end */
							if(response.venue.state.toLowerCase() === 'dc' || response.venue.state.toLowerCase() === 'd.c' || response.venue.state.toLowerCase() === 'washington dc'){
								$scope.citySelect = 'DC';
							}
							else{
								$scope.citySelect = response.venue.city;
							}
							for(var q = 0; q < $scope.venues.length; q++){
								if(response.location === $scope.venues[q][1]){
									$scope.venue = $scope.venues[q][1];
								}
							}
							if(!$scope.venue){
								$scope.venue = 'newvenue';
								$scope.newvenuename = response.location;
								$scope.newvenueaddress = response.venue.street;
							}


							var dateTime = response.start_time; //jshint ignore:line
							dateTime = dateTime.split('T');
							var fbDate = dateTime[0];
							fbDate = fbDate.split('-');
							fbDate = fbDate[1] + '/' + fbDate[2] + '/' + fbDate[0];
							var fbTime = fbDate[1];
							var timeHour = dateTime[1].substr(0, 2);
							var timeMins = dateTime[1].substr(2, 3);
							var ampm = 'AM';
							if (timeHour > 12) {
								timeHour -= 12;
								ampm = 'PM';
							}
							fbTime = timeHour + timeMins + ' ' + ampm;
							$scope.date = fbDate;
							$scope.time = fbTime;
							var tag1;
							for (var i = 0; i < genreArray.length; i++) {
								var genre = $scope.description.indexOf(genreArray[i]);
								if (genre !== -1) {
									tag1 = genreArray[i];
								}
							}
							$('#tags').select2('val',[tag1]);
							var price = $scope.description.split('$');
							price = price[1];

							if (price) {
								var twodigi = isNaN(price.substr(0, 2));
								var onedigi = isNaN(price.substr(0, 1));
								if (twodigi === false) {
									price = price.substr(0, 2);
								}
								else if (onedigi === false) {
									price = price.substr(0, 1);
								}
							}
							else {
								price = 0;
							}
							$scope.price = price;
						});
						$('.filter_city').trigger('chosen:updated');
						$('.filter_city').trigger('chosen:updated');
					}
				);
			}
			else{
				console.log('facebook event parse failed');
			}
		};
		$scope.fbLogin = function(){
			FB.login(function () {}, {
				scope: ''
			});
		};
		$scope.genreArray = ['grid','list'];
	});