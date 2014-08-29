'use strict';

/**
 * @ngdoc function
 * @name showhausAngApp.controller:PostCtrl
 * @description
 * # PostCtrl
 * Controller of the showhausAngApp
 */
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
var venues = [];
var preUrl = 'http://v2.showhaus.org/';//set to blank for release
angular.module('showhaus')
  .factory('venueCityFactory', function($resource) {
  var jsonQuery = preUrl+'assets/venuecity.php';
  return $resource(jsonQuery, {},{query: {method:'JSONP', params:{callback: 'JSON_CALLBACK'}, isArray:true}});
})
  .animation('.rules', function() {
    var NgHideClassName = 'ng-hide';
    return {
      beforeAddClass: function(element, className, done) {
        if(className === NgHideClassName) {
          $(element).slideUp(done); //jshint ignore:line
        }
      },
      removeClass: function(element, className, done) {
        if(className === NgHideClassName) {
          $(element).hide().slideDown(done);//jshint ignore:line
        }
      }
    };
  })
  .run(function($http, venueCityFactory) {
    venues = venueCityFactory.query();
  })
  .controller('PostCtrl', function ($scope, vcRecaptchaService) {
    //facebook stuff
    $scope.citySelect = getCookie('city');
    $scope.venues = venues;

    $scope.resetVenues = function(){
      $scope.venue = '';
    };
    $scope.model = {
      key: '6Lf-afkSAAAAADf4xBnaQM7VbkHBAYtAonlbirPU'
    };
    $scope.submit = function () {
      var valid;

      /**
       * SERVER SIDE VALIDATION
       *
       * You need to implement your server side validation here.
       * Send the model.captcha object to the server and use some of the server side APIs to validate it
       * See https://developers.google.com/recaptcha/docs/
       */
      console.log('sending the captcha response to the server', vcRecaptchaService.data());

      if (valid) {
        console.log('Success');

      } else {
        console.log('Failed validation');

        // In case of a failed validation you need to reload the captcha because each challenge can be checked just once
        vcRecaptchaService.reload();
      }
    };
  });
