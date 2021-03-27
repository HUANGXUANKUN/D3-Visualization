async function chart() {
  var glines;
  var mouseG;
  var tooltip;

  var parseDate = d3.timeParse("%Y");

  var margin = { top: 80, right: 200, bottom: 40, left: 80 };
  var width = window.innerWidth * 0.9 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var lineOpacity = 1;
  var lineStroke = "2px";

  var axisPad = 6; // axis formatting
  var R = 6; //legend marker

  var category = ["Winter", "Spring", "Summer", "Autumn"];

  // since Category B and E are really close to each other, assign them diverging colors
  var color = d3
    .scaleOrdinal()
    .domain(category)
    .range(["blue", "green", "red", "orange"]);

  d3.csv("../data/Seasonal_By_Hemisphere.csv", (data) => {
    var res = data.map((d, i) => {
      return {
        date: parseDate(d.Year),
        hemisphere: d.Hemisphere,
        season: d.Season,
        temperature: +d.SeasonAvg,
      };
    });

    // var res = [];
    // // filter by year
    // data_processed.forEach((d) => {
    //   // if (d.date.getFullYear() > 1990 ){
    //   //   res.push(d);
    //   // }
    //   res.push(d);
    // });

    let current_start_year = 2000;
    let current_end_year = 2020;
    let current_hemisphere = "Global";

    console.log(res);

    var xScale = d3
      .scaleTime()
      .domain(d3.extent(res, (d) => d.date))
      .range([0, width]);

    var yScale = d3
      .scaleLinear()
      .domain([
        d3.min(res, (d) => d.temperature),
        d3.max(res, (d) => d.temperature),
      ])
      .range([height, 0]);

    var svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // CREATE AXES //
    // render axis first before lines so that lines will overlay the horizontal ticks
    var xAxis = d3
      .axisBottom(xScale)
      .ticks(d3.timeYear.every(10))
      .tickSizeOuter(axisPad * 2)
      .tickSizeInner(axisPad * 2);
    var yAxis = d3.axisLeft(yScale).ticks(10, "s").tickSize(-width); //horizontal ticks across svg width

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .call((g) => {
        var years = xScale.ticks(d3.timeYear.every(1));
        var xshift = width / years.length / 2;
        g.selectAll("text")
          .attr("transform", `translate(${xshift}, 10)`) //shift tick labels to middle of interval
          .style("text-anchor", "middle")
          .attr("y", axisPad)
          .attr("fill", "#A9A9A9");
        g.selectAll("line").attr("stroke", "#A9A9A9");
        g.select(".domain").attr("stroke", "#A9A9A9");
      });

    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .call((g) => {
        g.selectAll("text")
          .style("text-anchor", "middle")
          .attr("x", -axisPad * 2)
          .attr("fill", "#A9A9A9");

        g.selectAll("line")
          .attr("stroke", "#A9A9A9")
          .attr("stroke-width", 0.7) // make horizontal tick thinner and lighter so that line paths can stand out
          .attr("opacity", 0.3);

        g.select(".domain").remove();
      })
      .append("text")
      .attr("x", 50)
      .attr("y", -10)
      .attr("fill", "#A9A9A9")
      .text("Temperature Anomalies");

    // CREATE LEGEND //
    var svgLegend = svg
      .append("g")
      .attr("class", "gLegend")
      .attr("transform", "translate(" + (width + 20) + "," + 0 + ")");

    var legend = svgLegend
      .selectAll(".legend")
      .data(category)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend
      .append("circle")
      .attr("class", "legend-node")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", R)
      .style("fill", (d) => color(d));

    legend
      .append("text")
      .attr("class", "legend-text")
      .attr("x", R * 2)
      .attr("y", R / 2)
      .style("fill", "#A9A9A9")
      .style("font-size", 12)
      .text((d) => d);

    // line generator
    var line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.temperature));

    renderChart(current_hemisphere); // inital chart render (set default to Global)

    // Update chart when radio button is selected
    d3.selectAll("input[name='selection']").on("change", function () {
      updateChart(this.value);
    });

    function updateChart(hemisphere) {
      var resNew = res.filter((d) => {
        if (
          d.hemisphere == hemisphere
        ) {
          return d;
        }
      });
      var res_nested = d3
        .nest()
        .key((d) => d.season)
        .entries(resNew);

      glines
        .select(".line") //select line path within line-group (which represents a vehicle category), then bind new data
        .data(res_nested)
        .transition()
        .duration(750)
        .attr("d", function (d) {
          return line(d.values);
        });

      mouseG.selectAll(".mouse-per-line").data(res_nested);

      mouseG.on("mousemove", function () {
        var mouse = d3.mouse(this);
        updateTooltipContent(mouse, res_nested);
      });
    }

    function renderChart(hemisphere) {
      var resNew = res.filter((d) => d.hemisphere == hemisphere);

      var res_nested = d3
        .nest() // necessary to nest data so that keys represent each vehicle category
        .key((d) => d.season)
        .entries(resNew);

      // APPEND MULTIPLE LINES //
      var lines = svg.append("g").attr("class", "lines");

      glines = lines
        .selectAll(".line-group")
        .data(res_nested)
        .enter()
        .append("g")
        .attr("class", "line-group");

      glines
        .append("path")
        .attr("class", "line")
        .attr("d", (d) => line(d.values))
        .style("stroke", (d, i) => color(i))
        .style("fill", "none")
        .style("opacity", lineOpacity)
        .style("stroke-width", lineStroke);

      // CREATE HOVER TOOLTIP WITH VERTICAL LINE //
      tooltip = d3
        .select("#chart")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#D3D3D3")
        .style("padding", 6)
        .style("display", "none");

      mouseG = svg.append("g").attr("class", "mouse-over-effects");

      mouseG
        .append("path") // create vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "#A9A9A9")
        .style("stroke-width", lineStroke)
        .style("opacity", "0");

      var lines = document.getElementsByClassName("line");

      var mousePerLine = mouseG
        .selectAll(".mouse-per-line")
        .data(res_nested)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

      mousePerLine
        .append("circle")
        .attr("r", 4)
        .style("stroke", function (d) {
          return color(d.key);
        })
        .style("fill", "none")
        .style("stroke-width", lineStroke)
        .style("opacity", "0");

      mouseG
        .append("svg:rect") // append a rect to catch mouse movements on canvas
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseout", function () {
          // on mouse out hide line, circles and text
          d3.select(".mouse-line").style("opacity", "0");
          d3.selectAll(".mouse-per-line circle").style("opacity", "0");
          d3.selectAll(".mouse-per-line text").style("opacity", "0");
          d3.selectAll("#tooltip").style("display", "none");
        })
        .on("mouseover", function () {
          // on mouse in show line, circles and text
          d3.select(".mouse-line").style("opacity", "1");
          d3.selectAll(".mouse-per-line circle").style("opacity", "1");
          d3.selectAll("#tooltip").style("display", "block");
        })
        .on("mousemove", function () {
          // update tooltip content, line, circles and text when mouse moves
          var mouse = d3.mouse(this);

          d3.selectAll(".mouse-per-line").attr("transform", function (d, i) {
            var xDate = xScale.invert(mouse[0]); // use 'invert' to get date corresponding to distance from mouse position relative to svg
            var bisect = d3.bisector(function (d) {
              return d.date;
            }).left; // retrieve row index of date on parsed csv
            var idx = bisect(d.values, xDate);

            d3.select(".mouse-line").attr("d", function () {
              var data = "M" + xScale(d.values[idx].date) + "," + height;
              data += " " + xScale(d.values[idx].date) + "," + 0;
              return data;
            });
            return (
              "translate(" +
              xScale(d.values[idx].date) +
              "," +
              yScale(d.values[idx].temperature) +
              ")"
            );
          });

          updateTooltipContent(mouse, res_nested);
        });
    }

    function updateTooltipContent(mouse, res_nested) {
      sortingObj = [];
      res_nested.map((d) => {
        var xDate = xScale.invert(mouse[0]);
        var bisect = d3.bisector(function (d) {
          return d.date;
        }).left;
        var idx = bisect(d.values, xDate);
        sortingObj.push({
          key: d.values[idx].season,
          temperature: d.values[idx].temperature,
          hemisphere: d.values[idx].hemisphere,
          year: d.values[idx].date.getFullYear(),
        });
      });

      sortingObj.sort(function (x, y) {
        return d3.descending(x.temperature, y.temperature);
      });

      var sortingArr = sortingObj.map((d) => d.key);

      var res_nested1 = res_nested.slice().sort(function (a, b) {
        return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key); // rank vehicle category based on price of temperature
      });

      tooltip
        .html(
          "Year: " +
            sortingObj[0].year +
            "<br/>" +
            "Hemishpere: " +
            sortingObj[0].hemisphere
        )
        .style("display", "block")
        .style("left", d3.event.pageX + 20)
        .style("top", d3.event.pageY - 20)
        .style("font-size", 11.5)
        .selectAll()
        .data(res_nested1)
        .enter() // for each vehicle category, list out name and price of temperature
        .append("div")
        .style("color", (d) => {
          return color(d.key);
        })
        .style("font-size", 10)
        .html((d) => {
          var xDate = xScale.invert(mouse[0]);
          var bisect = d3.bisector(function (d) {
            return d.date;
          }).left;
          var idx = bisect(d.values, xDate);
          return d.key + " " + ":" + d.values[idx].temperature.toString();
        });
    }
  });
}

chart();
