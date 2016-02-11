repApp.service('util', function(constants) {
  this.getPhotoUrl = function(bioguideId) {
    return constants.repPhotosBaseUrl + bioguideId + ".jpg";
  };
});
