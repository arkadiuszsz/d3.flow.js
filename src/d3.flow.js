(function() {

d3.flow = function(config) {
  var margin = {top:20, right:20, bottom:20, left:20};
  var width = 600;
  var height = 300;
  var nodeWidth = 120;
  var verticalGap = 10;
  var nodeFill = d3.scale.category20();

  var nodes = [];
  var links = [];
  var xScale = d3.scale.linear();
  var yScale = d3.scale.linear();
  var line = null;


  //----------------------------------------------------------------------------
  //
  // Layout
  //
  //----------------------------------------------------------------------------

  function flow(selection) {
    line = flow.link();
    
    selection.each(function(data) {
      var nodes = data.nodes;
      var links = data.links;
      
      // Update node values from links.
      var levels = [];
      var maxNodesPerLevel = 0;
      nodes.forEach(function(node) {
        if(!levels[node.depth]) levels[node.depth] = {value:0, count:0};

        // The value for the node is the sum of it's source or target links values (which ever is larger).
        node.sourceLinks = links.filter(function(link) {
          if(link.source == node.id) link.source = node;
          return link.source == node;
        });
        node.targetLinks = links.filter(function(link) {
          if(link.target == node.id) link.target = node;
          return link.target == node;
        });
        node.index = levels[node.depth].count;
        node.offsetValue = levels[node.depth].value;
        node.value = Math.max(d3.sum(node.sourceLinks, function(d) {return d.value}), d3.sum(node.targetLinks, function(d) {return d.value}));
        
        // Add node value to it's depth.
        levels[node.depth].value += node.value;
        levels[node.depth].count++;
        maxNodesPerLevel = Math.max(maxNodesPerLevel, levels[node.depth].count);
      });
      
      // Update X scale.
      xScale.domain(d3.extent(nodes, function(d) { return d.depth; }))
        .range([0, width - margin.left - margin.right - nodeWidth]);

      // Set the Y scale and then modify the domain to adjust for spacing.
      var maxValue = d3.max(levels, function(d) { return d ? d.value : 0; });
      yScale.domain([0, maxValue])
        .range([0, height - margin.top - margin.left])
        .domain([0, maxValue + yScale.invert(verticalGap*(maxNodesPerLevel-1))]);
        
      
      // Layout nodes.
      nodes.forEach(function(node) {
        node.x = xScale(node.depth);
        node.y = yScale(node.offsetValue) + (verticalGap * node.index);
        node.width = nodeWidth;
        node.height = yScale(node.value);
        node.fill = nodeFill(node.id);
        node.stroke = d3.rgb(node.fill).darker(2);
      });

      // Layout links.
      nodes.forEach(function(node) {
        var sy = node.y;
        node.sourceLinks.forEach(function(link) {
          link.sy = sy;
          sy += link.target.height;
        });
      });

      // Create SVG and layout everything.
      var svg = d3.select(this).append("svg");
      var g = svg.append("g");

      // Update SVG container.
      svg.attr("width", width).attr("height", height);
      g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Layout nodes.
      var node = g.selectAll(".node")
        .data(nodes)
        .enter().append("rect")
        .attr("class", "node")
        .attr("x", function(d) { return d.x })
        .attr("y", function(d) { return d.y })
        .attr("width", function(d) { return d.width })
        .attr("height", function(d) { return d.height })
        .style("fill", function(d) { return d.fill })
        .style("stroke", function(d) { return d.stroke });

      // Layout links.
      var link = g.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", line)
        .style("stroke-width", function(d) { return yScale(d.value); });
    });
  };
  
  
  //----------------------------------------------------------------------------
  //
  // Properties
  //
  //----------------------------------------------------------------------------

  flow.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _; return flow;
  };

  flow.links = function(_) {
    if (!arguments.length) return links;
    links = _; return flow;
  };

  flow.width = function(_) {
    if (!arguments.length) return width;
    width = _; return flow;
  };

  flow.height = function(_) {
    if (!arguments.length) return height;
    height = _; return flow;
  };


  flow.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = _; return flow;
  };

  flow.nodeFill = function(_) {
    if (!arguments.length) return nodeFill;
    nodeFill = _; return flow;
  };

  flow.verticalGap = function(_) {
    if (!arguments.length) return verticalGap;
    verticalGap = _; return flow;
  };


  //----------------------------------------------------------------------------
  //
  // Methods
  //
  //----------------------------------------------------------------------------

  flow.layout = function() {
    calculateNodeValues();
    return flow;
  };


  //----------------------------------------------------------------------------
  //
  // Private Methods
  //
  //----------------------------------------------------------------------------

  function calculateNodeValues(data) {
    var links
  }


  //----------------------------------------------------------------------------
  //
  // Private Classes
  //
  //----------------------------------------------------------------------------

  // Borrowed from the D3.js Sankey diagram (http://bost.ocks.org/mike/sankey).
  flow.link = function() {
    var curvature = .5;

    function link(d) {
      var dy = yScale(d.value);
      var x0 = d.source.x + d.source.width;
      var y0 = d.sy + (dy / 2);
      var x1 = d.target.x;
      var y1 = d.target.y + (dy / 2);

      var xi = d3.interpolateNumber(x0, x1);
      var x2 = xi(curvature);
      var x3 = xi(1 - curvature);
      
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_; return link;
    };

    return link;
  };

  return flow;
};

})();
