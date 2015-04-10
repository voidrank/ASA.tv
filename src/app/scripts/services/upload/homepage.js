'user strict';

/* Controllers */
var homepage = angular.module('homepage', []).config(
  function($interpolateProvider){
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
  }
);

homepage.controller('homepage', function homepage($scope, $http){
  /* element */
  $scope.username = {};
  $scope.email = {};
  $scope.top_container = {};
  $scope.main_area = {};

  /* tab2 */
  $scope.tab2 = {};
  $scope.tab2.myupload = {};
  $scope.tab2.myupload.fresh = function(op, ct){
    $http.get(
      '/homepage/myupload/?op=' + parseInt(op) + '&ct=' + parseInt(ct)
    ).success(
      function(response){
        $scope.tab2.myupload.content = response;
        console.log(response);
      }
    )
  };

  /* tab4 */
  $scope.tab4 = {};
  $scope.tab4.upload = {};
  $scope.tab4.upload.files_list = [];
  $scope.tab4.upload.files_dom = {};

  // add files
  document.getElementById('video-upload').onchange = function(){
    files = this.files;
    console.log(files);
    for (var i = 0; i < files['length']; ++i){
      $scope.tab4.upload.files_list.push(files[i]);
    }
    $scope.$apply();
  };

  // add Icon
  document.getElementById('video-upload-icon').onclick = function(){
    document.getElementById('video-upload').click();
  }

  // remove file
  $scope.tab4.upload.remove_file = function($index){
    $scope.tab4.upload.files_list.splice($index, 1);
    console.log($scope.tab4.upload.files_list);
  };

  // video cover
  document.getElementById('video-cover-upload-icon').onclick = function(){
    t = document.getElementById('video-cover-upload');
    document.getElementById('video-cover-upload').click();
    console.log(t);
  }
  var uploadVideoCover = new UploadVideoCover(
      document.getElementById('video-cover-upload'),
      document.getElementById('video-cover-preview')
  );
  console.log(uploadVideoCover.startUpload);

  // start uploading
  $scope.tab4.upload.progress = {'width': 0};
  $scope.tab4.upload.start = function(){
    var files = document.getElementById("video-upload").files;
    if (files.length){
      for (var i = 0; i < files.length; ++i)
        if (files[i].name.indexOf(' ') >= 0){
          alert("文件名不能带空格");
          console.log("这一行看到了吗！     " + files[i].name);
          return false;
        }
      var now = 0;
      var total = files.length;
      console.log(total);
      var progress = document.getElementById('progress-text');
      for (var i = 0; i < files.length; ++i){
        (function(){
          var previous_prog = 0;
          var upload = new Uploader(files[i], 
            // status
            function(obj){
              console.log(obj);
              console.log(now);
              console.log(obj.uploadprog);
              now += obj.uploadprog - previous_prog;
              previous_prog = obj.uploadprog;
              if (now > 0){
                document.getElementById('progress-text').innerHTML = (now/total).toFixed(0).toString() + "%"
              }
              $scope.tab4.upload.progress.width = parseFloat(now/total)+'%';
              $scope.$apply();
            },
            // config
            undefined,
            // callback
            function(response){
              uploadVideoCover.startUpload(response.rec);
            }
          );
        })();
      }
    }
  };

  /* tab responsive */
  $scope.tab_container = {};
  $scope.tab_container.active = 4;
  $scope.tab_container.tab_total = 5;
  for (var i = 0; i <= 5; ++i)
    $scope.tab_container['tab'+parseInt(i)] = {
      'class': "",
      'http': 0
    };

  $scope.tab_container.change_tab = function(new_tab_id){
    $scope.tab_container["tab"+parseInt($scope.tab_container.active)].class = "";
    $scope.tab_container["tab"+parseInt($scope.tab_container.active)].active = 0;
    $scope.tab_container["tab"+parseInt(new_tab_id)].class = "active";
    $scope.tab_container["tab"+parseInt(new_tab_id)].active = 1;
    $scope.tab_container.active = new_tab_id;
    if (new_tab_id == 2){
      if ($scope.tab_container.tab2.http == 0){
        $scope.tab_container.tab2.http = 1;
        $scope.tab2.myupload.fresh(0, 12);
      }
    }
  };
  $scope.tab_container.change_tab($scope.tab_container.active);

  // test
  $scope.test_model = [];
  $scope.test = function(){
    uploadVideoCover.startUpload(2);
  };

  // tab5
  $http.get('/homepage/genericperinfo/')
  .success(
    function(response){
      $scope.username.content = response.username;
      $scope.email.content = response.email;
    }
  )

});
