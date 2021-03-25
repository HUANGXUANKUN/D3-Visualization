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
    margin = { top: 50, right: 10, bottom: 50, left: 50 };

  var heading = "Global Temperature Anomalies 1980 - 2020";

  (width = window.innerWidth * 0.9 - margin.right - margin.left),
    (height = 550 - margin.top - margin.bottom);

  var colorScale;

  colorHold = [
    "#4A0816",
    "#6A0E1F",
    "#881528",
    "#A51D31",
    "#C12839",
    "#CE2D3E",
    "#D9495C",
    "#DE576B",
    "#E77589",
    "#F5B5C3",

    "#DEF5D9",
    "#D2F0CC",
    "#C5EBBF",
    "#91BF8C",
    "#85AF7F",
    "#5E7D59",
    "#526D4C",
    "#455C40",
    "#384B34",
    "#2B3A27",
  ];

  colorLText = [
    "< -90%",
    "-90% to -80%",
    "-80% to -70%",
    "-70% to -60%",
    "-60% to -50%",
    "-50% to -40%",
    "-40% to -30%",
    "-30% to -20%",
    "-20% to -10%",
    "-10% to 0%",

    "0% to 10%",
    "10% to 20%",
    "20% to 30%",
    "30% to 40%",
    "40% to 50%",
    "50% to 60%",
    "60% to 70%",
    "70% to 80%",
    "80% to 90%",
    "> 90%",
  ];

  var color_domain_array = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  function bandClassifier(val, multiplier) {
    if (val >= 0) {
      return Math.floor((val * multiplier) / (0.1 * multiplier)) + 1 > 10
        ? 10
        : Math.floor((val * multiplier) / (0.1  * multiplier)) + 1;
    } else {
      return Math.floor((val * multiplier) / (0.1 * multiplier)) < -10
        ? -10
        : Math.floor((val * multiplier) / (0.1  * multiplier));
    }
  }

  d3.csv("../data/EarthTempAnomalies.csv", function (rawData) {
    console.log(rawData);

    var month_mapper = {
      1: "Jan",
      2: "Feb",
      3: "Mar",
      4: "Apr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Aug",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    };
    var data = [];
    rawData.forEach((item) => {
      // filter by Hemisphere and year range
      if (
        item.Hemisphere === "Global" &&
        item.Year >= 1980 &&
        item.Year <= 2020
      ) {
        console.log(item);
        var year = item.Year;
        for (let i = 1; i <= 12; i++) {
          var month_short = month_mapper[i];
          let date_str = month_short + " " + year;
          var d = {
            date: date_str,
            year: year,
            month: month_short,
            value: item[month_short],
          };
          // console.log(d);
          data.push(d);
        }
      }
    });

    console.log("printing processed data");
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

    console.log(x_elements);
    console.log(y_elements);

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

    colorScale = d3.scaleOrdinal().domain(color_domain_array).range(colorHold);

    var rootsvg = d3
      .select("#heatmap1")
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
      .style("width", "300px")
      .style("height", "35px")
      .style("background", "white")
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
        d3.select(".trianglepointer1")
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

        d3.select(".LegText1")
          .select("text")
          .text(
            colorLText[
              colorScale.domain().indexOf(bandClassifier(d.perChange, 100))
            ]
          );
      })
      .on("mouseout", function () {
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
            "<strong>" +
              d.month +
              " " +
              d.year +
              "</strong><br/> " +
              " Global Temperature Change: " +
              (+d.value).toFixed(2) +
              " degree"
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
      .attr("class", "trianglepointer1")
      .attr(
        "transform",
        "translate(" + -lPatchWidth / colorScale.range().length / 2 + ")"
      )
      .append("path")
      .attr("d", symbolGenerator());

    //Legend Rectangels

    colorScale
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
      .attr("class", "LegText1")
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
      .text(heading);
  });
}
drawHeatMap();
