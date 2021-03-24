async function top20Canon() {


  var svg = d3.select("#top20fanfiction-container").append("svg")
    .attr('height', 500)
    .attr('width', 1000)

  var margin = 200,
    width = svg.attr("width") - margin;
  height = svg.attr("height") - margin;

  var genderMap = {
    'M': "lightblue",
    'F': "orange",
    'N': 'grey'
  };

  svg.append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 50)
    .attr("font-size", "24px")
    .text("20 Highest Occurring Characters in Fan-Fiction Novels")

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

    data.map(d => {
      d.fanfiction_percentage = d.fanfiction_percentage * 100;
      return d;
    });

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
      .text("frequency %");

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return xScale(d.name); })
      .attr("y", function (d) { return yScale(d.fanfiction_percentage); })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) { return height - yScale(d.fanfiction_percentage); })
      .attr("fill", function(d, i) { return genderMap[d.gender]; })
    
      // draw legends
      symbol_x = width - 150;
      symbol_y = 20;
      legend_text_x = symbol_x + 20;
      legend_text_y = symbol_y;
      g.append("circle").attr("cx",symbol_x).attr("cy",symbol_y).attr("r", 6).style("fill", genderMap["M"])
      g.append("circle").attr("cx",symbol_x).attr("cy",symbol_y+30).attr("r", 6).style("fill", genderMap["F"])
      g.append("circle").attr("cx",symbol_x).attr("cy",symbol_y+60).attr("r", 6).style("fill", genderMap["N"])
      g.append("text").attr("x", legend_text_x).attr("y", legend_text_y).text("Male").style("font-size", "15px").attr("alignment-baseline","middle")
      g.append("text").attr("x", legend_text_x).attr("y", legend_text_y+30).text("Female").style("font-size", "15px").attr("alignment-baseline","middle")
      g.append("text").attr("x", legend_text_x).attr("y", legend_text_y+60).text("Unknown").style("font-size", "15px").attr("alignment-baseline","middle")
  
    });
}

top20Canon();