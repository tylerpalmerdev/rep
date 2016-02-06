repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc, authSvc, resolveCurrUser) {

  $scope.status = 'rep-home'; // default
  $scope.currUserData = resolveCurrUser;

  $scope.newQObj = {
    options: []
  };

  $scope.filterOptions = [
    {label: 'Active', value: 'active', defaultOption: true},
    {label: 'Completed', value: 'completed'}
  ];

  $scope.qTypes = [
    {label: 'Yes/No', value: 'yn'},
    {label: 'Multiple Choice', value: 'mc'}
  ];

  $scope.repQs = questionSvc.getQsForRep('aoku78asd');

  // function to manipulate titles based on
  $scope.isSen = true;
  repSvc.getRepInfo($stateParams.repId)
  .then(
    function(response) {
      $scope.repData = response;
      if($scope.repData.title === 'Sen') {
        $scope.repTitle = 'Senator';
        $scope.isSen = true;
      } else if ($scope.repData.title === 'Rep') {
        $scope.repTitle = 'Representative';
        $scope.isSen = false;
      } else {
        $scope.repTitle = $scope.repData.title + '.';
      }
    }
  );

  $scope.logout = function() {
    authSvc.logout()
    .then(
      function(response) {
        // $scope.updateCurrUserData();
      }
    );
  };

});
