async function drawLineChart() {

  // 1. Access data
  const pathToJSON = "./data/data.json"
  let dataset = await d3.json(pathToJSON)

  // filter by year
  dataset = dataset.filter(d => {
    return d.Date.includes('2020') || d.Date.includes('2019')
  })

  const yAccessor = d => d.TotalRainfallInMonth
  const dateParser = d3.timeParse("%Y-%m-%d")
  const dateParser_m = d3.timeParse("%Y-%m")
  const dateFormatter = d3.timeFormat("%Y-%m-%d")
  const xAccessor = d => dateParser_m(d.Date)
  dataset = dataset.sort((a, b) => xAccessor(a) - xAccessor(b))
  const downsampledData = downsampleData(dataset, xAccessor, yAccessor)
  const months = d3.timeMonths(xAccessor(dataset[0]), xAccessor(dataset[dataset.length - 1]))

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  const defs = bounds.append("defs")

  // 4. Create scales

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

  const xScale = d3.scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])

  // create grid marks
  const yAxisGeneratorGridMarks = d3.axisLeft(yScale)
    .ticks()
    .tickSize(-dimensions.boundedWidth)
    .tickFormat("")

  // 5. Draw data
  const seasonBoundaries = [
    "3-20", // Spring starts on March 20th of every year
    "6-21", // Summer starts on June 21st of every year
    "9-21", // Fall starts on September 21st of every year
    "12-21",  // Winter starts on December 21st of every year
  ]

  // Season name here correlates to the appropriate start date in seasonBoundaries
  const seasonNames = ["Spring", "Summer", "Fall", "Winter"]
  let seasonsData = []

  // Identify the start and end dates of our dataset
  const startDate = xAccessor(dataset[0])
  // Mon May 21 2018 00:00:00 GMT-0700 (Pacific Daylight Time)

  const endDate = xAccessor(dataset[dataset.length - 1])
  // Mon May 20 2019 00:00:00 GMT-0700 (Pacific Daylight Time)

  // Identify specific years contained within our dataset
  const years = d3.timeYears(d3.timeMonth.offset(startDate, -13), endDate)
  // Mon Jan 01 2018 00:00:00 GMT-0800 (Pacific Standard Time),Tue Jan 01 2019 00:00:00 GMT-0800 (Pacific Standard Time)

  years.forEach(yearDate => { // For each year in our dataset
    const year = +d3.timeFormat("%Y")(yearDate) // 2019

    // For each of our defined season boundaries
    seasonBoundaries.forEach((boundary, index) => {
      // Identify the start and end of our season for the year
      const seasonStart = dateParser(`${year}-${boundary}`)
      // Tue Mar 20 2018 00:00:00 GMT-0700 (Pacific Daylight Time)

      const seasonEnd = seasonBoundaries[index + 1] ?
        dateParser(`${year}-${seasonBoundaries[index + 1]}`) :
        dateParser(`${year + 1}-${seasonBoundaries[0]}`)
      // Thu Jun 21 2018 00:00:00 GMT-0700 (Pacific Daylight Time)

      // Which is greater? Our dataset start date, or the start of the season for the year?
      const boundaryStart = d3.max([startDate, seasonStart])
      // Mon May 21 2018 00:00:00 GMT-0700 (Pacific Daylight Time)

      // Which is greater? Our dataset end date, or the end of the season for the year?
      const boundaryEnd = d3.min([endDate, seasonEnd])
      // Thu Jun 21 2018 00:00:00 GMT-0700 (Pacific Daylight Time)

      // Identify the days in our dataset that match this season's boundary
      const days = dataset.filter(d => xAccessor(d) > boundaryStart && xAccessor(d) <= boundaryEnd)
      if (!days.length) return
      seasonsData.push({
        start: boundaryStart,
        end: boundaryEnd,
        name: seasonNames[index],
        mean: d3.mean(days, yAccessor),
      })
    })
  })

  const seasonOffset = 10
  const seasons = bounds.selectAll(".season")
    .data(seasonsData)
    .enter().append("rect")
    .attr("x", d => xScale(d.start))
    .attr("width", d => xScale(d.end) - xScale(d.start))
    .attr("y", seasonOffset)
    .attr("height", dimensions.boundedHeight - seasonOffset)
    .attr("class", d => `season ${d.name}`)

  // draw the line
  const areaGenerator = d3.area()
    .x(d => xScale(xAccessor(d)))
    .y0(dimensions.boundedHeight / 2)
    .y1(d => yScale(yAccessor(d)))
    .curve(d3.curveBasis)

  // Even though we're drawing a smooth line, let's add the original data points in as small dots
  const dots = bounds.selectAll(".dot")
    .data(dataset)
    .enter().append("circle")
    .attr("cx", d => xScale(xAccessor(d)))
    .attr("cy", d => yScale(yAccessor(d)))
    .attr("r", 4)
    .attr("class", "dot")

  const lineGenerator = d3
    // .area()
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))
  // Let's create a smoother curved line instead of a jagged one

  // .curve(d3.curveBasis)

  const line = bounds.append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(dataset))


  // 6. Draw peripherals
  const seasonMeans = bounds.selectAll(".season-mean")
    .data(seasonsData)
    .enter().append("line")
    .attr("x1", d => xScale(d.start))
    .attr("x2", d => xScale(d.end))
    .attr("y1", d => yScale(d.mean))
    .attr("y2", d => yScale(d.mean))
    .attr("class", "season-mean")
  const seasonMeanLabel = bounds.append("text")
    .attr("x", -15)
    .attr("y", yScale(seasonsData[0].mean))
    .attr("class", "season-mean-label")
    .text("Season mean")

  const seasonLabels = bounds.selectAll(".season-label")
    .data(seasonsData)
    .enter().append("text")
    .filter(d => xScale(d.end) - xScale(d.start) > 60)
    .attr("x", d => xScale(d.start) + ((xScale(d.end) - xScale(d.start)) / 2))
    .attr("y", dimensions.boundedHeight + 40)
    .text(d => `${d.name} ${d3.timeFormat("%y")(d.end)}`) // Season name with year (e.g. "Spring 2018")
    .attr("class", "season-label")

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    // Simply our y axis so that we only see three tick marks for simplicity
    .ticks(3)

  const yAxis = bounds.append("g")
    .attr("class", "y-axis")
    .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
    .attr("y", -dimensions.margin.left + 10)
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("class", "y-axis-label")
    .text("Monthly Rainfall (mm)")

  // Add an inline Y axis label instead of having hard to read rotated text on the left side of our chart
  const yAxisLabelSuffix = bounds.append("text")
    // Pick a nice Y position to display our inline label
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", -3)
    .attr('fill', 'black')
    .style('font-size', '1.4em')
    .style("text-anchor", "middle")
    .text("Total monthly rainfall (mm) in Singapore 2019-2020")
    .attr("class", "y-axis-label y-axis-label-suffix")

  // Remove x axis tick marks so we can just display our season names
  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    .tickFormat(d3.timeFormat("%b %y"))
    .ticks()
  // .ticks(d3.time.months)

  const xAxis = bounds.append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator)

  // legend

  // "3-20", // Spring starts on March 20th of every year
  // "6-21", // Summer starts on June 21st of every year
  // "9-21", // Fall starts on September 21st of every year
  // "12-21",  // Winter starts on December 21st of every year


  const legend_x = dimensions.width - 200
  const legend_text_x = legend_x + 20
  const legend_y = dimensions.height + 50
  wrapper.append("circle").attr("cx", legend_x).attr("cy", legend_y).attr("r", 6).style("fill", "#36ad48")
  wrapper.append("circle").attr("cx", legend_x).attr("cy", legend_y + 20).attr("r", 6).style("fill", "#d44317")
  wrapper.append("circle").attr("cx", legend_x).attr("cy", legend_y + 40).attr("r", 6).style("fill", "#857f07")
  wrapper.append("circle").attr("cx", legend_x).attr("cy", legend_y + 60).attr("r", 6).style("fill", "#337bd4")

  wrapper.append("text").attr("x", legend_text_x).attr("y", legend_y).text("Spring:").style("font-size", "15px").attr("alignment-baseline", "middle")
  wrapper.append("text").attr("x", legend_text_x).attr("y", legend_y + 20).text("Summer:").style("font-size", "15px").attr("alignment-baseline", "middle")
  wrapper.append("text").attr("x", legend_text_x).attr("y", legend_y + 40).text("Fall:").style("font-size", "15px").attr("alignment-baseline", "middle")
  wrapper.append("text").attr("x", legend_text_x).attr("y", legend_y + 60).text("Winter").style("font-size", "15px").attr("alignment-baseline", "middle")

  wrapper.append("text").attr("x", legend_text_x+ 65).attr("y", legend_y).text("20th Mar").style("font-size", "14px").attr("alignment-baseline", "middle")
  wrapper.append("text").attr("x", legend_text_x+ 65).attr("y", legend_y + 20).text("21st June").style("font-size", "14px").attr("alignment-baseline", "middle")
  wrapper.append("text").attr("x", legend_text_x+ 65).attr("y", legend_y + 40).text("21st Sep").style("font-size", "14px").attr("alignment-baseline", "middle")
  wrapper.append("text").attr("x", legend_text_x+ 65).attr("y", legend_y + 60).text("21st Dec").style("font-size", "14px").attr("alignment-baseline", "middle")

}
drawLineChart()

// Let's cut down on the noisiness of our daily data points. This function allows us to pass in our dataset, xAccessor, and yAccessors so that we can receive a downsampled dataset with weekly values instead of daily values.
function downsampleData(data, xAccessor, yAccessor) {
  const months = d3.timeMonths(xAccessor(data[0]), xAccessor(data[data.length - 1]))

  return months.map((month, index) => {
    const monthEnd = months[index + 1] || new Date()
    const days = data.filter(d => xAccessor(d) > month && xAccessor(d) <= monthEnd)
    return {
      date: d3.timeFormat("%Y-%m-%d")(month),
      rainfall: d3.mean(days, yAccessor),
    }
  })
}