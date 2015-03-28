'use strict'

/* Controller */

var index = angular.module('index', []).config(
  function($interpolateProvider){
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
  }
);


index.controller('index', function index($scope, $http){
  /* element */
  $scope.collections = ['test']; 

  $http.get(
    "/video_list/?col=['test']"
  )
  .success(
    function(response){
      $scope.video_content = response
    }
  )
  
 /* css */
  $scope.style = {};
  $scope.style.collections = {
    'height': 300,
    'margin-bottom': 20
  }
  $scope.style.pagination = {
    'margin-top': 10
  }
});
