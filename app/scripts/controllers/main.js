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
  if(getcookies === ''){
    getcookies = 'NYC';
  }
  if (getcookies.length > 0) {
    return getcookies;
  }
  /*else if (navigator.geolocation && !getcookies) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var point = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        new google.maps.Geocoder().geocode({
          'latLng': point
        }, function (res, status) {
          if (status === google.maps.GeocoderStatus.OK && typeof res[0] !== 'undefined') {
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
  }*/
}
/* jshint ignore:end */
//##End Geolocation##//
var venues = [];
var INITIAL_EVENT_LENGTH = 0;
var events = [];
var preUrl = 'http://showhaus.org/assets/';//set to blank for release
//####Main####//
angular.module('showhaus')
  .factory('eventsFactory', function($resource) {
    var jsonQuery = preUrl+'eventlist.php';
    return $resource(jsonQuery);
  })
  .run(function($http, venueCityFactory, eventsFactory) {
  	events = eventsFactory.query();
  })
  .controller('MainCtrl', function($scope, $location, loadingService, getSetCity, getSetVenue, $timeout, $window, $rootScope, $http, $route, eventsFactory){
	$(".ui-dialog-content").dialog("destroy");
	if($location.$$search.post && $location.$$url.split('=')[1]){
		$location.path('/showpage').search('post', $location.$$search.post);
	}
	if(localStorage.getItem('password')){
        var ls = localStorage.getItem('password');
        $http.post(
            preUrl + 'checkAdmin.php',
            {"a":ls}
        ).success(function(data){
            if(data === "1"){
                $scope.editMode = true;
            }
            $scope.events = events;
        });
    }
    else{
        $scope.events = events;
    }
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
        document.cookie = 'city=NYC';
        $scope.citySelect = 'NYC';
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
		$(e.target).parents('.show-detail-contain').children('.expand-contain').slideToggle('slow');
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
	$scope.today = today;
	//the day names
	$scope.today = mm+'/'+dd+'/'+yyyy;
	$scope.tomorrow = mm+'/'+tomorrow_dd+'/'+yyyy;
	//"next week" events
    $scope.nextWeek = function(date){
        var mdy = date.split('/')
        var formattedParam = new Date(mdy[2], mdy[0]-1, mdy[1]);
        var ddy = $scope.today.split('/');
        var formattedToday = new Date(ddy[2], ddy[0]-1, ddy[1]);
        var diff = Math.round((formattedParam-formattedToday)/(1000*60*60*24));

        if(diff > 14 || diff < 0){
            return "true";
        }
        else if (diff > 7){
            $scope.futureEvent = false;
            return "Next";
        }
    }

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
        var date = new Date(item.date + ' ' + item.time);
        var now = new Date().getTime();
        if(date.getTime()+6000000 > now){
            return date.getTime();
        }
    };
    /*
        Pagination
    */
    $scope.reverse = false;
    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.entryLimit = 25;
    $scope.pagedItems = [];
    $scope.currentPage = 1;
    $scope.maxSize = 5; //pagination max size

    $scope.noOfPages = 5;
    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };

    /*
        End Pagination
    */
    $scope.sendToGoogle = function(city, event, venue, ticket){
        if(ticket){
            $window.ga('send', 'pageview', {ticket});
        }
        else{
            $window.ga('send', 'pageview', { page: city+': '+event+' @ '+ venue});
        }
    }

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

    $scope.staffPickComments = "";

    $scope.staffPicks = false;
    $scope.freeBox = false;

    $scope.editItem = function(mode, comments, postNumber){
        var semp = localStorage.getItem('password');
        $scope.theMode = mode;
        $http.post(preUrl + 'staff.php', {'mode': mode, 'password': semp, 'comments': comments, 'postNumber': postNumber}).success(function(response){
            switch($scope.theMode){
                case 'edit':
                    if(response!=="false"){
                        window.open(response);
                    }
                    else{
                        $(".editError ."+postNumber).fadeOut().next().delay(500).fadeIn();
                    }
                    break;
                case 'delete':
                    window.location.reload();
                    break;
                case 'staffPick':
                    window.location.reload();
                    break;
            }
        });
        //mode possibilities: edit, delete, staffPick
        //on edit click, data:{mode: "edit", password: ls}
            //should return url to go to
        //on delete click, data:{mode: "delete", password: ls}
            //should return by making show disappear. Also triggers events.php
        //on staffPick s&p, data:{mode: "staffPick", password: ls, comments: comments}
            //should trigger events.php
    }

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
  })
  .filter('startFrom', function () {
  	return function (input, start) {
  		if (input) {
  			start = +start;
  			return input.slice(start);
  		}
  		return [];
  	};
  })
  .filter("isFeatured", function() {
    return function(input, pick) {
        var filtered = [];
        angular.forEach(input, function(item) {
          if(item.featured!=='' && pick.featured) {
            filtered.push(item);
          }
          else if(!pick.featured){
            filtered.push(item);
          }
        });
        return filtered;
    };
  })
  .filter("isFree", function(){
    return function(input, box){
        var filtered = [];
        angular.forEach(input, function(item){
            if(item.price==0 && box.price){
                filtered.push(item);
            }
            else if(!box.price){
                filtered.push(item);
            }
        });
        return filtered;
    }
  })