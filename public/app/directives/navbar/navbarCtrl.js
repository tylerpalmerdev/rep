repApp.controller('navbarCtrl', function($scope, $state, authSvc) {

  $scope.currState = $state.current.name;

  $scope.changeStatus = function(status) {
    $scope.currStatus = status;
  };

  /*
  statuses:
  rep-home
  new-q
  voter-home
  my-reps
  settings
  */
});
