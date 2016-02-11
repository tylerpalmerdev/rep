repApp.directive('repContactBar', function() {
  return {
    templateUrl: 'app/directives/repSocialBar/repContactBarTmpl.html',
    // controller: 'repContactBarCtrl',
    restrict: 'E',
    scope: {
      repData: '='
    }
  };
});
