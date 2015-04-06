define('directive', ['app'], function(app){
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
});
