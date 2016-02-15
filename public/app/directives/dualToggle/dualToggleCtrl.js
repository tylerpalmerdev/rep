repApp.controller('dualToggleCtrl', function($scope) {

  // used to apply/remove active-toggle class for styling
  $scope.select = function(boxIndex) {
    $scope.selected = $scope.options[boxIndex].value;
    if (boxIndex === 0) {
      $scope.options[0].selected = true;
      $scope.options[1].selected = false;
    } else if (boxIndex === 1) {
      $scope.options[0].selected = false;
      $scope.options[1].selected = true;
    }
  };

  // checks/applies optional 'defaultOption' property on option objects.
  $scope.options.forEach(function(elem, i, arr) {
    if (elem.selected) {
      $scope.selected = elem.value;
    }
  });

  // revert to default when coming back to view
  $scope.select(0);
});
