repApp.controller('qFeedCtrl', function($scope, questionSvc, util, qFeedSvc, $interval, socketSvc, $element, $stateParams) {

  var socket = socketSvc.getSocket();

  socket.on('questionAnswered', function(data) {
    console.log("question just answered!", data);

    // if (question in questionData) > update that question
    // $scope.$apply();
  });

  socket.on('newQuestion', function(data) {
    // console.log("new question submitted!", data);
    var submittedBy = data.submitted_by.rep_id;
    // if new question was submitted by current rep, or if question was asked by a voter's rep:
    var checkIfRep = function(userData, repId) {
      var isRep = false;
      if (!$scope.userData.role || $scope.userData.role === 'rep') {
        return isRep;
      } else {
        userData.reps.forEach(function(elem, i, arr) {
          if (elem._id === repId) {
            console.log("new q from rep!");
            isRep = true;
          }
        });
      }
      return isRep;
    };

    var repCheck = checkIfRep($scope.userData, submittedBy);

    if (repCheck || (submittedBy === $stateParams.repId)) {
      $scope.qData.push(data);
      $scope.getFinalQData($scope.qData);
      $scope.$apply(function() {
        console.log("Q feed updated!");
      });
    }
  });

  // $element.on('$destroy', function() {
  //   socket.off('questionAnswered');
  //   socket.off('newQuestion');
  // });


  // update $scope.q-data to contain questions answered by user
  $scope.getFinalQData = function(rawQData) {
    $scope.qData = qFeedSvc.getUsersAnsweredQs($scope.userData, rawQData);
  };

  // invoke once right away
  $scope.getFinalQData($scope.qData);

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
        $scope.getFinalQData(response);
      }
    );
  };

  // $interval($scope.updateQuestionData, 5000, 20);

  $scope.userIsRepWhoAsked = qFeedSvc.userIsRepWhoAsked;
  $scope.isInPast = qFeedSvc.isInPast;
  $scope.qIsAnswerable = qFeedSvc.qIsAnswerable;
  $scope.showInfoOnly = qFeedSvc.showInfoOnly;
  $scope.userAnsweredQ = qFeedSvc.userAnsweredQ;
  $scope.userDidNotAnswer = qFeedSvc.userDidNotAnswer;
  $scope.userHasNotAnswered = qFeedSvc.userHasNotAnswered;
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
        questionObj.answered = true;
        questionObj.answer_chosen = questionObj.optionChosenIndex;
      }
    );
  };

});
