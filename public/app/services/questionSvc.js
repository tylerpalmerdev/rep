repApp.service('questionSvc', function() {
  var dummyQs = [
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'active',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'completed',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'completed',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    },
    {
      text: "Should we throw all puppies in puppy prison?",
      type: 'Y/N',
      rep_id: '9jasd8hasd8g',
      status: 'completed',
      submit_stamp: '1454370340',
      end_stamp: '1454586300',
      possible_answers: ['YES', 'NO', 'NOT SURE'],
      results: {
        0: 24010,
        1: 2309,
        2: 9092
      },
      num_responses: 35415
    }
  ];

  this.getQsForRep = function(repId) {
    // GET /questions?repId=repId;
    return dummyQs;
  };

  this.postNewQ = function(repId, qObj) {
    // POST /questions
    // body: qObj , qObj.repId = repId, qObj.submit_stamp = now, qObj.end_stamp = now + 3 days (or do on server?)
  }
});
