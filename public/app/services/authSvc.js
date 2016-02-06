repApp.service('authSvc', function($http, $state, $stateParams, $q) {

  var goToHomePage = function(responseObj) {
    var role = responseObj.data.role;
    if (role === 'voter') {
      $state.go('voter', {voterId: responseObj.data._id});
    } else if (role === 'rep') {
      $state.go('rep', {repId: responseObj.data.bioguide_id});
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

  this.voterRouteCheck = function(voterPageId) {
    var def = $q.defer();
    // var voterPageId = $stateParams.voterId;
    console.log('Voter Id passed in:', voterPageId);
    $http({
      method: 'GET',
      url: '/currUser'
    })
    .then(
      function(response) {
        // if curr auth user_id is same as voter page id

        var authedVoterId = response.data._id;
        console.log('Authed voter id:', authedVoterId);
        console.log('Authed voter id:', voterPageId);
        // def.resolve(response.data);
        if (authedVoterId) {
          if (authedVoterId === voterPageId) {
            def.resolve(response.data); // allow access
          } else {
            console.log('Authed user not allowed to other private user page. Rerouting to the authed users page.');
            $state.go('voter', {voterId: authedVoterId});
            def.reject(response.data);
          }
        } else {
          console.log('user not logged in, rerouting to login page.');
          $state.go('login');
          def.reject('User not logged in.');
        }
      }
    );
    return def.promise;
  };
});
