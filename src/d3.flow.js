(function() {

d3.flow = function(config) {
  var margin = {top:20, right:20, bottom:20, left:20};
  var width = 600;
  var height = 300;
  var nodeWidth = 120;
  var verticalGap = 10;

  var xScale = d3.scale.linear();
  var yScale = d3.scale.linear();


  //----------------------------------------------------------------------------
  //
  // Layout
  //
  //----------------------------------------------------------------------------

  function flow(selection) {}
    
  flow.layout = function(nodes, links) {
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
    });

    // Layout links.
    nodes.forEach(function(node) {
      var sy = node.y;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.target.height;
      });
    });
    
    links.forEach(function(link) {
      link.dy = yScale(link.value);
    });
  }
  
  
  //----------------------------------------------------------------------------
  //
  // Properties
  //
  //----------------------------------------------------------------------------

  flow.width = function(_) {
    if (!arguments.length) return width;
    width = _; return flow;
  };

  flow.height = function(_) {
    if (!arguments.length) return height;
    height = _; return flow;
  };

  flow.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _; return flow;
  };

  flow.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = _; return flow;
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



  //----------------------------------------------------------------------------
  //
  // Private Methods
  //
  //----------------------------------------------------------------------------


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
