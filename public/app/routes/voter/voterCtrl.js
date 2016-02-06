repApp.controller('voterCtrl', function($scope, voterData, authSvc) {
  $scope.test = 'voter ctrl connect';
  $scope.status = 'voter-home';
  $scope.voterData = voterData;

  $scope.logout = function() {
    authSvc.logout()
    .then(
      function(response) {
        // $scope.updateCurrUserData();
      }
    );
  };
});
