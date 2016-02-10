repApp.controller('qFeedCtrl', function($scope, questionSvc) {

  console.log("is rep has a type of:", typeof $scope.isRep, $scope.isRep);

  // this will be used to open/close modals for each question box.
  $scope.modalShowObj = {};

  $scope.showQModal = function(qId) {
    $scope.modalShowObj[qId] = true;
  };

  $scope.closeQModal = function(qId) {
    $scope.modalShowObj[qId] = false;
    $scope.optionChosenIndex = "";
  };

  // function to update question data for user and apply to scope
  $scope.updateQuestionData = function() {
    questionSvc.getQsForUser($scope.userData._id, $scope.userData.role)
    .then(
      function(response) {
        $scope.qData = response;
      }
    );
  };

  $scope.userIsRepWhoAsked = function(currUserObj, idOfRepWhoAsked) {
    if (!currUserObj) {
      return false;
    } else if (currUserObj.role === 'voter') {
      return false;
    } else if (currUserObj.role === 'rep') {
      if (currUserObj.rep_id._id === idOfRepWhoAsked) {
        console.log("rep is asking own question");
        return true;
      }
    } else {
      return false;
    }
  };

  $scope.isInPast = function(endDate) {
    var endDateMs = +new Date(endDate);
    if (endDateMs < Date.now()) {
      return true;
    } else {
      return false;
    }
  };

  $scope.userCanAnswerQ = function(currUserObj, questionId) {
    if (!currUserObj) {
      return false;
    } else {
      var role = currUserObj.role;
      if (role === 'rep') {
        return false;
      } else if (role === 'voter') {
        return true;
      }
    }
  };

  // only for voters
  $scope.answerQuestion = function(questionId, answerIndex) {
    var answerObj = {
      question_id: questionId,
      answer_chosen: parseInt(answerIndex), // route expects int
      user_id: $scope.userData._id
    };
    console.log(answerObj);
    questionSvc.answerQ(answerObj)
    .then(
      function(response) {
        $scope.closeQModal(questionId);
        $scope.updateQuestionData();
      }
    );
  };
});
