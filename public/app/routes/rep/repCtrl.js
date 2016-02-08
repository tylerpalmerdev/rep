repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc, authSvc, currUser, repData, repQuestions) {

  $scope.status = 'rep-home'; // default
  $scope.currUserData = currUser;
  $scope.repData = repData;
  $scope.repQs = repQuestions;

  $scope.newQObj = {options: []}; // set now so options can be pushed

  $scope.filterOptions = [
    {label: 'Active', value: 'active', defaultOption: true},
    {label: 'Completed', value: 'completed'}
  ];

  $scope.qTypes = [
    {label: 'Yes/No', value: 'yn'},
    {label: 'Multiple Choice', value: 'mc'}
  ];

  $scope.clearQForm = function() {
    $scope.newQObj = {options: []};
  };

  $scope.submitNewQ = function(newQObj) {
    newQObj.submitted_by = {
      rep_id: $scope.currUserData.rep_id._id,
      user_id: $scope.currUserData._id
    };
    questionSvc.postNewQ(newQObj)
    .then(
      function(response) {
        $scope.status = 'rep-home';
        $scope.clearQForm();
      }
    );
  };

  $scope.logout = function() {
    authSvc.logout();
  };

});
