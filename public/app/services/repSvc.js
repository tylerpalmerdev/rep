repApp.service('repSvc', function($http, constants) {

  // get all rep info from own db
  this.getAllReps = function() {
    return $http({
      method: 'GET',
      url: '/reps'
    })
    .then(
      function(response) {
        return response.data;
      },
      function(err) {
        return err;
      }
    );
  };

  // get single rep info from own db
  this.getRepInfo = function(repId) { // uses rep_id
    return $http({
      method: 'GET',
      url: '/reps/' + repId
    })
    .then(
      function(response) {
        var data = response.data[0];
        data.photo_url = constants.repPhotosBaseUrl + data.bioguide_id + ".jpg";
        return data;
      }
    );
  };

}); // END
