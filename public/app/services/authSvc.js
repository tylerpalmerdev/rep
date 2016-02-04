repApp.service('authSvc', function($http) {
  this.registerNewUser = function(userObj) {
    return $http({
      method: 'POST',
      url: '/register',
      data: userObj
    })
    .then(
      function(response) {
        return response;
      },
      function(err) {
        console.log(err);
      }
    );
  };
});
