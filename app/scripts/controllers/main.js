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
function geolocation(cityList) {
  var DC_ZIP_ARRAY = [20001, 20900];
  var BALTIMORE_ZIP_ARRAY = [21000, 22000];
  var BROOKLYN_ZIP_ARRAY = [11200, 11240];
  var GEO_CITY = '';
  var getcookies = localStorage.getItem('city');
  if (getcookies === 'all'){
    getcookies = '';
  }
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
            for(var i in res){
                for(var t in cityList){
                    if(res[i].formatted_address.indexOf(cityList[t].city) > -1){
                        GEO_CITY = cityList[t].city;
                        localStorage.setItem('city', GEO_CITY);
                    }
                }
            }
            localStorage.setItem('city', GEO_CITY);
          }
        });
      });
      return GEO_CITY;
  }
}
/* jshint ignore:end */
//##End Geolocation##//
var preUrl = 'http://showhaus.org/assets/';//set to blank for release
//####Main####//
angular.module('showhaus')
  .factory('eventsFactory', function($resource) {
    var jsonQuery = preUrl+'eventlist.php';
    return $resource(jsonQuery);
  })
  .controller('MainCtrl', function($scope, $location, loadingService, getSetCity, getSetVenue, $timeout, $window, $rootScope, $http, $route, eventsFactory){
    $scope.postQuery = parseInt(window.location.hash.split('/')[window.location.hash.split('/').length-1]);
    $scope.citySelect = {};
    $scope.venueSelect = {};
    $scope.firstTimeVisitor = true;
    $scope.cityList = [];
    $scope.venueList = [];
    $scope.showPage = false;
    $scope.currentURL = $location.url();
    $rootScope.$on('event', function(event, obj){
        $scope.events = obj.events;
    })

    $scope.displayedEvent = "";
    if(sessionStorage.getItem('events')){
        $scope.events = JSON.parse(sessionStorage.getItem('events'));
    }
    else{
        $scope.events = new eventsFactory.query();
        $scope.events.$promise.then(function(data){
            var NYC_CITIES = ["ny","queens","brooklyn","long island city"];
            var DC_CITIES = ["washington","dc","washington dc","washington d.c", "d.c", "d.c.", "washington d.c.", "arlington", "vienna", "alexandria"];
            for(var i = 0; i < data.length; i++){
                if($scope.postQuery == data[i].id){
                    $scope.go(data[i]);
                }
                for(var ny in NYC_CITIES){
                    if(data[i].city.toLowerCase() === NYC_CITIES[ny]){
                        data[i].city = "NYC";
                    }
                }
                for(var dc in DC_CITIES){
                    if(data[i].city.toLowerCase() === DC_CITIES[dc]){
                        data[i].city = "DC";
                    }
                }
                if($scope.cityQualifies(data[i].city) && $scope.cityList.indexOf(data[i].city) == -1){
                    $scope.cityList.push(data[i].city);
                }
                $scope.resetVenues();
            }
            sessionStorage.setItem('events', JSON.stringify(data));
            return data;
        });
    }

    if(sessionStorage.getItem("og")){
        $scope.firstTimeVisitor = false;
    }

    $scope.dismissHelp = function(){
        sessionStorage.setItem("og", 1);
        $scope.firstTimeVisitor = false;
    }

	if($location.$$search.post && $location.$$url.split('=')[1]){
		$location.path('/showpage').search('post', $location.$$search.post);
	}
	if($location.$$search.dev){
        $scope.numItems = 1;
	}
	else{
	    $scope.numItems = 150;
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
        });
    }
    //##FILTERS##//
    $scope.list = true; //sets list as default view
    $scope.resetVenues = function(){
      $scope.venueSelect.selected = "";
      $scope.venueList = [];
      for(var i in $scope.events){
        if($scope.events[i].city == $scope.citySelect.selected){
            if($scope.venueList.indexOf($scope.events[i].venue) == -1){
                $scope.venueList.push($scope.events[i].venue);
            }
        }
      }
    };
    //####//
    $scope.setNewCookie = function(e){
      if($scope.citySelect.selected){
        localStorage.setItem('city', $scope.citySelect.selected);
      }
      else{
        localStorage.setItem('city', "NYC");
        $scope.citySelect.selected = 'NYC';
      }
    };
    //set the city based on the users location
    $scope.citySelect.selected = geolocation($scope.events); // jshint ignore:line
    //##go to showpage from list view##//
    $scope.go = function (event) {
      $scope.displayedEvent = event;
      var url = "/"+event.city+"/"+event.venue+"/"+event.id;
      url = url.replace(/ /g,"_");
      $location.update_path(url, true);
      $scope.showPage = true;
      $rootScope.$broadcast('showPage', true);
    };
    $rootScope.$on('showPage', function(event, obj){
        $scope.showPage = obj;
    })
    $scope.removeUrl = function(){
        $location.update_path('/', true);
        $scope.showPage = !$scope.showPage;
    };
    //####//
    $scope.searchEvents = "";
    $scope.$watch(function() {
      $scope.loading = loadingService.isLoading();
    }, function(value) { $scope.loading = value; });
    //##Listen to events from showpage##//
    if(typeof getSetVenue.get() === 'string'){
      $scope.venueSelect.selected = getSetVenue.get();
    }
	$scope.openMaps = function(address){
		address = address.replace(/\s+/g, '+');
		window.open('https://google.com/maps/place/'+address, '_blank');
	}
	$scope.formattedSubtitle = function(sub){
		sub.replace(/(<([^>]+)>)/ig,"")
		return sub;
	}
	$scope.selectOptions = {dropdownAutoWidth : true};
	$scope.cityQualifies = function(cityName){
	    var cityList = [];
	    for(var t in $scope.events){
	        if($scope.events[t].city === cityName){
	            cityList.push($scope.events[t]);
	        }
	    }
	    if(cityList.length > 15){
	        return true;
	    }
	    return false;
	};
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
		if($scope.citySelect.selected==""){
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
	    var index = $scope.filtered.indexOf(item);
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
                    for(var i in $scope.events){
                        if($scope.events[i].id === postNumber){
                            $scope.events.splice(i, 1);
                        }
                    }
                    break;
                case 'staffPick':
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
    };
    $rootScope.$on('$locationChangeSuccess', function() {
        $rootScope.actualLocation = $location.path();
    });

    $rootScope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {
        if($rootScope.actualLocation === newLocation) {
            $rootScope.$broadcast('showPage', false);
        }
    });
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
  });
