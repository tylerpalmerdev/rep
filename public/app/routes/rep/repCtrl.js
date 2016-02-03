repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc) {

  $scope.currAuth = {
    auth: true,
    role: 'rep',
    repId: $stateParams.repId
  };

  $scope.newQObj = {
    options: []
  };

  $scope.qFilter = 'active';
  $scope.changeQFilter = function(filterBy) {
    $scope.qFilter = filterBy;
  };

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
