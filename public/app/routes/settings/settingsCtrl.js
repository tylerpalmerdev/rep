repApp.controller('settingsCtrl', function($scope, authSvc) {
  $scope.test = 'settingsCtrl connect';
  $scope.logout = function() {
    authSvc.logout()
    .then(
      function(response) {
        console.log('user logged out!');
        // $scope.updateCurrUserData();
      }
    );
  };
});
