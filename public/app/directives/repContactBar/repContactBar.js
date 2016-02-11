repApp.directive('repContactBar', function() {
  return {
    templateUrl: 'app/directives/repContactBar/repContactBarTmpl.html',
    controller: 'repContactBarCtrl',
    restrict: 'E',
    scope: {
      repData: '='
    }
  };
});
