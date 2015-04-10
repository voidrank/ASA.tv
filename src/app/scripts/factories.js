define('factory', ['app'], function(app){
  app.factory('apiUrlHttpInterceptor', function(apiUrl){

    var shouldPrependApiUrl = function(reqConfig){
      if (!apiUrl) return false;
      return !(/[\s\S]*.html/.test(reqConfig.url)||
          (reqConfig.url && reqConfig.url.indexOf(apiUrl) === 0));
    };

    return {
      request: function(reqConfig){
        if (apiUrl && shouldPrependApiUrl(reqConfig))
          reqConfig.url = apiUrl + reqConfig.url;
        return reqConfig;
      }
    };
  })
  .config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push('apiUrlHttpInterceptor');
  }]);
})
