repApp.directive('questionFeed', function() {
  return {
    templateUrl: 'app/directives/qFeed/qFeedTmpl.html',
    controller: 'qFeedCtrl',
    scope: {
      qData: '=',
      userData: '=',
      isRep: '='
    }
  };
});
