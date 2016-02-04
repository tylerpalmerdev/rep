repApp.controller('loginCtrl', function($scope, $state, repSvc) {
  $scope.test = 'Login CTRL connect';
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );
});
