define('indexController', 
    [
     'app','factory', 'less!/app/less/index', 
    ],
    function(app){
      app.controller('index', ['$scope','$http', 'collectionUrl', 'videoCoverUrl', function($scope, $http, collectionUrl, videoCoverUrl){
          $scope.collections = [];
          $scope.collectionUrl = collectionUrl;
          $http.get('/collection/public')
            .success(function(res){
              $scope.collections = res;
            });
          $scope.videoCoverUrl = videoCoverUrl;
          $scope.images = [
            {'rec': 1, src: videoCoverUrl+'1'},
            {'rec': 1, src: videoCoverUrl+'1'},
            {'rec': 1, src: videoCoverUrl+'1'},
            {'rec': 1, src: videoCoverUrl+'1'},
          ];
      }]);
    }
);
