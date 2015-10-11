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
  if (getcookies === 'all'){
    getcookies = '';
  }
  if (getcookies.length > 0) {
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
              //GEO_CITY = 'DC';
            }
            else if (zip >= BALTIMORE_ZIP_ARRAY[0] && zip <= BALTIMORE_ZIP_ARRAY[1]) {
              GEO_CITY = 'Baltimore';
            }
            else if (zip >= BROOKLYN_ZIP_ARRAY[0] && zip <= BROOKLYN_ZIP_ARRAY[1]) {
              GEO_CITY = 'NYC';
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
var preUrl = 'http://v3.showhaus.org/assets/';//set to blank for release
//####Main####//
angular.module('showhaus')
  .factory('venueCityFactory', function($resource) {
    var jsonQuery = preUrl+'venuecity.php';
    return $resource(jsonQuery, {},{query: {method:'JSONP', params:{callback: 'JSON_CALLBACK'}, isArray:true}});
  })
  .factory('eventsFactory', function($resource) {
    var jsonQuery = preUrl+'events.php';
    return $resource(jsonQuery, {},{query: {method:'JSONP', params:{callback: 'JSON_CALLBACK'}, isArray:true}});
  })
  .run(function($http, venueCityFactory, eventsFactory, $interval) {
	//$interval(function() {
		venues = venueCityFactory.query();
		events = eventsFactory.query();
	//}, 30000);
  })
  .controller('MainCtrl', function($scope, $location, loadingService, getSetCity, getSetVenue){
	$(".ui-dialog-content").dialog("destroy");
	if($location.$$search.post && $location.$$url.split('=')[1]){
		$location.path('/showpage').search('post', $location.$$search.post);
	}
    $scope.venues = venues;
    $scope.events = events;
    //##FILTERS##//
    $scope.list = true; //sets list as default view
    $scope.resetVenues = function(){
      $scope.venueSelect = '';
    };
	$scope.freeFilter = function(obj){
		if($scope.freebox=='true'){
			if(obj.price == 0){
				return obj.price;
			}
		}
		else{
			return obj.price;
		}
	}
    //####//
    $scope.setNewCookie = function(){
      if($scope.citySelect!==''){
        document.cookie = 'city=' + $scope.citySelect;
      }
      else{
        document.cookie = 'city=all';
      }
    };
    //set the city based on the users location
    $scope.citySelect = geolocation(); // jshint ignore:line
    //##go to showpage from list view##//
    $scope.go = function ( city, venue, id ) {
	  venue = venue.replace(/\s/g, '_');
      $location.path('showpage/'+city+'/'+venue+'/').search('post',id);
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
	$scope.openMaps = function(address){
		address = address.replace(/\s+/g, '+');
		window.open('https://google.com/maps/place/'+address, '_blank');
	}
	$scope.formattedSubtitle = function(sub){
		sub.replace(/(<([^>]+)>)/ig,"")
		return sub;
	}
	var numPages = events.length / 10;
	if(parseInt(numPages)>1){
		$scope.numPages = parseInt(numPages);
	}
	$scope.getNumber = function(num) {
		return new Array(num);
	}
	$scope.expand = function(e){
		e.preventDefault();
		$(e.target).parents('.show-detail-contain').next('.expand-contain').slideToggle('slow');
	}
	$scope.collapse = function(e){
		e.preventDefault();
		$(e.target).parents('.expand-contain').slideUp('slow');
	}
	$scope.$watchCollection('citySelect', function() {
		if($scope.citySelect==""){
			$scope.resetVenues();
		}
		else{
			$('select').trigger('chosen:updated');
		}
	});
  });
