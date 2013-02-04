(function() {

d3.flow = function(config) {
  var margin = {top:20, right:20, bottom:20, left:20};
  var width = 400;
  var height = 300;
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
        // The value for the node is the sum of it's source or target links values (which ever is larger).
        var sourceLinks = links.filter(function(link) { return link.source == node.id });
        var targetLinks = links.filter(function(link) { return link.target == node.id });
        node.value = Math.max(d3.sum(sourceLinks, function(d) {return d.value}), d3.sum(targetLinks, function(d) {return d.value}));

        // Add node value to it's depth.
        if(!levels[node.depth]) levels[node.depth] = {value:0};
        levels[node.depth].value += node.value;
      });
      
      // Update scales
      xScale.domain(d3.extent(nodes, function(d) { return d.depth; }))
        .range([0, width - margin.left - margin.right]);

      yScale.domain([0, d3.max(levels, function(d) { return d ? d.value : 0; })])
        .range([0, height - margin.top - margin.left]);
      
      // Create SVG and layout everything.
      var svg = d3.select(this).selectAll("svg").data([data]);
      svg.attr("width", width).attr("height", height);

      var enter = svg.enter().append("svg").append("g");
    });
  };
  
  
  //----------------------------------------------------------------------------
  //
  // Properties
  //
  //----------------------------------------------------------------------------

  chart.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return chart;
  };

  chart.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
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
