repApp.controller('loginCtrl', function($scope, $state, repSvc, authSvc) {
  $scope.test = 'Login CTRL connect';
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );

  $scope.loginUser = function(userObj) {
    authSvc.loginUser(userObj)
    .then(
      function(response) {
        $scope.updateCurrUserData();
      },
      function(err) {
        console.log(err);
      }
    )
  };

});
