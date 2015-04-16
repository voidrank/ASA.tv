define('indexController', 
    [
     'app','factories', 'less!indexStyle', 
    ],
    function(app){
      app.controller('index', ['$scope','$http', 'collectionUrl', 'indexUrl', 'collectionUrl', 'playerUrl', 'videoCoverUrl', function($scope, $http, collectionUrl, indexUrl, collectionUrl, playerUrl, videoCoverUrl){
          $scope.playerUrl = playerUrl;
          $scope.recommandation = [[], [], [], [], []];

          $http.get(collectionUrl+'/public')
            .success(function(res){
              $scope.collections = res;
            })


          $http.get(indexUrl)
            .success(function(res){
              for (var i = 0; i < res.recommandation.length; ++i){
                console.log(i);
                if (res.recommandation[i].rec != null){
                  rec = res.recommandation[i].rec;
                  res.recommandation[i].src = videoCoverUrl + rec;
                  res.recommandation[i].link = playerUrl + rec;
                }
                $scope.recommandation[res.recommandation[i].col].push(res.recommandation[i]);
              }
              $scope.rankList = res.rankList
              console.log($scope.recommandation);

              // recommandation 0
              $scope.currentIndex = 0;
              $scope.next = function(){
                $scope.currentIndex < $scope.recommandation[0].length - 1 ? $scope.currentIndex++ : $scope.currentIndex = 0;
              };
              $scope.prev = function() {
                $scope.currentIndex > 0 ? $scope.currentIndex-- : $scope.currentIndex = $scope.recommandation[0].length - 1;
              };
              $scope.$watch('currentIndex', function(){
                $scope.recommandation[0].forEach(function(image){
                  image.visible = false;
                })
                $scope.recommandation[0][$scope.currentIndex].visible = true;
              });
            });

      }]);
    }
);
