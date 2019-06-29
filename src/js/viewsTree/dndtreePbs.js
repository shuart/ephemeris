
var savedTree = undefined
var demoData =
  {
    "name": "My Project Name",
    "uuid":"efefsefe",
    "children": [
      {
        "name": "Sub Item A",
        "uuid":"sdsds",
        "children": [
          { "name": "Sub sub item AA", "uuid":"ssefraaaa" },
          { "name": "Sub sub item AB", "uuid":"t5tre5er5" }
        ]
      },
      { "name": "Sub Item B", "uuid":"apaapapa" }
    ]
  };

// Get JSON data
function displayThree({
  fullscreen = true,
  data=demoData,
  edit= false,
  startCollapsed=false,
  onClose = (e)=>{console.log("tree closed", e.data)},
  onEdit = (e)=>{console.log("Node Edited", e.data)},
  onLabelClicked = (e)=>{console.log("Label clicked", e.data)},
  onStoreUpdate = (e)=>{console.log("StoreUpdated", e)},
  onMove = (e)=>{console.log("Node moved", e.data)},
  onRemove = (e)=>{console.log("Node removed", e.data)},
  onAdd = (e)=>{console.log("Node removed", e.data)}
} ={}) {

  var self={}
  var treeData = data
  var sourceEl;
  var options={}

  var base
  var svg
  var nodes;

  var root;
  var treemap;

  var mode = "default";
  var dragging = false;
  var draggingSelected = undefined;
  var draggingElement = undefined;
  var draggingTimmer = 0;
  var draggingTimmerNow = 0;
  var lastHoover;

  // Set the dimensions and margins of the diagram

  // size of the diagram
  var viewerWidth;
  var viewerHeight;

  var margin;
  var width;
  var height;

  var updateCurrentTree = undefined



  function init() {

    //prepare render area
    var mainEl = document.createElement('div');
    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "99999"
    mainEl.style.backgroundColor = "white"
    if (fullscreen) {
      sourceEl = document.createElement('div');
      sourceEl.style.height = "100%";
      //fullscreen rules
      mainEl.classList ="ui current-tree-container"
      mainEl.style.padding = "0.5em"
      mainEl.style.width = "100%"
      mainEl.style.height = "100%"
      mainEl.style.left= "0px";
    }
    // size of the diagram
    viewerWidth = $(window).width();
    viewerHeight = $(window).height();

    margin = {top: 20, right: 90, bottom: 30, left: 90};
    width = viewerWidth - margin.left - margin.right;
    height = viewerHeight - margin.top - margin.bottom;

    sourceEl.appendChild(mainEl)
    document.body.appendChild(sourceEl)


    //add controls
    if (edit) {
      document.querySelector(".current-tree-container").insertAdjacentHTML('afterbegin',
              ` <div class="">
                <button class="action_set_mm_collapse ui tiny basic  button" type="button" name="button">Collapse</button>
                <button class="action_set_mm_uncollapse ui tiny basic  button" type="button" name="button">Un-collapse</button>
                <button class="action_set_pbs_close ui tiny basic red button" type="button" name="button">close</button>
                </div>`
              );
    }else {
      document.querySelector(".current-tree-container").insertAdjacentHTML('afterbegin',
              ` <div class="">
                <button class="action_set_pbs_close ui tiny basic red button" type="button" name="button">close</button>
                </div>`
              );
    }

    connect()
    updateAll()
  }

  function connect() {
    var updateOnStoreChange = function () {
      onStoreUpdate({sourceTree:self})
    }
    document.addEventListener('storeUpdated', updateOnStoreChange, false)

    d3.select(".action_set_pbs_add").on("click", function(d) { mode = "add"; })
    d3.select(".action_set_pbs_remove").on("click", function(d) { mode = "remove"; })
    d3.select(".action_set_pbs_close").on("click", function(d) {
      document.removeEventListener('storeUpdated', updateOnStoreChange, false)
      onClose({})
      sourceEl.remove()
    })
  }

  function render() {
  }
  function updateAll() {
    render()
  }

  function datizeNode(d) {
    return {name:d.data.name||d.name, uuid:d.data.uuid, children:d.data.children}
  }


  //RENDER TODO move to scope
  init()
  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var container = d3.select(".current-tree-container")
    //   .attr("width", width + margin.right + margin.left)
    //   .attr("height", height + margin.top + margin.bottom)
    //   .call(d3.zoom().on("zoom", function () {
    //        svgGroup.attr("transform", d3.event.transform)
    //     }))
    // .append("g")
    //   .attr("transform", "translate("
    //         + margin.left + "," + margin.top + ")");

  // var svgGroup = svg.append("g");
  // var svg = d3.select(".current-tree-container").append("svg")
  //     .attr("width", width + margin.right + margin.left)
  //     .attr("height", height + margin.top + margin.bottom)
  //     .call(d3.zoom().on("zoom", function () {
  //          svgGroup.attr("transform", d3.event.transform)
  //       }))
  //   .append("g")
  //     .attr("transform", "translate("
  //           + margin.left + "," + margin.top + ")");
  //
  // var svgGroup = svg.append("g");

  renderTreeView(data, container)

  function renderTreeView(treeData, target) {
        updateCurrentTree = update
        // Calculate total nodes, max label length
        var totalNodes = 0;
        var maxLabelLength = 00;
        // variables for drag/drop
        var selectedNode = null;
        var draggingNode = null;
        // panning variables
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.
        // Misc. variables
        var i = 0;
        var duration = 750;
        root = d3.hierarchy(treeData, function(d) { return d.children; });
        // size of the diagram
        var viewerWidth = $(document).width();
        var viewerHeight = $(document).height();

        var treemap;
        //var tree = d3.tree().size([viewerHeight, viewerWidth]);

        // A recursive helper function for performing some setup by walking through all nodes
        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;
            visitFn(parent);
            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[i], visitFn, childrenFn);
                }
            }
        }

        // Call visit function to establish maxLabelLength
        visit(treeData, function(d) { totalNodes++;
                                      maxLabelLength = Math.max(d.name.length, maxLabelLength); },
    							      function(d) { return d.children && d.children.length > 0 ? d.children : null; });
        // sort the tree according to the node names
        function sortTree() {
            //tree.sort(function(a, b) {
            //    return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
            //});
        }
        // Sort the tree initially incase the JSON isn't in a sorted order.
        sortTree();
        // TODO: Pan function, can be better implemented.
        function pan(domNode, direction) {
            var speed = panSpeed;
            if (panTimer) {
                clearTimeout(panTimer);
                translateCoords = d3.transform(svgGroup.attr("transform"));
                if (direction == 'left' || direction == 'right') {
                    translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                    translateY = translateCoords.translate[1];
                } else if (direction == 'up' || direction == 'down') {
                    translateX = translateCoords.translate[0];
                    translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
                }
                scaleX = translateCoords.scale[0];
                scaleY = translateCoords.scale[1];
                scale = zoomListener.scale();
                svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                zoomListener.scale(zoomListener.scale());
                zoomListener.translate([translateX, translateY]);
                panTimer = setTimeout(function() {
                    pan(domNode, speed, direction);
                }, 50);
            }
        }
        // Define the zoom function for the zoomable tree
        function zoom() {
    			if(d3.event.transform != null) {
            svgGroup.attr("transform", d3.event.transform );
    			}
        }
    		// Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
      /*  function centerNode(source) {
            //scale = zoomListener.scale();
    				t = d3.zoomTransform(baseSvg.node());
            x = -source.y0;
            y = -source.x0;
            x = x * t.k + viewerWidth / 2;
            y = y * t.k + viewerHeight / 2;
            //d3.select('g').transition().duration(duration).attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    				d3.select('g').transition().duration(duration).call( zoomListener.transform, d3.zoomIdentity.translate(x,y).scale(t.k) );
            //zoomListener.scale(scale);
            //zoomListener.translate([x, y]);
        }*/
        function centerNode(source) {
          // t = d3.zoomTransform(baseSvg.node());
          // x = -source.y0;
          // y = -source.x0;
          // x = x * t.k + viewerWidth / 2;
          // y = y * t.k + viewerHeight / 2;
          // d3.select('svg').transition().duration(duration)
          //                              .call( zoomListener.transform, d3.zoomIdentity.translate(x,y).scale(t.k) );
        }
        function centerOnRoot() {//TODO viewer size is not correct. TBC at startup
          t = d3.zoomTransform(baseSvg.node());
          x = -400;
          y = -600;
          x = x * t.k + viewerWidth / 2;
          y = y * t.k + viewerHeight / 2;
          d3.select('svg').transition().duration(duration)
                                       .call( zoomListener.transform, d3.zoomIdentity.translate(x,y).scale(t.k) );
        }
        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
        function initiateDrag(d, domNode) {
            draggingNode = d;
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
            d3.select(domNode).attr('class', 'node activeDrag');

            svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
                if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
                else return -1; // a is the hovered element, bring "a" to the front
            });
            // if nodes has children, remove the links and nodes
            // if (nodes.length > 1) {
            //     // remove link paths
            //     var treeData = treemap(nodes);
            //     // Compute the new tree layout.
            //     links = treeData.descendants().slice(1);
            //     nodePaths = svgGroup.selectAll("path.link").data(links, function(d) { return d.id; }).remove();
            //     // remove child nodes
            //     nodesExit = svgGroup.selectAll("g.node").data(nodes, function(d) { return d.id; })
    				// 		                                        .filter(function(d, i) { if (d.id == draggingNode.id) {
            //                                                                        return false;
            //                                                                      }
            //                                                                        return true;
            //                                                                      }).remove();
            // }
            // // remove parent link
            // parentLink = tree.links(tree.nodes(draggingNode.parent));
            // svgGroup.selectAll('path.link').filter(function(d, i) { if (d.id == draggingNode.id) {
            //                                                           return true;
            //                                                         }
            //                                                           return false;
            //                                                       }).remove();

            dragStarted = null;
        }

        // define the baseSvg, attaching a class for styling and the zoomListener
        var baseSvg = target.append("svg").attr("width", viewerWidth)
                                                                .attr("height", viewerHeight)
                                                                .attr("class", "mindmap_overlay")
                                                                .call(zoomListener);

        // Define the drag listeners for drag/drop behaviour of nodes.
        dragListener = d3.drag()
        .on("start", function(d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            var treeData = treemap(d);
            nodes = treeData.descendants()
            d3.event.sourceEvent.stopPropagation();
                // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
            })
            .on("drag", function(d) {
                if (d == root) {
                    return;
                }
                if (dragStarted) {
                    domNode = this;
                    initiateDrag(d, domNode);
                }
                // console.log(domNode);

                // get coords of mouseEvent relative to svg container to allow for panning
                relCoords = d3.mouse($('svg').get(0));
                if (relCoords[0] < panBoundary) {
                    panTimer = true;
                    pan(this, 'left');
                } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                    panTimer = true;
                    pan(this, 'right');
                } else if (relCoords[1] < panBoundary) {
                    panTimer = true;
                    pan(this, 'up');
                } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                    panTimer = true;
                    pan(this, 'down');
                } else {
                    try {
                        clearTimeout(panTimer);
                    } catch (e) {

                    }
                }

                d.x0 += d3.event.dy;
                d.y0 += d3.event.dx;
                var node = d3.select(this);
                node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
                updateTempConnector();
                console.log(d);
                console.log(selectedNode);
            }).on("end", function(d) {
                if (d == root) {
                    return;
                }
                domNode = this;
                console.log(selectedNode);
                if (selectedNode) {
                    // now remove the element from the parent, and insert it into the new elements children
                    var index = draggingNode.parent.children.indexOf(draggingNode);
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }
                    if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                            selectedNode.children.push(draggingNode);
                        } else {
                            selectedNode._children.push(draggingNode);
                        }
                    } else {
                        selectedNode.children = [];
                        selectedNode.children.push(draggingNode);
                    }
                    // Make sure that the node being added to is expanded so user can see added node is correctly moved
                    expand(selectedNode);
                    sortTree();
                    lastHoover = selectedNode
                    if (confirm("Move selected nodes?")) {
                      sendEndDragInfos();
                    }
                    endDrag();//todo not working without new exteral data . Parent is not ok.

                } else {
                    endDrag();
                }
            });

        function endDrag() {

            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
            d3.select(domNode).attr('class', 'node');
            // now restore the mouseover event or we won't be able to drag a 2nd time
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');

            updateTempConnector();

            if (draggingNode !== null) {
                update(root);
                centerNode(draggingNode);
                draggingNode = null;
            }
        }

        // Helper functions for collapsing and expanding nodes.

        function labelClicked(d) {
          if (d3.event.defaultPrevented) return; // click suppressed
          console.log(onLabelClicked);
          onLabelClicked({element:d,sourceTree:self, target:d3.event.target})
          console.log(d);
          update(root)
        }

        function removeNode(d){
          onRemove({element:d,sourceTree:self, target:d3.event.target})
        }

        // Click on helper
        function clickHelper(d) {
          if (true) {
            onAdd({element:d,sourceTree:self, target:d3.event.target})
            console.log(store.currentPbs.items);
          }
        }

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d.children.forEach(expand);
                d._children = null;
            }
        }

        var overCircle = function(d) {
            selectedNode = d;
            updateTempConnector();
        };
        var outCircle = function(d) {
            selectedNode = null;
            updateTempConnector();
        };

        // Function to update the temporary connector indicating dragging affiliation
        var updateTempConnector = function() {
            var data = [];
            console.log("updateTempConnector");
            console.log(draggingNode);
            console.log(selectedNode);
            if (draggingNode !== null && selectedNode !== null) {
                // have to flip the source coordinates since we did this for the existing connectors on the original tree
                data = [{
                    source: {
                        x: draggingNode.x0,
                        y: draggingNode.y0
                    },
                    target: {
                        x: selectedNode.x0,
                        y: selectedNode.y0
                    }
                }];
            }

            var link = svgGroup.selectAll("path.templink").data(data)
            link.enter().append("path").attr("class", "templink").attr("stroke", "#00b5ad")

            link.attr("d", function(d) {
              var s = {x: d.source.x, y: d.source.y };
              var d = {x: d.target.x, y: d.target.y };
              return diagonal(s, d);
                                   });

            link.exit().remove();
        };
        var sendEndDragInfos = function() {
            console.log("Sendendrag");
            console.log(draggingNode);
            console.log(selectedNode);
            if (draggingNode !== null && selectedNode !== null) {
              onMove({element:draggingNode, newParent: selectedNode,sourceTree:self, target:d3.event.target})
            }
        };

    		/*
        // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
        function centerNode(source) {
            scale = zoomListener.scale();
            x = -source.y0;
            y = -source.x0;
            x = x * scale + viewerWidth / 2;
            y = y * scale + viewerHeight / 2;
            d3.select('g').transition().duration(duration).attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
        } */

        // Toggle children function

        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            return d;
        }

        // Toggle children on click.

        function click(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            update(d);
            centerNode(d);
        }

    		// Erzeugen geschwungene Linie vom Eltern- zum Kind-Knoten
    		function diagonal(s, d) {
    			/* The original from d3noob is not working in IE11!
    			//https://bl.ocks.org/d3noob
    			path = `M ${s.y} ${s.x}
    					C ${(s.y + d.y) / 2} ${s.x},
    					${(s.y + d.y) / 2} ${d.x},
    					${d.y} ${d.x}`
    			*/
    			if(s != null &&
    			   d != null) {
    			  var path = "M " + s.y + " " + s.x
    				     		+ " C " + (( s.y + d.y ) / 2) + " " + s.x + ","
    						    + (( s.y + d.y ) / 2) + " " + d.x + ","
    						    + " " + d.y + " " + d.x;

    			  return path;
    			}
    		}

        function update(source) {
            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more consistent.
            var levelWidth = [1];
            var childCount = function(level, n) {

                if (n.children && n.children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);

                    levelWidth[level + 1] += n.children.length;
                    n.children.forEach(function(d) {
                        childCount(level + 1, d);
                    });
                }
            };
            childCount(0, root);
            var newHeight = d3.max(levelWidth) * 50; // 25 pixels per line
            // Baum-Layout erzeugen und die Größen zuweisen
    		    treemap = d3.tree().size([newHeight, viewerWidth]);
    				// Berechnung x- und y-Positionen pro Knoten
    		    var treeData = treemap(root);
            // Compute the new tree layout.
            nodes = treeData.descendants();
    		    var links = treeData.descendants().slice(1);

            // Set widths between levels based on maxLabelLength.
            nodes.forEach(function(d) {
                // d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
                // alternatively to keep a fixed scale one can set a fixed depth per level
                // Normalize for fixed-depth by commenting out below line
                d.y = (d.depth * 250); //500px per level.
            });
            // Update the nodes…
            node = svgGroup.selectAll("g.node").data(nodes, function(d) { return d.id || (d.id = ++i); });
            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g").call(dragListener)
                                        .attr("class", "node")
                                        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

            nodeEnter.append("circle").attr('class', 'nodeCircle')
                                      //.attr("r", 0)
                                      .attr("r", 4.5)
                                      .on('click', click)
                                      .style("fill", function(d) { return d._children ? "#00b5ad" : "#fff"; });

            nodeEnter.append("text").attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                                    .attr("dy", ".35em")
                                    .attr('class', 'nodeText')
                                    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                                    .text(function(d) { return d.data.name; })
                                    .style("fill-opacity", 0)
                                    .on("click", labelClicked);

            // phantom node to give us mouseover in a radius around it
            nodeEnter.append("circle").attr('class', 'ghostCircle')
                                      .attr("r", 30)
                                      .attr("opacity", 0.2) // change this to zero to hide the target area
                                      .style("fill", "#00b5ad")
                                      .attr('pointer-events', 'mouseover')
                                      .on("mouseover", function(node) { overCircle(node); })
                                      .on("mouseout", function(node) { outCircle(node); });

            // Add plus sign for the nodes
            nodeEnter.append('circle')
                .attr("cy", "1em")
                .attr('class', 'plus')
                .attr('r', 1e-6)
                .attr('r', 2)
                .style("fill", "grey")
                .style("opacity", "0.3")
                .on('click',clickHelper );

            // Add minus sign for the nodes
            nodeEnter.append('circle')
                .attr("cy", "1em")
                .attr("cx", "0.5em")
                .attr('class', 'minus')
                .attr('r', 1e-6)
                .attr('r', 2)
                .style("fill", "red")
                .style("stroke", "red")
                .style("opacity", "0.3")
                .on('click', removeNode);

            // Update the text to reflect whether node has children or not.
            node.select('text').attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                               .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                               .text(function(d) { return d.data.name; });
            // Change the circle fill depending on whether it has children and is collapsed
            node.select("circle.nodeCircle").attr("r", 4.5).style("fill", function(d) { return d._children ? "#00b5ad" : "#fff"; });
            // Transition nodes to their new position.
    				var nodeUpdate = nodeEnter.merge(node);
    				nodeUpdate.transition().duration(duration).attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
            // Fade the text in
            nodeUpdate.select("text").style("fill-opacity", 1);
            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) { return "translate(" + source.y + "," + source.x +")";}).remove();
            nodeExit.select("circle").attr("r", 0);
            nodeExit.select("text").style("fill-opacity", 0);
            // Update the links…
            var link = svgGroup.selectAll("path.link").data(links, function(d) { return d.id; });
            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert("path", "g").attr("class", "link")
                                                            .attr("d", function(d) { var o = { x: source.x0, y: source.y0 };
    																																								 return diagonal(o, o); })
            // Transition links to their new position.
    				var linkUpdate = linkEnter.merge(link);
            linkUpdate.transition().duration(duration).attr('d', function(d){ return diagonal(d, d.parent) });
            // Transition exiting nodes to the parent's new position.
            var linkExit = link.exit().transition().duration(duration).attr("d", function(d) { var o = { x: source.x, y: source.y };
                                                                                               return diagonal(o, o); })
                                                       .remove();
            // Stash the old positions for transition.
            nodes.forEach(function(d) { d.x0 = d.x;
                                        d.y0 = d.y; });
        }

        // Append a group which holds all nodes and which the zoom Listener can act upon.
        var svgGroup = baseSvg.append("g");
        // svgGroup.attr("transform", "translate(" + 200 + "," + 200 + ")");//set base position

        // Define the root
        //root = treeData;
    		//root = d3.hierarchy(treeData, function(d) { return d.children; });
        root.x0 = viewerHeight / 2;
        root.x0 = 200;
        root.y0 = 50;

        // Layout the tree initially and center on the root node.
        update(root);
        centerOnRoot()
        // centerNode(root);

        //Connect to main top_buttons
        d3.select(".action_set_mm_collapse").on("click", function(d) {
          nodes.forEach(function(d) { collapse(d); });
          update(root)
        })
        d3.select(".action_set_mm_uncollapse").on("click", function(d) {
          nodes.forEach(function(d) { expand(d); });
          update(root)
        })
    }

  function updateFromRoot(d) {
    if (d) {
      update(d)
    }else {
      update(root)
    }
  }
  function hardUpdate(d) {
    if (d) {
      update(d,true)
    }else {
      update(root,true)
    }
  }
  function setData(newData) {
    treeData=newData
    root = d3.hierarchy(treeData, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;
    console.log(treeData);
    console.log(root);
    console.log(lastHoover);
    updateCurrentTree(lastHoover || root)
  }

  self.updateFromRoot=updateFromRoot
  self.setData=setData
  self.hardUpdate=hardUpdate
  return self
}

//helper FUNCTIONS
function hierarchiesList(originalItemsArray, linksArray) {
  var newList = [];
  var itemArray = JSON.parse(JSON.stringify(originalItemsArray))

  function getById(array, uuid) {
    var item = array.filter((item)=>{
      return item.uuid == uuid
    })
    if (item[0]) { return item[0]} else { return undefined}
  }

  function hasParent(source) {
    var relatedLink = linksArray.filter((item)=>{
      return item.target == source.uuid
    })
    if (relatedLink[0]) {
      console.log("has parent");
      return relatedLink[0].source
    }
    return undefined

  }

  function addHierarchElement(array) {
    for (var i = 0; i < array.length; i++) {
      var item = array[i]
      var parentId = hasParent(item)
      if (parentId) {
        //move element to parent
        var parent = getById(array,parentId)
        if (!parent.children) {
          parent.children = []
        }
        //mark item to future remove element from main demoArray
        item.parent = parentId;
        //link to correct item
        parent.children.push(item)
        //array.splice(i, 1);
        console.log(array);
      }
    }
  }

  addHierarchElement(itemArray)
  var newitemArray = itemArray.filter((item)=>!item.parent)
  console.log(newitemArray);
  return newitemArray
}

function flattenChildArray(data, childrenProp) {
  var oData = data;
  var flatElements = [];
  var links = [];

  function addFlatElement(sourceArray,target, parent) {
    for (var i = 0; i < sourceArray.length; i++) {
      var newElement = {}
      if (parent) { //create a link with the parrent
        links.push({source:parent.uuid, target:sourceArray[i].uuid})
      }
      for (var property in sourceArray[i]) {//copy all prop to new object
          if (sourceArray[i].hasOwnProperty(property)) {
            if (property == childrenProp) { //recursion with children
              addFlatElement(sourceArray[i][property],target,sourceArray[i])
            }else{
              newElement[property] = sourceArray[i][property]
            }
          }

      }
      target.push(newElement)
    }
  }

  addFlatElement(oData,flatElements)
  console.log(flatElements);
  console.log(links);
  return {items:flatElements, links:links}
}
