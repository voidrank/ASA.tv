define('homeController', ['app', 'Uploader', 'UploadVideoCover', 'factories', 'less!homeStyle', 'css!ngDropdownStyle'], function(app, Uploader, UploadVideoCover){

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


  .controller('tab2', ['$scope', '$http', 'myUploadUrl', 'videoCoverUrl', 'playerUrl', function($scope, $http, myUploadUrl, videoCoverUrl, playerUrl){
    $scope.videoCoverUrl = videoCoverUrl;
    $scope.playerUrl = playerUrl;
    $scope.muUpload = [];
    $http.get(myUploadUrl)
      .success(function(res){
        $scope.myUpload = res;
      })
      .error(function(res){
        $scope.myUpload = [];
      })
  }])


  .controller('tab4', ['$scope', '$http', 'collectionUrl', 'apiUrl', function($scope, $http, collectionUrl, apiUrl){
    //collections Selected
    $scope.collection = {};
    $scope.collection.options = [];
    $scope.collection.selected = {
      'name': '请选择'
    };
    $http.get(collectionUrl + 'is_member_of')
      .success(function(res){
        $scope.collection.options = res;
      });

    //cover upload
    uploadVideoCover = new UploadVideoCover(
      document.getElementById('video-cover'), 
      document.getElementById('video-cover-preview'),
      {
        'url': apiUrl + '/video/cover/'
      }
    );
    // video upload
    // file object
    var fileuploadobj = function(file) {
		var uploadinst = new Uploader(file, {
			url: apiUrl + '/',
			filename: file.name,
			collection: $scope.collection.selected.name,
		});
		uploadinst.on("progress", function(progress){;
            if (progress.checksum == 100) {
              this.state = 3;
            }
            $scope.$apply();
		});
		uploadinst.on("finish", function(res){
            this.state = 4;
            $scope.$apply();
            $scope.uploadCounts--;
            $scope.uploadnext();
            uploadVideoCover.startUpload(res.rec);
		});
		uploadinst.on("error", function(err){
            console.log(err.stack);
            this.state = 999;
            $scope.$apply();
            $scope.uploadCounts--;
            $scope.uploadnext();
		});
		uploadinst.state = 0;
		return uploadinst;
    };
    Uploader.prototype.queue = function() {
      this.state = 1;
      $scope.uploadQueue.push(this);
      $scope.uploadnext();
    };
    Uploader.prototype.startupload = function() {
      $scope.uploadCounts++;
      this.config.collection = $scope.collection.selected.name;
      this.state = 2;
      this.upload();
      $scope.$apply();
    };
    Uploader.prototype.remove = function() {
	  if (this.state >= 2) this.cancel();
      var index = 0;
      for (; index < $scope.allvideofiles.length; index++) {
        if ($scope.allvideofiles[index] === this) {
          break;
        }
      }
      if (index < $scope.allvideofiles.length) {
        $scope.allvideofiles.splice(index, 1);
      }
    };
    // global vars
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
      console.log($scope.videofiles);
      for (var i=0; i<$scope.videofiles.length; i++) {
        $scope.allvideofiles.push(fileuploadobj($scope.videofiles[i]));
      }
    };
    //end of videoupload

    $scope.uploadall = function() {
      $scope.allvideofiles.map(function(f){f.queue();});
    };
    $scope.videoCover = [];
  }]);

});
