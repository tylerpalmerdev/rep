repApp.service('districtSvc', function($http) {
  var sunlightBaseUrl = 'https://congress.api.sunlightfoundation.com';
  var sunlightApiKey = 'c8b4c2f1a90e4d76adf7c80417b20882';

  this.getDistrictByLatLon = function(scopeObj) {
    // get lat lon from address/google map
    var lat = 33.799828;
    var lon = -118.352848;

    $http({
      method: 'GET',
      url: (sunlightBaseUrl + '/districts/locate?apikey=' + sunlightApiKey + '&latitude=' + lat + '&longitude=' + lon)
    })
    .then(
      function(response) {
        scopeObj.district = response.data.results[0];
      }
    );
  };
});
