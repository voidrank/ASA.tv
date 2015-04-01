require(['app'], function(app){
  app.controller('index', function($scope){
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
  return app;
});
