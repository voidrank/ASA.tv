define('videoPlayerController', ['app', 'player', 'css!playerStyle'], function(app, player){
  app

    .controller('videoPlayer', ['$scope', '$http', '$routeParams', 'resourceUrl', 'recToToken', 'sendDanmakuUrl',  function($scope, $http, $routeParams, resourceUrl, recToTokenUrl, sendDanmakuUrl){
      console.log($routeParams);
      $http.get(recToTokenUrl+ $routeParams.rec)
        .success(function(res){
          player(resourceUrl + res.token, sendDanmakuUrl + res.token);
        });
    }]);
});
