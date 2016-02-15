var repApp = angular.module('repApp', ['ui.router', 'ngAnimate', 'angucomplete-alt']);

// add this to run block to fix scroll to top error when changing stateParams
repApp.run(function($rootScope) {
  $rootScope.$on('$stateChangeSuccess', function() {
   document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
});

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

repApp.service('authSvc', function($http, $state, $stateParams, $q, questionSvc) {

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

  // if voter and voter answered q, return true
  this.userAnsweredQ = function(userData, questionObj) {
    if (!userData.role || userData.role === 'rep') {
      return false;
    } else if (questionObj.answered) {
      return true;
    } else { // account for other scenarios
      return false;
    }
  };

  // to show "you did not submit an answer" text
  this.userDidNotAnswer = function(userData, questionObj) {

    if (!userData.role || userData.role === 'rep' || questionObj.answered || !this.isInPast(questionObj)) {
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

  // compares userData and questionArr, adds answered data to question arr
  this.getUsersAnsweredQs = function(currUserObj, questionArr) {
    if (currUserObj.role && currUserObj.role === 'voter') {
      currUserObj.questions_answered.forEach(function(elem, i, arr) {
        questionArr.forEach(function(qElem, qI, qArr) {
          if (qElem._id === elem.question_id) {
            qElem.answered = true;
            qElem.answer_chosen = elem.answer_chosen;
          }
        });
      });
    }
    return questionArr;
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

repApp.service('repSvc', function($http, $q,  constants) {

  // only need to access inside the service, will return via public methods
  var allReps = "";

  // get all rep info from own db
  this.getAllReps = function() {
    var def = $q.defer();
    if(allReps) {
      def.resolve(allReps);
    } else {
      $http({
        method: 'GET',
        url: '/reps'
      })
      .then(
        function(response) {
          allReps = response.data;
          def.resolve(allReps);
        },
        function(err) {
          def.reject(err);
        }
      );
    }
    return def.promise;
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

  // revert to default when coming back to view
  $scope.select(0);
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

repApp.controller('qFeedCtrl', function($scope, questionSvc, util, qFeedSvc, $interval) {

  // update $scope.q-data to contain questions answered by user
  $scope.qData = qFeedSvc.getUsersAnsweredQs($scope.userData, $scope.qData);

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
        $scope.qData = qFeedSvc.getUsersAnsweredQs($scope.userData, response);
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

/*
 * angucomplete-alt
 * Autocomplete directive for AngularJS
 * This is a fork of Daryl Rowland's angucomplete with some extra features.
 * By Hidenari Nozaki
 */

/*! Copyright (c) 2014 Hidenari Nozaki and contributors | Licensed under the MIT license */

(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = factory(require('angular'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['angular'], factory);
  } else {
    // Global Variables
    factory(root.angular);
  }
}(window, function (angular) {
  'use strict';

  angular.module('angucomplete-alt', []).directive('angucompleteAlt', ['$q', '$parse', '$http', '$sce', '$timeout', '$templateCache', '$interpolate', function ($q, $parse, $http, $sce, $timeout, $templateCache, $interpolate) {
    // keyboard events
    var KEY_DW  = 40;
    var KEY_RT  = 39;
    var KEY_UP  = 38;
    var KEY_LF  = 37;
    var KEY_ES  = 27;
    var KEY_EN  = 13;
    var KEY_TAB =  9;

    var MIN_LENGTH = 3;
    var MAX_LENGTH = 524288;  // the default max length per the html maxlength attribute
    var PAUSE = 500;
    var BLUR_TIMEOUT = 200;

    // string constants
    var REQUIRED_CLASS = 'autocomplete-required';
    var TEXT_SEARCHING = 'Searching...';
    var TEXT_NORESULTS = 'No results found';
    var TEMPLATE_URL = '/angucomplete-alt/index.html';

    // Set the default template for this directive
    $templateCache.put(TEMPLATE_URL,
        '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' +
        '  <input id="{{id}}_value" name="{{inputName}}" tabindex="{{fieldTabindex}}" ng-class="{\'angucomplete-input-not-empty\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' +
        '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' +
        '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' +
        '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ng-bind="textNoResults"></div>' +
        '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' +
        '      <div ng-if="imageField" class="angucomplete-image-holder">' +
        '        <img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/>' +
        '        <div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div>' +
        '      </div>' +
        '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' +
        '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' +
        '      <div ng-if="matchClass && result.description && result.description != \'\'" class="angucomplete-description" ng-bind-html="result.description"></div>' +
        '      <div ng-if="!matchClass && result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );

    function link(scope, elem, attrs, ctrl) {
      var inputField = elem.find('input');
      var minlength = MIN_LENGTH;
      var searchTimer = null;
      var hideTimer;
      var requiredClassName = REQUIRED_CLASS;
      var responseFormatter;
      var validState = null;
      var httpCanceller = null;
      var dd = elem[0].querySelector('.angucomplete-dropdown');
      var isScrollOn = false;
      var mousedownOn = null;
      var unbindInitialValue;
      var displaySearching;
      var displayNoResults;

      elem.on('mousedown', function(event) {
        if (event.target.id) {
          mousedownOn = event.target.id;
          if (mousedownOn === scope.id + '_dropdown') {
            document.body.addEventListener('click', clickoutHandlerForDropdown);
          }
        }
        else {
          mousedownOn = event.target.className;
        }
      });

      scope.currentIndex = scope.focusFirst ? 0 : null;
      scope.searching = false;
      unbindInitialValue = scope.$watch('initialValue', function(newval) {
        if (newval) {
          // remove scope listener
          unbindInitialValue();
          // change input
          handleInputChange(newval, true);
        }
      });

      scope.$watch('fieldRequired', function(newval, oldval) {
        if (newval !== oldval) {
          if (!newval) {
            ctrl[scope.inputName].$setValidity(requiredClassName, true);
          }
          else if (!validState || scope.currentIndex === -1) {
            handleRequired(false);
          }
          else {
            handleRequired(true);
          }
        }
      });

      scope.$on('angucomplete-alt:clearInput', function (event, elementId) {
        if (!elementId || elementId === scope.id) {
          scope.searchStr = null;
          callOrAssign();
          handleRequired(false);
          clearResults();
        }
      });

      scope.$on('angucomplete-alt:changeInput', function (event, elementId, newval) {
        if (!!elementId && elementId === scope.id) {
          handleInputChange(newval);
        }
      });

      function handleInputChange(newval, initial) {
        if (newval) {
          if (typeof newval === 'object') {
            scope.searchStr = extractTitle(newval);
            callOrAssign({originalObject: newval});
          } else if (typeof newval === 'string' && newval.length > 0) {
            scope.searchStr = newval;
          } else {
            if (console && console.error) {
              console.error('Tried to set ' + (!!initial ? 'initial' : '') + ' value of angucomplete to', newval, 'which is an invalid value');
            }
          }

          handleRequired(true);
        }
      }

      // #194 dropdown list not consistent in collapsing (bug).
      function clickoutHandlerForDropdown(event) {
        mousedownOn = null;
        scope.hideResults(event);
        document.body.removeEventListener('click', clickoutHandlerForDropdown);
      }

      // for IE8 quirkiness about event.which
      function ie8EventNormalizer(event) {
        return event.which ? event.which : event.keyCode;
      }

      function callOrAssign(value) {
        if (typeof scope.selectedObject === 'function') {
          scope.selectedObject(value);
        }
        else {
          scope.selectedObject = value;
        }

        if (value) {
          handleRequired(true);
        }
        else {
          handleRequired(false);
        }
      }

      function callFunctionOrIdentity(fn) {
        return function(data) {
          return scope[fn] ? scope[fn](data) : data;
        };
      }

      function setInputString(str) {
        callOrAssign({originalObject: str});

        if (scope.clearSelected) {
          scope.searchStr = null;
        }
        clearResults();
      }

      function extractTitle(data) {
        // split title fields and run extractValue for each and join with ' '
        return scope.titleField.split(',')
          .map(function(field) {
            return extractValue(data, field);
          })
          .join(' ');
      }

      function extractValue(obj, key) {
        var keys, result;
        if (key) {
          keys= key.split('.');
          result = obj;
          for (var i = 0; i < keys.length; i++) {
            result = result[keys[i]];
          }
        }
        else {
          result = obj;
        }
        return result;
      }

      function findMatchString(target, str) {
        var result, matches, re;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        // Escape user input to be treated as a literal string within a regular expression
        re = new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (!target) { return; }
        if (!target.match || !target.replace) { target = target.toString(); }
        matches = target.match(re);
        if (matches) {
          result = target.replace(re,
              '<span class="'+ scope.matchClass +'">'+ matches[0] +'</span>');
        }
        else {
          result = target;
        }
        return $sce.trustAsHtml(result);
      }

      function handleRequired(valid) {
        scope.notEmpty = valid;
        validState = scope.searchStr;
        if (scope.fieldRequired && ctrl && scope.inputName) {
          ctrl[scope.inputName].$setValidity(requiredClassName, valid);
        }
      }

      function keyupHandler(event) {
        var which = ie8EventNormalizer(event);
        if (which === KEY_LF || which === KEY_RT) {
          // do nothing
          return;
        }

        if (which === KEY_UP || which === KEY_EN) {
          event.preventDefault();
        }
        else if (which === KEY_DW) {
          event.preventDefault();
          if (!scope.showDropdown && scope.searchStr && scope.searchStr.length >= minlength) {
            initResults();
            scope.searching = true;
            searchTimerComplete(scope.searchStr);
          }
        }
        else if (which === KEY_ES) {
          clearResults();
          scope.$apply(function() {
            inputField.val(scope.searchStr);
          });
        }
        else {
          if (minlength === 0 && !scope.searchStr) {
            return;
          }

          if (!scope.searchStr || scope.searchStr === '') {
            scope.showDropdown = false;
          } else if (scope.searchStr.length >= minlength) {
            initResults();

            if (searchTimer) {
              $timeout.cancel(searchTimer);
            }

            scope.searching = true;

            searchTimer = $timeout(function() {
              searchTimerComplete(scope.searchStr);
            }, scope.pause);
          }

          if (validState && validState !== scope.searchStr && !scope.clearSelected) {
            scope.$apply(function() {
              callOrAssign();
            });
          }
        }
      }

      function handleOverrideSuggestions(event) {
        if (scope.overrideSuggestions &&
            !(scope.selectedObject && scope.selectedObject.originalObject === scope.searchStr)) {
          if (event) {
            event.preventDefault();
          }

          // cancel search timer
          $timeout.cancel(searchTimer);
          // cancel http request
          cancelHttpRequest();

          setInputString(scope.searchStr);
        }
      }

      function dropdownRowOffsetHeight(row) {
        var css = getComputedStyle(row);
        return row.offsetHeight +
          parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
      }

      function dropdownHeight() {
        return dd.getBoundingClientRect().top +
          parseInt(getComputedStyle(dd).maxHeight, 10);
      }

      function dropdownRow() {
        return elem[0].querySelectorAll('.angucomplete-row')[scope.currentIndex];
      }

      function dropdownRowTop() {
        return dropdownRow().getBoundingClientRect().top -
          (dd.getBoundingClientRect().top +
           parseInt(getComputedStyle(dd).paddingTop, 10));
      }

      function dropdownScrollTopTo(offset) {
        dd.scrollTop = dd.scrollTop + offset;
      }

      function updateInputField(){
        var current = scope.results[scope.currentIndex];
        if (scope.matchClass) {
          inputField.val(extractTitle(current.originalObject));
        }
        else {
          inputField.val(current.title);
        }
      }

      function keydownHandler(event) {
        var which = ie8EventNormalizer(event);
        var row = null;
        var rowTop = null;

        if (which === KEY_EN && scope.results) {
          if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
            event.preventDefault();
            scope.selectResult(scope.results[scope.currentIndex]);
          } else {
            handleOverrideSuggestions(event);
            clearResults();
          }
          scope.$apply();
        } else if (which === KEY_DW && scope.results) {
          event.preventDefault();
          if ((scope.currentIndex + 1) < scope.results.length && scope.showDropdown) {
            scope.$apply(function() {
              scope.currentIndex ++;
              updateInputField();
            });

            if (isScrollOn) {
              row = dropdownRow();
              if (dropdownHeight() < row.getBoundingClientRect().bottom) {
                dropdownScrollTopTo(dropdownRowOffsetHeight(row));
              }
            }
          }
        } else if (which === KEY_UP && scope.results) {
          event.preventDefault();
          if (scope.currentIndex >= 1) {
            scope.$apply(function() {
              scope.currentIndex --;
              updateInputField();
            });

            if (isScrollOn) {
              rowTop = dropdownRowTop();
              if (rowTop < 0) {
                dropdownScrollTopTo(rowTop - 1);
              }
            }
          }
          else if (scope.currentIndex === 0) {
            scope.$apply(function() {
              scope.currentIndex = -1;
              inputField.val(scope.searchStr);
            });
          }
        } else if (which === KEY_TAB) {
          if (scope.results && scope.results.length > 0 && scope.showDropdown) {
            if (scope.currentIndex === -1 && scope.overrideSuggestions) {
              // intentionally not sending event so that it does not
              // prevent default tab behavior
              handleOverrideSuggestions();
            }
            else {
              if (scope.currentIndex === -1) {
                scope.currentIndex = 0;
              }
              scope.selectResult(scope.results[scope.currentIndex]);
              scope.$digest();
            }
          }
          else {
            // no results
            // intentionally not sending event so that it does not
            // prevent default tab behavior
            if (scope.searchStr && scope.searchStr.length > 0) {
              handleOverrideSuggestions();
            }
          }
        } else if (which === KEY_ES) {
          // This is very specific to IE10/11 #272
          // without this, IE clears the input text
          event.preventDefault();
        }
      }

      function httpSuccessCallbackGen(str) {
        return function(responseData, status, headers, config) {
          // normalize return obejct from promise
          if (!status && !headers && !config && responseData.data) {
            responseData = responseData.data;
          }
          scope.searching = false;
          processResults(
            extractValue(responseFormatter(responseData), scope.remoteUrlDataField),
            str);
        };
      }

      function httpErrorCallback(errorRes, status, headers, config) {
        // cancelled/aborted
        if (status === 0 || status === -1) { return; }

        // normalize return obejct from promise
        if (!status && !headers && !config) {
          status = errorRes.status;
        }
        if (scope.remoteUrlErrorCallback) {
          scope.remoteUrlErrorCallback(errorRes, status, headers, config);
        }
        else {
          if (console && console.error) {
            console.error('http error');
          }
        }
      }

      function cancelHttpRequest() {
        if (httpCanceller) {
          httpCanceller.resolve();
        }
      }

      function getRemoteResults(str) {
        var params = {},
            url = scope.remoteUrl + encodeURIComponent(str);
        if (scope.remoteUrlRequestFormatter) {
          params = {params: scope.remoteUrlRequestFormatter(str)};
          url = scope.remoteUrl;
        }
        if (!!scope.remoteUrlRequestWithCredentials) {
          params.withCredentials = true;
        }
        cancelHttpRequest();
        httpCanceller = $q.defer();
        params.timeout = httpCanceller.promise;
        $http.get(url, params)
          .success(httpSuccessCallbackGen(str))
          .error(httpErrorCallback);
      }

      function getRemoteResultsWithCustomHandler(str) {
        cancelHttpRequest();

        httpCanceller = $q.defer();

        scope.remoteApiHandler(str, httpCanceller.promise)
          .then(httpSuccessCallbackGen(str))
          .catch(httpErrorCallback);

        /* IE8 compatible
        scope.remoteApiHandler(str, httpCanceller.promise)
          ['then'](httpSuccessCallbackGen(str))
          ['catch'](httpErrorCallback);
        */
      }

      function clearResults() {
        scope.showDropdown = false;
        scope.results = [];
        if (dd) {
          dd.scrollTop = 0;
        }
      }

      function initResults() {
        scope.showDropdown = displaySearching;
        scope.currentIndex = scope.focusFirst ? 0 : -1;
        scope.results = [];
      }

      function getLocalResults(str) {
        var i, match, s, value,
            searchFields = scope.searchFields.split(','),
            matches = [];
        if (typeof scope.parseInput() !== 'undefined') {
          str = scope.parseInput()(str);
        }
        for (i = 0; i < scope.localData.length; i++) {
          match = false;

          for (s = 0; s < searchFields.length; s++) {
            value = extractValue(scope.localData[i], searchFields[s]) || '';
            match = match || (value.toString().toLowerCase().indexOf(str.toString().toLowerCase()) >= 0);
          }

          if (match) {
            matches[matches.length] = scope.localData[i];
          }
        }
        return matches;
      }

      function checkExactMatch(result, obj, str){
        if (!str) { return false; }
        for(var key in obj){
          if(obj[key].toLowerCase() === str.toLowerCase()){
            scope.selectResult(result);
            return true;
          }
        }
        return false;
      }

      function searchTimerComplete(str) {
        // Begin the search
        if (!str || str.length < minlength) {
          return;
        }
        if (scope.localData) {
          scope.$apply(function() {
            var matches;
            if (typeof scope.localSearch() !== 'undefined') {
              matches = scope.localSearch()(str);
            } else {
              matches = getLocalResults(str);
            }
            scope.searching = false;
            processResults(matches, str);
          });
        }
        else if (scope.remoteApiHandler) {
          getRemoteResultsWithCustomHandler(str);
        } else {
          getRemoteResults(str);
        }
      }

      function processResults(responseData, str) {
        var i, description, image, text, formattedText, formattedDesc;

        if (responseData && responseData.length > 0) {
          scope.results = [];

          for (i = 0; i < responseData.length; i++) {
            if (scope.titleField && scope.titleField !== '') {
              text = formattedText = extractTitle(responseData[i]);
            }

            description = '';
            if (scope.descriptionField) {
              description = formattedDesc = extractValue(responseData[i], scope.descriptionField);
            }

            image = '';
            if (scope.imageField) {
              image = extractValue(responseData[i], scope.imageField);
            }

            if (scope.matchClass) {
              formattedText = findMatchString(text, str);
              formattedDesc = findMatchString(description, str);
            }

            scope.results[scope.results.length] = {
              title: formattedText,
              description: formattedDesc,
              image: image,
              originalObject: responseData[i]
            };
          }

        } else {
          scope.results = [];
        }

        if (scope.autoMatch && scope.results.length === 1 &&
            checkExactMatch(scope.results[0],
              {title: text, desc: description || ''}, scope.searchStr)) {
          scope.showDropdown = false;
        } else if (scope.results.length === 0 && !displayNoResults) {
          scope.showDropdown = false;
        } else {
          scope.showDropdown = true;
        }
      }

      function showAll() {
        if (scope.localData) {
          processResults(scope.localData, '');
        }
        else if (scope.remoteApiHandler) {
          getRemoteResultsWithCustomHandler('');
        }
        else {
          getRemoteResults('');
        }
      }

      scope.onFocusHandler = function() {
        if (scope.focusIn) {
          scope.focusIn();
        }
        if (minlength === 0 && (!scope.searchStr || scope.searchStr.length === 0)) {
          scope.currentIndex = scope.focusFirst ? 0 : scope.currentIndex;
          scope.showDropdown = true;
          showAll();
        }
      };

      scope.hideResults = function() {
        if (mousedownOn &&
            (mousedownOn === scope.id + '_dropdown' ||
             mousedownOn.indexOf('angucomplete') >= 0)) {
          mousedownOn = null;
        }
        else {
          hideTimer = $timeout(function() {
            clearResults();
            scope.$apply(function() {
              if (scope.searchStr && scope.searchStr.length > 0) {
                inputField.val(scope.searchStr);
              }
            });
          }, BLUR_TIMEOUT);
          cancelHttpRequest();

          if (scope.focusOut) {
            scope.focusOut();
          }

          if (scope.overrideSuggestions) {
            if (scope.searchStr && scope.searchStr.length > 0 && scope.currentIndex === -1) {
              handleOverrideSuggestions();
            }
          }
        }
      };

      scope.resetHideResults = function() {
        if (hideTimer) {
          $timeout.cancel(hideTimer);
        }
      };

      scope.hoverRow = function(index) {
        scope.currentIndex = index;
      };

      scope.selectResult = function(result) {
        // Restore original values
        if (scope.matchClass) {
          result.title = extractTitle(result.originalObject);
          result.description = extractValue(result.originalObject, scope.descriptionField);
        }

        if (scope.clearSelected) {
          scope.searchStr = null;
        }
        else {
          scope.searchStr = result.title;
        }
        callOrAssign(result);
        clearResults();
      };

      scope.inputChangeHandler = function(str) {
        if (str.length < minlength) {
          cancelHttpRequest();
          clearResults();
        }
        else if (str.length === 0 && minlength === 0) {
          scope.searching = false;
          showAll();
        }

        if (scope.inputChanged) {
          str = scope.inputChanged(str);
        }
        return str;
      };

      // check required
      if (scope.fieldRequiredClass && scope.fieldRequiredClass !== '') {
        requiredClassName = scope.fieldRequiredClass;
      }

      // check min length
      if (scope.minlength && scope.minlength !== '') {
        minlength = parseInt(scope.minlength, 10);
      }

      // check pause time
      if (!scope.pause) {
        scope.pause = PAUSE;
      }

      // check clearSelected
      if (!scope.clearSelected) {
        scope.clearSelected = false;
      }

      // check override suggestions
      if (!scope.overrideSuggestions) {
        scope.overrideSuggestions = false;
      }

      // check required field
      if (scope.fieldRequired && ctrl) {
        // check initial value, if given, set validitity to true
        if (scope.initialValue) {
          handleRequired(true);
        }
        else {
          handleRequired(false);
        }
      }

      scope.inputType = attrs.type ? attrs.type : 'text';

      // set strings for "Searching..." and "No results"
      scope.textSearching = attrs.textSearching ? attrs.textSearching : TEXT_SEARCHING;
      scope.textNoResults = attrs.textNoResults ? attrs.textNoResults : TEXT_NORESULTS;
      displaySearching = scope.textSearching === 'false' ? false : true;
      displayNoResults = scope.textNoResults === 'false' ? false : true;

      // set max length (default to maxlength deault from html
      scope.maxlength = attrs.maxlength ? attrs.maxlength : MAX_LENGTH;

      // register events
      inputField.on('keydown', keydownHandler);
      inputField.on('keyup', keyupHandler);

      // set response formatter
      responseFormatter = callFunctionOrIdentity('remoteUrlResponseFormatter');

      // set isScrollOn
      $timeout(function() {
        var css = getComputedStyle(dd);
        isScrollOn = css.maxHeight && css.overflowY === 'auto';
      });
    }

    return {
      restrict: 'EA',
      require: '^?form',
      scope: {
        selectedObject: '=',
        disableInput: '=',
        initialValue: '=',
        localData: '=',
        localSearch: '&',
        remoteUrlRequestFormatter: '=',
        remoteUrlRequestWithCredentials: '@',
        remoteUrlResponseFormatter: '=',
        remoteUrlErrorCallback: '=',
        remoteApiHandler: '=',
        id: '@',
        type: '@',
        placeholder: '@',
        remoteUrl: '@',
        remoteUrlDataField: '@',
        titleField: '@',
        descriptionField: '@',
        imageField: '@',
        inputClass: '@',
        pause: '@',
        searchFields: '@',
        minlength: '@',
        matchClass: '@',
        clearSelected: '@',
        overrideSuggestions: '@',
        fieldRequired: '=',
        fieldRequiredClass: '@',
        inputChanged: '=',
        autoMatch: '@',
        focusOut: '&',
        focusIn: '&',
        fieldTabindex: '@',
        inputName: '@',
        focusFirst: '@',
        parseInput: '&'
      },
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || TEMPLATE_URL;
      },
      compile: function(tElement) {
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        if (!(startSym === '{{' && endSym === '}}')) {
          var interpolatedHtml = tElement.html()
            .replace(/\{\{/g, startSym)
            .replace(/\}\}/g, endSym);
          tElement.html(interpolatedHtml);
        }
        return link;
      }
    };
  }]);

}));

repApp.controller('repSelectCtrl', function($scope, $state, repSvc) {
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );

  $scope.repSelected = function($item) {
    if ($state.current.name === 'signup') {
      $scope.repInfo = $item.originalObject;
    } else {
      $state.go('rep', {repId: $item.originalObject._id});
    }
  };
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

repApp.directive('resultsChart', function() {
  return {
    templateUrl: 'app/directives/resultsChart/resultsChartTmpl.html',
    restrict: 'E',
    scope: {
      questionData: '=' // [{votes: 70, text: 'blhkh'}]
    },
    replace: false,
    link: function(scope, element, attrs) {
      var chart = d3.select(element[0]),
          options = scope.questionData.options,
          totalVotes = 0,
          highestVal = 0,
          lowestVal = 0,
          answerChosen;

      // get total votes for %s and highest/lowest vote counts
      options.forEach(function(elem, i, arr) {
        totalVotes += elem.votes;
        if (elem.votes > highestVal) {
          highestVal = elem.votes;
        }

        if(!lowestVal) {
          lowestVal = elem.votes;
        } else if (elem.votes < lowestVal) {
          lowestVal = elem.votes;
        }
      });

      // see if an answer has been chosen by user; assign if so
      if (scope.questionData.answered) {
        answerChosen = scope.questionData.options[scope.questionData.answer_chosen];
      }

      // create chart div to hold all the things
      var chartDiv = chart.append("div")
      .attr("class", "chart")
      .selectAll("div")
      .data(options.sort(function(a, b) {
        return b.votes - a.votes;
      }))
      .enter()
      .append("div")
      .attr("class", "option-wrapper")
      .style("width","100%");

      // add div to contain text for each option & add option text
      chartDiv.append("div")
      .attr("class", function(d, i) {
        if (!answerChosen) {
          return "option-text";
        } else {
          if (d.text === answerChosen.text) {
            return "option-text answer-chosen";
          } else {
            return "option-text";
          }
        }
      })
      .text(function(d){
        return d.text;
      });

      // add bars for each option, width/color based on # votes
      chartDiv.append("div")
      .attr("class", "chart-bar")
      .transition().ease("elastic")
      .style("background-color", function(d) {
        var maxRgb = 230,
            minRgb = 75,
            valRange = (highestVal - lowestVal),
            basePct = 1 - ((highestVal - d.votes) / valRange),
            baseRgb = maxRgb * basePct,
            colorVal = baseRgb + (1 - basePct) * minRgb;

        return "rgb(0, " + colorVal + ", 150)";
      })
      .style("width", function (d) {
        if (d.votes === 0) {
          return '1px';
        } else {
          var pctOfHighest = ((d.votes / highestVal) * 100);
          return pctOfHighest+ '%';
        }
      });

      // adds child div to each bar div to hold text + add text
      chartDiv.selectAll("div.chart-bar")
      .append("div")
      .attr("class", "bar-text-wrapper")
      .text(function(d) {
        if (d.votes === 0) {
          return "0% (0 votes)";
        }
        var pct = ((d.votes / totalVotes) * 100).toFixed(1);
        return pct + "% (" + d.votes.toLocaleString() + " votes)";
      });

      // adds total votes div to bottom of chart div
      d3.select(".chart")
      .append("div")
      .attr("class", "response-count-wrapper")
      .text(totalVotes.toLocaleString() + " total votes");

    }
  };
});

repApp.controller('loginCtrl', function($scope, $state, repSvc, authSvc) {

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

repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc, authSvc, currUser, repData, repQuestions, qFeedSvc) {

  $scope.currUserData = currUser; // data about current user
  $scope.repData = repData; // data about current page's rep
  $scope.repQs = repQuestions; // all questions for current page's rep
  $scope.userIsRepOnOwnPage = function() {
    return qFeedSvc.userIsRepWhoAsked($scope.currUserData, $stateParams.repId);
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
