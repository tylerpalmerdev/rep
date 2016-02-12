repApp.filter("feedSort", function() {
  return function(rawFeedElems, filterBy) { // active/ completed
    var sortedFeed = [],
        toVote = [],
        voted = [];

    var sortAsc = function(a, b) {
      return new Date(a.complete_at).getTime() - new Date(b.complete_at).getTime();
    };

    var sortDesc = function(a, b) {
      return new Date(b.complete_at).getTime() - new Date(a.complete_at).getTime();
    };

    rawFeedElems.forEach(function(elem, i, arr) {
      var elemEndDate = +new Date(elem.complete_at);
      var now = Date.now();
      if (filterBy === 'active' && elemEndDate > now) {
        if (elem.answered) { // if user answered question
          voted.push(elem); // add to voted array
        } else { // if user did not vote yet
          toVote.push(elem); // at to toVote arr
        }
      } else if (filterBy === 'completed' && elemEndDate < now) {
        sortedFeed.push(elem);
      }
    });

    if (filterBy === 'active') {
      toVote.sort(sortAsc);
      voted.sort(sortAsc);
      sortedFeed = toVote.concat(voted);
    } else if (filterBy === 'completed') {
      sortedFeed.sort(sortDesc);
    }

    return sortedFeed;

  };
});
