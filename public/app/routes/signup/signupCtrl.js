repApp.controller('signupCtrl', function($scope, districtSvc, authSvc, util) {

  // custom options for dual-toggle directive
  $scope.roleOptions = util.signupRoleOptions;

  $scope.newUserObj = {}; // declare now to enable $watch

  // when newUserObj is updated
  $scope.$watchCollection('newUserObj', function() {
    // if it has an addressData prop
    if ($scope.newUserObj.hasOwnProperty('addressData')) {
      // get district for new user based on lat/lon
      var lat = $scope.newUserObj.addressData.lat;
      var lng = $scope.newUserObj.addressData.lng;

      // pull district data
      districtSvc.getDistrictByLatLon(lat, lng)
      .then(
        function(response) {
          $scope.newUserObj.district = response;
          $scope.addressSelected = true;
        }
      );
    }
  });

  $scope.register = function(newUserObj, repInfo) {

    if (newUserObj.role === 'rep') {
      newUserObj.bioguide_id = repInfo.bioguide_id;
      newUserObj.rep_id = repInfo._id;
    }

    authSvc.registerNewUser(newUserObj)
    .then(
      function(response) {
        console.log('User reg success, from signupCtrl');
      },
      function(err) {
        console.log(err);
      }
    );
  };

}); // END
