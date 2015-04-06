define('directive', ['app', 'jquery'], function(app, $){
    app.directive('homelink', function(homepageUrl){
      return {
        restrict: 'E',
        transclude: true,
        template: "<a href='" + homepageUrl + "'>" +
                  "<span ng-transclude></span>" +
                  "</a>",
      };
    })
    .directive('loginlink', function(loginUrl){
      return {
        restrict: 'E',
        transclude: true,
        template: "<a href='" + loginUrl + "'>" +
                  "<span ng-transclude></span>" +
                  "</a>",
      };
    })
    .directive('logoutlink', function(logoutUrl){
      return {
        restrict: 'E',
        transclude: true,
        template: "<a href='" + logoutUrl + "'>" +
                  "<span ng-transclude></span>" +
                  "</a>",
      };
    })
    .directive('registerlink', function(registerUrl){
      return {
        restrict: 'E',
        transclude: true,
        template: "<a href='" + registerUrl + "'>" +
                  "<span ng-transclude></span>" +
                  "</a>",
      };
    })
    .directive('slider', function(urlPrefix){
      return {
        restrict: 'AE',
        replace: true,
        templateUrl: urlPrefix + '/app/views/index_slider.html',
        link: function(scope, ele, attr){
          scope.currentIndex = 0;
          console.log(scope.currentIndex);
          scope.next = function(){
            console.log(scope.currentIndex);
            scope.currentIndex < scope.images.length - 1 ? scope.currentIndex++ : scope.currentIndex = 0;
          };
          scope.prev = function() {
            scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
          };
          scope.$watch('currentIndex', function(){
            scope.images.forEach(function(image){
              image.visible = false;
            })
            scope.images[scope.currentIndex].visible = true;
          });
        },
        scope: {
          images: '='
        },
      }
    });
});
