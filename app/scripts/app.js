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
		'angularUtils.directives.dirPagination'
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
			/*.when('/showpage', {
				templateUrl: 'pages/showpage.html',
				controller: 'ShowpageCtrl'
			})
			.when('/showpage/:city/:venue/', {
				templateUrl: 'pages/showpage.html',
				controller: 'ShowpageCtrl'
			})*/
			.when('/post', {
				templateUrl: 'pages/post.html',
				controller: 'PostCtrl'
			})
			.when('/success', {
				templateUrl: 'pages/success.html',
				controller: 'SuccessCtrl'
			})
			.when('/newsletter-success', {
				templateUrl: 'assets/email_success.html'
			})
			.when('/edit',{
				templateUrl: 'pages/edit.html',
				controller: 'EditCtrl'
			})
			.when('/feeds',{
				templateUrl: 'pages/feeds.html',
				controller: 'FeedsCtrl'
			})
			.when('/archivedOrDeleted', {
				templateUrl: 'pages/archivedOrDeleted.html',
				controller: 'ArchiveCtrl'
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
	}])
	.directive('chosen', function($timeout) {

        var linker = function(scope, element, attr) {

          $timeout(function () {
            element.chosen({
              placeholder_text_single: "-- select venue --",
              "disable_search_threshold": 5
            });
          }, 0, false);
        };

        return {
          restrict: 'A',
          link: linker
        };
      }).directive('showhausFooter', function(){
        return {
            restrict: 'E',
            templateUrl: 'pages/footer.html',
            scope: {
               mainPage: '=mainPage'
            },
            controller: function($scope, $http, $location) {
            $scope.performance = performance.now();
                $.getJSON("http://jsonip.com?callback=?", function (data) {$scope.ip_address = data.ip;});
                $scope.checkPid = function(e){
                    var c = parseInt(sessionStorage.getItem('a'));
                    var a;
                    if(e.shiftKey&&e.which == 1 && c!==3){
                        if(localStorage.getItem('password')){
                            a = localStorage.getItem('password');
                        }
                        else{
                            a = prompt("", "");
                        }

                        $http.post(
                            preUrl + 'checkAdmin.php',
                            {"a":a}
                        ).success(function (g) {
                                if(g === "0" && !sessionStorage.getItem('a')){
                                    sessionStorage.setItem('a', 1);
                                    localStorage.removeItem('password');
                                    window.location.reload();
                                }
                                else if (g === "0" && sessionStorage.getItem('a')){
                                    var b = parseInt(sessionStorage.getItem('a'));
                                    b+=1;
                                    sessionStorage.setItem('a',b);
                                    localStorage.removeItem('password');
                                    window.location.reload();
                                }
                                else if(g === "1"){
                                    sessionStorage.setItem('a', 0);
                                    localStorage.setItem('password', a);
                                    window.location.reload();
                                }
                            }).error(function (status) {
                                console.log(status);
                            });
                    }
                    else if(c===3){
                        var z = 0;
                        //blacklist on mt
                        $scope.sendToGoogle($scope.ip_address);
                        while(z < 700){
                            window.open('http://i.imgur.com/lYdRATj.gif');
                            z++;
                        }
                    }
                }
            $scope.getCookie = function(cname) {
              var name = cname + '=';
              var ca = document.cookie.split(';');
              for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name) === 0){
                  return c.substring(name.length, c.length);
                }
              }
              return '';
            }
            var getcookies = getCookie('city');
	        if (getcookies === 'all'){
               getcookies = '';
	        }
	        else if(getcookies === ''){
              getcookies = 'NYC';
	        }
            $scope.subscribe = function(){
                if(this.userEmail && getcookies){
                   $http.post(
                         'http://showhaus.org/assets/' + 'subscribe.php',
                         {"email":$scope.userEmail,
                         "city": getcookies
                        }
                    ).then(function(data){
                        $location.path('/newsletter-success');
                    });
                  }
               };
            }
        };
    });