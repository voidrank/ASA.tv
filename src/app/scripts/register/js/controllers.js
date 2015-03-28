'use strict';

/* Controllers */
var register = angular.module('register', []);

register.controller('register', function register($scope, $http){
  $scope.data = {
    username: "",
    password: "",
    repeat_password: "",
    email: ""
  }
  $scope.submit = function(){
    $http.post(
      window.location.href,
      JSON.stringify($scope.data)
    ).error(
      function(data){
        console.log(data);
      }
    ).success(
      function(data){
        if (data['status'] != 'OK')
          window.alert(data['msg']);
      }
    )
  }
});

