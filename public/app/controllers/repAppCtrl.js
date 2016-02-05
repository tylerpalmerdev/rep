repApp.controller('repAppCtrl', function($scope, authSvc) {

  $scope.updateCurrUserData = function() {
    authSvc.getCurrUser()
    .then(
      function(response) {
        $scope.currUserData = response;
        console.log('Current user data updated to:', $scope.currUserData);
      }
    );
  };

  $scope.updateCurrUserData();

});
