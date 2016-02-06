var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep/:repId',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl',
    resolve: {
      resolveCurrUser: function(authSvc) {
        return authSvc.getCurrUser();
      }
    }
  })
  .state('voter', {
    url: '/voter/:voterId',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl',
    resolve: {
      voterData: function(authSvc, $stateParams) {
        var targetVoterId = $stateParams.voterId;
        return authSvc.voterRouteCheck(targetVoterId);
      }
    }
  })
  .state('login', {
    url: '/login',
    templateUrl: 'app/routes/login/loginTmpl.html',
    controller: 'loginCtrl'
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'app/routes/signup/signupTmpl.html',
    controller: 'signupCtrl'
  });

  $urlRouterProvider
  .otherwise('/login');
});
