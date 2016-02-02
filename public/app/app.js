var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl'
  })
  .state('repfeed', {
    parent: 'rep',
    url: '/repfeed',
    templateUrl: 'app/routes/rep/repfeed/repfeedTmpl.html',
    controller: 'repfeedCtrl'
  })
  .state('newq', {
    parent: 'rep',
    url: '/newq',
    templateUrl: 'app/routes/rep/newQ/newQTmpl.html',
    controller: 'newQCtrl'
  })
  .state('voter', {
    url: '/voter',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl'
  })
  .state('voterfeed', {
    parent: 'voter',
    url: '/voterfeed',
    templateUrl: 'app/routes/voter/voterfeed/voterfeedTmpl.html',
    controller: 'voterfeedTmpl'
  })
  .state('myreps', {
    parent: 'voter',
    url: '/myreps',
    templateUrl: 'app/routes/voter/myreps/myrepsTmpl.html',
    controller: 'myrepsCtrl'
  });


  $urlRouterProvider
  .otherwise('/rep');
});
