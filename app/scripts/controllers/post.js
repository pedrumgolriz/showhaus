'use strict';

/**
 * @ngdoc function
 * @name showhausAngApp.controller:PostCtrl
 * @description
 * # PostCtrl
 * Controller of the showhausAngApp
 */
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
				'email': $scope.email
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
	});
