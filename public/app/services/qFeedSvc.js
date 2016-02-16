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

  // if voter and voter answered q, return true
  this.userAnsweredQ = function(userData, questionObj) {

    if (userData.role === 'voter' && questionObj.answered) {
      return true;
    } else {
      return false;
    }
  };

  // to show "you did not submit an answer" text
  this.userDidNotAnswer = function(userData, questionObj) {

    if (!userData.role || userData.role === 'rep' || questionObj.answered || !this.isInPast(questionObj)) {
      return false;
    } else if (!questionObj.answered) {
      return true;
    }
  };

  // to show "you have not submitted an answer" text
  this.userHasNotAnswered = function(userData, questionObj) {
    if (userData.role === 'voter' && !this.isInPast(questionObj) && !questionObj.answered) {
      return true;
    } else {
      return false;
    }
  };

  this.getTimeRemaining = function(questionObj) {
    var timeLeftMs = +new Date(questionObj.complete_at) - Date.now();
    var msInDay = 24 * 60 * 60 * 1000;
    var msInHour = msInDay / 24;
    var msInMinute = msInHour / 60;

    var days = Math.floor(timeLeftMs / msInDay);
    var hours = Math.floor((timeLeftMs - (days * msInDay)) / msInHour);
    var minutes = Math.floor((timeLeftMs - (days * msInDay) - (hours * msInHour)) / msInMinute);

    var timeLeftStr;

    if (days > 0) {
      if (hours === 0) {
        timeLeftStr = days + ' days';
      } else {
        timeLeftStr = days + ' days, ' + hours + ' hours';
      }
    } else {
      if (hours === 0) {
        timeLeftStr = minutes + ' min';
      } else {
        timeLeftStr = hours + ' hours, ' + minutes + ' min';
      }
    }
    return timeLeftStr;
  };

  this.chosenAnswerMatch = function(isRep, option, questionObj) {
    if (!questionObj.options[questionObj.answer_chosen]) {
      return false;
    } else if (option.text === questionObj.options[questionObj.answer_chosen].text) {
      return true;
    } else {
      return false;
    }
  };

  // compares userData and questionArr, adds answered data to question arr
  this.getUsersAnsweredQs = function(currUserObj, questionArr) {
    if (currUserObj.role && currUserObj.role === 'voter') {
      currUserObj.questions_answered.forEach(function(elem, i, arr) {
        questionArr.forEach(function(qElem, qI, qArr) {
          if (qElem._id === elem.question_id) {
            qElem.answered = true;
            qElem.answer_chosen = elem.answer_chosen;
          }
        });
      });
    }
    return questionArr;
  };

});
