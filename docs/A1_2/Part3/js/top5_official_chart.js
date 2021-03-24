async function drawDiagram2() {
  let dimensions = {
    width: window.innerWidth / 2,
    height: 600,
    margin: {
      left: 0,
      right: 0,
      top: 30,
      bottom: 0,
    },
  };

  const small_node_r = 8;
  const big_node_r = 15;

  const wrapper_id_name = "#top5_official";
  const top5_id = ["39", "58", "21", "11", "22"];
  console.log(top5_id);
  const title = "Official Books";

  //   top5_fan_id = ["39", "21", "32", "47", "40"];
  //   top5_official_id = ["39", "58", "21", "11", "22"];

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const svg = d3
    .select(wrapper_id_name)
    .append("svg")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  svg
    .append("text")
    .attr("transform", `translate(${dimensions.boundedWidth / 2 - 50},0)`)
    .attr("x", 0)
    .attr("y", 20)
    .attr("font-size", "24px")
    .text(title);

  svg.on("click", function () {
    _restoreEdges();
    _restoreNodes();
  });

  var tip = d3
    .tip()
    .attr("class", "bio-tip")
    .direction("e")
    .offset([0, 20])
    .html(function (d) {
      var html = "";
      html += "<h1>" + d.name + "</h1>";
      html += "<p>" + d.bio + "</p>";
      return html;
    });

  svg.call(tip);

  var width = dimensions.boundedWidth,
    height = dimensions.boundedHeight;

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id(function (d) {
        return d.id;
      })
    )
    .force(
      "collide",
      d3
        .forceCollide(function (d) {
          return d.r + 15;
        })
        .iterations(16)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("y", d3.forceY(0))
    .force("x", d3.forceX(0));

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function _restoreEdges() {
    svg.selectAll("line").style("opacity", 0.7);
    svg.selectAll("line").style("stroke-width", 2);
  }

  function _restoreNodes() {
    svg.selectAll("circle").style("opacity", 1);
  }

  function _displayConnections(id) {
    // _restoreEdges();
    // _restoreNodes();

    var edges = svg.selectAll("line");

    let connectedNodeIds = new Set();
    edges.style("opacity", function (d) {
      var source = d.source.id;
      var target = d.target.id;
      if (source === id || target === id) {
        connectedNodeIds.add(source)
        connectedNodeIds.add(target)
        return 1;
      }
      else return 0.05;
    });

    edges.transition().style("stroke-width", function (d) {
      var source = d.source.id;
      var target = d.target.id;

      if (source === id || target === id) return 3.5;
      else return 0;
    });

    var allNodes = svg.selectAll("circle");
    allNodes.style("opacity", function (node){
        if (!connectedNodeIds.has(node.id)){
            return 0.05
        }
        return 1;
    })


  }


  d3.json("./data/top5_official_char.json", function (error, rawData) {
    if (error) throw error;
    console.log("official")
    console.log(rawData);

    var nodes = rawData["nodes"].map((d) => {
      let new_d = d;
      if (top5_id.includes(d.id)) {
        new_d.r = big_node_r;
      } else {
        new_d.r = small_node_r;
      }
      return new_d;
    });

    var graph = {
      nodes: nodes,
      links: rawData.links,
    };

    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line")
      .style("opacity", 0.7)
      .attr("stroke-width", "2")
      .attr("stroke", function (d) {
        if (d.type == "+") {
          return "orange";
        } else {
          return "#ff0f8f";
        }
      });

    //   .attr("stroke-width", function (d) {
    //     return 1;
    //     // return Math.sqrt(d.value);
    //   });

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("g")
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .on("click", function (d) {
        console.log("clicked on");
        console.log(d);
        _displayConnections(d.id);
        d3.event.stopPropagation();
      });

    var circles = node
      .append("circle")
      .attr("r", (d) => {
        return d.r;
      })
      .attr("fill", function (d) {
        if (top5_id.includes(d.id)) {
          return "#09998d";
        } else {
          return "#4349bf";
        }
      })
      
    var lables = node
      .append("text")
      .text(function (d) {
        if (top5_id.includes(d.id)) {
          return d.name;
        } else return "";
      })
      .attr("x", big_node_r)
      .attr("y", big_node_r / 2);

    node.append("title").text(function (d) {
      return d.id;
    });

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    function ticked() {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  });
}

drawDiagram2();
