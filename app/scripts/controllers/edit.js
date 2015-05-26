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
	.controller('EditCtrl', function ($scope, $http, $location, $resource) {
		$(".ui-dialog-content").dialog("destroy");

		var preUrl = 'http://v2.showhaus.org/';//set to blank for release
		var postnumber = $location.$$search.post;

		$scope.editData = {
			"password": localStorage.getItem('temp_p'),
			"id": postnumber
		}
		$http.post(
				preUrl + 'assets/edit.php',
			$scope.editData
		).success(function (data, status) {
				if(data=="success"){
					localStorage.removeItem('temp_p');
					$scope.showPage = true;
				}else {
					$scope.showPage = false;
					$location.path('showpage/').search('post',postnumber);
				}
				//console.log(data);
			}).error(function (status) {
				$('#passwordCheck').text('Please check your password and try again.');
				$('#dialog input').addClass('postshow_error');
			});


		var eventsQuery = preUrl + 'assets/events.php?post=' + postnumber;
		var venueQuery = preUrl + 'assets/venuecity.php';
		var venues = $resource(venueQuery, {}, {query: {method: 'JSONP', params: {callback: 'JSON_CALLBACK'}, isArray: true}});
		var events = $resource(eventsQuery, {}, {query: {method: 'JSONP', params: {callback: 'JSON_CALLBACK'}, isArray: true}});
		$scope.venues = venues.query();
		$scope.events = events.query();
		var f = 0; //f keeps track of when events is finally queried
		$scope.$watch('events', function() {
			if(f>0) {
				$scope.venue = $scope.events[0].venue;
				$scope.citySelect = $scope.events[0].city;
			}
			f+=1;
		}, true);

		$scope.postEvent = function (isValid) {
			if(isValid&&$scope.citySelect !== 'all') {
				if($('#tags').val()===''){
					$('#tags').val('haus');
				}
				var file = $('#imgpreview').attr('src');
				var data = {};
				if(file===$scope.events[0].poster){
					data = {
						'city': $scope.citySelect,
						'venue': $scope.venue,
						'newvenue': $scope.newvenuename,
						'venue_address': $scope.newvenueaddress,
						'title': $scope.events[0].title,
						'subtitle': $scope.events[0].subtitle,
						'date': $scope.events[0].date,
						'time': $scope.events[0].time,
						'price': $scope.events[0].price,
						'description': $scope.event.description,
						'tags': $('#tags').val().split(','),
						'id': $location.$$search.post
					};
				}
				else {
					data = {
						'city': $scope.citySelect,
						'venue': $scope.venue,
						'newvenue': $scope.newvenuename,
						'venue_address': $scope.newvenueaddress,
						'title': $scope.events[0].title,
						'subtitle': $scope.events[0].subtitle,
						'date': $scope.events[0].date,
						'time': $scope.events[0].time,
						'price': $scope.events[0].price,
						'description': $scope.event.description,
						'tags': $('#tags').val().split(','),
						'poster': file,
						'id': $location.$$search.post
					};
				}
				$http.post(
						preUrl + 'assets/update.php',
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
		$scope.genreArray = ['grid','list'];
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
					'Ok': function() {
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
				preUrl + 'assets/delete.php',
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
		$scope.resetVenues = function () {
			$scope.venue = '';
			$('.filter_city').trigger("chosen:updated");
		};
		$('#postshow_date').datepicker({ minDate: 0 });
		$('#postshow_time').timepicker({ minTime: 0, show24Hours: false, timeFormat: 'h:mm TT'});
	});