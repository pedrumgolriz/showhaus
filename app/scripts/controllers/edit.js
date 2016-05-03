'use strict';
/*global $:false*/
/**
 * @ngdoc function
 * @name showhausAngApp.controller:PostCtrl
 * @description
 * # EditCtrl
 * Controller of the showhausAngApp
 */
angular.module('showhaus')
	.factory('venueCityFactory', function($resource) {
	    var jsonQuery = preUrl+'locations.php';
	    return $resource(jsonQuery);
	  })
	.factory('eventFactory', function($resource){
		var jsonQuery = preUrl + 'eventlist.php';
		return $resource(jsonQuery);
	})
	.controller('EditCtrl', function ($scope, $http, $location, $resource, venueCityFactory, eventFactory) {
		$(".ui-dialog-content").dialog("destroy");
		$scope.events = new eventFactory.query();
		$scope.venues = new venueCityFactory.query();

		var preUrl = 'http://showhaus.org/assets/';//set to blank for release
		$scope.postnumber = $location.$$search._;
		$http.post(
				preUrl + 'edit.php',
				{"_": $scope.postnumber}
		).success(function (data, status) {
				if(data!=="fail"){
					$scope._id = data;
				}
				else {
					$scope.showPage = false;
					$location.path('/archivedOrDeleted');
				}
			}).error(function (status) {
				$('#passwordCheck').text('Please check your password and try again.');
				$('#dialog input').addClass('postshow_error');
			});

		$scope.$watch('_id + events', function(){
			if(typeof($scope._id) !== 'undefined' && $scope.events.length > 0){
				$scope.event = $.grep($scope.events, function(e){ return e.id == $scope._id; });
				if($scope.event.length === 0){
					$location.path('/archivedOrDeleted');
				}
				$scope.showPage = true;
				$scope.event = $scope.event[0];
			}
		});

		$scope.postEvent = function (isValid, eventDetails) {
			if(isValid&&$scope.citySelect !== 'all') {
				if($('#tags').val()===''){
					$('#tags').val('haus');
				}
				var file = $('#imgpreview').attr('src');
				var data = {};
				/*if(file===$scope.events[0].poster){
					data = {
						'city': eventDetails.city,
						'venue': eventDetails.venue,
						'newvenue': eventDetails.newvenuename,
						'venue_address': eventDetails.newvenueaddress,
						'title': eventDetails.title,
						'subtitle': eventDetails.subtitle,
						'date': eventDetails.date,
						'time': eventDetails.time,
						'price': eventDetails.price,
						'description': eventDetails.description,
						'id': $location.$$search.post
					};
				}
				else {*/
					data = {
						'city': eventDetails.city,
						'venue': eventDetails.venue,
						'newvenue': eventDetails.newvenuename,
						'venue_address': eventDetails.newvenueaddress,
						'title': eventDetails.title,
						'subtitle': eventDetails.subtitle,
						'date': eventDetails.date,
						'time': eventDetails.time,
						'price': eventDetails.price,
						'description': eventDetails.description,
						'id': eventDetails.id
					};
				//}
				$http.post(
						preUrl + 'update.php',
						data
				).success(function (data) {
						$location.path('/success').search('post', $location.$$search.post);
						console.log(data);
					}).error(function (status) {
						console.log(status);
					});
			}
			else{
				$('.ng-invalid').addClass('invalid');
				if(!$scope.venue){
					$('#postshow_venue_chosen').addClass('invalid');
				}
				else{
					$('#postshow_venue_chosen').removeClass('invalid');
				}
			}
		};
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
			$scope.file = '';
			$scope.events[0].poster = ''; //hardcode
		};
		$scope.deleteModal = function(){
			$('#dialog').dialog({
				width: 400,
				height: 315,
				buttons: {
					'Yes, Delete Show': function() {
						$scope.deletePost();
					},
					'Cancel': function() {
						$(this).dialog('close');
					}
				}
			});
		};
		$scope.deletePost = function() {
			$scope.data = {
				'id': $location.$$search.post,
				'password': $scope.password
			};
			$http.post(
				preUrl + 'delete.php',
				$scope.data
			).success(function (data, status) {
					if(data == "success") {
						$location.path('/delete');
					}
					else{
						$('#passwordCheck').text('Please check your password and try again.');
						$('#dialog input').addClass('postshow_error');
					}
			}).error(function (status) {
				$('#passwordCheck').text('Please check your password and try again.');
					$('#dialog input').addClass('postshow_error');
			});
		};
		$('#postshow_date').datepicker({ minDate: 0 });
		$('#postshow_time').timepicker({ minTime: 0, show24Hours: false, timeFormat: 'h:mm TT'});
	});
