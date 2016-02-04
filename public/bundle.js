var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep/:repId',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl'
  })
  .state('newq', {
    url: '/newq/:repId',
    templateUrl: 'app/routes/newQ/newQTmpl.html',
    controller: 'newQCtrl'
  })
  .state('voter', {
    url: '/voter/:voterId',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl'
  })
  .state('myreps', {
    url: '/myreps/:voterId',
    templateUrl: 'app/routes/myreps/myrepsTmpl.html',
    controller: 'myrepsCtrl'
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

repApp.service('questionSvc', function() {
  var dummyQs = [
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'completed',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'completed',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'completed',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    }
  ];

  this.getQsForRep = function(repId) {
    // GET /questions?repId=repId;
    return dummyQs;
  };

  this.postNewQ = function(repId, qObj) {
    // POST /questions
    // body: qObj , qObj.repId = repId, qObj.submit_stamp = now, qObj.end_stamp = now + 3 days (or do on server?)
  }
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
  this.getRepInfo = function(repId) { // uses bioguide_id

    return $http({
      method: 'GET',
      url: '/reps/' + repId
    })
    .then(
      function(response) {
        var data = response.data[0];
        data.photo_url = constants.repPhotosBaseUrl + repId + ".jpg";
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
    console.log(rawPlaceData);

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

repApp.controller('navbarCtrl', function($scope, $state) {
  $scope.test = 'NAVBAR CTRL CONNECT';
  $scope.currState = $state.current.name;
  if($scope.currState === 'rep') {
    $scope.repState = true;
  } else if ($scope.currState === 'newq') {
    $scope.newqState = true;
  }
});

repApp.directive('navBar', function() {
  return {
    templateUrl: 'app/directives/navbar/navbarTmpl.html',
    controller: 'navbarCtrl',
    restrict: 'E',
    scope: {
      currAuth: '='
    }
  };
});

repApp.controller('qBoxCtrl', function($scope) {

});

repApp.directive('qBox', function() {
  return {
    templateUrl: 'app/directives/qBox/qBoxTmpl.html',
    controller: 'qBoxCtrl',
    scope: {
      qInfo: '=',
      rep: '@'
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
      repId: '='
    }
  };
});

repApp.controller('loginCtrl', function($scope, $state, repSvc) {
  $scope.test = 'Login CTRL connect';
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );
});

repApp.controller('myrepsCtrl', function($scope) {
  
});

repApp.controller('newQCtrl', function($scope, $stateParams) {
  $scope.currAuth = {
    auth: true,
    role: 'rep',
    repId: $stateParams.repId
  };

  // declare now so options can be added to array
  $scope.newQObj = {
    options: []
  };

  $scope.qTypes = [
    {
      label: 'Yes/No',
      value: 'yn'
    },
    {
      label: 'Multiple Choice',
      value: 'mc'
    }
  ];
});

repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc) {

  $scope.currAuth = {
    auth: true,
    role: 'rep',
    repId: $stateParams.repId
  };

  $scope.newQObj = {
    options: []
  };

  $scope.filterOptions = [
    {
      label: 'Active',
      value: 'active',
      defaultOption: true
    },
    {
      label: 'Completed',
      value: 'completed'
    }
  ];

  $scope.repQs = questionSvc.getQsForRep('aoku78asd');

  $scope.isSen = true;
  repSvc.getRepInfo($stateParams.repId)
  .then(
    function(response) {
      $scope.repData = response;
      if($scope.repData.title === 'Sen') {
        $scope.repTitle = 'Senator';
        $scope.isSen = true;
      } else if ($scope.repData.title === 'Rep') {
        $scope.repTitle = 'Representative';
        $scope.isSen = false;
      } else {
        $scope.repTitle = $scope.repData.title + '.';
      }
    }
  );

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

      districtSvc.getDistrictByLatLon(lat, lng)
      .then(
        function(response) {
          $scope.newUserObj.district = response;
          $scope.addressSelected = true;
        }
      );
    }
  });

  $scope.register = function(newUserObj) {
    authSvc.registerNewUser(newUserObj)
    .then(
      function(response) {
        console.log(response);
      },
      function(err) {
        console.log(err);
      }
    );
  };

}); // END

repApp.controller('voterCtrl', function($scope, repSvc) {
  $scope.test = 'voter ctrl connect';
});
