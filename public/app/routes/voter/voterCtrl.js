repApp.controller('voterCtrl', function($scope, constants, voterData, authSvc) {
  $scope.status = 'voter-home';

  // make injected data about authed user available on $scope
  $scope.voterData = voterData;

  $scope.getRepImgUrl = function(bioguideId) {
    return constants.repPhotosBaseUrl + bioguideId + ".jpg";
  };

  $scope.logout = function() {
    authSvc.logout();
  };
});
