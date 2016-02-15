repApp.controller('repCtrl', function($scope, $stateParams, repSvc, districtSvc, questionSvc, authSvc, currUser, repData, repQuestions, qFeedSvc) {

  $scope.currUserData = currUser; // data about current user
  $scope.repData = repData; // data about current page's rep
  $scope.repQs = repQuestions; // all questions for current page's rep
  $scope.userIsRepOnOwnPage = function() {
    return qFeedSvc.userIsRepWhoAsked($scope.currUserData, $stateParams.repId);
  };

});
