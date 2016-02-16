repApp.controller('qFeedCtrl', function($scope, questionSvc, util, qFeedSvc, $interval, socketSvc, $element, $stateParams) {

  // this will be used to open/close modals for each question box.
  $scope.modalShowObj = {};

  $scope.showQModal = function(qId) {
    $scope.modalShowObj[qId] = true;
  };

  $scope.closeQModal = function(questionObj) {
    $scope.modalShowObj[questionObj._id] = false;
    questionObj.optionChosenIndex = null;
  };

  // utility functions/vals for show/hide logic on feed;
  $scope.filterOptions = util.qFeedFilterOptions;
  $scope.getRepImgUrl = util.getPhotoUrl;
  $scope.userIsRepWhoAsked = qFeedSvc.userIsRepWhoAsked;
  $scope.isInPast = qFeedSvc.isInPast;
  $scope.qIsAnswerable = qFeedSvc.qIsAnswerable;
  $scope.showInfoOnly = qFeedSvc.showInfoOnly;
  $scope.userAnsweredQ = qFeedSvc.userAnsweredQ;
  $scope.userDidNotAnswer = qFeedSvc.userDidNotAnswer;
  $scope.userHasNotAnswered = qFeedSvc.userHasNotAnswered;
  $scope.getTimeRemaining = qFeedSvc.getTimeRemaining;
  $scope.chosenAnswerMatch = qFeedSvc.chosenAnswerMatch;

  // update $scope.q-data to contain questions answered by user, if any
  $scope.getFinalQData = function(rawQData) {
    $scope.qData = qFeedSvc.getUsersAnsweredQs($scope.userData, rawQData);
  };

  // invoke once right away
  $scope.getFinalQData($scope.qData);

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
      }
    );
  };

  // SOCKET.io FUNCTIONS! Move to service somehow? Clean up?
  var socket = socketSvc.getSocket();

  // update data for answered question when answered
  socket.on('questionAnswered', function(data) {
    var qsAnswered = data.questions_answered;
    var lastQ = qsAnswered[qsAnswered.length - 1];

    // loop through each current question
    $scope.qData.forEach(function(elem, i, arr) {
      // if one matches the one that was just updated:
      if (elem._id === lastQ.question_id) {
        // console.log('match!');
        // var newTotal = elem.total_responses++;
        elem.total_responses++; // mainly for rep
        // if voter on own page & just answered q
        if (data._id === $stateParams.voterId) {
          elem.answered = true;
          elem.answer_chosen = lastQ.answer_chosen;
        }
        $scope.$apply(function() {
          console.log("answer data updated!");
        });
      }
    });
    return true;
  });

  // add data for new question after asked
  socket.on('newQuestion', function(data) {
    // console.log("new question submitted!", data);
    var submittedBy = data.submitted_by.rep_id._id;
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

  // disconnect from sockets when leaving page
  $element.on('$destroy', function() {
    socket.off('questionAnswered');
    socket.off('newQuestion');
  });
});
