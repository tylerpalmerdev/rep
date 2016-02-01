var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl'
  })
  .state('voter', {
    url: '/voter',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl'
  });

  $urlRouterProvider
  .otherwise('/voter');
});
