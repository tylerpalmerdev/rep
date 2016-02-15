repApp.controller('repSelectCtrl', function($scope, $state, repSvc) {
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );

  $scope.repSelected = function($item) {
    if ($state.current.name === 'signup') {
      $scope.repInfo = $item.originalObject;
    } else {
      $state.go('rep', {repId: $item.originalObject._id});
    }
  };
});
