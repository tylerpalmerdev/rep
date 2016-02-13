repApp.service('util', function(constants) {
  this.getPhotoUrl = function(bioguideId) {
    return constants.repPhotosBaseUrl + bioguideId + ".jpg";
  };

  this.qFeedFilterOptions = [
    {label: 'Active', value: 'active', selected: true},
    {label: 'Completed', value: 'completed'}
  ];

  this.newQFormOptions = [
    {label: 'Yes/No', value: 'yn', selected: true}, // sets default
    {label: 'Multiple Choice', value: 'mc'}
  ];

  this.signupRoleOptions = [
    {
      label: 'Representative',
      value: 'rep',
      selected: true
    },
    {
      label: 'Voter',
      value: 'voter'
    }
  ];
});
