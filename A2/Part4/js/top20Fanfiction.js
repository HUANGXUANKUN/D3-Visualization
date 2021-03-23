async function top20Canon() {


  var svg = d3.select("#top20fanfiction-container").append("svg")
    .attr('height', 500)
    .attr('width', 1000)
    .text("Top 20 Popular Fan Fiction Characters");

  var margin = 200,
    width = svg.attr("width") - margin;
  height = svg.attr("height") - margin;

  // colors
  var color = {
    'base': d3.rgb('rgb(185, 11, 11)'),
    'other': '#ffd700',
  }

  var genderMap = {
    'M': color.base,
    'F': color.other,
    'N': 'grey'
  };

  svg.append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 50)
    .attr("font-size", "24px")
    .text("Top 20 Popular Fan-Fiction Characters in %")

  var xScale = d3.scaleBand().range([0, width]).padding(0.4),
    yScale = d3.scaleLinear().range([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");

  d3.csv("../data/char_frequencies_canon_ff.csv", function (error, data) {
    if (error) {
      throw error;
    }

    data.sort(function (a, b) {
      return parseFloat(b.fanfiction_percentage) - parseFloat(a.fanfiction_percentage);
    });
    data = data.slice(0, 20);

    var legend_values = [
      { color: genderMap['M'], value: 'male' },
      { color: genderMap['F'], value: 'female' },
      { color: genderMap['N'], value: 'other' },
    ]

    xScale.domain(data.map(function (d) { return d.name; }));
    yScale.domain([0, d3.max(data, function (d) { return d.fanfiction_percentage; })]);

    g.append("g")

      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function (d) {
        return d;
      })
        .ticks(10))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .attr("stroke-width", ".8")
      .text("frequency");

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return xScale(d.name); })
      .attr("y", function (d) { return yScale(d.fanfiction_percentage); })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) { return height - yScale(d.fanfiction_percentage); });
  });
}

top20Canon();