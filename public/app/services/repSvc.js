repApp.service('repSvc', function($http) {
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

  this.getRepInfo = function(repId) { // uses bioguide_id
    // GET /reps/:repId
    return $http({
      method: 'GET',
      url: '/reps/' + repId
    })
    .then(
      function(response) {
        var data = response.data[0];
        data.photo_url = "https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/" + repId + ".jpg";
        return data;
      }
    );
  };
});
