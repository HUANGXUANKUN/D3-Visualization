async function drawLegend() {
  let dimensions = {
    width: window.innerWidth/5,
    height: 600,
    margin: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  };

  //   top5_fan_id = ["39", "21", "32", "47", "40"];
  //   top5_official_id = ["39", "58", "21", "11", "22"];

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const svg = d3
    .select("#legend")
    .append("svg")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );
    
  // draw legends
  symbol_x = dimensions.boundedWidth/2 - 10;
  symbol_y = dimensions.boundedHeight - 150;
  legend_text_x = symbol_x + 20;
  legend_text_y = symbol_y;
  svg
    .append("circle")
    .attr("cx", symbol_x)
    .attr("cy", symbol_y)
    .attr("r", 6)
    .style("fill", "orange");
  svg
    .append("circle")
    .attr("cx", symbol_x)
    .attr("cy", symbol_y + 30)
    .attr("r", 6)
    .style("fill", "#ff0f8f");
  svg
    .append("text")
    .attr("x", legend_text_x)
    .attr("y", legend_text_y)
    .text("Ally")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", legend_text_x)
    .attr("y", legend_text_y + 30)
    .text("Enemy")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
}

drawLegend();
