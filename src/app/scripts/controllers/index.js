define('indexController', 
    [
    'app', 'jquery', 'factories', 'less!indexStyle', 
    ],
    function(app, $){
      app.controller('index', ['$scope','$http', 'collectionUrl', 'indexUrl', 'collectionUrl', 'playerUrl', 'videoCoverUrl', function($scope, $http, collectionUrl, indexUrl, collectionUrl, playerUrl, videoCoverUrl){
        $scope.playerUrl = playerUrl;
        $scope.recommandation = [[], [], [], [], []];

        $http.get(collectionUrl+'public')
          .success(function(res){
            $scope.collections = res;
            console.log($scope.collections);
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
