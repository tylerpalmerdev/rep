repApp.service('qFeedSvc', function() {
  // function to hide "rep who asked" info when rep is looking at their own Qs
  this.userIsRepWhoAsked = function(currUserObj, idOfRepWhoAsked) {
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

  this.isInPast = function(questionObj) {
    var endDateMs = +new Date(questionObj.complete_at);
    if (endDateMs < Date.now()) {
      return true;
    } else {
      return false;
    }
  };

  // used to hide/ show answer form and answer question button on card
  this.qIsAnswerable = function(isRep, questionObj) {
    if (!isRep && !questionObj.answered && !this.isInPast(questionObj)) {
      return true;
    } else {
      return false;
    }
  };

  // if neither of above is true, only show info about question (button & box)
  this.showInfoOnly = function(isRep, questionObj) {
    if (!this.qIsAnswerable(isRep, questionObj) && !this.isInPast(questionObj)) {
      return true;
    } else {
      return false;
    }
  };

  this.userAnsweredQ = function(isRep, questionObj) {
    if (isRep || !questionObj.answered) {
      return false;
    } else if (questionObj.answered) {
      return true;
    } else { // account for other scenarios
      return false;
    }
  };

  // to show "you did not submit an answer" text
  this.userDidNotAnswer = function(isRep, questionObj) {
    if (isRep || questionObj.answered || !this.isInPast(questionObj)) {
      return false;
    } else if (!questionObj.answered) {
      return true;
    }
  };

  // why doesn't this work?
  // check to see if user answered question, used when they are on rep page
  this.userHasAnsweredQ = function(userData, qId) {
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
});
