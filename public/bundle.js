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
    controller: 'loginCtrl',
    resolve: {
      userNotLoggedIn: function(authSvc) {
        return authSvc.userNotLoggedIn();
      }
    }
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'app/routes/signup/signupTmpl.html',
    controller: 'signupCtrl',
    resolve: {
      userNotLoggedIn: function(authSvc) {
        return authSvc.userNotLoggedIn();
      }
    }
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

repApp.filter("feedSort", function() {
  return function(rawFeedElems, filterBy) { // active/ completed
    var sortedFeed = [],
        toVote = [],
        voted = [];

    var sortAsc = function(a, b) {
      return new Date(a.complete_at).getTime() - new Date(b.complete_at).getTime();
    };

    var sortDesc = function(a, b) {
      return new Date(b.complete_at).getTime() - new Date(a.complete_at).getTime();
    };

    rawFeedElems.forEach(function(elem, i, arr) {
      var elemEndDate = +new Date(elem.complete_at);
      var now = Date.now();
      if (filterBy === 'active' && elemEndDate > now) {
        if (elem.answered) { // if user answered question
          voted.push(elem); // add to voted array
        } else { // if user did not vote yet
          toVote.push(elem); // at to toVote arr
        }
      } else if (filterBy === 'completed' && elemEndDate < now) {
        sortedFeed.push(elem);
      }
    });

    if (filterBy === 'active') {
      toVote.sort(sortAsc);
      voted.sort(sortAsc);
      sortedFeed = toVote.concat(voted);
    } else if (filterBy === 'completed') {
      sortedFeed.sort(sortDesc);
    }

    return sortedFeed;

  };
});

repApp.service('qFeedSvc', function() {
  // function to hide "rep who asked" info when rep is looking at their own Qs
  this.userIsRepWhoAsked = function(currUserObj, idOfRepWhoAsked) {
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

  this.isInPast = function(questionObj) {
    var endDateMs = +new Date(questionObj.complete_at);
    if (endDateMs < Date.now()) {
      return true;
    } else {
      return false;
    }
  };

  // used to hide/ show answer form and answer question button on card
  this.qIsAnswerable = function(isRep, questionObj) {
    if (!isRep && !questionObj.answered && !this.isInPast(questionObj)) {
      return true;
    } else {
      return false;
    }
  };

  // if neither of above is true, only show info about question (button & box)
  this.showInfoOnly = function(isRep, questionObj) {
    if (!this.qIsAnswerable(isRep, questionObj) && !this.isInPast(questionObj)) {
      return true;
    } else {
      return false;
    }
  };

  this.userAnsweredQ = function(isRep, questionObj) {
    if (isRep || !questionObj.answered) {
      return false;
    } else if (questionObj.answered) {
      return true;
    } else { // account for other scenarios
      return false;
    }
  };

  // to show "you did not submit an answer" text
  this.userDidNotAnswer = function(isRep, questionObj) {
    if (isRep || questionObj.answered || !this.isInPast(questionObj)) {
      return false;
    } else if (!questionObj.answered) {
      return true;
    }
  };

  this.getTimeRemaining = function(questionObj) {
    var timeLeftMs = +new Date(questionObj.complete_at) - Date.now();
    var msInDay = 24 * 60 * 60 * 1000;
    var msInHour = msInDay / 24;
    var msInMinute = msInHour / 60;

    var days = Math.floor(timeLeftMs / msInDay);
    var hours = Math.floor((timeLeftMs - (days * msInDay)) / msInHour);
    var minutes = Math.floor((timeLeftMs - (days * msInDay) - (hours * msInHour)) / msInMinute);

    var timeLeftStr;

    if (days > 0) {
      if (hours === 0) {
        timeLeftStr = days + ' days';
      } else {
        timeLeftStr = days + ' days, ' + hours + ' hours';
      }
    } else {
      if (hours === 0) {
        timeLeftStr = minutes + ' min';
      } else {
        timeLeftStr = hours + ' hours, ' + minutes + ' min';
      }
    }
    return timeLeftStr;
  };

  this.chosenAnswerMatch = function(isRep, option, questionObj) {
    if (isRep || !questionObj.options[questionObj.answer_chosen]) {
      return false;
    } else if (option.text === questionObj.options[questionObj.answer_chosen].text) {
      return true;
    } else {
      return false;
    }
  };

  // why doesn't this work?
  // check to see if user answered question, used when they are on rep page
  this.userHasAnsweredQ = function(userData, qId) {
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

repApp.service('util', function(constants) {
  this.getPhotoUrl = function(bioguideId) {
    return constants.repPhotosBaseUrl + bioguideId + ".jpg";
  };

  this.qFeedFilterOptions = [
    {label: 'Active', value: 'active', selected: true},
    {label: 'Completed', value: 'completed'}
  ];

  this.newQFormOptions = [
    {label: 'Yes/No', value: 'yn', selected: true}, // sets default
    {label: 'Multiple Choice', value: 'mc'}
  ];

  this.signupRoleOptions = [
    {
      label: 'Representative',
      value: 'rep',
      selected: true
    },
    {
      label: 'Voter',
      value: 'voter'
    }
  ];
});

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
  $scope.select = function(boxIndex) {
    $scope.selected = $scope.options[boxIndex].value;
    if (boxIndex === 0) {
      $scope.options[0].selected = true;
      $scope.options[1].selected = false;
    } else if (boxIndex === 1) {
      $scope.options[0].selected = false;
      $scope.options[1].selected = true;
    }
  };

  // checks/applies optional 'defaultOption' property on option objects.
  $scope.options.forEach(function(elem, i, arr) {
    if (elem.selected) {
      $scope.selected = elem.value;
    }
  });
});

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

repApp.controller('navbarCtrl', function($scope, $state, $stateParams, authSvc, questionSvc, constants, util) {

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

  $scope.qTypes = util.newQFormOptions;

  $scope.openQForm = function() {
    $scope.newQForm = true;
  };

  $scope.clearQForm = function() {
    $scope.newQObj = {options: [], kind: 'yn'};
    $scope.qTypes[0].selected = true;
    $scope.qTypes[1].selected = false;
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

  $scope.getRepImgUrl = util.getPhotoUrl;
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

repApp.controller('qFeedCtrl', function($scope, questionSvc, util, qFeedSvc) {

  // this will be used to open/close modals for each question box.
  $scope.modalShowObj = {};

  $scope.filterOptions = util.qFeedFilterOptions;

  $scope.showQModal = function(qId) {
    $scope.modalShowObj[qId] = true;
  };

  $scope.closeQModal = function(questionObj) {
    $scope.modalShowObj[questionObj._id] = false;
    questionObj.optionChosenIndex = null;
  };

  $scope.getRepImgUrl = util.getPhotoUrl;

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

  $scope.userIsRepWhoAsked = qFeedSvc.userIsRepWhoAsked;
  $scope.isInPast = qFeedSvc.isInPast;
  $scope.qIsAnswerable = qFeedSvc.qIsAnswerable;
  $scope.showInfoOnly = qFeedSvc.showInfoOnly;
  $scope.userAnsweredQ = qFeedSvc.userAnsweredQ;
  $scope.userDidNotAnswer = qFeedSvc.userDidNotAnswer;
  $scope.getTimeRemaining = qFeedSvc.getTimeRemaining;
  $scope.chosenAnswerMatch = qFeedSvc.chosenAnswerMatch;

  // only for voters
  $scope.answerQuestion = function(userId, questionObj) {
    var answerObj = {
      question_id: questionObj._id,
      answer_chosen: parseInt(questionObj.optionChosenIndex), // route expects int
      user_id: userId
    };
    questionSvc.answerQ(answerObj)
    .then(
      function(response) {
        $scope.closeQModal(questionObj);
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

repApp.directive('repContactBar', function() {
  return {
    templateUrl: 'app/directives/repContactBar/repContactBarTmpl.html',
    controller: 'repContactBarCtrl',
    restrict: 'E',
    scope: {
      repData: '='
    }
  };
});

repApp.controller('repContactBarCtrl', function($scope) {

  $scope.showEmailModal = false;
  $scope.showPhoneModal = false;
  $scope.showAddressModal = false;

  $scope.showContactModal = function(modalVar) {
    $scope[modalVar] = true;
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

repApp.controller('resultsChartCtrl', function($scope) {
  $scope.test = 'RESULTS CTRL CONNECT';
});

repApp.directive('resultsChart', function() {
  return {
    templateUrl: 'app/directives/resultsChart/resultsChartTmpl.html',
    restrict: 'E',
    scope: {
      questionData: '='
    },
    replace: false,
    link: function(scope, element, attrs) {
      var chart = d3.select(element[0]);

      chart.append("div")
      .attr("class", "chart")
      .selectAll("div")
      .data(scope.questionData.options.sort(function(a, b) {
        return b.votes - a.votes;
      }))
      .enter()
      .append("div")
      .transition().ease("elastic")
      .style("width", function (d) {
        return d.votes + 'px';
      })
      .text(function(d) {
        return d.votes + " votes";
      });
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

repApp.controller('signupCtrl', function($scope, districtSvc, authSvc, util) {

  // custom options for dual-toggle directive
  $scope.roleOptions = util.signupRoleOptions;

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

repApp.controller('voterCtrl', function($scope, constants, voterData, voterQs, util) {

  // make injected data about authed user available on $scope
  $scope.voterData = voterData;
  $scope.voterQs = voterQs;

});
