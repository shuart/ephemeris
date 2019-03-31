
setTimeout(function () {
  //displayThree(renderDTree(db))
}, 10);

// Get JSON data
function displayThree(treeData) {
// var treeData =
//   {
//     "name": "Top Level",
//     "children": [
//       {
//         "name": "Level 2: A",
//         "children": [
//           { "name": "Son of A" },
//           { "name": "Daughter of A" }
//         ]
//       },
//       { "name": "Level 2: B" }
//     ]
//   };

// panning variables
var panSpeed = 200;
var panBoundary = 20; // Within 20px from edges will pan when dragging.

// Set the dimensions and margins of the diagram

// size of the diagram
var viewerWidth = $(window).width();
var viewerHeight = $(window).height();

var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = viewerWidth - margin.left - margin.right,
    height = viewerHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#tree-container").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .call(d3.zoom().on("zoom", function () {
         svgGroup.attr("transform", d3.event.transform)
      }))
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var svgGroup = svg.append("g");

d3.select("#tree-container").call(d3.drag()
       .on("start", dragstarted)
       .on("drag", dragged)
       .on("end", dragended));

function dragstarted(d) {

 d3.select(this).raise().classed("active", true);
 if (d.x1){
          d.x1 =  d3.event.x - d.xt;
          d.y1 =  d3.event.y - d.yt;
      }else{
          d.x1 = d3.event.x;
          d.y1 = d3.event.y;
      }
 d3.event.sourceEvent.stopPropagation();
}

function dragged(d) {
 //  console.log(svgGroup.x);
 // svgGroup.x = d3.event.x
 // svgGroup.y = d3.event.y

 //svgGroup.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
 //svg.selectAll()
   // .attr("x", d.x = d3.event.x)
   // .attr("y", d.y = d3.event.y);
   svgGroup.attr("transform", "translate(" + (d3.event.x - d.x1)  + "," + (d3.event.y - d.y1) + ")");
   d.xt = d3.event.x - d.x1;
   d.yt = d3.event.y - d.y1;
}

function dragended(d) {
 d3.select(this).classed("active", false);
}

var i = 0,
    duration = 750,
    root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
//root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){
    var padd = 90
    d.y = d.depth * (210+padd)
    if (d.depth == 4) {
      d.y = (d.depth * (170+padd))
    }
  });



  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svgGroup.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 5)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svgGroup.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}
}
