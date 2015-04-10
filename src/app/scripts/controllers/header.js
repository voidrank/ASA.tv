define('headerController', ['app', 'less!headerStyle'], function(app){
  'use strict';
  app.controller('header', ['$scope', '$http', 'urlPrefix', function($scope, $http, urlPrefix){
    $scope.userLogIO = {
      'authenticated': false,
      'username' : ''
    }
    $http.get(urlPrefix + '/api/user/user_log_io')
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
