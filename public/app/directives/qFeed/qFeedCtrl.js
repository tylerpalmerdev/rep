repApp.controller('qFeedCtrl', function($scope, questionSvc, util, qFeedSvc) {

  // this will be used to open/close modals for each question box.
  $scope.modalShowObj = {};

  $scope.showQModal = function(qId) {
    $scope.modalShowObj[qId] = true;
  };

  $scope.closeQModal = function(qId) {
    $scope.modalShowObj[qId] = false;
    $scope.optionChosenIndex = "";
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
