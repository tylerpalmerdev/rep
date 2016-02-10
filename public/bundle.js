var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep/:repId',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl',
    resolve: {
      currUser: function(authSvc) {
        return authSvc.getCurrUser();
      },
      repData: function(repSvc, $stateParams) {
        return repSvc.getRepInfo($stateParams.repId);
      },
      repQuestions: function(questionSvc, $stateParams) {
        return questionSvc.getQsForUser($stateParams.repId, 'rep');
      }
    }
  })
  .state('voter', {
    url: '/voter/:voterId',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl',
    resolve: {
      voterData: function(authSvc, $stateParams) {
        return authSvc.voterRouteCheck($stateParams.voterId);
      },
      voterQs: function(questionSvc, $stateParams) {
        return questionSvc.getQsForUser($stateParams.voterId, 'voter');
      }
    }
  })
  .state('login', {
    url: '/login',
    templateUrl: 'app/routes/login/loginTmpl.html',
    controller: 'loginCtrl'
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'app/routes/signup/signupTmpl.html',
    controller: 'signupCtrl'
  });

  $urlRouterProvider
  .otherwise('/login');
});

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

  this.voterRouteCheck = function(voterPageId) {
    var def = $q.defer();
    console.log('Voter Id passed in:', voterPageId);
    $http({
      method: 'GET',
      url: '/currUser'
    })
    .then(
      function(response) {
        // if curr auth user_id is same as voter page id
        var authedVoterId = response.data._id;
        if (authedVoterId) {
          if (authedVoterId === voterPageId) {
            def.resolve(response.data); // allow access
          } else {
            $state.go('voter', {voterId: authedVoterId});
            def.reject(response.data);
          }
        } else {
          $state.go('login');
          def.reject('User not logged in.');
        }
      }
    );
    return def.promise;
  };
});

repApp.constant('constants', {
  sunlightBaseUrl: 'https://congress.api.sunlightfoundation.com',
  sunlightApiKey: 'c8b4c2f1a90e4d76adf7c80417b20882',
  repPhotosBaseUrl: 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/'
});

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

repApp.service('questionSvc', function($http, constants) {

  this.getQsForUser = function(id, role) {
    return $http({
      method: 'GET',
      url: '/questions?role=' + role + '&' + role + 'Id=' + id
    })
    .then(
      function(response) {
        return response.data;
      }
    );
  };

  this.postNewQ = function(qObj) {

    var new_options = []; // blank array to hold final option objects
    qObj.options.forEach(function(elem, i, arr) {
      if (elem) { // if option is not blank
        new_options.push({text: elem}); // add option object to new arr
      }
    });
    qObj.options = new_options;

    return $http({
      method: 'POST',
      url: '/questions',
      data: qObj
    })
    .then(
      function(response) {
        console.log(response.data);
        // return response.data;
      }
    );
  };

  this.answerQ = function(answerObj) {
    /*
    {
      question_id: 'asdojkf8jasd98f',
      answer: 2,
      user_id: '099asg0asd'
    }
    */
    return $http({
      method: 'POST',
      url: '/answers',
      data: answerObj
    })
    .then(
      function(response) {
        console.log('answer submitted!');
      }
    );
  };
});

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

repApp.controller('addressSearchCtrl', function($scope) {

  // set bounds of search to the whole world
  var bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-90, -180),
    new google.maps.LatLng(90, 180)
  );

  // get place search input element (only one on page at a time, because ID)
  var input = document.getElementById('address-search-input');

  // create options object
  var options = {
    bounds: bounds,
    types: ['geocode'],
    componentRestrictions: {country: 'us'}
  };

  // new autocomplete object that will actually initialize autocomplete
  var autocomplete = new google.maps.places.Autocomplete(input, options);

  var getPlaceDetails = function() {
    // raw address data from autocomplete, returned after city selected
    // create addressData obj
    $scope.addressData = {};

    var rawPlaceData = autocomplete.getPlace();
    // console.log(rawPlaceData);

    // extract state data
    var state = rawPlaceData.address_components[rawPlaceData.address_components.length - 4];

    // add to addressData object from raw place data
    $scope.addressData.address_string = rawPlaceData.formatted_address;
    $scope.addressData.state_short = state.short_name;
    $scope.addressData.state_long = state.long_name;
    $scope.addressData.place_id = rawPlaceData.place_id;
    $scope.addressData.lat = rawPlaceData.geometry.location.lat();
    $scope.addressData.lng = rawPlaceData.geometry.location.lng();
    $scope.addressData.map_url = rawPlaceData.url;
    $scope.$apply(); // update scope
  };

  // when new place is selected, log results obj of place
  autocomplete.addListener('place_changed', getPlaceDetails);

});

repApp.directive('addressSearch', function() {
  return {
    templateUrl: 'app/directives/addressSearch/addressSearchTmpl.html',
    restrict: 'E',
    scope: {
      addressData: '='
    },
    controller: 'addressSearchCtrl'
  };
});

repApp.controller('dualToggleCtrl', function($scope) {

  // used to apply/remove active-toggle class for styling
  $scope.highlightBox = function(boxIndex) {
    if (boxIndex === 0) {
      $scope.first = true;
      $scope.second = false;
    } else if (boxIndex === 1) {
      $scope.second = true;
      $scope.first = false;
    }
  };

  // checks/applies optional 'defaultOption' property on option objects.
  $scope.options.forEach(function(elem, i, arr) {
    if (elem.defaultOption) {
      $scope.selected = elem.value;
      $scope.highlightBox(i);
    }
  });

  // function to select one toggle/ deselect other
  $scope.select = function(option) {
    $scope.selected = $scope.options[option].value;
    $scope.highlightBox(option);
  };
});

/*
Example data:
$scope.roleOptions = [
  {
    label: 'Representative',
    value: 'rep',
    defaultOption: true
  },
  {
    label: 'Voter',
    value: 'voter'
  }
];
*/

repApp.directive('dualToggle', function() {
  return {
    templateUrl: 'app/directives/dualToggle/dualToggleTmpl.html',
    controller: 'dualToggleCtrl',
    restrict: 'E',
    scope: {
      options: '=', // arr with two objects
      selected: '=', // pass back up to $scope
      toggleDefualt: '@'
    }
  };
});


repApp.directive('dialogModal', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/modal/modalTmpl.html',
    scope: {
      showModal: '='
    },
    transclude: true,
    link: function(scope, elem, attrs) {
      scope.hideModal = function() {
        scope.showModal = false;
      };
    }
  };
});

repApp.controller('navbarCtrl', function($scope, $state, $stateParams, authSvc, questionSvc, constants) {

  /* NAV */
  $scope.goHome = function(status) {
    // if voter is viewing a rep page and wants to go home
    if ($scope.currAuth.role === 'voter' && $state.current.name === 'rep') {
      $state.go('voter', {voterId: $scope.currAuth._id});
    }
    // or, if rep viewing another rep page
    else if ($scope.currAuth.role === 'rep' && $scope.currAuth.rep_id._id !== $stateParams.rep_id) {
      $state.go('rep', {repId: $scope.currAuth.rep_id._id});
    }
  };

  /* NEW Q - REP ONLY*/
  $scope.newQForm = false;
  $scope.newQObj = {options: []};

  $scope.qTypes = [
    {label: 'Yes/No', value: 'yn'},
    {label: 'Multiple Choice', value: 'mc'}
  ];

  $scope.openQForm = function() {
    $scope.newQForm = true;
  };

  $scope.clearQForm = function() {
    $scope.newQObj = {options: []};
  };

  // for reps only
  $scope.updateQData = function() {
    // if rep is on own page
    if ($scope.currAuth.rep_id === $stateParams.repId) {
      questionSvc.getQsForUser($scope.currAuth._id, 'rep')
      .then(
        function(response) {
          $scope.userQs = response;
        }
      );
    }
  };

  $scope.submitNewQ = function(newQObj) {
    newQObj.submitted_by = {
      rep_id: $scope.currAuth.rep_id._id,
      user_id: $scope.currAuth._id
    };
    questionSvc.postNewQ(newQObj)
    .then(
      function(response) {
        $scope.newQForm = false;
        $scope.clearQForm();
        $scope.updateQData();
      }
    );
  };

  $scope.logoutCurrUser = function() {
    authSvc.logout();
  };

  /* MYREPS - VOTER ONLY */
  $scope.myRepsModal = false;

  $scope.openMyReps = function() {
    $scope.myRepsModal = true;
  };

  $scope.getRepImgUrl = function(bioguideId) {
    return constants.repPhotosBaseUrl + bioguideId + ".jpg";
  };
});

repApp.directive('navBar', function() {
  return {
    templateUrl: 'app/directives/navbar/navbarTmpl.html',
    controller: 'navbarCtrl',
    restrict: 'E',
    scope: {
      currAuth: '=',
      currStatus: '=',
      userQs: '='
    }
  };
});

repApp.controller('qFeedCtrl', function($scope, questionSvc) {

  // this will be used to open/close modals for each question box.
  $scope.modalShowObj = {};

  $scope.showQModal = function(qId) {
    $scope.modalShowObj[qId] = true;
  };

  $scope.closeQModal = function(qId) {
    $scope.modalShowObj[qId] = false;
    $scope.optionChosenIndex = "";
  };

  // DOESN'T UPDATE REP Q DATA IN REAL TIME
  // function to update question data for user and apply to scope
  $scope.updateQuestionData = function() {
    questionSvc.getQsForUser($scope.userData._id, $scope.userData.role)
    .then(
      function(response) {
        $scope.qData = response;
      }
    );
  };

  // function to hide "rep who asked" info when rep is looking at their own Qs
  $scope.userIsRepWhoAsked = function(currUserObj, idOfRepWhoAsked) {
    if (!currUserObj) { // if no authed user
      return false;
    } else if (currUserObj.role === 'voter') { // if voter
      return false;
    } else if (currUserObj.role === 'rep') {
      if (currUserObj.rep_id._id === idOfRepWhoAsked) {
        return true;
      }
    } else {
      return false;
    }
  };

  $scope.isInPast = function(endDate) {
    var endDateMs = +new Date(endDate);
    if (endDateMs < Date.now()) {
      return true;
    } else {
      return false;
    }
  };

  // why doesn't this work?
  // check to see if user answered question
  $scope.userHasAnsweredQ = function(userData, qId) {
    // if (!userData) { // false if not auth'd
    //   return false;
    // } else if (userData.role === 'rep') { // false if rep
    //   return false;
    // } else if (userData.role === 'voter') {
    //   // if voter hasn't answered any questions
    //   if (userData.questions_answered.length === 0) {
    //     return false;
    //   } else {
    //     // search array of questions answerer for the q's ID
    //     userData.questions_answered.forEach(function(elem, i, arr) {
    //       if (elem.question_id === qId) { // if match found
    //         console.log("match!", elem.question_id, qId);
    //         return true; // return the index of that
    //       }
    //     });
    //   }
    // }
    // // if nothing matches
    // return false;
  };

  // only for voters
  $scope.answerQuestion = function(questionId, answerIndex) {
    var answerObj = {
      question_id: questionId,
      answer_chosen: parseInt(answerIndex), // route expects int
      user_id: $scope.userData._id
    };
    questionSvc.answerQ(answerObj)
    .then(
      function(response) {
        $scope.closeQModal(questionId);
        $scope.updateQuestionData();
      }
    );
  };
});

repApp.directive('questionFeed', function() {
  return {
    templateUrl: 'app/directives/qFeed/qFeedTmpl.html',
    controller: 'qFeedCtrl',
    scope: {
      qData: '=',
      userData: '=',
      isRep: '='
    }
  };
});

repApp.controller('repSelectCtrl', function($scope, repSvc) {
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );
});

repApp.directive('repSelect', function() {
  return {
    templateUrl: 'app/directives/repSelect/repSelectTmpl.html',
    controller: 'repSelectCtrl',
    restrict: 'E',
    scope: {
      repInfo: '='
    }
  };
});

repApp.controller('loginCtrl', function($scope, $state, repSvc, authSvc) {
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );

  $scope.loginUser = function(userObj) {
    authSvc.loginUser(userObj)
    .then(
      function(response) {
        console.log('User logged in, loginCtrl');
      },
      function(err) {
        console.log(err);
      }
    );
  };

});

repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc, authSvc, currUser, repData, repQuestions) {

  $scope.currUserData = currUser; // data about current user
  $scope.repData = repData; // data about current page's rep
  $scope.repQs = repQuestions; // all questions for current page's rep

  $scope.filterOptions = [
    {label: 'Active', value: 'active', defaultOption: true},
    {label: 'Completed', value: 'completed'}
  ];

});

repApp.controller('settingsCtrl', function($scope, authSvc) {
  $scope.test = 'settingsCtrl connect';
  $scope.logout = function() {
    authSvc.logout()
    .then(
      function(response) {
        console.log('user logged out!');
        // $scope.updateCurrUserData();
      }
    );
  };
});

repApp.controller('signupCtrl', function($scope, districtSvc, authSvc) {

  // custom options for dual-toggle directive
  $scope.roleOptions = [
    {
      label: 'Representative',
      value: 'rep',
      defaultOption: true
    },
    {
      label: 'Voter',
      value: 'voter'
    }
  ];

  $scope.newUserObj = {}; // declare now to enable $watch

  // when newUserObj is updated
  $scope.$watchCollection('newUserObj', function() {
    // if it has an addressData prop
    if ($scope.newUserObj.hasOwnProperty('addressData')) {
      // get district for new user based on lat/lon
      var lat = $scope.newUserObj.addressData.lat;
      var lng = $scope.newUserObj.addressData.lng;

      // pull district data
      districtSvc.getDistrictByLatLon(lat, lng)
      .then(
        function(response) {
          $scope.newUserObj.district = response;
          $scope.addressSelected = true;
        }
      );
    }
  });

  $scope.register = function(newUserObj, repInfo) {

    if (newUserObj.role === 'rep') {
      newUserObj.bioguide_id = repInfo.bioguide_id;
      newUserObj.rep_id = repInfo._id;
    }

    authSvc.registerNewUser(newUserObj)
    .then(
      function(response) {
        console.log('User reg success, from signupCtrl');
      },
      function(err) {
        console.log(err);
      }
    );
  };

}); // END

repApp.controller('voterCtrl', function($scope, constants, voterData, voterQs) {

  // make injected data about authed user available on $scope
  $scope.voterData = voterData;
  $scope.voterQs = voterQs;

});
