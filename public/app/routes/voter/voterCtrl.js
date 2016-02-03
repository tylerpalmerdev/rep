repApp.controller('voterCtrl', function($scope, repSvc) {
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );
});
