
// setTimeout(function () {
//   displayThree(renderDTree(store.db))
// }, 10);

var savedTree = undefined

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

// Get JSON data
function displayThree({
  data=undefined,
  edit= false,
  startCollapsed=false,
  onClose = (e)=>{console.log("tree closed", e.data);}
} ={}) {

  var self={}

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

    //var demoArray = [demoData]
    // var flattened = flattenChildArray(demoArray,"children")
    // setTimeout(function () {
    //   console.log(flattened);
    //   hierarchiesList(flattened.items, flattened.links)
    // }, 100);



    if (data) {
      treeData = data
    }else {
      treeData = demoData
    }


  function exportThree() {

    var treeData = treemap(root);

    function clearNode(node) {
      var dChildren = node.children
      console.log(node);
      node.name = node.data.name;
      node.uuid = node.data.uuid;
      delete node.parent
      delete node.depth
      delete node.height
      delete node.x
      delete node.y
      delete node.x0
      delete node.y0
      delete node.data
      console.log(node.name);
      if (node.children) {
        for (child of node.children) {
          clearNode(child)
        }
      }

    }

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    clearNode(nodes[0])
    console.log(nodes[0]);
    var jsontxt = JSON.stringify(nodes[0]);
    console.log(jsontxt);
    console.log(JSON.parse(jsontxt));

    savedTree = JSON.parse(jsontxt)
    e ={data:savedTree}
    onClose(e)

  }

  function datizeNode(d) {
    return {name:d.data.name||d.name, uuid:d.data.uuid, children:d.data.children}
  }

  if (edit) {
    document.getElementById("pbs-container").insertAdjacentHTML('afterbegin',
            ` <div class="">
              <button class="action_set_pbs_remove ui tiny basic button" type="button" name="button">remove</button>
              <button class="action_set_pbs_move ui tiny basic button" type="button" name="button">move</button>
              <button class="action_set_pbs_close ui tiny basic red button" type="button" name="button">close</button>
              </div>`
            );
  }else {
    document.getElementById("pbs-container").insertAdjacentHTML('afterbegin',
            ` <div class="">
              <button class="action_set_pbs_close ui tiny basic red button" type="button" name="button">close</button>
              </div>`
            );
  }



  // panning variables
  var panSpeed = 200;
  var panBoundary = 20; // Within 20px from edges will pan when dragging.

  var mode = "default";
  var dragging = false;
  var draggingSelected = undefined;
  var draggingElement = undefined;
  var draggingTimmer = 0;
  var draggingTimmerNow = 0;

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
  var svg = d3.select("#pbs-container").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .call(d3.zoom().on("zoom", function () {
           svgGroup.attr("transform", d3.event.transform)
        }))
    .append("g")
      .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");

  var svgGroup = svg.append("g");

  // d3.select("#pbs-container").call(d3.drag()
  //        .on("start", dragstarted)
  //        .on("drag", dragged)
  //        .on("end", dragended));

  d3.select(".action_set_pbs_move").on("click", function(d) { mode = "default"; })
  d3.select(".action_set_pbs_add").on("click", function(d) { mode = "add"; })
  d3.select(".action_set_pbs_remove").on("click", function(d) { mode = "remove"; })
  d3.select(".action_set_pbs_close").on("click", function(d) {

    if (edit) {
      exportThree()
    }else {
      onClose({})
    }

    document.querySelector("#pbs-container").innerHTML =""
    document.querySelector("#pbs-container").style.display = "none"
  })

  function hoovering(d) {
    console.log(d);
    console.log(dragging);
    if (dragging && d != draggingElement) {
      draggingSelected = d
      console.log(d, d3.event);
      d3.select(d3.event.target)
      .style('fill', 'orange')
      .transition().duration(duration)
        .attr('r', function() {
          return 10 + Math.random() * 40;
        });
      console.log(d.data.name);
    }
  }

  function dragstarted(d) {
    draggingElement = d;
    var event = d3.event
    dragging = false;
    draggingTimmer = Date.now()

    setTimeout(function () {
      if (edit) {
        draggingTimmer = Date.now()
      }

     //d3.select(this).raise().classed("active", true);
    console.log("moooovong");
     event.sourceEvent.stopPropagation();
   }, 200);

  }

  function dragged(d) {
   console.log(d);
   draggingTimmerNow = Date.now()
   console.log(draggingTimmerNow,draggingTimmer);
   if ((draggingTimmerNow - draggingTimmer) > 1000 && edit) {
     dragging = true;
   }
   console.log(dragging);

   // svgGroup.x = d3.event.x
   // svgGroup.y = d3.event.y

   //svgGroup.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
   //svg.selectAll()
     // .attr("x", d.x = d3.event.x)
     // .attr("y", d.y = d3.event.y);
     //d.y = d3.event.y

     if (dragging) {

       //prevent connection with descendants
       d.descendants().forEach(function (desc) {
         var element = d3.selectAll("circle")
          .filter(function(cd) {
            console.log(cd);
              return cd.id == desc.id && cd.id != d.id;
          })
          .style('fill', 'orange')
          .transition().duration(duration)
            .attr('r', 0);
        console.log(element);
       });

       //move current node
       d.x0 += d3.event.dy;
       d.y0 += d3.event.dx;
       var node = d3.select(this);
       node.attr("transform", "translate(" + (d.y0-15) + "," + (d.x0-15)+ ")");
     }



     //d.attr("transform", "translate(" + (d3.event.x)  + "," + (d3.event.y) + ")");
     //d.xt = d3.event.x - d.x1;
     //d.yt = d3.event.y - d.y1;
  }

  function dragended(d) {

    setTimeout(function () {
      dragging = false;
      console.log("dragstop");
    }, 300);
    // function updateDepthFromParent(node) {
    //   node.depth = node.parent.depth+1
    //   console.log(node.data.name);
    //   console.log(node.children);
    //   if (node.children) {
    //     for (child of node.children) {
    //       console.log(child.data.name);
    //       updateDepthFromParent(child)
    //     }
    //   }
    // }
    // function cleanTree(node) {
    //   if (node.children && node.children.length == 0) {
    //     node.children= null
    //   }
    // }
    //
    // if (draggingSelected && draggingSelected != d) {
    //   d3.select(this).classed("active", false);
    //
    //   if (!draggingSelected.children) {
    //     draggingSelected.children = []
    //     draggingSelected.data.children = []
    //   }
    //   var children = []
    //   d.parent.children.forEach(function(child){
    //     if (child.id != d.id){
    //       //add to the child list if target id is not same
    //       //so that the node target is removed.
    //       children.push(child);
    //     }
    //   })
    //   d.parent.children = children
    //   d.parent.data.children = children
    //     console.log(d.parent);
    //
    //    d.parent = draggingSelected
    //    updateDepthFromParent(d)
    //
    //   draggingSelected.children.push(d)
    //   draggingSelected.data.children.push(d)
    //
    //   console.log(draggingSelected);
    //   cleanTree(root)
    //
    //   // update(d)
    // }
    // draggingSelected = undefined
    // dragging = false

    function setNodeDepth(d) {
        d.depth = d == root ? 0 : d.parent.depth + 1;
        if (d.children) {
            d.children.forEach(setNodeDepth);
        } else if (d._children) {
            d._children.forEach(setNodeDepth);
        }
    }

    if (draggingSelected && draggingSelected != d) {
      var selectedNode = draggingSelected
      var draggingNode = d
      var index = draggingNode.parent.children.indexOf(draggingNode);
      if (index > -1) {
          draggingNode.parent.children.splice(index, 1);
          draggingNode.parent.data.children.splice(index, 1);
          // had to update the "draggingNode" parent "children" array if it's
          // empty otherwise the "firstWalk()" core function throws an error when
          // trying to call "children[0]".
          if (draggingNode.parent.children.length == 0) {
              draggingNode.parent.children = null;
          }
      }

      // update the "draggingNode" parent as well as update all its children
      // so that their properties are properly adjusted to their new depths.
      draggingNode.parent = selectedNode;
      draggingNode.descendants().forEach(setNodeDepth);

      // check for visible children.
      if (!selectedNode.data.children) {
        selectedNode.data.children = []
      }
      selectedNode.data.children.push(datizeNode(draggingNode));

      if (selectedNode.children) {
          selectedNode.children.push(draggingNode);
      // check for hidden children.
      } else if (selectedNode._children) {
          selectedNode._children.push(draggingNode);
      // no children exist, create new children array and add "draggingNode".
      } else {
          selectedNode.children = [];
          selectedNode.children.push(draggingNode);
      }
    }



    draggingSelected = undefined
    dragging = false

    setTimeout(function () {
      console.log(d);
      update(d)
    }, 100);
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
  if (startCollapsed) {
    root.children.forEach(collapse);
  }

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
      }).call(d3.drag()
             .on("start", dragstarted)
             .on("drag", dragged)
             .on("end", dragended));


    // Add Circle for the nodes
    nodeEnter.append('circle')
        .on('click', click)
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        })
        .on("mouseover", hoovering)

    // Add plus sign for the nodes
    nodeEnter.append('circle')
        .attr("cy", "1em")
        .attr('class', 'plus')
        .attr('r', 1e-6)
        .attr('r', 2)
        .style("fill", "grey")
        .on('click', clickHelper);

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) { console.log(d.data.name);return d.data.name; })
        .on('click', editText);

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

    function editText(d) {
      var newValue = prompt("Edit text")
      if (newValue) {
        d3.select(d3.event.target).text(newValue)
        d.data.name = newValue

        // d3.selectAll('text')
        // .style('fill', 'orange')
        // .attr('r', function() {
        //   return 10 + Math.random() * 40;
        // });
        // console.log(d3.select("[id='" + d.id + "']").select("text").text("feffsesf"));
      }
    }

    function removeNode(d){
      //this is the links target node which you want to remove
         // var target = d.target;
         var target = d;
         //make new set of children
         var children = [];
         //iterate through the children
         console.log(d);
         target.parent.children.forEach(function(child){
           if (child.id != target.id){
             //add to the child list if target id is not same
             //so that the node target is removed.
             children.push(child);
           }
         });
         if (target.children && target.children[0] && confirm("Keep Childs?")) {
           target.children.forEach(function(child){
             if (child.id != target.id){
               //add to the child list if target id is not same
               //so that the node target is removed.
               child.depth = target.depth
               child.parent = target.parent
               children.push(child);
             }
           });

         }
         if (!children[0]) {
           delete target.parent.children
         }else {
           //set the target parent with new set of children sans the one which is removed
           target.parent.children = children;
         }

         //redraw the parent since one of its children is removed
         update(target.parent)
    }

    // Click on helper
    function clickHelper(d) {
      if (true) {
        var newNode = {
          type: 'node-type',
          name: new Date().getTime(),
          children: []
        };
        selected = d
        var newName = prompt("Nom?")
        if (newName) {
          //TODO check if node collapsed or not
          //Creates a Node from newNode object using d3.hierarchy(.)
          var newNode = d3.hierarchy(newNode);

          //later added some properties to Node like child,parent,depth
          newNode.depth = selected.depth + 1;
          newNode.height = selected.height - 1;
          newNode.parent = selected;
          newNode.id = newName;
          newNode.data.name = newName;
          newNode.data.uuid = Date.now();

          //Selected is a node, to which we are adding the new node as a child
          //If no child array, create an empty array
          if(!selected.children){
            selected.children = [];
            selected.data.children = [];
          }

          //Push it to parent.children array
          selected.children.push(newNode);
          selected.data.children.push(newNode.data);
        }
      }

      update(d);
    }

    // Toggle children on click.
    function click(d) {
      dragging = false;
      if (mode == "default") {
        if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
      }else if (mode == "remove" && confirm("Remove Node?")) {
        removeNode(d)
      }else if (mode == "add") {
        var newNode = {
          type: 'node-type',
          name: new Date().getTime(),
          children: []
        };
        selected = d
        var newName = prompt("Nom?")
        if (newName) {
          //TODO check if node collapsed or not
          //Creates a Node from newNode object using d3.hierarchy(.)
          var newNode = d3.hierarchy(newNode);

          //later added some properties to Node like child,parent,depth
          newNode.depth = selected.depth + 1;
          newNode.height = selected.height - 1;
          newNode.parent = selected;
          newNode.id = newName;
          newNode.data.name = newName;
          newNode.data.uuid = Date.now();

          //Selected is a node, to which we are adding the new node as a child
          //If no child array, create an empty array
          if(!selected.children){
            selected.children = [];
            selected.data.children = [];
          }

          //Push it to parent.children array
          selected.children.push(newNode);
          selected.data.children.push(newNode.data);
        }
      }

      update(d);
    }
  }
  return self
}
