repApp.controller('repContactBarCtrl', function($scope) {

  $scope.showEmailModal = false;
  $scope.showPhoneModal = false;
  $scope.showAddressModal = false;

  $scope.showContactModal = function(modalVar) {
    $scope[modalVar] = true;
  };

});
