'use strict';
/*global $:false*/
/**
 * @ngdoc function
 * @name showhausAngApp.controller:PostCtrl
 * @description
 * # PostCtrl
 * Controller of the showhausAngApp
 */
//var genreArray = ['list', 'grid', 'limited'];
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
var venues = [];
var preUrl = 'http://showhaus.org/assets/';//set to blank for release
angular.module('showhaus')
	.factory('venueCityFactory', function ($resource) {
		var jsonQuery = preUrl + 'locations.php';
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
		venues = new venueCityFactory.query();
	})
	.controller('PostCtrl', function ($scope, $http, $location) {
		$(".ui-dialog-content").dialog("destroy");
		$(".date").datepicker({ minDate: 0 });
		$(".time").timepicker({ minTime: 0, show24Hours: false, timeFormat: "h:mm TT"});
		//facebook stuff
		$scope.citySelect = getCookie('city');
		$scope.venues = venues;
		$scope.resetVenues = function () {
			$scope.venue = '';
		};
		$scope.postEvent = function () {
			if($scope.form.$valid) {
				/*if($('#tags').val()===''){
					$('#tags').val('haus');
				}*/
				var file = $('#imgpreview').attr('src');
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
					'description': CKEDITOR.instances.editor.getData(),
					//'tags': document.getElementById('tags').value,
					'email': $scope.email,
					'fbimage': $scope.fbImage,
					'poster': file,
					'fb_event': $scope.fb_event,
					'ticket_uri': $scope.ticket
				};
				$http.post(
					preUrl + 'new.php',
					data
				).success(function (data) {
						$location.path('/success').search('post', data);
					}).error(function (status) {
						console.log(status);
					});
			}
			else{
				$('.ng-invalid').each(function(){
					$(this).addClass('error');
				});
			}
		};
		$scope.fbEvent = function(){
			var facebookEvent = $scope.facebookEvent.toLowerCase();
			facebookEvent = facebookEvent.split('events/').pop().split('/')[0];
			var eventNum = parseInt(facebookEvent.split('events/').pop().split('/')[0]);
			$scope.fb_event = "http://facebook.com/events/"+eventNum;
			if(!isNaN(eventNum)){
				FB.api(
					{
						method: 'fql.query',
						query: 'SELECT pic_cover, ticket_uri FROM event WHERE eid = ' + facebookEvent
					},
					function (response) {
						if (response && !response.error) {
							$scope.$apply(function() {
								var fbImage = response[0].pic_cover.source; //jshint ignore:line
								$scope.fbImage = fbImage;
								$scope.ticket = response[0].ticket_uri
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
						$scope.$apply(function(){
							$scope.title = response.name;
							$scope.subtitle = $scope.title.substring(80, 190);
							/* jshint ignore:start */
							/*CKEDITOR.instances.editor.setData('',function(){
								this.insertText(response.description);
							});*/
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
							if($scope.venue != response.location){
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
							if(dateTime[1]) {
								var timeHour = dateTime[1].substr(0, 2);
								var timeMins = dateTime[1].substr(2, 3);
								var ampm = 'AM';
								if (timeHour > 12) {
									timeHour -= 12;
									ampm = 'PM';
								}
								fbTime = timeHour + timeMins + ' ' + ampm;

								$scope.time = fbTime;
							}
							$scope.date = fbDate;
							/*var tag1;
							for (var i = 0; i < genreArray.length; i++) {
								var genre = response.description.indexOf(genreArray[i]);
								if (genre !== -1) {
									tag1 = genreArray[i];
								}
							}
							$('#tags').select2('val',[tag1]);*/
							var price = response.description.split('$');
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
							$scope.external = true;
						});
					}
				);
			}
			else{
				$scope.external = false;
			}
		};
		$scope.fbLogin = function(){
			FB.login(function () {}, {
				scope: ''
			});
		};
		//$scope.genreArray = ['grid','list'];
		$scope.fileCheck = function(){
			var file = $('input[type=file]')[0].files[0];
			var size = file.size/1048576;
			if(file.type.indexOf('image')>-1&&size<=5){
				return true;
			}
			else{
				$('[type=file]').wrap('<form>').parent('form').trigger('reset');
				$('[type=file]').unwrap();
				return false;
			}
		};
		$scope.imgDelete = function(){
			$('[type=file]').wrap('<form>').parent('form').trigger('reset');
			$('[type=file]').unwrap();
			$scope.fbImage = '';
			$scope.poster = '';
		};
	});
