'use strict';

/**
 * @ngdoc function
 * @name showhausAngApp.controller:IndexCtrl
 * @description
 * # IndexCtrl
 * Controller of the showhausAngApp
 */

angular.module('showhaus')
  .controller('IndexCtrl', function ($scope, $rootScope) {
    $scope.showPage = false;
    $rootScope.$on('showPage', function(event, obj){
        $scope.showPage = obj;
    })
    $rootScope.$on('ogImage', function(event, obj){
        $scope.meta = obj;
    })
  });
