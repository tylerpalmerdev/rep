repApp.directive('resultsChart', function() {
  return {
    templateUrl: 'app/directives/resultsChart/resultsChartTmpl.html',
    restrict: 'E',
    scope: {
      questionData: '='
    },
    replace: false,
    link: function(scope, element, attrs) {
      var chart = d3.select(element[0]);

      chart.append("div")
      .attr("class", "chart")
      .selectAll("div")
      .data(scope.questionData.options.sort(function(a, b) {
        return b.votes - a.votes;
      }))
      .enter()
      .append("div")
      .transition().ease("elastic")
      .style("width", function (d) {
        return d.votes + 'px';
      })
      .text(function(d) {
        return d.votes + " votes";
      });
    }
  };
});
