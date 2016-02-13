repApp.directive('resultsChart', function() {
  return {
    templateUrl: 'app/directives/resultsChart/resultsChartTmpl.html',
    restrict: 'E',
    scope: {
      questionData: '=' // [{votes: 70, text: 'blhkh'}]
    },
    replace: false,
    link: function(scope, element, attrs) {
      var chart = d3.select(element[0]),
          options = scope.questionData.options,
          totalVotes = 0,
          highestVal = 0,
          lowestVal = 0;

      // get total votes for %s and highest/lowest vote counts
      options.forEach(function(elem, i, arr) {
        totalVotes += elem.votes;
        if (elem.votes > highestVal) {
          highestVal = elem.votes;
        }

        if(!lowestVal) {
          lowestVal = elem.votes;
        } else if (elem.votes < lowestVal) {
          lowestVal = elem.votes;
        }
      });

      var parDiv = chart.append("div")
      .attr("class", "chart")
      .selectAll("div")
      .data(options.sort(function(a, b) {
        return b.votes - a.votes;
      }))
      .enter()
      .append("div")
      .style("width","100%");

      parDiv.append("div").text(function(d){
        return d.text;
      });
      parDiv.append("div").attr("class", "chart-bar")
      .transition().ease("elastic")
      .style("background-color", function(d) {
        var maxRgb = 255,
            minRgb = 75,
            valRange = (highestVal - lowestVal),
            basePct = 1 - ((highestVal - d.votes) / valRange),
            baseRgb = maxRgb * basePct,
            colorVal = baseRgb + (1 - basePct) * minRgb;

        return "rgb(0, 0, " + colorVal + ")";
      })
      .style("width", function (d) {
        var pctOfHighest = ((d.votes / highestVal) * 100);
        return pctOfHighest+ '%';
      })
      .text(function(d) {
        var pct = ((d.votes / totalVotes) * 100).toFixed(1);
        return pct + "% (" + d.votes + " votes)";
      });



    }
  };
});
