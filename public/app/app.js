var repApp = angular.module('repApp', ['ui.router', 'ngAnimate', 'angucomplete-alt']);

// add this to run block to fix scroll to top error when changing stateParams
repApp.run(function($rootScope) {
  $rootScope.$on('$stateChangeSuccess', function() {
   document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
});

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
    controller: 'loginCtrl',
    resolve: {
      userNotLoggedIn: function(authSvc) {
        return authSvc.userNotLoggedIn();
      }
    }
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'app/routes/signup/signupTmpl.html',
    controller: 'signupCtrl',
    resolve: {
      userNotLoggedIn: function(authSvc) {
        return authSvc.userNotLoggedIn();
      }
    }
  });

  $urlRouterProvider
  .otherwise('/login');
});
