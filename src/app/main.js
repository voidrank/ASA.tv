
// put all urlprefix here
var urlPrefix = '';


require.config({
  baseUrl: urlPrefix + '/app',
  paths: {
    'jquery': 'bower_components/jquery/dist/jquery.min',
    'angular': 'bower_components/angular/angular',
    'ngRoute': 'bower_components/angular-route/angular-route.min',
    'angular-resource': 'angular-resource.min',
    'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min',
    'flat-ui': 'bower_components/flat-ui/dist/js/flat-ui.min',
    'domReady': 'bower_components/domReady/domReady',
    /* less */
    'less': 'bower_components/require-less/less',
    'lessc': 'bower_components/require-less/lessc',
    'normalize': 'bower_components/require-less/normalize',
    /* css */
    'css': 'bower_components/require-css/css.min',
    /* app */
    'factory': 'scripts/factory',
    'directive': 'scripts/directives',
    'headerController': 'scripts/controllers/header',
    'indexController': 'scripts/controllers/index',
  },
  shim: {
    'angular': {
      exports: 'angular'
    },
    'ngRoute': {
      deps: ['angular']
    },
    'angular-resource': {
      deps: ['angular'],
    }
  },
  urlArgs: 'v' + (new Date()).getTime()
});


define('app', ['angular', 'ngRoute'], function(angular, ngRoute){
  var app = angular.module('app', ['ngRoute']);
  app.config(['$routeProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', "$httpProvider", function($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider){
        app.controllerProvider = $controllerProvider;
        app.compileProvider = $compileProvider;
        app.routeProvider = $routeProvider;
        app.filterProvider = $filterProvider;
        app.provide = $provide;

        $routeProvider.when('/', {
          templateUrl: '/app/views/index.html',
        });
        $routeProvider.otherwise({
          redirectTo: '/'
        });
      }])
  .constant(
    'urlPrefix', urlPrefix
  )
  .constant(
    'apiUrl', urlPrefix + '/api'
  )
  .constant(
    'homepageUrl', urlPrefix + '/homepage'
  )
  .constant(
    'loginUrl', urlPrefix + '/accounts/login'
  )
  .constant(
    'logoutUrl', urlPrefix + '/accounts/logout'
  )
  .constant(
    'registerUrl', urlPrefix + '/accounts/register'
  )
  .constant(
    'collectionUrl', urlPrefix + '/collection/'
  );
  return app;
});

define('angularRender', ['domReady', "angular", 'app', 'indexController', 'headerController', 'directive'], function(domReady, angular, app){
  domReady(function(){
    angular.element().ready(function(){
       angular.bootstrap(document, ["app"]);
    });
  });
});

require(['angularRender', 'css']);
