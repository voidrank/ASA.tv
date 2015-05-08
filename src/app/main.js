// put all urlprefix here
var urlPrefix = '';


require.config({
    baseUrl: urlPrefix + '/app',
    paths: {
        /* bower_components */
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'angular': 'bower_components/angular/angular',
        'ngRoute': 'bower_components/angular-route/angular-route.min',
        'angular-resource': 'angular-resource.min',
        'angular-animate': 'bower_components/angular-animate/angular-animate.min',
        'angular-dropdowns': 'bower_components/angular-dropdowns/dist/angular-dropdowns',
        'ngDropdownStyle': 'bower_components/angular-dropdowns/dist/angular-dropdowns',
        'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min',
        'flat-ui': 'bower_components/flat-ui/dist/js/flat-ui.min',
        'domReady': 'bower_components/domReady/domReady',
        'loadingjs': 'bower_components/loading.js/loading',
        'loadingjsStyle': 'bower_components/loading.js/loading',
        /* ABPlayer */
        'ABPMobile': 'scripts/services/ABPlayerHTML5/js/ABPMobile',
        'CommentCoreLibrary': 'scripts/services/ABPlayerHTML5/js/CommentCoreLibrary',
        'ABPLibxml': 'scripts/services/ABPlayerHTML5/js/ABPLibxml',
        'ABPlayer': 'scripts/services/ABPlayerHTML5/js/ABPlayer',
        'player': 'scripts/services/player',
        'playerStyle': 'scripts/services/ABPlayerHTML5/css/base',
        /* jquery tool */
        'unslider': 'bower_components/unslider/src/unslider.min',
        /* less */
        'less': 'bower_components/require-less/less',
        'lessc': 'bower_components/require-less/lessc',
        'normalize': 'bower_components/require-less/normalize',
        /* css */
        'css': 'bower_components/require-css/css.min',
        /* app */
        'factories': 'scripts/factories',
        'directive': 'scripts/directives',
        'Uploader': 'scripts/services/upload/upload',
        'UploadVideoCover': 'scripts/services/upload/uploadCover',
        'headerController': 'scripts/controllers/header',
        'footerController': 'scripts/controllers/footer',
        'indexController': 'scripts/controllers/index',
        'homeController': 'scripts/controllers/home',
        'pageController': 'scripts/controllers/page',
        'videoPlayerController': 'scripts/controllers/videoPlayer',
        /* bootstrap */
        'bootstrapStyle': 'bower_components/bootstrap/dist/css/bootstrap.min',
        /* style */
        'indexStyle': 'less/index',
        'footerStyle': 'less/footer',
        'homeStyle': 'less/home',
        'headerStyle': 'less/header',
        'pageStyle': 'less/page',
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
        },
        'angular-animate': {
            deps: ['angular']
        },
        'angular-dropdowns': {
            deps: ['angular']
        },
        'unslider': {
            deps: ['jquery']
        },
    },
    urlArgs: 'v' + (new Date()).getTime()
});


define('app', ['angular', 'ngRoute', 'angular-animate', 'angular-dropdowns', 'unslider'], function (angular, ngRoute) {
    var app = angular.module('app', ['ngRoute', 'ngAnimate', 'ngDropdowns']);
    app.config(['$routeProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', "$httpProvider", "$locationProvider", function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider, $locationProvider) {
        app.controllerProvider = $controllerProvider;
        app.compileProvider = $compileProvider;
        app.routeProvider = $routeProvider;
        app.filterProvider = $filterProvider;
        app.provide = $provide;

        $routeProvider
            .when(urlPrefix + '/', {
                templateUrl: urlPrefix + '/app/views/index.html',
            })
            .when(urlPrefix + '/home/', {
                templateUrl: urlPrefix + '/app/views/home.html',
            })
            .when(urlPrefix + '/rec/:rec', {
                templateUrl: urlPrefix + '/app/views/videoPlayer.html',
            })
            .when(urlPrefix + '/collection/:col', {
                templateUrl: urlPrefix + '/app/views/page.html',
            })
            .when(urlPrefix + '/search', {
                templateUrl: urlPrefix + '/app/views/search.html'
            });
        $locationProvider.html5Mode(true);
    }])
        .constant(
        'urlPrefix', urlPrefix
    )
        .constant(
        'apiUrl', urlPrefix + '/api'
    )
        .constant(
        'homepageUrl', urlPrefix + '/home'
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
        'collectionUrl', urlPrefix + '/api/collection/'
    )
        .constant(
        'recToToken', urlPrefix + '/api/video/recToToken/'
    )
        .constant(
        'videoCoverUrl', urlPrefix + '/api/video/cover/'
    )
        .constant(
        'sendDanmakuUrl', urlPrefix + '/api/danmaku/'
    )
        .constant(
        'indexUrl', urlPrefix + '/api/index'
    )
        .constant(
        'playerUrl', urlPrefix + '/rec/'
    )
        .constant(
        'indexPageUrl', urlPrefix + '/'
    )
        .constant(
        'myUploadUrl', urlPrefix + '/api/video/myupload/'
    )
        .constant(
        'resourceUrl', urlPrefix + '/api/resource/'
    )
        .constant(
        'github', 'http://github.com/voidrank/asa.tv'
    )
        .constant(
        'stuUrl', 'stu.fudan.edu.cn'
    )
        .constant(
        'joinUs', 'stu.fudan.edu.cn/joinus/'
    );
    return app;
});

define('render',
    ['domReady', "angular", 'app', 'jquery', 'loadingjs', 'indexController', 'headerController', 'footerController', 'homeController', 'videoPlayerController', 'pageController', 'directive'],
    function (domReady, angular, app, $, loadingjs) {
        domReady(function () {

            // angular
            angular.element().ready(function () {
                angular.bootstrap(document, ["app"]);
            });

        });
    }
);

requirejs(['render', 'css', 'css!bootstrapStyle', 'css!loadingjsStyle'], function () {
    document.getElementsByTagName('body')[0].style['margin-top'] = 0;
    /*
     * This is a hack
     * At this time, angular haven't
     * rendered html, but rendering
     * function 'angular.bootstrap'
     * is in the js async queue,
     * the 'end' function will be
     * done after angular rendering
     */
    setTimeout(loading.wait(0).end('#loading-page'), 0);
});
