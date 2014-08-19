'use strict';

/**
 * @ngdoc function
 * @name showhausAngApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the showhausAngApp
 */
//##Geolocation##//
/* jshint ignore:start */
function getCookie(cname) {
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
function geolocation() {
  var DC_ZIP_ARRAY = [20001, 20900];
  var BALTIMORE_ZIP_ARRAY = [21000, 22000];
  var BROOKLYN_ZIP_ARRAY = [11200, 11240];
  var GEO_CITY = '';
  var getcookies = getCookie('city');
  if (getcookies) {
    return getcookies;
  }
  else if (navigator.geolocation && !getcookies) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var point = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        new google.maps.Geocoder().geocode({
          'latLng': point
        }, function (res, status) {
          if (status === google.maps.GeocoderStatus.OK && typeof res[0] !== 'undefined') {
            /*jshint camelcase: false */
            var zip = res[0].formatted_address.match(/,\s\w{2}\s(\d{5})/)[1];
            if (zip >= DC_ZIP_ARRAY[0] && zip <= DC_ZIP_ARRAY[1]) {
              GEO_CITY = 'DC';
            }
            else if (zip >= BALTIMORE_ZIP_ARRAY[0] && zip <= BALTIMORE_ZIP_ARRAY[1]) {
              GEO_CITY = 'Baltimore';
            }
            else if (zip >= BROOKLYN_ZIP_ARRAY[0] && zip <= BROOKLYN_ZIP_ARRAY[1]) {
              GEO_CITY = 'Brooklyn';
            }
            document.cookie = 'zip=' + zip;
            document.cookie = 'city=' + GEO_CITY;
            return GEO_CITY;
          }
        });
      });
  }
}
/* jshint ignore:end */
//##End Geolocation##//
var venues = [];
var events = [];
var preUrl = 'http://v2.showhaus.org/';//set to blank for release
//####Main####//
angular.module('showhaus')
  .factory('venueCityFactory', function($resource) {
    var jsonQuery = preUrl+'assets/venuecity.php';
    return $resource(jsonQuery, {},{query: {method:'JSONP', params:{callback: 'JSON_CALLBACK'}, isArray:true}});
  })
  .factory('eventsFactory', function($resource) {
    var jsonQuery = preUrl+'assets/events.php';
    return $resource(jsonQuery, {},{query: {method:'JSONP', params:{callback: 'JSON_CALLBACK'}, isArray:true}});
  })
  .run(function($http, venueCityFactory, eventsFactory) {
    venues = venueCityFactory.query();
    events = eventsFactory.query();
  })
  .controller('MainCtrl', function($scope, $location, loadingService, getSetCity, getSetVenue){
    $scope.venues = venues;
    $scope.events = events;
    //##FILTERS##//
    $scope.list = true; //sets list as default view
    $scope.resetVenues = function(){
      $scope.venueSelect = '';
    };
    $scope.$watch(function(){
      if($scope.freebox==='true'){
        $scope.freeShows = '0';
        $scope.strictPrice = true;
      }
      else{
        $scope.freeShows = '';
        $scope.strictPrice = false;
      }
    });
    //####//
    $scope.setNewCookie = function(){
      document.cookie = 'city=' + $scope.citySelect;
    };
    //set the city based on the users location
    $scope.citySelect = geolocation(); // jshint ignore:line
    //##go to showpage from list view##//
    $scope.go = function ( path ) {
      $location.path('showpage').search('post',path);
    };
    //####//
    $scope.$watch(function() {
      return loadingService.isLoading();
    }, function(value) { $scope.loading = value; });
    //##Listen to events from showpage##//
    if(typeof getSetCity.get() === 'string'){
      $scope.citySelect = getSetCity.get();
    }
    if(typeof getSetVenue.get() === 'string'){
      $scope.venueSelect = getSetVenue.get();
    }
  });
