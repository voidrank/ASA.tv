define('indexController', ['app', 'factory', 'less!/app/less/index'],
    function(app){
      'use strict';
      app
        .controller('index', ['$scope','$http', 'collectionUrl', function($scope, $http, collectionUrl){
          $scope.collections = [];
          $scope.collectionUrl = collectionUrl;
          $http.get('/collection/public')
            .success(function(res){
              $scope.collections = res;
            });
        }]);
    }
);
