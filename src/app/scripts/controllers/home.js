define('homeController', ['app', 'factories', 'less!homeStyle'], function(app){
  app.controller('home', function($scope, $http){
    $scope.tab = [];
    for (var i = 0; i < 6; ++i)
      $scope.tab[i] = {};
    $scope.changeTab = function(tabIndex){
      for (var i = 0; i < 6; ++i)
        $scope.tab[i].isActive = false;
      $scope.tab[tabIndex].isActive = true;
    }
  });
});
