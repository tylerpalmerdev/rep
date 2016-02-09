repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc, authSvc, currUser, repData, repQuestions) {

  $scope.currUserData = currUser;
  $scope.repData = repData;
  $scope.repQs = repQuestions;
  $scope.newQForm = false;

  $scope.newQObj = {options: []}; // set now so options can be pushed

  $scope.filterOptions = [
    {label: 'Active', value: 'active', defaultOption: true},
    {label: 'Completed', value: 'completed'}
  ];

});
