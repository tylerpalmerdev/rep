repApp.service('repSvc', function($http, $q,  constants) {

  // only need to access inside the service, will return via public methods
  var allReps = "";

  // get all rep info from own db
  this.getAllReps = function() {
    var def = $q.defer();
    if(allReps) {
      def.resolve(allReps);
    } else {
      $http({
        method: 'GET',
        url: '/reps'
      })
      .then(
        function(response) {
          allReps = response.data;
          def.resolve(allReps);
        },
        function(err) {
          def.reject(err);
        }
      );
    }
    return def.promise;
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
