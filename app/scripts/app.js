'use strict';

/**
 * @ngdoc overview
 * @name showhausAngApp
 * @description
 * # showhausAngApp
 *
 * Main module of the application.
 */
angular
	.module('showhaus', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch',
	])
	.factory('loadingService', function () {
		var service = {
			requestCount: 0,
			isLoading: function () {
				return service.requestCount > 0;
			}
		};
		return service;
	})

	.factory('onStartInterceptor', function (loadingService) {
		return function (data) {
			loadingService.requestCount++;
			return data;
		};
	})

	.factory('delayedPromise', function ($q, $timeout) {
		return function (promise, delay) {
			var deferred = $q.defer();
			var delayedHandler = function () {
				$timeout(function () {
					deferred.resolve(promise);
				}, delay);
			};
			promise.then(delayedHandler, delayedHandler);
			return deferred.promise;
		};
	})

	.factory('onCompleteInterceptor', function (loadingService, delayedPromise) {
		return function (promise) {
			var decrementRequestCount = function (response) {
				loadingService.requestCount--;
				return response;
			};
			return delayedPromise(promise, 0).then(decrementRequestCount, decrementRequestCount);
		};
	})

	.config(function ($routeProvider, $httpProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'pages/main.html',
				controller: 'MainCtrl'
			})
			.when('/about', {
				templateUrl: 'pages/about.html',
				controller: 'AboutCtrl'
			})
			.when('/showpage', {
				templateUrl: 'pages/showpage.html',
				controller: 'ShowpageCtrl'
			})
			.when('/showpage/:city/:venue/', {
				templateUrl: 'pages/showpage.html',
				controller: 'ShowpageCtrl'
			})
			.when('/post', {
				templateUrl: 'pages/post.html',
				controller: 'PostCtrl'
			})
			.when('/success', {
				templateUrl: 'pages/success.html',
				controller: 'SuccessCtrl'
			})
			.when('/edit',{
				templateUrl: 'pages/edit.html',
				controller: 'EditCtrl'
			})
			.when('/feeds',{
				templateUrl: 'pages/feeds.html',
				controller: 'FeedsCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
		$httpProvider.responseInterceptors.push('onCompleteInterceptor');
		$locationProvider.hashPrefix('!');
	})

	.run(function ($http, onStartInterceptor) {
		$http.defaults.transformRequest.push(onStartInterceptor);
	})

	.factory('getSetCity', function () {
		var savedData = {};

		function set(data) {
			savedData = data;
		}

		function get() {
			return savedData;
		}

		return {
			set: set,
			get: get
		};
	})
	.factory('getSetVenue', function () {
		var savedData = {};

		function set(data) {
			savedData = data;
		}

		function get() {
			return savedData;
		}

		return {
			set: set,
			get: get
		};
	})
	.directive('numbersOnly', function () {
		return {
			require: 'ngModel',
			link: function (scope, element, attrs, modelCtrl) {
				modelCtrl.$parsers.push(function (inputValue) {
					// this next if is necessary for when using ng-required on your input.
					// In such cases, when a letter is typed first, this parser will be called
					// again, and the 2nd time, the value will be undefined
					if (inputValue === undefined) {
						return '';
					}
					var transformedInput = inputValue.replace(/[^0-9]/g, '');
					if (transformedInput !== inputValue) {
						modelCtrl.$setViewValue(transformedInput);
						modelCtrl.$render();
					}

					return transformedInput;
				});
			}
		};
	})
	.directive('ckEditor', [function () {
		return {
			require: '?ngModel',
			restrict: 'C',
			link: function(scope, elm, attr, ngModel) {
				var ck;
				ck = CKEDITOR.replace(elm[0]);//jshint ignore:line

				if (!ngModel){
					return;
				}

				ck.on('pasteState', function() {
					scope.$apply(function() {
						ngModel.$setViewValue(ck.getData());

					});
				});

				ngModel.$render = function() {
					ck.setData(ngModel.$viewValue);
				};
			}
		};
	}])
	.directive('fileread', [function () {
		return {
			scope: {
				fileread: '='
			},
			link: function (scope, element) {
				element.bind('change', function (changeEvent) {
					var reader = new FileReader();
					reader.onload = function (loadEvent) {
						scope.$apply(function () {
							scope.fileread = loadEvent.target.result;
						});
					};
					reader.readAsDataURL(changeEvent.target.files[0]);
				});
			}
		};
	}]);
