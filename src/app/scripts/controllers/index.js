define('indexController', 
    [
    'app', 'jquery', 'factories', 'less!indexStyle', 
    ],
    function(app, $){
      app.controller('index', ['$scope','$http', 'collectionUrl', 'indexUrl', 'collectionUrl', 'playerUrl', 'videoCoverUrl', function($scope, $http, collectionUrl, indexUrl, collectionUrl, playerUrl, videoCoverUrl){
        $scope.playerUrl = playerUrl;
        $scope.collection = [];
        $scope.recommadation = [];
        $scope.videos = [];

        $http.get(collectionUrl+'public')
          .success(function(res){
            $scope.collections = res;
            console.log($scope.collections);
            var i;
            for (i = 0; i < $scope.collections.length; ++i){
              ((function(i){
                $http.get(collectionUrl+'video/'+$scope.collections[i].name+'/'+0)
                  .success(function(res){
                    $scope.videos[i] = res.slice(0, 8);
                    console.log(i);
                    console.log($scope.videos[i]);
                  });
              })(i));
            }
          })


        $http.get(indexUrl)
          .success(function(res){
            $scope.recommandation = res.recommandation;
            $scope.rankList = res.rankList.slice(0, 10);
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
                'fluid': false,
              })
            }, 0);
          });

      }]);
    }
);
