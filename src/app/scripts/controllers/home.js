define('homeController', ['app', 'Uploader', 'UploadVideoCover', 'factories', 'less!homeStyle'], function(app, Upload, UploadVideoCover){

  app


  .controller('home', function($scope, $http){
    $scope.tab = [];
    for (var i = 0; i < 6; ++i)
      $scope.tab[i] = {};
    $scope.changeTab = function(tabIndex){
      for (var i = 0; i < 6; ++i)
        $scope.tab[i].isActive = false;
      $scope.tab[tabIndex].isActive = true;
    }
    $scope.changeTab(4);
  })
  

  .controller('tab2', function($scope, $http){
  })


  .controller('tab4', ['$scope', '$http', 'collectionUrl', function($scope, $http, collectionUrl){
    $scope.videoCover = [];
    uploadVideoCover = new UploadVideoCover(document.getElementById('video-cover'), document.getElementById('video-cover-preview'));
    $http.get(collectionUrl + 'is_member_of')
    .success(function(res){
      console.log(res);
    })
  }]);

});
