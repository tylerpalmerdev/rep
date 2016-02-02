repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc) {
  $scope.test = 'REP CTLR CONNECT';
  $scope.newQ = true;
  $scope.newQObj = {
    options: []
  };
  $scope.repData = repSvc.getRepInfo('12ubasdg');
  districtSvc.getDistrictByLatLon($scope);

  $scope.qFilter = 'active';
  $scope.changeQFilter = function(filterBy) {
    $scope.qFilter = filterBy;
  };

  $scope.repQs = questionSvc.getQsForRep('aoku78asd');

});
