repApp.controller('navbarCtrl', function($scope, $state) {
  $scope.test = 'NAVBAR CTRL CONNECT';
  $scope.currState = $state.current.name;
  if($scope.currState === 'rep') {
    $scope.repState = true;
  } else if ($scope.currState === 'newq') {
    $scope.newqState = true;
  }
});
