repApp.controller('repContactBarCtrl', function($scope) {
  $scope.getTwitterLink = function(twitterId) {
    return "http://twitter.com/" + twitterId;
  };

  $scope.getFacebookLink = function(facebookId) {
    return "http://facebook.com/" + facebookId;
  };

});
