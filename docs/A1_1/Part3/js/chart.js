d3.csv("./data/data.csv").then(d => chart(d))

function chart(data) {
  // first column is date
  var keys = data.columns.slice(1);
  console.log(keys)

  var parseTime = d3.timeParse("%m"),
    formatDate = d3.timeFormat("%Y-%m"),
    bisectDate = d3.bisector(d => d.date).left,
    formatValue = d3.format(",.0f");

  const formatColumn = str => str.split("-")[0];
  console.log(data)
  data.forEach(function (d) {
    d.date = parseTime(d.date);
    return d;
  })

  var svg = d3.select("#chart"),
    margin = { top: 15, right: 50, bottom: 10, left: 35 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleTime()
    .rangeRound([margin.left, width - margin.right])
    .domain(d3.extent(data, d => d.date))

  var y = d3.scaleLinear()
    .rangeRound([height - margin.bottom, margin.top]);

  var z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .curve(d3.curveCardinal)
    .x(d => x(d.date))
    .y(d => y(d.degrees));

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + ",0)");



  var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line").attr("class", "lineHover")
    .style("stroke", "#999")
    .attr("stroke-width", 1)
    .style("shape-rendering", "crispEdges")
    .style("opacity", 0.5)
    .attr("y1", -height)
    .attr("y2", 0);

  focus.append("text").attr("class", "lineHoverDate")
    .attr("text-anchor", "middle")
    .attr("font-size", 14);

  var overlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("x", margin.left)
    .attr("width", width - margin.right - margin.left)
    .attr("height", height)

  // var wrapper = d3.select("#chart")
  const legend_x = width - 30
  const legend_text_x = legend_x + 20
  const legend_y = 20
  svg.append("circle").attr("cx", legend_x).attr("cy", legend_y).attr("r", 6).style("fill", "#609fca")
  svg.append("circle").attr("cx", legend_x).attr("cy", legend_y + 20).attr("r", 6).style("fill", "#ff930e")
  svg.append("circle").attr("cx", legend_x).attr("cy", legend_y + 40).attr("r", 6).style("fill", "#61b861")

  svg.append("text").attr("x", legend_text_x).attr("y", legend_y).text("2018").style("font-size", "15px").attr("alignment-baseline", "middle")
  svg.append("text").attr("x", legend_text_x).attr("y", legend_y + 20).text("2019").style("font-size", "15px").attr("alignment-baseline", "middle")
  svg.append("text").attr("x", legend_text_x).attr("y", legend_y + 40).text("2020").style("font-size", "15px").attr("alignment-baseline", "middle")

  // update(d3.select('#selectbox').text(), 0);
  update(d3.select('#selectbox').property('value'), 0);
  function update(input, speed) {

    var copy = keys.filter(f => f.includes(input))
    console.log('input ' + input)
    // copy = keys;
    console.log(copy)
    var yearGroup = copy.map(function (id) {
      return {
        id: id,
        values: data.map(d => {
          return { date: d.date, degrees: +d[id] }
        })
      };
    });

    console.log(yearGroup)

    y.domain([
      d3.min(yearGroup, d => d3.min(d.values, c => c.degrees)),
      d3.max(yearGroup, d => d3.max(d.values, c => c.degrees))
    ]).nice();
    svg.selectAll(".x-axis").attr("font-size", 14)

    svg.selectAll(".y-axis").transition().attr("font-size", 14)
      .duration(speed)
      .call(d3.axisLeft(y).tickSize(-width + margin.right + margin.left))

    var city = svg.selectAll(".yearGroup")
      .data(yearGroup);

    city.exit().remove();

    city.enter().insert("g", ".focus").append("path")
      .attr("class", "line yearGroup")
      .style("stroke", d => z(d.id))
      .merge(city)
      .transition().duration(speed)
      .attr("d", d => line(d.values))

    tooltip(copy);
  }

  function tooltip(copy) {

    var labels = focus.selectAll(".lineHoverText")
      .data(copy)

    labels.enter().append("text")
      .attr("class", "lineHoverText")
      .style("fill", d => z(d))
      .attr("text-anchor", "start")
      .attr("font-size", 14)
      .attr("dy", (_, i) => 1 + i * 2 + "em")
      .merge(labels);

    var circles = focus.selectAll(".hoverCircle")
      .data(copy)

    circles.enter().append("circle")
      .attr("class", "hoverCircle")
      .style("fill", d => z(d))
      .attr("r", 2.5)
      .merge(circles);

    svg.selectAll(".overlay")
      .on("mouseover", function () { focus.style("display", null); })
      .on("mouseout", function () { focus.style("display", "none"); })
      .on("mousemove", mousemove);


    function mousemove() {

      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.select(".lineHover")
        .attr("transform", "translate(" + x(d.date) + "," + height + ")");

      focus.select(".lineHoverDate")
        .attr("transform",
          "translate(" + x(d.date) + "," + (height + margin.bottom) + ")")
      // .text(formatDate(d.date));

      focus.selectAll(".hoverCircle")
        .attr("cy", e => y(d[e]))
        .attr("cx", x(d.date));

      focus.selectAll(".lineHoverText")
        .attr("transform",
          "translate(" + (x(d.date)) + "," + height / 2.5 + ")")
        .text(e => formatColumn(e) + ": " + formatValue(d[e]) + 'mm');

      x(d.date) > (width - width / 4)
        ? focus.selectAll("text.lineHoverText")
          .attr("text-anchor", "end")
          .attr("dx", -10)
        : focus.selectAll("text.lineHoverText")
          .attr("text-anchor", "start")
          .attr("dx", 10)
    }
  }

  var selectbox = d3.select("#selectbox")
    .on("change", function () {
      update(this.value, 750);
    })
}
