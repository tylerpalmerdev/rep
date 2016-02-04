repApp.service('districtSvc', function($http, constants) {
  // uses sunlight api
  this.getDistrictByLatLon = function(lat, lng) {

    return $http({
      method: 'GET',
      url: (constants.sunlightBaseUrl + '/districts/locate?apikey=' + constants.sunlightApiKey + '&latitude=' + lat + '&longitude=' + lng)
    })
    .then(
      function(response) {
        return response.data.results[0];
      }
    );
  };
});
