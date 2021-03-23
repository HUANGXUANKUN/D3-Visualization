function findRMS(arr) {
  return Math.pow(
    arr.reduce(function (acc, pres) {
      return acc + Math.pow(pres, 2);
    }) / arr.length,
    0.5
  );
}

// mean
function findMean(arr) {
  return (
    arr.reduce(function (acc, prev) {
      return acc + prev;
    }) / arr.length
  );
}

async function drawHeatMap() {
  var lPatchWidth = 200;
  var itemSize = 30,
    cellSize = itemSize - 3,
    margin = { top: 50, right: 20, bottom: 50, left: 110 };

  var value_csv_title = "NumberOfRainfallDay";
  

  width = window.innerWidth * 0.9 - margin.right - margin.left,
  height = 550 - margin.top - margin.bottom;

  var colorScale;

  colorHold = [
    "#781426",
    "#C76475",
    "#EF9FAE",
    "#ABDB92",
    "#77B75B",
    "#2E6E12",
  ];
  colorLText = [
    "< -66%",
    "-66% to -33%",
    "-33% to 0%",
    "0% to 33%",
    "33% to 66%",
    "> 66%",
  ];

  function bandClassifier(val, multiplier) {
    if (val >= 0) {
      return Math.floor((val * multiplier) / (0.33 * multiplier)) + 1 > 3
        ? 3
        : Math.floor((val * multiplier) / (0.33 * multiplier)) + 1;
    } else {
      return Math.floor((val * multiplier) / (0.33 * multiplier)) < -3
        ? -3
        : Math.floor((val * multiplier) / (0.33 * multiplier));
    }
  }

  d3.csv("./data/data.csv", function (rawData) {
    const dateParser = d3.timeParse("%Y-%m");
    console.log((height + margin.bottom - 35 - 20))
    var data;
    data = rawData.map(function (item) {
      var newItem = {};
      var date = dateParser(item.Date);
      newItem.date = date;
      newItem.year = date.getYear() + 1900;
      newItem.month = date.toLocaleString('default', { month: 'long' });
      newItem.value = item[value_csv_title];
      return newItem;
    });

    console.log(data);

    invertcolors = 0;
    // Inverting color scale
    if (invertcolors) {
      colorHold.reverse();
    }

    var x_elements = d3
        .set(
          data.map(function (item) {
            return item.year;
          })
        )
        .values(),
      y_elements = d3
        .set(
          data.map(function (item) {
            return item.month;
          })
        )
        .values();
        
    console.log(x_elements)
    console.log(y_elements)

    var xScale = d3
      .scaleBand()
      .domain(x_elements)
      .range([0, x_elements.length * itemSize])
      .paddingInner(20)
      .paddingOuter(cellSize / 2);

    var xAxis = d3
      .axisBottom()
      .scale(xScale)
      .tickFormat(function (d) {
        return d;
      });

    var yScale = d3
      .scaleBand()
      .domain(y_elements)
      .range([0, y_elements.length * itemSize])
      .paddingInner(0.2)
      .paddingOuter(0.2);

    var yAxis = d3
      .axisLeft()
      .scale(yScale)
      .tickFormat(function (d) {
        return d;
      });

    // Finding the mean of the data
    var mean = findMean(
      data.map(function (d) {
        return +d.value;
      })
    );

    //setting percentage change for value w.r.t average
    data.forEach(function (d) {
      d.perChange = (d.value - mean) / mean;
    });

    colorScale = d3
      .scaleOrdinal()
      .domain([-3, -2, -1, 1, 2, 3])
      .range(colorHold);

    var rootsvg = d3
      .select("#heatmap2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    var svg = rootsvg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // tooltip
    tooltip = d3
      .select("body")
      .append("div")
      .style("width", "200px")
      .style("height", "40px")
      .style("background", "#C3B3E5")
      .style("opacity", "1")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("box-shadow", "0px 0px 6px #7861A5")
      .style("padding", "10px");

    toolval = tooltip.append("div");

    var cells = svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("g")
      .append("rect")
      .attr("class", "cell")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("y", function (d) {
        return yScale(d.month);
      })
      .attr("x", function (d) {
        return xScale(d.year) - cellSize / 2;
      })
      .attr("fill", function (d) {
        return colorScale(bandClassifier(d.perChange, 100));
      })
      .attr("rx", 3)
      .attr("ry", 3)
      .on("mouseover", function (d) {
        console.log(d);
        //d3.select(this).attr("fill","#655091");
        d3.select(this).style("stroke", "orange").style("stroke-width", "3px");
        d3.select(".trianglepointer")
          .transition()
          .delay(100)
          .attr(
            "transform",
            "translate(" +
              -(
                lPatchWidth / colorScale.range().length / 2 +
                colorScale.domain().indexOf(bandClassifier(d.perChange, 100)) *
                  (lPatchWidth / colorScale.range().length)
              ) +
              ",0)"
          );

        d3.select(".LegText")
          .select("text")
          .text(
            colorLText[
              colorScale.domain().indexOf(bandClassifier(d.perChange, 100))
            ]
          );
      })
      .on("mouseout", function () {
        //d3.select(this).attr('fill', function(d) { return colorScale(window.bandClassifier(d.perChange,100));});
        d3.select(this).style("stroke", "none");
        tooltip.style("visibility", "hidden");
      })
      .on("mousemove", function (d) {
        tooltip
          .style("visibility", "visible")
          .style("top", d3.event.pageY - 30 + "px")
          .style("left", d3.event.pageX + 20 + "px");

        console.log(d3.mouse(this)[0]);
        tooltip
          .select("div")
          .html(
            "<strong>" + d.month + " " + d.year  + "</strong><br/> " + " Rainy Days: " + (+d.value) + " days"
          );
      });

    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .selectAll("text")
      .attr("font-weight", "normal");

    svg
      .append("g")
      .attr("class", "x axis")
      .attr(
        "transform",
        "translate(0," + (y_elements.length * itemSize + cellSize / 2) + ")"
      )
      .call(xAxis)
      .selectAll("text")
      .attr("font-weight", "normal")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.5em")
      .attr("transform", function (d) {
        return "rotate(-65)";
      });

    // Legends section
    

    legends = svg
      .append("g")
      .attr("class", "legends")
      .attr(
        "transform",
        "translate(" +
          ((width + margin.right) / 2 - lPatchWidth / 2 - margin.left / 2) +
          "," +
          (height + margin.bottom - 35 - 20) +
          ")"
      );

      

    // Legend traingle pointer generator
    var symbolGenerator = d3.symbol().type(d3.symbolTriangle).size(64);

    legends
      .append("g")
      .attr("transform", "rotate(180)")
      .append("g")
      .attr("class", "trianglepointer")
      .attr(
        "transform",
        "translate(" + -lPatchWidth / colorScale.range().length / 2 + ")"
      )
      .append("path")
      .attr("d", symbolGenerator());
      
    //Legend Rectangels
    legends
      .append("g")
      .attr("class", "LegRect")
      .attr("transform", "translate(0," + 15 + ")")
      .selectAll("rect")
      .data(colorScale.range())
      .enter()
      .append("rect")
      .attr("width", lPatchWidth / colorScale.range().length + "px")
      .attr("height", "10px")
      .attr("fill", function (d) {
        return d;
      })
      .attr("x", function (d, i) {
        return i * (lPatchWidth / colorScale.range().length);
      });

    // legend text
    legends
      .append("g")
      .attr("class", "LegText")
      .attr("transform", "translate(0,45)")
      .append("text")
      .attr("x", lPatchWidth / 2)
      .attr("font-weight", "normal")
      .style("text-anchor", "middle")
      .text(colorLText[0]);

    // Heading
    rootsvg
      .append("g")
      .attr("transform", "translate(0,30)")
      .append("text")
      .attr("x", (width + margin.right + margin.left) / 2)
      .attr("font-weight", "bold")
      .attr("font-size", "22px")
      .attr("font-family", "Segoe UI bold")
      .style("text-anchor", "middle")
      .text("Singapore Monthly Rain Days 1982 - 2021");
  });
}
drawHeatMap();
