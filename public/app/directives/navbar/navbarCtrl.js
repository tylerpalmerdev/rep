repApp.controller('navbarCtrl', function($scope, $state, $stateParams, authSvc) {

  //
  $scope.currState = $state.current.name;

  $scope.goHomeVoter = function() {
    // if voter is in voter area and wants to change to voter-home view
    if ($scope.currState === 'voter') {
      $scope.currStatus = 'voter-home';
    }
    // if voter is viewing a rep page and wants to go home
    else if ($scope.currState === 'rep') {
      $state.go('voter', {voterId: $scope.currAuth._id});
    }
  };

  $scope.goHomeRep = function(status) {
    var authedRep = $scope.currAuth.rep_id._id;
    // if on own rep page:
    if ($stateParams.repId === authedRep) {
      $scope.currStatus = 'rep-home';
    }
    // if on another rep page
    else {
      $state.go('rep', {repId: authedRep});
    }
  };

  $scope.logoutCurrUser = function() {
    authSvc.logout();
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
