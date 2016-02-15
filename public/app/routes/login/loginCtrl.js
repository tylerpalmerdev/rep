repApp.controller('loginCtrl', function($scope, $state, repSvc, authSvc) {

  $scope.loginUser = function(userObj) {
    authSvc.loginUser(userObj)
    .then(
      function(response) {
        console.log('User logged in, loginCtrl');
      },
      function(err) {
        console.log(err);
      }
    );
  };

});
