var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep/:repId',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl',
    resolve: {
      currUser: function(authSvc) {
        return authSvc.getCurrUser();
      },
      repData: function(repSvc, $stateParams) {
        return repSvc.getRepInfo($stateParams.repId);
      },
      repQuestions: function(questionSvc, $stateParams) {
        return questionSvc.getQsForUser($stateParams.repId, 'rep');
      }
    }
  })
  .state('voter', {
    url: '/voter/:voterId',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl',
    resolve: {
      voterData: function(authSvc, $stateParams) {
        return authSvc.voterRouteCheck($stateParams.voterId);
      },
      voterQs: function(questionSvc, $stateParams) {
        return questionSvc.getQsForUser($stateParams.voterId, 'voter');
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
