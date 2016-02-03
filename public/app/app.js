var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep/:repId',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl'
  })
  .state('newq', {
    url: '/newq/:repId',
    templateUrl: 'app/routes/newQ/newQTmpl.html',
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
  })
  .state('land', {
    url: '/',
    templateUrl: 'app/routes/land/landTmpl.html',
    controller: 'landCtrl'
  });


  $urlRouterProvider
  .otherwise('/');
});
