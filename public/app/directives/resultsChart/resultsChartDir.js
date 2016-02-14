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
          lowestVal = 0,
          answerChosen;

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

      // see if an answer has been chosen by user; assign if so
      if (scope.questionData.answered) {
        answerChosen = scope.questionData.options[scope.questionData.answer_chosen];
      }

      // create chart div to hold all the things
      var chartDiv = chart.append("div")
      .attr("class", "chart")
      .selectAll("div")
      .data(options.sort(function(a, b) {
        return b.votes - a.votes;
      }))
      .enter()
      .append("div")
      .attr("class", "option-wrapper")
      .style("width","100%");

      // add div to contain text for each option & add option text
      chartDiv.append("div")
      .attr("class", function(d, i) {
        if (!answerChosen) {
          return "option-text";
        } else {
          if (d.text === answerChosen.text) {
            return "option-text answer-chosen";
          } else {
            return "option-text";
          }
        }
      })
      .text(function(d){
        return d.text;
      });

      // add bars for each option, width/color based on # votes
      chartDiv.append("div")
      .attr("class", "chart-bar")
      .transition().ease("elastic")
      .style("background-color", function(d) {
        var maxRgb = 230,
            minRgb = 75,
            valRange = (highestVal - lowestVal),
            basePct = 1 - ((highestVal - d.votes) / valRange),
            baseRgb = maxRgb * basePct,
            colorVal = baseRgb + (1 - basePct) * minRgb;

        return "rgb(0, " + colorVal + ", 150)";
      })
      .style("width", function (d) {
        if (d.votes === 0) {
          return '1px';
        } else {
          var pctOfHighest = ((d.votes / highestVal) * 100);
          return pctOfHighest+ '%';
        }
      });

      // adds child div to each bar div to hold text + add text
      chartDiv.selectAll("div.chart-bar")
      .append("div")
      .attr("class", "bar-text-wrapper")
      .text(function(d) {
        if (d.votes === 0) {
          return "0% (0 votes)";
        }
        var pct = ((d.votes / totalVotes) * 100).toFixed(1);
        return pct + "% (" + d.votes.toLocaleString() + " votes)";
      });

      // adds total votes div to bottom of chart div
      d3.select(".chart")
      .append("div")
      .attr("class", "response-count-wrapper")
      .text(totalVotes.toLocaleString() + " total votes");

    }
  };
});
