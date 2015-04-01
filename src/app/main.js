// ventor 
require.config({
  baseUrl: '/app',
  paths: {
    'jquery': 'bower_components/jquery/dist/jquery.min',
    'angular': 'bower_components/angular/angular.min',
    'angular-route': 'bower_components/angular-route/angular-route.min',
    'angular-resource': 'angular-resource.min',
    'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min',
    'flat-ui': 'bower_components/flat-ui/dist/js/flat-ui.min',
    'domReady': 'bower_components/domReady/domReady',
    'app': 'app',
    'index': 'scripts/controllers/index'
  },
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angular-route': ['angular'],
    'angular-resource': ['angular']
  },
  urlArgs: "bust=" + (new Date()).getTime()
});

require(['domReady', "angular", "app", 'index'], function(domReady, angular){
  domReady(function(){
    angular.element().ready(function(){
      angular.bootstrap(document, ["app"]);
    });
  });
});
