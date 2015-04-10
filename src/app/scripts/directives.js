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
      template: "<a href='" + loginUrl + "' target='_self'>" +
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


  .directive('contactUs', function(stuUrl){
    return {
      restrict: 'E',
      transclude: true,
      template: "<a href='" + stuUrl + "'>" +
        "<span ng-transclude></span>" +
        "</a>",
    }
  })


  .directive('joinUs', function(joinUrl){
    return {
      restrict: 'E',
      transclude: true,
      template: "<a href='" + joinUrl + "'>" +
        "<span ng-transclude></span>" +
        "</a>"
    }
  })


  .directive('appFilereader', function($q) {
    var slice = Array.prototype.slice;

    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        if (!ngModel) return;
        ngModel.$render = function() {};
        element.bind('change', function(e) {
          var element = e.target;

          $q.all(slice.call(element.files, 0).map(readFile))
            .then(function(values) {
              if (element.multiple) ngModel.$setViewValue(values);
              else ngModel.$setViewValue(values.length ? values[0] : null);
            });

          function readFile(file) {
            var deferred = $q.defer();

            var reader = new FileReader();
            reader.onload = function(e) {
              deferred.resolve(e.target.result);
            };
            reader.onerror = function(e) {
              deferred.reject(e);
            };
            reader.readAsDataURL(file);

            return deferred.promise;
          }

        }); //change

      } //link
    }; //return
  }) //finish directive
  
});
