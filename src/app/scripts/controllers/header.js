define('headerController', ['app', 'less!/app/less/header'], function(app){
  'use strict';
  app.controller('header', ['$scope', '$http', function($scope, $http){
    $scope.userLogIO = {
      'authenticated': false,
      'username' : ''
    }
    $http.get('/user/user_log_io')
      .success(function(res){
        $scope.userLogIO.username = res.username;
        $scope.userLogIO.authenticated = true;
      })
      .error(function(res){
        $scope.userLogIO.authenticated = false;
        $scope.username = '';
      });
  }]);
})
