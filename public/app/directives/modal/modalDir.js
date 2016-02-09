repApp.directive('dialogModal', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/modal/modalTmpl.html',
    scope: {
      showModal: '='
    },
    transclude: true,
    link: function(scope, elem, attrs) {
      scope.hideModal = function() {
        scope.showModal = false;
      };
    }
  };
});
