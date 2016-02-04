repApp.controller('newQCtrl', function($scope, $stateParams) {
  $scope.currAuth = {
    auth: true,
    role: 'rep',
    repId: $stateParams.repId
  };

  // declare now so options can be added to array
  $scope.newQObj = {
    options: []
  };

  $scope.qTypes = [
    {
      label: 'Yes/No',
      value: 'yn'
    },
    {
      label: 'Multiple Choice',
      value: 'mc'
    }
  ];
});
