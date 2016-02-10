repApp.directive('navBar', function() {
  return {
    templateUrl: 'app/directives/navbar/navbarTmpl.html',
    controller: 'navbarCtrl',
    restrict: 'E',
    scope: {
      currAuth: '=',
      currStatus: '=',
      userQs: '='
    }
  };
});
