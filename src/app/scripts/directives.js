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


  .directive('fileUpload', function() {
    var slice = Array.prototype.slice;

    return {
      restrict: 'A',
      require: '?ngModel',
      compile: function(element, attrs) {
		var fileElement = document.createElement("input");
		fileElement.type = "file";
		fileElement.className = "file-upload";
		fileElement.style.display = "none";
		
		if (typeof attrs.multiple !== "undefined") {
			fileElement.multiple = "multiple";
		}
		
		element.append(fileElement);
		element.bind("click", function() {
			fileElement.click();
        });
        
        return function(scope, element, attrs, ngModel) {
          if (!ngModel) return;
          ngModel.$render = function() {};
          fileElement.addEventListener("change", function() {
            var newValue = [];
            for (var i=0; i<fileElement.files.length; i++) {
				newValue.push(fileElement.files[i]);
			}
            ngModel.$setViewValue(newValue);
		  });
        }; // return
      } //link
    }; //return
  }) //finish directive
  
});
