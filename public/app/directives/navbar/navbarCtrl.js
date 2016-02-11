repApp.controller('navbarCtrl', function($scope, $state, $stateParams, authSvc, questionSvc, constants, util) {

  /* NAV */
  $scope.goHome = function(status) {
    // if voter is viewing a rep page and wants to go home
    if ($scope.currAuth.role === 'voter' && $state.current.name === 'rep') {
      $state.go('voter', {voterId: $scope.currAuth._id});
    }
    // or, if rep viewing another rep page
    else if ($scope.currAuth.role === 'rep' && $scope.currAuth.rep_id._id !== $stateParams.rep_id) {
      $state.go('rep', {repId: $scope.currAuth.rep_id._id});
    }
  };

  /* NEW Q - REP ONLY*/
  $scope.newQForm = false;
  $scope.newQObj = {options: []};

  $scope.qTypes = [
    {label: 'Yes/No', value: 'yn'},
    {label: 'Multiple Choice', value: 'mc'}
  ];

  $scope.openQForm = function() {
    $scope.newQForm = true;
  };

  $scope.clearQForm = function() {
    $scope.newQObj = {options: []};
  };

  // for reps only
  $scope.updateQData = function() {
    // if rep is on own page
    if ($scope.currAuth.rep_id === $stateParams.repId) {
      questionSvc.getQsForUser($scope.currAuth._id, 'rep')
      .then(
        function(response) {
          $scope.userQs = response;
        }
      );
    }
  };

  $scope.submitNewQ = function(newQObj) {
    newQObj.submitted_by = {
      rep_id: $scope.currAuth.rep_id._id,
      user_id: $scope.currAuth._id
    };
    questionSvc.postNewQ(newQObj)
    .then(
      function(response) {
        $scope.newQForm = false;
        $scope.clearQForm();
        $scope.updateQData();
      }
    );
  };

  $scope.logoutCurrUser = function() {
    authSvc.logout();
  };

  /* MYREPS - VOTER ONLY */
  $scope.myRepsModal = false;

  $scope.openMyReps = function() {
    $scope.myRepsModal = true;
  };

  $scope.getRepImgUrl = util.getPhotoUrl;
});
