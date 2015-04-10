define('homeController', ['app', 'Uploader', 'UploadVideoCover', 'factories', 'less!homeStyle'], function(app, Upload, UploadVideoCover){
  app.controller('home', function($scope, $http){
    $scope.tab = [];
    for (var i = 0; i < 6; ++i)
      $scope.tab[i] = {};
    $scope.changeTab = function(tabIndex){
      for (var i = 0; i < 6; ++i)
        $scope.tab[i].isActive = false;
      $scope.tab[tabIndex].isActive = true;
    }
    $scope.changeTab(4);
    $scope.videoCover = [];
    uploadVideoCover = new UploadVideoCover(document.getElementById('video-cover'), document.getElementById('video-cover-preview'));
  });

});
