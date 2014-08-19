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
    'ngTouch'
  ])
    .factory('loadingService', function() {
      var service = {
        requestCount: 0,
        isLoading: function() {
          return service.requestCount > 0;
        }
      };
      return service;
    })

    .factory('onStartInterceptor', function(loadingService) {
      return function (data) {
        loadingService.requestCount++;
        return data;
      };
    })

    .factory('delayedPromise', function($q, $timeout){
      return function(promise, delay) {
        var deferred = $q.defer();
        var delayedHandler = function() {
          $timeout(function() { deferred.resolve(promise); }, delay);
        };
        promise.then(delayedHandler, delayedHandler);
        return deferred.promise;
      };
    })

    .factory('onCompleteInterceptor', function(loadingService, delayedPromise) {
      return function(promise) {
        var decrementRequestCount = function(response) {
          loadingService.requestCount--;
          return response;
        };
        return delayedPromise(promise, 0).then(decrementRequestCount, decrementRequestCount);
      };
    })

  .config(function ($routeProvider, $httpProvider) {
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
      .otherwise({
        redirectTo: '/'
      });
    $httpProvider.responseInterceptors.push('onCompleteInterceptor');
  })

    .run(function($http, onStartInterceptor) {
      $http.defaults.transformRequest.push(onStartInterceptor);
    })

  .factory('getSetCity', function() {
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
  .factory('getSetVenue', function() {
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
  });
