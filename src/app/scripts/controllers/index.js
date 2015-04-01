require(['app'],
    function(app){
      'use strict';
      app
        .controller('index', ['$scope','$http', function($scope, $http){
          /* element */
          console.log("123");
          $scope.collections = ['test']; 

          $http.get(
              "/api/video_list/?col=['test']"
              )
            .success(function(response){
              $scope.video_content = response
            })

          /* css */
          $scope.style = {};
          $scope.style.collections = {
            'height': 300,
            'margin-bottom': 20
          }
          $scope.style.pagination = {
            'margin-top': 10
          }
        }]);
    }
)
