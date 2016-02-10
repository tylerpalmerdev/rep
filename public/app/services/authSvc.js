repApp.service('authSvc', function($http, $state, $stateParams, $q) {

  var goToHomePage = function(responseObj) {
    var role = responseObj.data.role;
    if (role === 'voter') {
      $state.go('voter', {voterId: responseObj.data._id});
    } else if (role === 'rep') {
      $state.go('rep', {repId: responseObj.data.rep_id});
    }
  };

  this.registerNewUser = function(userObj) {
    return $http({
      method: 'POST',
      url: '/signup',
      data: userObj
    })
    .then(
      function(response) {
        goToHomePage(response);
      },
      function(err) {
        console.log(err);
      }
    );
  };

  this.loginUser = function(userObj) {
    return $http({
      method: 'POST',
      url: '/login',
      data: userObj
    })
    .then(
      function(response) {
        goToHomePage(response);
      },
      function(err) {
        console.log('login failed', err);
      }
    );
  };

  this.logout = function() {
    return $http({
      method: 'GET',
      url: '/logout'
    })
    .then(
      function(response) {
        $state.go('login');
        return response.data;
      }
    );
  };

  this.getCurrUser = function() {
    return $http({
      method: 'GET',
      url: '/currUser'
    })
    .then(
      function(response) {
        return response.data;
      }
    );
  };

  // makes sure that voter pages can only be viewed by the logged in voter
  this.voterRouteCheck = function(voterPageId) {
    var def = $q.defer();
    this.getCurrUser()
    .then(
      function(response) {
        // if not logged in or rep role, reject promise/block view of voter page
        if (!response || response.role === 'rep') {
          def.reject('User not logged in.');
        } else if (response.role === 'voter') { // if voter
          var authedVoterId = response._id;
          if (authedVoterId === voterPageId) { // if voter id is same as page
            def.resolve(response); // allow access
          } else { // if not
            $state.go('voter', {voterId: authedVoterId}); // go to auth'd voter's page
            def.reject(response); // reject
          }
        }
      }
    );
    return def.promise;
  };

  // used to make sure logged in users don't go to login/register page
  this.userNotLoggedIn = function() {
    var def = $q.defer();

    this.getCurrUser()
    .then(
      function(response) {
        if(!response) {
          def.resolve();
        } else if (response) {
          def.reject();
        }
      }
    );

    return def.promise;
  };
});
