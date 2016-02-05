repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc) {

  // $scope.currAuth = {
  //   auth: true,
  //   role: 'rep',
  //   repId: $stateParams.repId
  // };

  $scope.newQObj = {
    options: []
  };

  $scope.filterOptions = [
    {
      label: 'Active',
      value: 'active',
      defaultOption: true
    },
    {
      label: 'Completed',
      value: 'completed'
    }
  ];

  $scope.repQs = questionSvc.getQsForRep('aoku78asd');

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

});
