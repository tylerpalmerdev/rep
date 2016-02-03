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
    url: '/voter',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl'
  })
  .state('voterfeed', {
    parent: 'voter',
    url: '/voterfeed',
    templateUrl: 'app/routes/voter/voterfeed/voterfeedTmpl.html',
    controller: 'voterfeedTmpl'
  })
  .state('myreps', {
    parent: 'voter',
    url: '/myreps',
    templateUrl: 'app/routes/voter/myreps/myrepsTmpl.html',
    controller: 'myrepsCtrl'
  })
  .state('land', {
    url: '/',
    templateUrl: 'app/routes/land/landTmpl.html',
    controller: 'landCtrl'
  });


  $urlRouterProvider
  .otherwise('/');
});

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

repApp.service('repSvc', function($http) {
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

  this.getRepInfo = function(repId) { // uses bioguide_id
    // GET /reps/:repId
    return $http({
      method: 'GET',
      url: '/reps/' + repId
    })
    .then(
      function(response) {
        var data = response.data[0];
        data.photo_url = "https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/" + repId + ".jpg";
        return data;
      }
    );
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

repApp.controller('landCtrl', function($scope, $state, repSvc) {
  $scope.test = 'Land CTRL connect';
  repSvc.getAllReps()
  .then(
    function(response) {
      $scope.repData = response;
    }
  );
});

repApp.controller('newQCtrl', function($scope, $stateParams) {
  $scope.currAuth = {
    auth: true,
    role: 'rep',
    repId: $stateParams.repId
  };
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

  $scope.qFilter = 'active';
  $scope.changeQFilter = function(filterBy) {
    $scope.qFilter = filterBy;
  };

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

repApp.controller('voterCtrl', function($scope, repSvc) {
  $scope.test = 'voter ctrl connect';
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

repApp.controller('myrepsCtrl', function($scope) {
  
});
