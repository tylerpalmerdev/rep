repApp.controller('qFeedCtrl', function($scope, questionSvc, util) {

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

  // function to hide "rep who asked" info when rep is looking at their own Qs
  $scope.userIsRepWhoAsked = function(currUserObj, idOfRepWhoAsked) {
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

  $scope.isInPast = function(endDate) {
    var endDateMs = +new Date(endDate);
    if (endDateMs < Date.now()) {
      return true;
    } else {
      return false;
    }
  };

  // why doesn't this work?
  // check to see if user answered question, used when they are on rep page
  $scope.userHasAnsweredQ = function(userData, qId) {
    // if (!userData) { // false if not auth'd
    //   return false;
    // } else if (userData.role === 'rep') { // false if rep
    //   return false;
    // } else if (userData.role === 'voter') {
    //   // if voter hasn't answered any questions
    //   if (userData.questions_answered.length === 0) {
    //     return false;
    //   } else {
    //     // search array of questions answerer for the q's ID
    //     userData.questions_answered.forEach(function(elem, i, arr) {
    //       if (elem.question_id === qId) { // if match found
    //         console.log("match!", elem.question_id, qId);
    //         return true; // return the index of that
    //       }
    //     });
    //   }
    // }
    // // if nothing matches
    // return false;
  };

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
