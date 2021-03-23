async function drawLineChart() {
  // 1. Access data
  const pathToJSON = "./data/data.json";
  const data = await d3.json(pathToJSON);
  const year = '2020'
  var allGroup = [
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
    "2012",
    "2011",
    "2010",
  ]
  // let year = '2020'

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 250,
    margin: {
      top: 30,
      right: 15,
      bottom: 50,
      left: 60,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw canvas
  const drawLineGraph = (metric, index) => {

    console.log('index is ' + index)
    const yAccessor = (d) => d[metric];
    const dateParser = d3.timeParse("%Y-%m");
    const xAccessor = (d) => dateParser(d.Date);
    const splitStringByCapital = s => s.replace(/([A-Z])/g, ' $1').trim()

    // filter by year
    let dataset = data.filter(d => {
      return d.Date.includes(year)
    })

    dataset = dataset.sort((a, b) => xAccessor(a) - xAccessor(b)).slice(-24);

    // compute average value of current dataset metric
    let avg = 0;
    dataset.forEach(d => {
      avg += parseInt(d[metric])
    })
    avg = avg / dataset.length;
    console.log('avg = ' + avg)

    const wrapper = d3
      .select("#wrapper")
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .text("Value vs Date Graph");

    const bounds = wrapper
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    bounds
      .append("defs")
      .append("clipPath")
      .attr("id", "bounds-clip-path")
      .append("rect")
      .attr("width", dimensions.boundedWidth)
      .attr("height", dimensions.boundedHeight);

    const clip = bounds.append("g").attr("clip-path", "url(#bounds-clip-path)");

    // 4. Create scales

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0]);

    // Define custom value for an average value
    const cuttingPoint = yScale(avg);

    const cutting = clip
      .append("rect")
      .attr("class", "freezing")
      .attr("x", 0)
      .attr("width", d3.max([0, dimensions.boundedWidth]))
      .attr("y", cuttingPoint)
      .attr(
        "height",
        d3.max([0, dimensions.boundedHeight - cuttingPoint])
      );

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth]);

    const averageLabel = clip
      .append('text')
      .attr('x', dimensions.boundedWidth - 2)
      .attr('y', cuttingPoint)
      .attr('fill', 'black')
      .style('font-size', '0.9em')
      .style("text-anchor", "end")
      .text('mean')

    // 5. Draw data

    const lineGenerator = d3
      .line()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)));

    const line = clip
      .append("path")
      .attr("class", "line")
      .attr("d", lineGenerator(dataset));

    // 6. Draw peripherals

    const yAxisGenerator = d3.axisLeft().scale(yScale);

    const yAxis = bounds.append("g").attr("class", "y-axis").call(yAxisGenerator);

    const yAxisLabel = yAxis
      .append("text")
      .attr("class", "y-axis-label")
      .attr("x", -dimensions.boundedHeight / 2)
      .attr("y", -dimensions.margin.left + 13)
      .style("font-size", "16px")
      .html(splitStringByCapital(metric));

    const xAxisGenerator = d3.axisBottom().scale(xScale)
      // .ticks(d3.time.months, 1)//should display 1 year intervals
      .tickFormat(d3.timeFormat("%b %y"));
    // .style("font-size","10px");

    const xAxis = bounds
      .append("g")
      .attr("class", "x-axis")
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)
      .call(xAxisGenerator);

    // graph title

    const xAxisLabel = bounds
      .append('text')
      .attr('x', dimensions.boundedWidth / 2)
      .attr('y', dimensions.margin.bottom - 50)
      .attr('fill', 'black')
      .style('font-size', '1.4em')
      .style("text-anchor", "middle")
      .text(splitStringByCapital(metric) + ' (' + year + ')')



    // 7. Set up interactions

    // display a tooltip whenever a hover occurs anywhere on the chart
    const listeningRect = bounds
      .append("rect")
      // We don't need to define x or y attributes because they both default to 0 for rect elements
      .attr("class", "listening-rect")
      .attr("width", dimensions.boundedWidth)
      .attr("height", dimensions.boundedHeight)
      .on("mousemove", onMouseMove)
      .on("mouseleave", onMouseLeave);

    const tooltip = d3.select("#tooltip");

    // EXTRA CREDIT: Position a circle over the spot we're hovering over
    const tooltipCircle = bounds
      .append("circle") // Draw and then immediately hide it
      .attr("r", 4)
      .attr("stroke", "#eb5050")
      .attr("fill", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0);

    function onMouseMove() {
      const mousePosition = d3.mouse(this); // this refers to listeningRect
      // Use the .invert() method of xScale() to convert our units backward - from the range to the domain, instead of from the domain to the range (default)
      const hoveredDate = xScale.invert(mousePosition[0]);

      // Find the distance between the hovered point and a datapoint
      const getDistanceFromHoveredDate = (d) => Math.abs(xAccessor(d) - hoveredDate);

      // Use .scan() to get the index of the closest data point to our hovered date
      const closestIndex = d3.scan(
        dataset,
        (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
      );
      const closestDataPoint = dataset[closestIndex];
      const closestXValue = xAccessor(closestDataPoint);
      const closestYValue = yAccessor(closestDataPoint);

      // Use the closestXValue to set the date in our tooltip
      const formatDate = d3.timeFormat("%B, %Y");
      tooltip.select("#date").text(formatDate(closestXValue));

      // Use the closestYValue to set tooltip
      // const formatValue = (d) => `${d3.format("")(d)} Days`;
      // tooltip.select("#tooltip-total").text(formatValue(closestYValue));
      tooltip.select("#tooltip-total").text(closestDataPoint.TotalRainfallInMonth);
      tooltip.select("#tooltip-maximum").text(closestDataPoint.MaximumDailyRainfall);
      tooltip.select("#tooltip-days").text(closestDataPoint.NumberOfRainfallDay);

      // Grab the x,y position of our closest point
      const x = xScale(closestXValue) + dimensions.margin.left;
      const y = yScale(closestYValue) + dimensions.margin.top + dimensions.height * index;

      // Shift our tooltip
      tooltip.style(
        "transform",
        `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`
      );


      // Position our tooltip circle and display it
      tooltipCircle
        .attr("cx", xScale(closestXValue))
        .attr("cy", yScale(closestYValue))
        .style("opacity", 1);

      // Display our tooltip
      tooltip.style("opacity", 1);

    }
    function onMouseLeave() {
      tooltip.style("opacity", 0); // Hide our tooltip
      tooltipCircle.style("opacity", 0); // Hide our tooltip circle
    }
  }

  const metrics = [
    "TotalRainfallInMonth",
    "MaximumDailyRainfall",
    "NumberOfRainfallDay",
  ]

  metrics.forEach(drawLineGraph)
}

drawLineChart();
