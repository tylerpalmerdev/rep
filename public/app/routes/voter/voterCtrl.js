repApp.controller('voterCtrl', function($scope, constants, voterData, voterQs, authSvc) {

  // make injected data about authed user available on $scope
  $scope.status = 'voter-home';
  $scope.voterData = voterData;
  $scope.voterQs = voterQs;

  $scope.getRepImgUrl = function(bioguideId) {
    return constants.repPhotosBaseUrl + bioguideId + ".jpg";
  };

  $scope.logout = function() {
    authSvc.logout();
  };
});
