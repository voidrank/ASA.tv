define('homeController', ['app', 'Uploader', 'UploadVideoCover', 'factories', 'less!homeStyle'], function(app, Uploader, UploadVideoCover){

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


  .controller('tab4', ['$scope', '$http', 'collectionUrl', 'apiUrl', function($scope, $http, collectionUrl, apiUrl){
    $scope.videofiles = [];
	$scope.allvideofiles = [];
    $scope.changeVideoFiles = function() {
		for (var i=0; i<$scope.videofiles.length; i++) {
            /* state:
                  0: set up
                  1: uploading
                  2: uploaded
                  -1: failed
             */
			$scope.allvideofiles.push({
              file: $scope.videofiles[i],
              name: $scope.videofiles[i].name,
              state: 0,
                progress: {
                    checksum: 0,
                    upload: 0
                },
              upload: function() {
                  var ngfileobj = this;
                  ngfileobj.state = 1;
                  var uploadinst = new Uploader(ngfileobj.file,
                      function(obj){
                          ngfileobj.progress.checksum = obj.checksumprog;
                          ngfileobj.progress.upload = obj.uploadprog;
                      },
                      {
                          url: apiUrl + '/',
                          filename: ngfileobj.name
                      },
                      function(){
                          ngfileobj.state = 2;
                          $scope.$apply();
                      },
                      function(err){
                          console.log(err);
                          ngfileobj.state = -1;
                          $scope.$apply();
                      });
              }
            });
		}
		console.log($scope.allvideofiles);
	};
	  
    $scope.videoCover = [];
    uploadVideoCover = new UploadVideoCover(document.getElementById('video-cover'), document.getElementById('video-cover-preview'));
    $http.get(collectionUrl + 'is_member_of')
    .success(function(res){
      console.log(res);
    })
  }]);

});
