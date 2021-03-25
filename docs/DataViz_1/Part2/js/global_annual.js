function drawGridData(ncol, nrow, cellWidth, cellHeight, data) {
  var gridData = [];
  var xpos = 0;
  var ypos = 0;

  let i = 0; // index
  for (var row = 0; row < nrow; row++) {
    gridData.push([]);

    // iterate for cells/columns inside each row
    for (var col = 0; col < ncol; col++) {
      gridData[row].push({
        x: xpos,
        y: ypos,
        width: cellWidth,
        height: cellHeight,
        year: data[i].year,
        value: data[i].value,
        perChange: data[i].perChange,
      });

      // increment x position (moving over by 50)
      xpos += cellWidth + 10;
      i++;
    }

    // reset x position after a row is complete
    xpos = 1;
    // increment y position (moving down by 50)
    ypos += cellHeight + 10;
  }
  return gridData;
}

// mean
function findMean(arr) {
  return (
    arr.reduce(function (acc, prev) {
      return acc + prev;
    }) / arr.length
  );
}

async function drawGlobal() {
  var lPatchWidth = 200;
  var margin = { top: 35, right: 10, bottom: 50, left: 50 };

  var heading = "Global Temperature Change 1880 - 2020";
  var startYear = 1880;
  var endYear = 2020;
  var rows = 14;
  var cols = 10;
  var cellWidth = 100;
  var cellHeight = 20;

  var width = window.innerWidth * 0.9 - margin.right - margin.left;
  var height = 600 - margin.top - margin.bottom;
  d3.csv("../data/EarthTempAnomalies.csv", function (rawData) {
    console.log(rawData);
    var data = [];

    rawData.forEach((item) => {
      // filter by Hemisphere and year range
      if (
        item.Hemisphere === "Global" &&
        item.Year >= startYear &&
        item.Year <= endYear
      ) {
        d = {
          year: item.Year,
          value: item["D-N"],
        };
        data.push(d);
      }
    });
    console.log(data);

    invertcolors = 0;
    // Inverting color scale
    if (invertcolors) {
      colorHold.reverse();
    }

    // Finding the mean of the data
    var mean = findMean(
      data.map(function (d) {
        return +d.value;
      })
    );

    //setting percentage change for value w.r.t average
    let min_value = 999999999,
      max_value = -9999999999;
    data.forEach(function (d) {
      d.perChange = (d.value - mean) / mean;
      min_value = Math.min(min_value, d.value);
      max_value = Math.max(max_value, d.value);
    });

    console.log("after perchange cal");
    console.log(data);
    // var myColor = d3
    //   .scaleLinear()
    //   .range(["#FFDEE3", "#390511"])
    //   .domain([min_value, max_value]);

      var myColor = d3
      .scaleLinear()
      .range(["green", "#ad9d6b","#8f0202"])
      .domain([min_value, 0, max_value]);


    var rootsvg = d3
      .select("#global")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var svg = rootsvg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // generate grid data with specified number of columns, rows, cell width, cell height
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

    var gridData = drawGridData(cols, rows, cellWidth, cellHeight, data);
    console.log(gridData);

    // tooltip
    tooltip = d3
      .select("body")
      .append("div")
      .style("width", "200px")
      .style("height", "35px")
      .style("background", "white")
      .style("opacity", "1")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("box-shadow", "0px 0px 6px #7861A5")
      .style("padding", "10px");

    toolval = tooltip.append("div");

    function mouseOver(d) {
      console.log(d);
      console.log(d3.select(".cell-"+d.year).node.nodeName)
      d3.select(".cell-"+d.year).style("stroke", "red").style("stroke-width", "3px");
    }

    function mouseOut(d) {
      d3.select(".cell-"+d.year).style("stroke", "grey").style("stroke-width", "1px");
      tooltip.style("visibility", "hidden");
    }

    function mouseMove(d) {
      tooltip
        .style("visibility", "visible")
        .style("top", d3.event.pageY - 30 + "px")
        .style("left", d3.event.pageX + 20 + "px");

      console.log(d3.mouse(this)[0]);
      tooltip
        .select("div")
        .html(
          "<strong>" +
            d.year +
            "</strong><br/> " +
            " Global Anomalies: " +
            (+d.value).toFixed(2) +
            " deg"
        );
    }

    // draw gridlines
    var grid = svg
      .append("g")
      .attr("class", "gridlines")
      .attr(
        "transform",
        "translate(" +
          (parseInt(margin.left) + (width - cols * (cellWidth + 10)) / 2) +
          "," +
          margin.top +
          ")"
      );

    var row = grid
      .selectAll(".row")
      .data(gridData)
      .enter()
      .append("g")
      .attr("class", "row");

    var column = row
      .selectAll(".cell")
      .data(function (d) {
        return d;
      })
      .enter()
      .append("rect")
      .attr("class", function (d) {
        return "cell-" + d.year;
      })
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      })
      .attr("width", function (d) {
        return d.width;
      })
      .attr("height", function (d) {
        return d.height;
      })
      .style("fill", function (d) {
        return myColor(d.value);
      })
      .style("stroke", "grey")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("mousemove", mouseMove);


    var column = row
      .selectAll(".year-label")
      .data(function (d) {
        return d;
      })
      .enter()
      .append("text")
      .attr("class", function (d) {
        return "label-" + d.year;
      })
      .attr("x", function (d) {
        return d.x + d.width / 2;
      })
      .attr("y", function (d) {
        return d.y + d.height / 2 + 5;
      })
      .style("text-anchor", "middle")
      .text(function (d) {
        return d.year;
      })
      .style("fill", "white")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("mousemove", mouseMove);

    // Legends section

    var legend = d3
      .legendColor()
      .scale(myColor)
      .shapeWidth(30)
      .cells(10)
      .orient("horizontal");

    legends = svg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          ((width + margin.right) / 2 - lPatchWidth / 2 - margin.left / 2) +
          "," +
          (height + margin.bottom - 35 - 20) +
          ")"
      )
      .call(legend);
  });
}
drawGlobal();
