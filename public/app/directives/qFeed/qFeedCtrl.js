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
