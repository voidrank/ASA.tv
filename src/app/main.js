// ventor 
require.config({
  baseUrl: '/app/bower_components',
  paths: {
    'angular': 'angularjs/angular.min',
    'jquery': 'jquery/dist/jquery.min',
    'bootstrap': 'bootstrap/dist/js/bootstrap.min',
    'flat-ui': 'flat-ui/dist/js/flat-ui.min',
    'domReady': 'domReady/domReady'
  },
  shim: {
    'bootstrap': {
      deps: ['jquery'],
      exports: 'bootstrap'
    },
    'jquery': {
      exports: 'jquery'
    },
    'flat-ui': {
      deps: ['jquery', 'bootstrap'],
      exports: 'flat-ui'
    },
    'angular': {
      deps: ['jquery', 'bootstrap'],
      exports: 'angular'
    }
  }
});

require([
  'angular',
  'jquery',
  'bootstrap',
  'flat-ui',
  'domReady'
]);

require.config([
  
});

// app
//


// bootstrap render
define(['angular', 'domReady'], function(angular, domReady){
  domReady(function(){
    angular.bootstrap(document, ['app']);
  });
});
