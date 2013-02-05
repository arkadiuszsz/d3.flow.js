(function() {

d3.flow = function(config) {
  var margin = {top:20, right:20, bottom:20, left:20};
  var width = 400;
  var height = 300;
  var nodeWidth = 18;
  var verticalGap = 20;
  var maxNodesPerLevel = 5;

  var nodes = [];
  var links = [];
  var xScale = d3.scale.linear();
  var yScale = d3.scale.linear();

  //----------------------------------------------------------------------------
  //
  // Layout
  //
  //----------------------------------------------------------------------------

  function chart(selection) {
    selection.each(function(data) {
      var nodes = data.nodes;
      var links = data.links;
      
      // Update node values from links.
      var levels = [];
      nodes.forEach(function(node) {
        if(!levels[node.depth]) levels[node.depth] = {value:0, count:0};

        // The value for the node is the sum of it's source or target links values (which ever is larger).
        var sourceLinks = links.filter(function(link) { return link.source == node.id });
        var targetLinks = links.filter(function(link) { return link.target == node.id });
        node.index = levels[node.depth].count;
        node.offsetValue = levels[node.depth].value;
        node.value = Math.max(d3.sum(sourceLinks, function(d) {return d.value}), d3.sum(targetLinks, function(d) {return d.value}));
        
        // Add node value to it's depth.
        levels[node.depth].value += node.value;
        levels[node.depth].count++;
      });
      
      // Update scales
      xScale.domain(d3.extent(nodes, function(d) { return d.depth; }))
        .range([0, width - margin.left - margin.right]);

      yScale.domain([0, d3.max(levels, function(d) { return d ? d.value : 0; })])
        .range([0, height - margin.top - margin.left]);
      
      // Layout nodes.
      nodes.forEach(function(node) {
        node.x = xScale(node.depth);
        node.y = yScale(node.offsetValue) + (verticalGap * node.index);
        node.width = nodeWidth;
        node.height = yScale(node.value);
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
    });
  };
  
  
  //----------------------------------------------------------------------------
  //
  // Properties
  //
  //----------------------------------------------------------------------------

  chart.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _; return chart;
  };

  chart.links = function(_) {
    if (!arguments.length) return links;
    links = _; return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _; return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _; return chart;
  };


  chart.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = _; return chart;
  };

  chart.verticalGap = function(_) {
    if (!arguments.length) return verticalGap;
    verticalGap = _; return chart;
  };


  //----------------------------------------------------------------------------
  //
  // Methods
  //
  //----------------------------------------------------------------------------

  chart.layout = function() {
    calculateNodeValues();
    return chart;
  };


  //----------------------------------------------------------------------------
  //
  // Private Methods
  //
  //----------------------------------------------------------------------------

  function calculateNodeValues(data) {
    var links
  }

  return chart;
};

})();
