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
var INITIAL_EVENT_LENGTH = 0;
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
    //venues = venueCityFactory.query();
  	events = eventsFactory.query();
  })
  .controller('MainCtrl', function($scope, $location, loadingService, getSetCity, getSetVenue, $timeout){
	$(".ui-dialog-content").dialog("destroy");
	if($location.$$search.post && $location.$$url.split('=')[1]){
		$location.path('/showpage').search('post', $location.$$search.post);
	}
    $scope.venues = venues;
    $scope.events = events;
    if(INITIAL_EVENT_LENGTH==0){
        INITIAL_EVENT_LENGTH = events.length;
    }
	$scope.eventVenues = [];
    //##FILTERS##//
    $scope.list = true; //sets list as default view
    $scope.resetVenues = function(){
      $scope.venueSelect = "";
      $timeout(function () {
        $('select').trigger('chosen:updated');
      }, 0, false);
    };
    //####//
    $scope.setNewCookie = function(){
      if($scope.citySelect!==''){
        document.cookie = 'city=' + $scope.citySelect;
      }
      else{
        document.cookie = 'city=all';
      }
    };
	if($scope.freebox){
		console.log($scope.freebox);
	}
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
	$scope.$watch(function(events){
        for(var i = 0; i < $scope.events.length; i++){
            $scope.eventVenues.push($scope.events[i].venue);
            for(var q = 0; q < $scope.venues.length; q++){
                var index = $scope.eventVenues.indexOf($scope.venues[q][1]);
                if(index == -1){
                    $scope.venues.splice(q,1);
                }
            }
        }
        if(INITIAL_EVENT_LENGTH > $scope.events.length){
            console.log($scope.events.length-INITIAL_EVENT_LENGTH+" new events added");
        }
        $scope.groupToPages();
        $timeout(function () {
            $('select').trigger('chosen:updated');
        }, 0, false);
    });
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
	$scope.extshow = function(url){
		window.open(url,'_blank');
	}
	$scope.$watchCollection('citySelect', function() {
		if($scope.citySelect==""){
			$scope.resetVenues();
		}
	});
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!

	var yyyy = today.getFullYear();
	if(dd<10){
		dd='0'+dd
	}
	if(mm<10){
		mm='0'+mm
	}
	var tomorrow_dd = parseInt(dd)+1;
	$scope.today = mm+'/'+dd+'/'+yyyy;
	$scope.tomorrow = mm+'/'+tomorrow_dd+'/'+yyyy;

	$scope.popupMap = function(e, address, city){
		var thisPopup = $(e.target);
		thisPopup.colorbox({
			iframe: true,
			innerWidth: 500,
			innerHeight: 300,
			opacity: 0.7,
			href: 'https://maps.google.com/maps?q='+address+'%2C'+city+'&ie=UTF8&t=m&output=embed'
		});
	};

	$scope.getDay = function(date){
	    var day;
    	switch (new Date(date).getDay()) {
            case 0:
                day = "Sunday";
                break;
            case 1:
                day = "Monday";
                break;
            case 2:
                day = "Tuesday";
                break;
            case 3:
                day = "Wednesday";
                break;
            case 4:
                day = "Thursday";
                break;
            case 5:
                day = "Friday";
                break;
            case 6:
                day = "Saturday";
                break;
        }
        return day;
	};
	$scope.orderByDate = function(item) {
        var date = new Date(item.date);
        return date;
    };
    /*
        Pagination
    */
    $scope.reset = function(){
        $scope.reverse = false;
        $scope.filteredItems = [];
        $scope.groupedItems = [];
        $scope.itemsPerPage = 10;
        $scope.pagedItems = [];
        $scope.currentPage = 0;
    }();
    $scope.groupToPages = function () {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.events.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.events[i] ];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.events[i]);
            }
        }
    };

    $scope.range = function (start, end) {
        var ret = [];
        if (!end) {
            end = start;
            start = 0;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };
    /*
        End Pagination
    */
  })
  .filter('startFrom', function() {
      return function(input, start) {
          start = +start; //parse to int
          return input.slice(start);
      }
  })
  .filter('unique', function() {
     return function(collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if(keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
     };
  });
