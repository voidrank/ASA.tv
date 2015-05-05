define('pageController',
    [
    'app', 'jquery', 'factories', 'less!pageStyle'
    ],
    function(app, $){
      app.controller('page', ['$scope','$http','$routeParams', 'collectionUrl', 'indexUrl', 'collectionUrl', 'playerUrl', 'videoCoverUrl', function($scope, $http,$routeParams,collectionUrl, indexUrl, collectionUrl, playerUrl, videoCoverUrl) {
        var pagename=$routeParams.col;
        console.log(pagename);
        console.log('!@#');

        $scope.videos = [];

        $scope.currentPage = 0;
        $scope.pageSize = 8;

        $http.get(collectionUrl + 'video/'+ pagename +'/0')
          .success(function (res) {
            $scope.videos = res;
            $scope.totalPage = Math.ceil($scope.videos.length / $scope.pageSize);
            $scope.endPage = $scope.totalPage;
            $scope.pages=[];
            var i;
            for(i=0;i<$scope.totalPage;i++) {
              console.log(i);
              $scope.pages.push(i);
            }

            $scope.rank = res;
            for(i=0;i<res.length;i++) {
              $scope.rank.ord = - $scope.rank.playCount;
            }
            //$scope.order = "playCount";
          });

        $scope.load = function() {
          $scope.show = $scope.videos.slice($scope.currentPage*$scope.pageSize,Math.min(($scope.currentPage+1)*$scope.pageSize,$scope.videos.length));

        };

        $scope.next = function() {
          if($scope.currentPage < $scope.totalPage-1) {
            $scope.currentPage++;
            $scope.load();
          }
        };

        $scope.prev = function() {
          if($scope.currentPage > 0) {
            $scope.currentPage--;
            $scope.load();
          }
        };

        $scope.loadPage = function (page) {
          $scope.currentPage = page;
          $scope.load();
        };
        


        $http.get(collectionUrl+'public')
          .success(function(res){
            $scope.collections = res;
            console.log($scope.collections);
          })


        $http.get(indexUrl)
          .success(function(res){
            $scope.recommandation = res.recommandation;
            $scope.rankList = res.rankList.slice(0, 5);
            /*
             * This is a hack
             * At this time, angular haven't 
             * rendered html, so [unslider]
             * will not get complete DOM.
             * Let the setup function run
             * after angular's render.
             */
            setTimeout(function(){
              $('.banner').unslider({
                'speed': 500,
                'delay': 3000,
                'complete': function(){},
                'keys': true,
                'dots': true,
                'fluid': false
              })
            }, 0);
          });

      }]);
    }
);
