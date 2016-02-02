var repApp = angular.module('repApp', ['ui.router', 'ngAnimate']);

repApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('rep', {
    url: '/rep',
    templateUrl: 'app/routes/rep/repTmpl.html',
    controller: 'repCtrl'
  })
  .state('voter', {
    url: '/voter',
    templateUrl: 'app/routes/voter/voterTmpl.html',
    controller: 'voterCtrl'
  });

  $urlRouterProvider
  .otherwise('/voter');
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
  this.getRepInfo = function(repId) {
    // GET /reps/:repId
    var repInfo = {
      name: 'Barbara Boxer',
      title: 'Senator',
      state: 'CA',
      district: 6,
      state_name: 'California',
      year_elected: '1992',
      address: '123 Capitol Hill, Washington, DC, 12345',
      website: 'barbara-boxer.senate.gov',
      official_email: 'barbara@senate.gov',
      registered: true,
      phone: '202-123-5435',
      rep_id: 'ik8jhasi98h',
      bioguide_id: 'B000711',
      photo_url: "https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/B000711.jpg"
    };

    return repInfo;
  };
});

repApp.controller('navbarCtrl', function($scope) {
  $scope.test = 'NAVBAR CTRL CONNECT';
  $scope.auth = {
    auth: true,
    role: 'rep'
  };
});

repApp.directive('navBar', function() {
  return {
    templateUrl: 'app/directives/navbar/navbarTmpl.html',
    controller: 'navbarCtrl',
    restrict: 'E'
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

repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc) {
  $scope.test = 'REP CTLR CONNECT';
  $scope.newQ = true;
  $scope.newQObj = {
    options: []
  };
  $scope.repData = repSvc.getRepInfo('12ubasdg');
  districtSvc.getDistrictByLatLon($scope);

  $scope.qFilter = 'active';
  $scope.changeQFilter = function(filterBy) {
    $scope.qFilter = filterBy;
  };

  $scope.repQs = questionSvc.getQsForRep('aoku78asd');

});

repApp.controller('voterCtrl', function($scope) {
  $scope.test = 'VOTER CTRL CONNECT';
});
