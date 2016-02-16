repApp.service('questionSvc', function($http, constants) {

  this.getQsForUser = function(id, role) {
    return $http({
      method: 'GET',
      url: '/questions?role=' + role + '&' + role + 'Id=' + id
    })
    .then(
      function(response) {
        return response.data;
      }
    );
  };

  this.postNewQ = function(qObj) {

    var new_options = []; // blank array to hold final option objects
    qObj.options.forEach(function(elem, i, arr) {
      if (elem) { // if option is not blank
        new_options.push({text: elem}); // add option object to new arr
      }
    });
    qObj.options = new_options;

    return $http({
      method: 'POST',
      url: '/questions',
      data: qObj
    })
    .then(
      function(response) {
        // console.log(response.data);
        // return response.data;
      }
    );
  };

  this.answerQ = function(answerObj) {

    return $http({
      method: 'POST',
      url: '/answers',
      data: answerObj
    })
    .then(
      function(response) {
        console.log('answer submitted!');
      }
    );
  };
});
