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
    $scope.uploadQueue = [];
    $scope.uploadCounts = 0;
      $scope.uploadnext = function() {
          while ($scope.uploadCounts < 1) {
              if ($scope.uploadQueue.length != 0) {
                  $scope.uploadQueue[0].upload();
                  $scope.uploadQueue.splice(0,1);
              } else break;
          }
      };
    $scope.changeVideoFiles = function() {
		for (var i=0; i<$scope.videofiles.length; i++) {
            /* state:
                  0: set up
                  1: queued up
                  2: checksum
                  3: upload
                  4: succeeded
                  999: failed
             */
			$scope.allvideofiles.push({
              file: $scope.videofiles[i],
              name: $scope.videofiles[i].name,
              state: 0,
                progress: {
                    checksum: 0,
                    upload: 0
                },
                queue: function() {
                    this.state = 1;
                    $scope.uploadQueue.push(this);
                    $scope.uploadnext();
                },
              upload: function() {
                  $scope.uploadCounts++;
                  var ngfileobj = this;
                  ngfileobj.state = 2;
                  var uploadinst = new Uploader(ngfileobj.file,
                      function(obj){
                          ngfileobj.progress.checksum = obj.checksumprog;
                          ngfileobj.progress.upload = obj.uploadprog;
                          if (obj.checksumprog == 100) {
                              ngfileobj.state = 3;
                              $scope.$apply();
                          }
                      },
                      {
                          url: apiUrl + '/',
                          filename: ngfileobj.name,
                          collection: 'test'
                      },
                      function(){
                          ngfileobj.state = 4;
                          $scope.$apply();
                          $scope.uploadCounts--;
                          $scope.uploadnext();
                      },
                      function(err){
                          console.log(err);
                          ngfileobj.state = 999;
                          $scope.$apply();
                          $scope.uploadCounts--;
                          $scope.uploadnext();
                      });
              },
                remove: function() {
                    var index = 0;
                    for (; index < $scope.allvideofiles.length; index++) {
                        if ($scope.allvideofiles[index] === this) {
                            break;
                        }
                    }
                    console.log(index);
                    if (index < $scope.allvideofiles.length) {
                        $scope.allvideofiles.splice(index, 1);
                    }
                }
            });
		}
		console.log($scope.allvideofiles);
	};
    $scope.uploadall = function() {
      $scope.allvideofiles.map(function(f){f.queue();});
    };
    $scope.videoCover = [];
    uploadVideoCover = new UploadVideoCover(document.getElementById('video-cover'), document.getElementById('video-cover-preview'));
    $http.get(collectionUrl + 'is_member_of')
    .success(function(res){
      console.log(res);
    })
  }]);

});
