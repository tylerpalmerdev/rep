repApp.service('repSvc', function($http) {
  this.getRepInfo = function(repId) {
    // GET /reps/:repId
    var repInfo = {
      name: 'Barbara Boxer',
      title: 'Senator',
      state: 'CA',
      district: 6,
      state_name: 'California',
      year_elected: '1992',
      address: '123 Capitol Hill, Washington, DC, 12345',
      website: 'barbara-boxer.senate.gov',
      official_email: 'barbara@senate.gov',
      registered: true,
      phone: '202-123-5435',
      rep_id: 'ik8jhasi98h',
      bioguide_id: 'B000711',
      photo_url: "https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/B000711.jpg"
    };

    return repInfo;
  };
});
