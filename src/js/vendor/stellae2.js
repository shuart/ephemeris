(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stellae = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var stellae = _dereq_('./scripts/stellae');

module.exports = stellae;

},{"./scripts/stellae":2}],2:[function(_dereq_,module,exports){
/* global d3, document */
/* jshint latedef:nofunc */
'use strict';

function stellae(_selector, _options) {
    var base, scale, translate, container, graph, info,note,notes,group, groups, node, nodes, relationship, relationshipOutline, relationshipOverlay, relationshipText, relationships, selector, simulation, svg,svgGroups, svgNotes, svgNodes, svgRelationships, svgScale, svgTranslate,
        selection,
        mouseCurrentPosition,
        classes2colors = {},
        justLoaded = false,
        numClasses = 0,
        options = {
            arrowSize: 4,
            colors: colors(),
            highlight: undefined,
            icons: undefined,
            customPathIcons: undefined,
            extraLabels:false,
            imageMap: {},
            images: undefined,
            infoPanel: true,
            minCollision: undefined,
            chargeStrength: -40,
            decay: 0.08,
            n4Data: undefined,
            n4DataUrl: undefined,
            nodeOutlineFillColor: undefined,
            nodeRadius: 25,
            relationshipColor: '#a5abb6',
            zoomFit: false,
            groupLabels:false,
            rootNode:false,
            fadeOtherNodesOnHoover:true,
            unpinNodeOnClick:true,
            startTransform:false,
            showLinksText:true,
            showLinksOverlay:true,
            extraLabelReplaceNormalPath:true
        },
        VERSION = '0.2.1';

    var linkModePreview = undefined;
    var linkMode = false;
    var linkModeStartNode = undefined;
    var linkModeEndNode = undefined;
    var currentSelectedNodes = undefined;
    var currentLinkedSubgroup = undefined;
    var currentGroupedNodes = undefined;
    var selectionModeActive = false;
    var optimizeRenderStatus = {text:false};

    //THREE JS GLOBALS
    var canvasScale=0.01
    var scene = undefined;
    var stage = undefined;
    var camera = undefined;

    var displayed = true;

    var renderer = undefined;

    var geometry = undefined
    var material = undefined
    var mainMaterial = undefined

    var selectedObject = undefined
    var selectedHelper = undefined
    var selectionBox = undefined
    var selectionBoxActive = false
    var nodes = []
    var nodesCore = []
    var nodesData = []
    var nodesNotes = []
    var spriteBuffer = []
    var spriteTextureBuffer = []
    var relationshipsData = []
    var plane = undefined
    var helperLine = undefined
    var cube = undefined
    var offset = undefined

    var controls = undefined
    var mouse = undefined
    var raycaster = undefined

    var hoovered = undefined
    var previousHoovered = undefined

    var newLinkSource = undefined
    var newLinkTarget = undefined

    //SHAPE TEMPLATES
    var circleGeometry = undefined

    var stats = undefined

    var instancegroup = undefined;

    //box selection elements TODO reorganise
    function rect(x, y, w, h) {
      return "M"+[x,y]+" l"+[w,0]+" l"+[0,h]+" l"+[-w,0]+"z";
    }
    function markNodesSelected(currentSelectedNodes) {
      d3.selectAll(".node").select(".selection_ring").style("opacity",0); //clear all
      if (currentSelectedNodes) {//mark selected
        let currentSelectedUuid = currentSelectedNodes.map(e=>e.uuid)
        var currentSelectedDom = d3.selectAll(".node").filter(function(d){
                  return currentSelectedUuid.includes(d.uuid)
                });
        currentSelectedDom.select(".selection_ring").style("opacity",1);
      }
    }
    function moveCurrentSelectedNodes(delta) {
      for (var i = 0; i < currentSelectedNodes.length; i++) {
        let currentNode = currentSelectedNodes[i]
        if (!currentNode.fx) {
          currentNode.fx = currentNode.x
          currentNode.fy = currentNode.y
        }
        currentNode.fx += delta[0]
        currentNode.fy += delta[1]
      }
    }
    function checkSelectedNode(start, end, nodes) {
      let selectedNodes = nodes.filter(e=>{
        return (e.x > start[0] && e.x < end[0] && e.y > start[1] && e.y < end[1] )
        // return (e.x > start[0] && e.y < start[1] && e.x < end[0] && e.y > end[1] )
        // return {uuid:e.uuid,fx : e.x,fy : e.y}
      });
      return selectedNodes
    }

    var startSelection = function(start) {
        selection.attr("d", rect(start[0], start[0], 0, 0))
          .attr("visibility", "visible");
    };

    var moveSelection = function(start, moved) {
        selection.attr("d", rect(start[0], start[1], moved[0]-start[0], moved[1]-start[1]));
        currentSelectedNodes = checkSelectedNode(start, moved, nodes)
        markNodesSelected(currentSelectedNodes)
    };

    var endSelection = function(start, end) {
        selection.attr("visibility", "hidden");
        currentSelectedNodes = checkSelectedNode(start, end, nodes)
        markNodesSelected(currentSelectedNodes)
        selectionModeActive = false
        if (typeof options.onSelectionEnd === 'function') {
            options.onSelectionEnd();
        }
    };


    function moveCurrentGroupedNodes(nodes, delta) {
      for (var i = 0; i < nodes.length; i++) {
        let currentNode = nodes[i]
        if (!currentNode.fx) {
          currentNode.fx = currentNode.x
          currentNode.fy = currentNode.y
        }
        currentNode.fx += delta[0]
        currentNode.fy += delta[1]
      }
    };
    function checkGroupedNode(start, end, nodes) {
      let selectedNodes = nodes.filter(e=>{

        return (e.x > start[0] && e.x < end[0] && e.y > start[1] && e.y < end[1] )
        // return (e.x > start[0] && e.y < start[1] && e.x < end[0] && e.y > end[1] )
        // return {uuid:e.uuid,fx : e.x,fy : e.y}
      });
      // return nodes[1]
      return selectedNodes
    };
    function setGroupedNodeToMove(group, nodes) {
      let selectedNodes = []
      if (group.nodes) {
        selectedNodes = nodes.filter(e=>{
          return group.nodes.includes(e.id)
        });
      }
      return selectedNodes
    };
    function checkIfNodesShouldBeAddedToGroup(nodes) {
      //first remove node rom all groups
      for (var i = 0; i < groups.length; i++) {
        let g = groups[i]
        for (var j = 0; j < nodes.length; j++) {
          nodes[j]
          if (g.nodes && g.nodes.includes(nodes[j].id)) {
            g.nodes = g.nodes.filter(n=> n != nodes[j].id)
          }
        }
      }
      let groupFound = false
      for (var i = 0; i < groups.length; i++) {
        let g = groups[i]
        let result = checkGroupedNode([g.x,g.y],[g.x+g.w,g.y+g.h], nodes)
        for (var j = 0; j < result.length; j++) {
          addNodeToGroup(result[j],g)
          return true//when found stop to avoid adding to multiple overlapping group
        }
      }
    };
    function moveCurrentLinkedSubgroup(groups, delta) {
      //first remove node rom all groups
      let groupFound = false
      for (var i = 0; i < groups.length; i++) {
        let g = groups[i]
        g.x +=delta[0]
        g.y +=delta[1]
        svg.selectAll(".group").filter(d=>d.uuid ==g.uuid)
            .attr('transform', "translate(" + g.x  + ", " + g.y  + ")");
            //move also asociate nodes
            currentGroupedNodes = setGroupedNodeToMove(g, nodes)
            moveCurrentGroupedNodes(currentGroupedNodes, delta)
            currentGroupedNodes=undefined;
      }
    };
    function addNodeToGroup(node, group) {
      if (!group.nodes) {
        group.nodes = []
      }
      group.nodes.push(node.id)
    }


    var zoom = d3.zoom().on('zoom', function() {

        svg.attr("transform", d3.event.transform); // updated for d3 v4
        // svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' + scale + ')');
        setTimeout(function () {
          optimizeRender({translate:svgTranslate,scale:svgScale})
        }, 10);


        if (typeof options.onCanvasZoom === 'function') {
          if (options.startTransform) {//always fals
            svgTranslate = [d3.event.transform.x,d3.event.transform.y]
            svgScale = d3.event.transform.k
            options.onCanvasZoom({translate:svgTranslate,scale:svgScale})
          }else {
            options.onCanvasZoom({translate:svgTranslate,scale:svgScale})
          }
        }
    })

    function optimizeRender(transfrom) {
      let scaleLimit =  0.6
      if (transfrom.scale <= scaleLimit) {
        if (!optimizeRenderStatus.text) {
           // d3.selectAll(".node").select("text").transition().attr("opacity", 0);
          d3.selectAll(".node").select("text").style("display","none"); //clear all
          optimizeRenderStatus.text = true
        }
        if (!optimizeRenderStatus.ring) {
          d3.selectAll(".node").select(".ring").style("display","none"); //clear all
          optimizeRenderStatus.ring = true
        }

      }else{

        if (optimizeRenderStatus.text) {
          d3.selectAll(".node").select("text").style("display","block"); //clear all
          optimizeRenderStatus.text = false
        }
        if (optimizeRenderStatus.ring) {
          d3.selectAll(".node").select(".ring").style("display","block"); //clear all
          optimizeRenderStatus.ring = false
        }

      }
    }

    function setUpGraph(container) {

      let containerDim = container.getBoundingClientRect();

      let h =containerDim.height;
      let w =containerDim.width;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 75,w/h, 0.1, 1000 );

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias :true });
      renderer.setSize( w,  h );
      container.appendChild( renderer.domElement );

      geometry = new THREE.BoxGeometry( 1, 1, 1 );
      material = new THREE.MeshBasicMaterial( { color: 0x35bdb2 } );
      mainMaterial = new THREE.MeshBasicMaterial( { color: 0x35bdb2 } );
      cube = new THREE.Mesh( geometry, material );
      cube.position.x = 5
      scene.add(cube)

      selectedObject = undefined
      nodes = []
      plane = undefined
      offset = new THREE.Vector3();

      mouse = new THREE.Vector2();
      raycaster = new THREE.Raycaster()

      //SHAPE TEMPLATES
      circleGeometry = createCircleGeometry()

      stats = new Stats();
      document.body.appendChild( stats.dom );

      stage = new THREE.Group();
      scene.add(stage)
      instancegroup = new THREE.Group();


      stage.add( instancegroup );
      stage.rotation.x = -Math.PI / 2;
      //scene.add( cube );
      controls = new THREE.MapControls( camera, renderer.domElement )



      // camera.position.z = 20;
      camera.position.y = 20;
      controls.update();

      animate();

      //create a line to draw connection
      const lineMaterial = new THREE.LineBasicMaterial( {
        color: 0xa5abb6,
        linewidth: 3,

       } );
      const linePoints = [];
      linePoints.push( new THREE.Vector3( - 1, -1, -0.15 ) );
      linePoints.push( new THREE.Vector3( -1.01, -1.01, -0.15 ) );

      const lineGeometry = new THREE.BufferGeometry().setFromPoints( linePoints );
      helperLine = new THREE.Line( lineGeometry, lineMaterial );
      stage.add(helperLine)

      //create a box for selection
      selectionBox = createRectangle()

      //create a helper plane to get position

      plane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 18, 18), new THREE.MeshBasicMaterial({
                  color: 0x00ff00,
                  opacity: 0.0,
                  transparent: true
              }));
              plane.visible = false;
              //plane.rotation.x = -Math.PI / 2;
              stage.add(plane);

      container.onclick = function (event) {
        // get the mouse positions
         var mouse_x = ( (event.clientX-containerDim.x) / containerDim.width ) * 2 - 1;
         var mouse_y = -( event.clientY / window.innerHeight ) * 2 + 1;
         var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5);
         vector.unproject(camera);
         var raycaster = new THREE.Raycaster(camera.position,
                 vector.sub(camera.position).normalize());
         var intersects1 = raycaster.intersectObjects(nodesNotes);
         var intersects2 = raycaster.intersectObjects(nodes);
         console.log(intersects2);
         if (intersects2.length>0) {
           console.log("node clicked");
         }else if (intersects1.length>0) {
           console.log("note clicked");
           if (typeof options.onNoteClick === 'function') {
           }else {
             let node = intersects1[0].object
             let group = intersects1[0].object.parent
             let data = group.edata
             var newName = prompt("Content", data.content)
             if (newName == "") {
               if (confirm("Remove note?")) {
                 notes=notes.filter(n=>n.uuid!= data.uuid)//remove the note from data
                 nodesNotes=nodesNotes.filter(n=>n!=node)//remove the note from data
                 // node.dispose()
                 stage.remove(group)
               }
             }else if (newName) {
               data.content =newName
               let newText = createTextPlane(newName)
               group.remove(node)//remove current text
               group.add(newText)//remove current text
               nodesNotes=nodesNotes.filter(n=>n!=node)
               nodesNotes.push(newText)
             }
           }
         }
      }

      container.addEventListener( 'wheel', function (event) {
        controls.enabled = true;
      } );
      container.addEventListener( 'keydown', function (event) {
        console.log("keydi");
        if (event.ctrlKey || selectionModeActive) {
           alert("ctr key was pressed during the click");
           controls.enabled = false;
        }
      } );
      container.addEventListener( 'keyup', function (event) {
        controls.enabled = true;
      } );


      container.onmousemove = function (event) {
          hoovered = undefined; //reset status
          if (!selectionModeActive) {
            controls.enabled = true;
          }

          // make sure we don't access anything else
           event.preventDefault();
          // get the mouse positions
           var mouse_x = ( (event.clientX-containerDim.x) / containerDim.width ) * 2 - 1;
           var mouse_y = -( event.clientY / window.innerHeight ) * 2 + 1;
          // get the 3D position and create a raycaster
          mouse.x = mouse_x;
      		mouse.y = mouse_y;
      		mouse.x = ( (event.clientX -containerDim.x) / containerDim.width ) * 2 - 1;
      		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
           var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5);
           vector.unproject(camera);
           // var raycaster = new THREE.Raycaster(camera.position,
           //         vector.sub(camera.position).normalize());
          camera.updateMatrixWorld();
          raycaster.setFromCamera( mouse, camera )
          // first check if we've already selected an object by clicking
          if (selectionModeActive && selectionBoxActive) {
            selectionBox.visible =true
            var intersects = raycaster.intersectObject(plane);
            let newPosition =intersects[0].point
            let basePoint_x = selectionBox.geometry.attributes.position.array[3]
            let basePoint_y = selectionBox.geometry.attributes.position.array[4]
            selectionBox.geometry.attributes.position.needsUpdate = true;
            selectionBox.geometry.attributes.position.array[9] =newPosition.x
            selectionBox.geometry.attributes.position.array[10] =-newPosition.z

            selectionBox.geometry.attributes.position.array[0] =basePoint_x
            selectionBox.geometry.attributes.position.array[1] =-newPosition.z
            selectionBox.geometry.attributes.position.array[6] =newPosition.x
            selectionBox.geometry.attributes.position.array[7] =basePoint_y
            selectionBox.geometry.attributes.position.array[12] =basePoint_x
            selectionBox.geometry.attributes.position.array[13] =-newPosition.z
            selectionBox.computeLineDistances();

          }else if (newLinkSource) {
            var intersects = raycaster.intersectObjects(nodes);
            controls.enabled = false;
            let rData = newLinkSource.edata
            helperLine.geometry.attributes.position.needsUpdate = true;
            helperLine.geometry.attributes.position.array[0] =rData.x*canvasScale
            helperLine.geometry.attributes.position.array[1] =rData.y*canvasScale

            if (intersects[0]) {
              let data = intersects[0].object.edata
              newLinkTarget = intersects[0].object
              helperLine.geometry.attributes.position.array[3] =data.x*canvasScale
              helperLine.geometry.attributes.position.array[4] =data.y*canvasScale
            }else {
              newLinkTarget = undefined
              var intersects = raycaster.intersectObject(plane);
              let newPosition =intersects[0].point

              helperLine.geometry.attributes.position.array[3] =newPosition.x
              helperLine.geometry.attributes.position.array[4] =-newPosition.z
            }


          }else if (selectedObject) {
             hoovered = selectedObject
             controls.enabled = false;
             //restart initSimulation
             simulation.alphaTarget(0.3).restart();
              // check the position where the plane is intersected
               var intersects = raycaster.intersectObject(plane);
              // reposition the selectedobject based on the intersection with the plane
              // let newPosition =intersects[0].point.sub(offset)
              let newPosition =intersects[0].point
              //circle.edata
               // selectedObject.parent.position.copy(intersects[0].point.sub(offset));
               selectedObject.edata.x = newPosition.x/canvasScale
               selectedObject.edata.y = -newPosition.z/canvasScale
               selectedObject.edata.fx = newPosition.x/canvasScale
               selectedObject.edata.fy = -newPosition.z/canvasScale
           } else if (selectedHelper) {
             var intersects = raycaster.intersectObject(plane);
             let newPosition =intersects[0].point
             selectedHelper.position.x = newPosition.x
             selectedHelper.position.y = -newPosition.z
             selectedHelper.edata.x = newPosition.x/canvasScale
             selectedHelper.edata.y = -newPosition.z/canvasScale
           }else {//nothing selected
              // if we haven't selected an object, we check if we might need
              // to reposition our plane. We need to do this here, since
              // we need to have this position before the onmousedown
              // to calculate the offset.
               var intersects = raycaster.intersectObjects(nodes);
               if (intersects.length > 0) {
                 // alert("fsefsfs")
                 controls.enabled = false;
                 hoovered = intersects[0].object
                 // controls.enableRotate = false
                 //controls.dispose()
                 //alert("dfsfs")
                  // now reposition the plane to the selected objects position
                   // plane.position.copy(intersects[0].object.parent.position);
                   // plane.position.z = -0;
                  // and align with the camera.
                   // plane.lookAt(camera.position);
               }else{
                 var intersects = raycaster.intersectObjects(nodesNotes);
                 if (intersects.length > 0) {
                   console.log(intersects);
                   controls.enabled = false;
                 }
               }

           }
           //updateElementStatus
           updateInteractionStates()
       };

          container.onmousedown = function (event) {

              // get the mouse positions
               var mouse_x = ( (event.clientX-containerDim.x) / containerDim.width ) * 2 - 1;
               var mouse_y = -( event.clientY / window.innerHeight ) * 2 + 1;
              // use the projector to check for intersections. First thing to do is unproject
              // the vector.
               var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5);
              // we do this by using the unproject function which converts the 2D mouse
              // position to a 3D vector.
               vector.unproject(camera);
              // now we cast a ray using this vector and see what is hit.
               var raycaster = new THREE.Raycaster(camera.position,
                       vector.sub(camera.position).normalize());
              // intersects contains an array of objects that might have been hit
               var intersects = raycaster.intersectObjects(nodes);
               if (selectionModeActive) {
                 var intersects = raycaster.intersectObject(plane);
                 let newPosition =intersects[0].point
                 selectionBox.geometry.attributes.position.needsUpdate = true;
                 selectionBox.geometry.attributes.position.array[3] =newPosition.x;
                 selectionBox.geometry.attributes.position.array[4] =-newPosition.z;
                 selectionBoxActive = true
                 // selectionBox.position.x =newPosition.x
                 // selectionBox.position.y =-newPosition.z
               } else if (intersects.length > 0) {
                  var intersectsCore = raycaster.intersectObjects(nodesCore);
                  if (intersectsCore[0]) {
                    // the first one is the object we'll be moving around
                     selectedObject = intersects[0].object;
                    // and calculate the offset
                     //var intersects = raycaster.intersectObject(plane);
                     //offset.copy(intersects[0].point).sub(plane.position);
                  }else {
                    newLinkSource = intersects[0].object
                  }
               }else { //if no nodes, check if there is a note
                 var intersects = raycaster.intersectObjects(nodesNotes);
                 if (intersects.length > 0) {
                   selectedHelper = intersects[0].object.parent
                   console.log(intersects[0].object.parent);
                 }
               }
           };

          container.onmouseup = function (event) {
              if (newLinkSource) {
                enLinkMode()
              }
              if (selectedObject) {
                if (typeof options.onNodeDragEnd === 'function') {
                    options.onNodeDragEnd(selectedObject.edata);
                }
              }
              //reset linkMode
              newLinkSource = undefined
              newLinkTarget = undefined
              //orbit.enabled = true;
              //reset Slected oBject Mode
              selectedObject = null;
              selectedHelper = null;
              //clean selection box
              selectionBoxActive = false
              selectionBox.visible =false
              setSelectionModeInactive()
              //update sim
              simulation.alphaTarget(0);
           }


    }

    var animate = function () {
      if (displayed) {
        requestAnimationFrame( animate );
      }


      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      updateNodesPostionInCanvas()
      updateRelationshipsPostionInCanvas()

      controls.update();
      renderer.render( scene, camera );
      stats.update();
    };

    function updateNodesPostionInCanvas() {
      for (var i = 0; i < nodesData.length; i++) {
        nodesData[i].relatedObject.position.x = nodesData[i].x*canvasScale;
        nodesData[i].relatedObject.position.y = nodesData[i].y*canvasScale;
      }
    }
    function updateRelationshipsPostionInCanvas() {
      for (var i = 0; i < relationshipsData.length; i++) {
        let rData = relationshipsData[i]
        let line = rData.relatedObject
        line.geometry.attributes.position.needsUpdate = true;
        line.geometry.attributes.position.array[0] =rData.source.x*canvasScale
        line.geometry.attributes.position.array[1] =rData.source.y*canvasScale
        line.geometry.attributes.position.array[3] =rData.target.x*canvasScale
        line.geometry.attributes.position.array[4] =rData.target.y*canvasScale
      }
    }

    function updateInteractionStates() {
      if (previousHoovered) {
        previousHoovered.parent.children[1].scale.x = previousHoovered.parent.children[1].scale.x -0.1
        previousHoovered.parent.children[1].scale.y = previousHoovered.parent.children[1].scale.y -0.1
        previousHoovered = undefined
      }
      if (hoovered) {
        previousHoovered = hoovered
        hoovered.parent.children[1].scale.x = hoovered.parent.children[1].scale.x +0.1
        hoovered.parent.children[1].scale.y = hoovered.parent.children[1].scale.y +0.1
      }
      if (!newLinkSource) {
        helperLine.geometry.attributes.position.needsUpdate = true;
        helperLine.geometry.attributes.position.array[0] =-1
        helperLine.geometry.attributes.position.array[1] =-1
        helperLine.geometry.attributes.position.array[3] =-1.01
        helperLine.geometry.attributes.position.array[4] =-1.01
      }

    }

    function updateWithD3Data(d3Data) {
        //check for extra Helper elements
        updateHelpers(d3Data.notes,d3Data.groups)
        //start display cycle of nodes and relations
        updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
    }

    function updateNodesAndRelationships(n, r) {
      if (options.groupLabels ) {
        updateNodes(n);
        // var newLinks = r.concat(createGroupLinks(nodes))
        // if (options.rootNode) {
        //   newLinks = newLinks.concat(createRootNode(nodes))
        // }
        updateRelationships(r);

        simulation.nodes(nodesData);
        simulation.force('link').links(relationshipsData);
      }else {
        updateRelationships(r);
        updateNodes(n);

        simulation.nodes(nodes);
        simulation.force('link').links(relationships);
      }
    }
    function updateHelpers(n,g) {
      // g = [{uuid:"54646", id:'55645646', x:78, y:45, h:88, w:66}]
      // TODO: restore
      updateNotes(n);
      // updateGroups(g);
    }

    function updateNodes(n) {
      for (var i = 0; i < n.length; i++) {
        //nodes.push(n[i])
      }
      createNewNodes(n)
        // Array.prototype.push.apply(nodes, n);
        // node = svgNodes.selectAll('.node')
        //                .data(nodes, function(d) { return d.id; });
        // var nodeEnter = appendNodeToGraph();
        // node = nodeEnter.merge(node);
    }
    function updateRelationships(r) {
      for (var i = 0; i < r.length; i++) {
        let relData = r[i]

        const material = new THREE.LineBasicMaterial( {
          color: 0xa5abb6,
          linewidth: 2,

         } );
        const points = [];
        points.push( new THREE.Vector3( - 10, 0, -0.15 ) );
        points.push( new THREE.Vector3( 10, 0, -0.15 ) );

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );
        instancegroup.add(line)
        relationships.push(line)
        relData.relatedObject = line
        relationshipsData.push(relData)
      }

    }
    function updateNotes(n) {
      for (var i = 0; i < n.length; i++) {
        notes.push(n[i])
        createNewNote(n[i])
      }
    }
    function updateGroups(g) {
      for (var i = 0; i < g.length; i++) {
        groups.push(g[i])
      }
    }

    function createNewNote(n) {
      var textGroup = new THREE.Group();
      textGroup.edata = n
      let text = createTextPlane(n.content)
      textGroup.position.set(n.x,n.y,0.02); // move geometry up and out
      textGroup.add(text);
      nodesNotes.push(text)
      stage.add(textGroup);
    }

    function createTextPlane(content) {
      let text = dcText(content, 5, 7, 25, 0x000000);      // text #2, TRANSPARENT
      text.scale.set(0.1,0.1,0.1); // move geometry up and out
      return text
    }

    function createGroup(n) {
      var groupGroup = new THREE.Group();
      let text = dcText(n.content, 5, 7, 25, 0x000000);      // text #2, TRANSPARENT
      text.scale.set(0.1,0.1,0.1); // move geometry up and out
      text.position.set(n.x,n.y,0.02); // move geometry up and out
      stage.add(text);
    }

    // function appendNoteToGraph() {
    //     var n = appendNote();
    //     appendLayoutToNote(n)
    //     return n;
    // }
    // function appendGroupToGraph() {
    //     var g = appendGroup();
    //     var gLayout = appendLayoutToGroup(g)
    //     appendResizeToGroup(g, gLayout)
    //     appendTextToGroup(g)
    //     return g;
    // }

    function createNewNodes(n) {
      for (var i = 0; i < n.length; i++) {
        let nData = n[i]
        let newNode = createNode(nData)
        n[i].relatedObject = newNode
        nodesData.push(n[i])
        //newNode.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 0 - 0);
        newNode.position.set(0, i*0.01-5, 0);
        instancegroup.add( newNode );
      }
    }

    function initSimulation() {
      //TODO:restore
        // if (options.startTransform && !justLoaded) {//check if graph need to be adjusted
        //     initialZoom(options.startTransform)
        // }
        var simulation = d3.forceSimulation()
//                           .velocityDecay(0.8)
//                           .force('x', d3.force().strength(0.002))
//                           .force('y', d3.force().strength(0.002))
                           //  .force('x', d3.forceX().strength(0.04).x(d => svg.node().parentElement.parentElement.clientWidth / 2))
                           // .force('y', d3.forceY().strength(0.02).y(d => svg.node().parentElement.parentElement.clientHeight / 2))
                           .force('collide', d3.forceCollide().radius(function(d) {
                               return options.minCollision;
                           }).strength(1).iterations(1))
                           .force('charge', d3.forceManyBody().strength(options.chargeStrength).distanceMax(800))
                           .force('link', d3.forceLink().id(function(d) {
                               return d.id;
                           }))
                           // .force('center', d3.forceCenter(svg.node().parentElement.parentElement.clientWidth / 2, svg.node().parentElement.parentElement.clientHeight / 2))
                           .force('center', d3.forceCenter())
                           .alphaDecay(options.decay)
                           // .alphaDecay(0.014)
                           // .alphaMin(0.035)
                           .on('tick', function() {
                               updateFromSimulation()
                           })
                           .on('end', function() {
                             simulation.force("center", null)
                               if (options.zoomFit && !justLoaded) {
                                   justLoaded = true;
                                   zoomFit(2);
                               }
                           });

        return simulation;
    }

    function updateFromSimulation() {
    }

    function exportNodesPosition(condition) {
      var exportedData = []
      if (condition == "all") {
        exportedData = nodesData.map(e=>{
          return {uuid:e.uuid,fx : e.x,fy : e.y}
        });
      }else {
        exportedData = nodesData.filter(e=> e.fx).map(e=>{
          return {uuid:e.uuid,fx : e.fx,fy : e.fy}
        });
      }
        return exportedData
    }
    function exportHelpers() {
      var exportedData = {notes:notes, groups:groups}
      return exportedData
    }


    //dragInteraction

    function dragged(d) {
      var dragContext = this
      if (!linkMode) {
        stickNode(d);
      }else {
        updateLinkModePreview(d,dragContext )//Update the new link positions
      }
    }

    function dragStarted(d) {
        if (!d3.event.active && !linkMode) {
            simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;

        if (typeof options.onNodeDragStart === 'function') {
            options.onNodeDragStart(d);
        }
        if (linkMode) {//get activated when mouse on external circle
          linkModePreview = d3.select(this).append('g')
                              .append("line")          // attach a line
                              .style("stroke", "black")  // colour the line
                              .attr("x1", 0)     // x position of the first end of the line
                              .attr("y1", 0)      // y position of the first end of the line
                              .attr("x2", 10)     // x position of the second end of the line
                              .attr("y2", 10);
        }
        //check group to be moved
        currentLinkedSubgroup = [];
        for (var i = 0; i < groups.length; i++) {
          let g = groups[i]
          if (g.master == d.uuid){
            currentLinkedSubgroup.push(g)
          }
        }
    }

    function dragEnded(d) { //remove after transcribe
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
        checkIfNodesShouldBeAddedToGroup([d])
        if (typeof options.onNodeDragEnd === 'function') {
            options.onNodeDragEnd(d);
        }
        // if (linkMode) {
        //   enLinkMode()
        // }
    }
    function enLinkMode() {
      if (options.onLinkingEnd && newLinkSource && newLinkTarget && newLinkSource !=newLinkTarget) {
        options.onLinkingEnd([newLinkSource.edata,newLinkTarget.edata])
      }
      newLinkSource = undefined //clear Node stored
      newLinkTarget = undefined //clear Node stored
    }

    function updateLinkModePreview(d, dragContext) {
      var mousePosition = d3.mouse(dragContext);
      // var cm = d3.mouse(dragContext);
      // var newX = cm[0] + translate[0] ;
      // var newY = cm[1] + translate[1] ;
      // if(scale > 0)
      // {
      //     newX = newX / scale;
      //     newY = newY / scale;
      // }
      linkModePreview.attr("x2",mousePosition[0]+3)     // x position of the second end of the line
                     .attr("y2", mousePosition[1]+3);
    }

    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //OLDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



    function appendInfoPanel(container) {
        return container.append('div')
                        .attr('class', 'stellae-info');
    }

    function appendInfoElement(cls, isNode, property, value) {
        var elem = info.append('a');

        elem.attr('href', '#')
            .attr('class', cls)
            .html('<strong>' + property + '</strong>' + (!isNode ? (': ' + value) : ''));

        if (isNode && value) {//customColor are used
            elem.style('background-color', function(d) {
                    return options.nodeOutlineFillColor ? options.nodeOutlineFillColor : value;
                })
                .style('border-color', function(d) {
                    return options.nodeOutlineFillColor ? class2darkenColor(options.nodeOutlineFillColor) : class2darkenCustomColor(value);
                })
                .style('color', function(d) {
                    return options.nodeOutlineFillColor ? class2darkenColor(options.nodeOutlineFillColor) : '#fff';
                });
        }
        if (!value) {
            elem.style('background-color', function(d) {
                    return options.nodeOutlineFillColor ? options.nodeOutlineFillColor : (isNode ? class2color(property) : defaultColor());
                })
                .style('border-color', function(d) {
                    return options.nodeOutlineFillColor ? class2darkenColor(options.nodeOutlineFillColor) : (isNode ? class2darkenColor(property) : defaultDarkenColor());
                })
                .style('color', function(d) {
                    return options.nodeOutlineFillColor ? class2darkenColor(options.nodeOutlineFillColor) : '#fff';
                });
        }
    }

    function appendInfoElementClass(cls, node, color) {
        appendInfoElement(cls, true, node, color);
    }

    function appendInfoElementProperty(cls, property, value) {
        appendInfoElement(cls, false, property, value);
    }

    function appendInfoElementRelationship(cls, relationship) {
        appendInfoElement(cls, false, relationship);
    }


    function appendGroup() {
        return group.enter()
                   .append('g')
                   .attr('class', "group")
                   .attr('transform', function (d) {
                     return "translate(" + d.x + ", " + d.y + ")"
                   })
                   .on('click', function(d) {//catch dblclick on canvas
                       if (typeof options.onGroupClick === 'function') {

                       }else {
                         var newName = prompt("Content", d.content)
                         if (newName == "") {
                           if (confirm("Remove Group?")) {
                             groups=groups.filter(n=>n.uuid!= d.uuid)//remove the group from data
                             d3.select(this).remove()//remove the linked element
                           }
                         }else if (newName) {
                           d.content= newName
                           d3.select(this).select('text').text(d.content);
                         }
                       }
                   })
                   .call(d3.drag()
                           .on('start', function (d) {
                             if (!d3.event.active && !linkMode) {
                                currentGroupedNodes = setGroupedNodeToMove(d, nodes)
                                 simulation.alphaTarget(0.3).restart();
                             }
                           })
                           .on('drag', function(d) {
                              d.x += d3.event.dx;
                              d.y += d3.event.dy;
                              d3.select(this)
                                  .attr('transform', "translate(" + d.x  + ", " + d.y  + ")");
                              //move contained node
                              moveCurrentGroupedNodes(currentGroupedNodes, [d3.event.dx,d3.event.dy])

                              if (d.master) {//move master node too
                                let masters = nodes.filter(e=>d.master == e.id);
                                moveCurrentGroupedNodes(masters, [d3.event.dx,d3.event.dy])
                              }
                            })
                           .on('end', function () {
                             if (!d3.event.active) {
                                 simulation.alphaTarget(0);
                             }
                           }));

    }
    // function appendLayoutToGroup(group) {
    //     return group.append('rect')
    //                 .attr('class', "groupLayout")
    //                .attr("fill", "#2ab6ab")
    //                .attr("rx", "4")
    //                .style("opacity", .1)
    //                // .attr("x", 10)
    //                // .attr("y", 10)
    //                .attr("width", function (d) {
    //                  return d.w
    //                })
    //                .attr("height", function (d) {
    //                  return d.h
    //                })
    // }
    // function appendTextToGroup(group) {
    //     return group.append('text')
    //                .attr("fill", "black")
    //                .attr('transform', "translate(5, 15)")
    //                .attr('font-weight', "bold")
    //                .text(function (d) {
    //                  return d.content || "Group"
    //                });
    // }
    // function appendResizeToGroup(group, layout) {
    //     return group.append('circle')
    //                 .attr("fill", "grey")
    //                 .attr("r", 5)
    //                 .attr('transform', function(d){
    //                   return "translate(" +(d.w) + ", " + (d.h)  + ")"
    //                 })
    //                 .on('click', function(d) {//catch dblclick on canvas
    //                 })
    //                 .call(d3.drag()
    //                         // .on('start', dragStarted)
    //                         .on('drag', function(d) {
    //
    //                             // move helper
    //                             if ((d.w + d3.event.dx>0) && (d.h + d3.event.dy>0)) {// prevent negative group size
    //                               d.w += d3.event.dx;
    //                               d.h += d3.event.dy;
    //                               d3.select(this)
    //                                   .attr('transform', "translate(" + d.w + ", " + d.h + ")");
    //                               //change group size
    //                               d3.select(this.parentNode).select('.groupLayout')
    //                                   .attr("width", d.w)
    //                                   .attr("height", d.h)
    //                             }
    //
    //                          })
    //                         .on('end', function () {
    //                           if (!d3.event.active) {
    //                               simulation.alphaTarget(0);
    //                           }
    //                         }));
    //
    // }
    // function appendLayoutToNote(note) {
    //     return note.append('text')
    //                .attr("fill", "black")
    //                // .attr("x", 10)
    //                // .attr("y", 10)
    //                // .attr("width", 50)
    //                // .attr("height", 100)
    //                .text(function (d) {
    //                  return d.content || 'group'
    //                });
    // }

    // function appendNode() {
    //     return node.enter()
    //                .append('g')
    //                .attr('class', function(d) {
    //                    var highlight, i,
    //                        classes = 'node',
    //                        label = d.labels[0];
    //
    //                    if (icon(d)|| options.customPathIcons[d.labels[0]]["path"]) {
    //                        classes += ' node-icon';
    //                    }
    //
    //                    if (image(d)) {
    //                        classes += ' node-image';
    //                    }
    //
    //                    if (options.highlight) {
    //                        for (i = 0; i < options.highlight.length; i++) {
    //                            highlight = options.highlight[i];
    //
    //                            if (d.labels[0] === highlight.class && d.properties[highlight.property] === highlight.value) {
    //                                classes += ' node-highlighted';
    //                                break;
    //                            }
    //                        }
    //                    }
    //
    //                    return classes;
    //                })
    //                .on('click', function(d) {
    //                    if (options.unpinNodeOnClick) {
    //                      d.fx = d.fy = null;
    //                    }
    //
    //                    if (typeof options.onNodeClick === 'function') {
    //                       // var xy = d3.mouse(base.node()); TODO not usefull remove
    //                        options.onNodeClick(d,{canvasPosition: undefined});
    //                    }
    //                })
    //                .on('dblclick', function(d) {
    //                    stickNode(d);
    //
    //                    if (typeof options.onNodeDoubleClick === 'function') {
    //                        options.onNodeDoubleClick(d);
    //                    }
    //                })
    //                .on('mouseenter', function(d) {
    //                    if (info) {
    //                        updateInfo(d);
    //                    }
    //                    if (options.fadeOtherNodesOnHoover) {
    //                      fadeNodes(0.5,d,this)
    //                    }
    //                    if (linkMode) {
    //                      linkModeEndNode = d
    //                    }
    //
    //                    if (typeof options.onNodeMouseEnter === 'function') {
    //                        options.onNodeMouseEnter(d);
    //                    }
    //                })
    //                .on('mouseleave', function(d) {
    //                    if (info) {
    //                        clearInfo(d);
    //                    }
    //                    if (linkMode) {
    //                      linkModeEndNode = undefined
    //                    }
    //                    if (options.fadeOtherNodesOnHoover) {
    //                      unfadeAllNodes()
    //                    }
    //
    //
    //                    if (typeof options.onNodeMouseLeave === 'function') {
    //                        options.onNodeMouseLeave(d);
    //                    }
    //                })
    //                .on("contextmenu", function (d, i) {
    //                  if (typeof options.onNodeContextMenu === 'function') {
    //                     d3.event.preventDefault();
    //                     options.onNodeContextMenu(d);
    //                  }
    //                })
    //                .call(d3.drag()
    //                        .on('start', dragStarted)
    //                        .on('drag', dragged)
    //                        .on('end', dragEnded));
    // }







    function appendRandomDataToNode(d, maxNodesToGenerate) {
        var data = randomD3Data(d, maxNodesToGenerate);
        updateWithCustomData(data);
    }

    function appendRelationship() {
        return relationship.enter()
                           .append('g')
                           .attr('class', 'relationship')
                           .on('dblclick', function(d) {
                               if (typeof options.onRelationshipDoubleClick === 'function') {
                                   options.onRelationshipDoubleClick(d);
                               }
                           })
                           .on("contextmenu", function (d, i) {
                             if (typeof options.onLinkContextMenu === 'function') {
                                d3.event.preventDefault();
                                options.onLinkContextMenu(d);
                             }
                           })
                           .on('mouseenter', function(d) {
                               if (info) {
                                   updateInfo(d);
                               }
                           });
    }

    function appendOutlineToRelationship(r) {
        // return r.append('path')
        //         .attr('class', 'outline')
        //         .attr('fill', '#a5abb6')
        //         .attr('stroke', 'none');
        return r.append('path')
                .attr("marker-end", "url(#markerstriangle)")
                .attr('class', 'outline')
                .attr('fill', 'none')
                .style("stroke-dasharray", function (d) {
                  return d.customDashArray || ""
                })
                //.attr('stroke', '#a5abb6')
                .attr('stroke',function(d) {
                    // return d.color ||'#b38b47';
                    // return d.color ||'#02b5ab';
                    return d.customColor ||'#a5abb6';
                });
    }

    function appendOverlayToRelationship(r) {
        return r.append('path')
                .attr('class', 'overlay');
    }

    function appendTextToRelationship(r) {
        return r.append('text')
                .attr('class', 'text')
                .attr('fill', '#000000')
                .attr('font-size', '8px')
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .text(function(d) {
                    return d.displayType;
                });
    }

    function appendRelationshipToGraph() {
        var text = undefined;
        var overlay = undefined;
        var relationship = appendRelationship(),
            outline = appendOutlineToRelationship(relationship);

            if (options.showLinksText) {
              text = appendTextToRelationship(relationship);
            }
            if (options.showLinksOverlay) {
              overlay = appendOverlayToRelationship(relationship);
            }

        return {
            outline: outline,
            overlay: overlay,
            relationship: relationship,
            text: text
        };
    }

    function fadeNodes(opacity,currentNode, currentSVG) {
      var linkedByIndex = {};
      relationships.forEach(function(d) {
          linkedByIndex[d.source.index + "," + d.target.index] = 1;
      });
      function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
      }
      var visible = d3.selectAll(".node").filter(function(d){
                return isConnected(d, currentNode);
              });
      d3.selectAll(".node").style("opacity",0.2);
      // d3.select(currentSVG).style("opacity",1);
      visible.style("opacity",1);

      d3.selectAll(".relationship").style("opacity", function(o) {
                return o.source === currentNode || o.target === currentNode ? 1 : opacity;
            });
    }
    function unfadeAllNodes() {
      d3.selectAll(".node").style("opacity",1);
      d3.selectAll(".relationship").style("opacity",1);
    }

    function class2color(cls) {
        var color = classes2colors[cls];

        if (!color) {
//            color = options.colors[Math.min(numClasses, options.colors.length - 1)];
            color = options.colors[numClasses % options.colors.length];
            classes2colors[cls] = color;
            numClasses++;
        }

        return color;
    }

    function class2darkenColor(cls) {
        return d3.rgb(class2color(cls)).darker(1);
    }

    function clearInfo() {
        info.html('');
    }

    function color() {
        return options.colors[options.colors.length * Math.random() << 0];
    }

    function colors() {
        return [
            '#a5abb6', // dark gray
            '#ffc766', // light orange
            '#6dce9e', // green #1
            '#ff75ea', // pink
            '#68bdf6', // light blue
            '#fcea7e', // light yellow
            '#ff928c', // light red
            '#405f9e', // navy blue
            '#78cecb', // green #2,
            '#b88cbb', // dark purple
            '#ced2d9', // light gray
            '#e84646', // dark red
            '#fa5f86', // dark pink
            '#ffab1a', // dark orange
            '#fcda19', // dark yellow
            '#797b80', // black
            '#c9d96f', // pistacchio
            '#47991f', // green #3
            '#f2baf6', // purple
            '#70edee', // turquoise
            '#faafc2'  // light pink
        ];
    }

    function contains(array, id) {
        var filter = array.filter(function(elem) {
            return elem.id === id;
        });

        return filter.length > 0;
    }

    function defaultColor() {
        return options.relationshipColor;
    }

    function defaultDarkenColor() {
        return d3.rgb(options.colors[options.colors.length - 1]).darker(1);
    }



    function extend(obj1, obj2) {
        var obj = {};

        merge(obj, obj1);
        merge(obj, obj2);

        return obj;
    }



    function init(_selector, _options) {

        nodes = []; //set the base elements array
        relationships = [];
        notes = [];
        groups = [];


        merge(options, _options);

        if (options.icons) {
            options.showIcons = true;
        }

        if (!options.minCollision) {
            options.minCollision = options.nodeRadius * 2;
        }


        selector = _selector;

        container = document.querySelector(selector);
        // container = d3.select(selector);
        container.classList="stellae"
        // container.attr('class', 'stellae')
        //          .html('');

        // if (options.infoPanel) {
        //     info = appendInfoPanel(container);
        // }

        // appendGraph(container);
        setUpGraph(container)

        simulation = initSimulation();
        //
        // if (options.customData) {
        //     loadCustomData(options.customData);
        // } else if (options.customDataUrl) {
        //     loadCustomDataFromUrl(options.customDataUrl);
        // } else {
        //     console.error('Error: both customData and customDataUrl are empty!');
        // }
    }




    // function renderInternal() {
    //     tick();
    // }
    //
    // var rafId = null;
    // function render() {
    //     // if (rafId == null) {
    //     //     rafId = requestAnimationFrame(function() {
    //     //         rafId = null;
    //     //         renderInternal();
    //     //     });
    //     // }
    //     renderInternal()
    // }

    function loadCustomData() { //Entry point for loading data
        nodes = []; //set the base elements array
        relationships = [];
        notes = [];
        groups = [];

        updateWithCustomData(options.customData);
    }

    function loadCustomDataFromUrl(customDataUrl) {
        nodes = [];//set the base elements array
        relationships = [];
        notes = [];

        d3.json(customDataUrl, function(error, data) {
            if (error) {
                throw error;
            }

            updateWithCustomData(data);
        });
    }

    function merge(target, source) {
        Object.keys(source).forEach(function(property) {
            target[property] = source[property];
        });
    }

    function customDataToD3Data(data) {
        var graph = {
            nodes: [],
            relationships: [],
            notes:[]//TODO populate notes initaly
        };

        data.results.forEach(function(result) {
            result.data.forEach(function(data) {
                data.graph.nodes.forEach(function(node) {
                    if (!contains(graph.nodes, node.id)) {
                        graph.nodes.push(node);
                    }
                });

                data.graph.relationships.forEach(function(relationship) {
                    relationship.source = relationship.startNode;
                    relationship.target = relationship.endNode;
                    graph.relationships.push(relationship);
                });

                data.graph.relationships.sort(function(a, b) {
                    if (a.source > b.source) {
                        return 1;
                    } else if (a.source < b.source) {
                        return -1;
                    } else {
                        if (a.target > b.target) {
                            return 1;
                        }

                        if (a.target < b.target) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });

                for (var i = 0; i < data.graph.relationships.length; i++) {
                    if (i !== 0 && data.graph.relationships[i].source === data.graph.relationships[i-1].source && data.graph.relationships[i].target === data.graph.relationships[i-1].target) {
                        data.graph.relationships[i].linknum = data.graph.relationships[i - 1].linknum + 1;
                    } else {
                        data.graph.relationships[i].linknum = 1;
                    }
                }
            });
        });

        return graph;
    }

    function randomD3Data(d, maxNodesToGenerate) {
        var data = {
                nodes: [],
                relationships: []
            },
            i,
            label,
            node,
            numNodes = (maxNodesToGenerate * Math.random() << 0) + 1,
            relationship,
            s = size();

        for (i = 0; i < numNodes; i++) {
            label = randomLabel();

            node = {
                id: s.nodes + 1 + i,
                labels: [label],
                properties: {
                    random: label
                },
                x: d.x,
                y: d.y
            };

            data.nodes[data.nodes.length] = node;

            relationship = {
                id: s.relationships + 1 + i,
                displayType: label.toUpperCase(),
                type: label.toUpperCase(),
                startNode: d.id,
                endNode: s.nodes + 1 + i,
                properties: {
                    from: Date.now()
                },
                source: d.id,
                target: s.nodes + 1 + i,
                linknum: s.relationships + 1 + i
            };

            data.relationships[data.relationships.length] = relationship;
        }

        return data;
    }

    function randomLabel() {
        var icons = Object.keys(options.iconMap);
        return icons[icons.length * Math.random() << 0];
    }

    function rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

        return { x: nx, y: ny };
    }

    function rotatePoint(c, p, angle) {
        return rotate(c.x, c.y, p.x, p.y, angle);
    }

    function rotation(source, target) {
        return Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
    }

    function size() {
        return {
            nodes: nodes.length,
            relationships: relationships.length
        };
    }
/*
    function smoothTransform(elem, translate, scale) {
        var animationMilliseconds = 5000,
            timeoutMilliseconds = 50,
            steps = parseInt(animationMilliseconds / timeoutMilliseconds);

        setTimeout(function() {
            smoothTransformStep(elem, translate, scale, timeoutMilliseconds, 1, steps);
        }, timeoutMilliseconds);
    }

    function smoothTransformStep(elem, translate, scale, timeoutMilliseconds, step, steps) {
        var progress = step / steps;

        elem.attr('transform', 'translate(' + (translate[0] * progress) + ', ' + (translate[1] * progress) + ') scale(' + (scale * progress) + ')');

        if (step < steps) {
            setTimeout(function() {
                smoothTransformStep(elem, translate, scale, timeoutMilliseconds, step + 1, steps);
            }, timeoutMilliseconds);
        }
    }
*/
    function stickNode(d) {
        if (d3.event.sourceEvent.ctrlKey && currentSelectedNodes) {//move other selected nodes
          let delta = [
            -d.fx + d3.event.x,
            -d.fy + d3.event.y
          ]
          moveCurrentSelectedNodes(delta)
        }else {
          d.fx = d3.event.x;//move only main targeted node
          d.fy = d3.event.y;
        }
        //check if a group is a slave of this node and move it
        if (currentLinkedSubgroup) {
          let delta = [
            d3.event.dx,
            d3.event.dy
          ]
          moveCurrentLinkedSubgroup(currentLinkedSubgroup, delta)
        }

        if (currentSelectedNodes && !d3.event.sourceEvent.ctrlKey) {//remove selection on move without control
          currentSelectedNodes = undefined
          markNodesSelected(currentSelectedNodes)
        }
    }

    function tick() {
        tickNodes();
        tickRelationships();
    }

    function tickNodes() {
        if (node) {
          //check if update is needed
          node.each(function (d) {
            if (d.xFrom ) {
              d.delta = Math.max(Math.abs(d.xFrom - d.x),Math.abs(d.yFrom - d.y));
            }else {
              d.xFrom = d.x
              d.yFrom = d.y
              d.delta=10000 //to kickstart sim at first
            }
          })
          .filter(function (d) {//use only nodes that are moving
            return d.delta > 0;
          })
          .attr('transform', function(d) {
              return 'translate(' + d.x + ', ' + d.y + ')';
          });

        }
    }

    function tickRelationships() {
        if (relationship) {

            if (options.showLinksOverlay) {
              tickRelationshipsOverlays();
            }
            tickRelationshipsOutlines();
        }
    }

    function tickRelationshipsOutlines() {
      //check if update is needed
        relationship.each(function (d) {
          if (d.source.xFrom &&  d.target.xFrom) {
            d.delta = Math.max(d.source.delta,d.target.delta)
          }else{
            d.delta=10000 //to kickstart sim at first
          }
          // if (d.delta ) {
          //   d.delta = Math.max(Math.abs(d.source.xFrom - d.source.x),Math.abs(d.source.yFrom - d.source.y),Math.abs(d.target.xFrom - d.target.x),Math.abs(d.target.yFrom - d.target.y));
          // }else {
          //   d.delta=10000 //to kickstart sim at first
          // }
        })
        .filter(function (d) {//use only nodes that are moving
          return d.delta > 0;

        })
        .each(function(d) {

            var rel = d3.select(this),
                outline = rel.select('.outline'),
                text = rel.select('.text'),
                padding = 3;

                var sourceRotationAngle = rotation(d.source, d.target);
                var sourceUnitaryNormalVector = unitaryNormalVector(d.source, d.target);

                rel.attr('transform', function(d) {
                    var angle = sourceRotationAngle

                    var normal = sourceUnitaryNormalVector

                    // var normal = {x:0,y:0}
                    // if (d.displacement) {
                    //   normal = unitaryNormalVector(d.source, d.target);
                    // }

                    var displacementDist = d.displacement|| 0;
                    return 'translate(' + (d.source.x+(displacementDist*normal.x))+ ', ' + (d.source.y+(displacementDist*normal.y)) + ')rotate(' + angle + ')';
                });
            var displayWidth = 8
            if (d.displayType) {
              displayWidth= d.displayType.length*4
            }
            var bbox = {width:displayWidth, height:0};// simplification considering each letter is 4px large

            tickRelationshipsCurrentOutline(outline, bbox,sourceRotationAngle , sourceUnitaryNormalVector)
            if (options.showLinksText) {
              tickRelationshipsTexts(text, sourceRotationAngle ,sourceUnitaryNormalVector)
            }



        });
        //current functions
        function tickRelationshipsTexts(text,sourceRotationAngle ,sourceUnitaryNormalVector) {
          text.attr('transform', function(d) {
              var angle = (sourceRotationAngle + 360) % 360,
                  mirror = angle > 90 && angle < 270,
                  center = { x: 0, y: 0 },
                  n = sourceUnitaryNormalVector,
                  nWeight = mirror ? 2 : -3,
                  point = { x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight, y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight },
                  rotatedPoint = rotatePoint(center, point, angle);

              return 'translate(' + rotatedPoint.x + ', ' + rotatedPoint.y + ') rotate(' + (mirror ? 180 : 0) + ')';
          });
        }
        function tickRelationshipsCurrentOutline(outline, bbox,sourceRotationAngle , sourceUnitaryNormalVector) {
          outline.attr('d', function(d) {
              var center = { x: 0, y: 0 },
                  angle = sourceRotationAngle,
                  textBoundingBox = bbox,
                  textPadding = 5,
                  u = unitaryVector(d.source, d.target),
                  textMargin = { x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5, y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5 },
                  n = sourceUnitaryNormalVector,
                  rotatedPointA1 = rotatePoint(center, { x: 0 + (options.nodeRadius + 1) * u.x - n.x, y: 0 + (options.nodeRadius + 1) * u.y - n.y }, angle),

                  rotatedPointB2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x - u.x * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y - u.y * options.arrowSize }, angle);
                  if (options.showLinksText) {
                    var rotatedPointB1 = rotatePoint(center, { x: textMargin.x - n.x, y: textMargin.y - n.y }, angle);
                    var rotatedPointA2 = rotatePoint(center, { x: d.target.x - d.source.x - textMargin.x - n.x, y: d.target.y - d.source.y - textMargin.y - n.y }, angle);

                    return 'M ' + rotatedPointA1.x + ' ' + rotatedPointA1.y +
                            ' L ' + rotatedPointB1.x + ' ' + rotatedPointB1.y +
                            ' Z M ' + rotatedPointB2.x + ' ' + rotatedPointB2.y +
                            ' L ' + rotatedPointA2.x + ' ' + rotatedPointA2.y +
                            ' Z';
                  }else {
                    return 'M ' + rotatedPointB2.x + ' ' + rotatedPointB2.y +
                            ' L ' + rotatedPointA1.x + ' ' + rotatedPointA1.y +
                            ' Z';
                  }
          });
        }
    }

    function tickRelationshipsOverlays() {
        relationshipOverlay.attr('d', function(d) {

          let mustUpdate = false;
          if (mustUpdate) {
            var center = { x: 0, y: 0 },
                angle = rotation(d.source, d.target),
                n1 = unitaryNormalVector(d.source, d.target),
                n = unitaryNormalVector(d.source, d.target, 50),
                rotatedPointA = rotatePoint(center, { x: 0 - n.x, y: 0 - n.y }, angle),
                rotatedPointB = rotatePoint(center, { x: d.target.x - d.source.x - n.x, y: d.target.y - d.source.y - n.y }, angle),
                rotatedPointC = rotatePoint(center, { x: d.target.x - d.source.x + n.x - n1.x, y: d.target.y - d.source.y + n.y - n1.y }, angle),
                rotatedPointD = rotatePoint(center, { x: 0 + n.x - n1.x, y: 0 + n.y - n1.y }, angle);

            return 'M ' + rotatedPointA.x + ' ' + rotatedPointA.y +
                   ' L ' + rotatedPointB.x + ' ' + rotatedPointB.y +
                   ' L ' + rotatedPointC.x + ' ' + rotatedPointC.y +
                   ' L ' + rotatedPointD.x + ' ' + rotatedPointD.y +
                   ' Z';
          }
        });
    }

    function tickRelationshipsTexts() {
        // relationshipText.attr('transform', function(d) {
        //     var angle = (rotation(d.source, d.target) + 360) % 360,
        //         mirror = angle > 90 && angle < 270,
        //         center = { x: 0, y: 0 },
        //         n = unitaryNormalVector(d.source, d.target),
        //         nWeight = mirror ? 2 : -3,
        //         point = { x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight, y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight },
        //         rotatedPoint = rotatePoint(center, point, angle);
        //
        //     return 'translate(' + rotatedPoint.x + ', ' + rotatedPoint.y + ') rotate(' + (mirror ? 180 : 0) + ')';
        // });
    }

    function toString(d) {
        var s = d.labels ? d.labels[0] : d.type;

        s += ' (<id>: ' + d.id;

        Object.keys(d.properties).forEach(function(property) {
            s += ', ' + property + ': ' + JSON.stringify(d.properties[property]);
        });

        s += ')';

        return s;
    }

    function unitaryNormalVector(source, target, newLength) {
        var center = { x: 0, y: 0 },
            vector = unitaryVector(source, target, newLength);

        return rotatePoint(center, vector, 90);
    }

    function unitaryVector(source, target, newLength) {
        var length = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);

        return {
            x: (target.x - source.x) / length,
            y: (target.y - source.y) / length,
        };
    }

    // function updateWithD3Data(d3Data) {
    //
    //     //check for extra Helper elements
    //     updateHelpers(d3Data.notes,d3Data.groups)
    //     //start display cycle of nodes and relations
    //     updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
    // }

    // function updateWithCustomData(customData) {
    //     var d3Data = customDataToD3Data(customData);
    //     updateWithD3Data(d3Data);
    // }

    function updateInfo(d) {
        clearInfo();

        if (d.labels) {
            appendInfoElementClass('class', d.labels[0], d.customColor);
        } else {
            appendInfoElementRelationship('class', d.type);
        }

        appendInfoElementProperty('property', '&lt;id&gt;', d.id);

        Object.keys(d.properties).forEach(function(property) {
            appendInfoElementProperty('property', property, JSON.stringify(d.properties[property]));
        });
    }




    function createGroupLinks(nodes) {
      function checkIfLabelMustGroup(label) {
        if (!Array.isArray(options.groupLabels) ) {
          return options.groupLabels
        }else {
          return options.groupLabels.includes(label)
        }
      }
      var lastLabel ='none'
      var currentNode = undefined
      var curentIndex =-1;
      var groupLinks = []
      nodes.forEach(function (i) {
        if (i.labels[0] != lastLabel && i.id!=1 && checkIfLabelMustGroup(i.labels[0])) {
          currentNode = i
          lastLabel = i.labels[0]
          nodes.filter(e=>e.labels[0] == lastLabel && e != currentNode).forEach(function (i) {
            curentIndex ++;
            var newLink = {
              endNode: i.uuid,
              id: curentIndex,
              index: curentIndex,
              invisible:true,
              properties: {from: 1470002400000},
              source: currentNode,
              startNode: currentNode.uuid,
              target: i,
              type: "origin"
            }
            groupLinks.push(newLink)
          })
        }
      })
      return groupLinks
    }
    function createRootNode(nodes) {
      var firstNode = undefined
      var curentIndex =1000000;
      var currentNode =undefined;
      var groupLinks = []
      var limitToGroup = "Pbs"
      nodes.forEach(function (i) {
        if (firstNode) {
          if (!limitToGroup || i.labels[0] == limitToGroup) { //TODO add filter control
            currentNode = i
            curentIndex ++;
            var newLink = {
              endNode: i.uuid,
              id: curentIndex,
              index: curentIndex,
              invisible:true,
              properties: {from: 1470002400000},
              source: firstNode,
              startNode: firstNode.uuid,
              target: i,
              type: "origin"
            }
            groupLinks.push(newLink)
          }
        }else {
          firstNode = i
        }
      })
      return groupLinks
    }

    // function updateRelationships(r) {
    //     Array.prototype.push.apply(relationships, r);
    //
    //     relationship = svgRelationships.selectAll('.relationship')
    //                                    .data(relationships, function(d) { return d.id; });
    //
    //     var relationshipEnter = appendRelationshipToGraph();
    //
    //     relationship = relationshipEnter.relationship.merge(relationship);
    //
    //     relationshipOutline = svg.selectAll('.relationship .outline');
    //     relationshipOutline = relationshipEnter.outline.merge(relationshipOutline);
    //
    //     if (options.showLinksOverlay) {
    //       relationshipOverlay = svg.selectAll('.relationship .overlay');
    //       relationshipOverlay = relationshipEnter.overlay.merge(relationshipOverlay);
    //     }
    //
    //
    //     if (options.showLinksText) {
    //       relationshipText = svg.selectAll('.relationship .text');
    //       relationshipText = relationshipEnter.text.merge(relationshipText);
    //     }
    //
    //
    // }

    function version() {
        return VERSION;
    }

    function importNodesPosition() {
        nodes.forEach(function (n) {
          // n.fx = 10;
          // n.fy = 100;
          // n.x = 10;
          // n.y = 100;
        })
        simulation.nodes(nodes);
    }
    function setFadeOtherNodesOnHoover(value) {
        options.fadeOtherNodesOnHoover = value
    }

    function unhideConnectedNodes(currentNode) {
      var linkedByIndex = {};
      relationships.forEach(function(d) {
          linkedByIndex[d.source.index + "," + d.target.index] = 1;
      });
      function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
      }
      var visible = d3.selectAll(".node").filter(function(d){
                return isConnected(d, currentNode);
              });
      visible.style("display","block");

      var currentLinkedRel= d3.selectAll(".relationship").filter(function(o){
                return o.source === currentNode || o.target === currentNode
              });
      currentLinkedRel.style("display","block");

      // d3.selectAll(".relationship").each("display", function(o) {
      //           return o.source === currentNode || o.target === currentNode ? "block" : "none";
      //       });
    }
    function unhideAllNodes() {
      d3.selectAll(".node").style("display","block");
      d3.selectAll(".relationship").style("display","block");
    }

    function setFocusedNodes(property, arrayOfFocusedValue, style){
      if (style.includes("mark")) {
        d3.selectAll(".node").select(".selection_ring").style("opacity",0); //clear all
        if (arrayOfFocusedValue[0]) {//mark selected
          let currentSelected = arrayOfFocusedValue
          var currentSelectedDom = d3.selectAll(".node").filter(function(d){
                    return currentSelected.includes(d[property]) //check if prop value is in selected array
                  });
          currentSelectedDom.select(".selection_ring").style("opacity",1);
        }
      }
      if (style.includes("hideOthers")){
        if (arrayOfFocusedValue[0]) {
          d3.selectAll(".relationship").style("display","none"); //clear all
          d3.selectAll(".node").style("display","none"); //clear all
          let currentSelected = arrayOfFocusedValue
          var currentSelectedDom = d3.selectAll(".node").filter(function(d){
                    return currentSelected.includes(d[property]) //check if prop value is in selected array
                  });
          currentSelectedDom.style("display","block");
          currentSelectedDom.each((d) => {//display connected nodes
            unhideConnectedNodes(d)
          })
        }else {
          d3.selectAll(".node").style("display","block"); //show all
          d3.selectAll(".relationship").style("display", "block");
        }
      }

    }

    function zoomFit(transitionDuration) {
        var bounds = svg.node().getBBox(),
            parent = svg.node().parentElement.parentElement,
            fullWidth = parent.clientWidth,
            fullHeight = parent.clientHeight,
            width = bounds.width,
            height = bounds.height,
            midX = bounds.x + width / 2,
            midY = bounds.y + height / 2;

        if (width === 0 || height === 0) {
            return; // nothing to fit
        }

        svgScale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
        svgTranslate = [fullWidth / 2 - svgScale * midX, fullHeight / 2 - svgScale * midY];

        svg.attr('transform', 'translate(' + svgTranslate[0] + ', ' + svgTranslate[1] + ') scale(' + svgScale + ')');
//        smoothTransform(svgTranslate, svgScale);
    }
    function getSelectedNodes() {
      return currentSelectedNodes
    }
    function setSelectionModeActive() {
      selectionModeActive = true;
      controls.enabled = false;
    }
    function setSelectionModeInactive() {
      selectionModeActive = false;
      controls.enabled = true;
    }

    // function getCurrentMousePosition() {
    //         var xy1 = mouseCurrentPosition
    //         return{x:xy1[0],y:xy1[1]}
    // }
    function getlocalMousePositionFromLayerMousePosition(xy) {
            var transform = d3.zoomTransform(base.node());
            var xy1 = transform.invert(xy);
            return{x:xy1[0],y:xy1[1]}
    }

    function initialZoom(startPositions) {
        // svgScale = startPositions[2]
        // svgTranslate = [startPositions[0],startPositions[1]];
        // svg.attr('transform', 'translate(' + 0 + ', ' + 0 + ') scale(' + startPositions[2] + ')');
        //svg.attr('transform', 'translate(' + svgTranslate[0] + ', ' + svgTranslate[1] + ') scale(' + svgScale + ')');
        // svgNodes.attr('transform', 'translate(' + 400 + ', ' + 200 + ') scale(' + 0.8 + ')');

        // svgNodes.attr('transform', 'translate(' + startPositions[0] + ', ' + startPositions[1] + ') scale(' + startPositions[2] + ')');
        // svgRelationships.attr('transform', 'translate(' + startPositions[0] + ', ' + startPositions[1] + ') scale(' + startPositions[2] + ')');

        // svg.attr('dx',startPositions[0])
        // svg.attr('dy',startPositions[1])

        // svg.attr('transform', 'translate(' + startPositions[0] + ', ' + startPositions[1] + ') scale(' + startPositions[2] + ')');
        base.call( zoom.transform, d3.zoomIdentity.translate(startPositions[0],startPositions[1]).scale(startPositions[2]) );
        // svg.call(zoom)
//        smoothTransform(svgTranslate, svgScale);
    }

    //ITEM CREATION
    function createCircleGeometry() {
       var circleRadius = 4;
       // var circleShape = new THREE.Shape()
       //   .moveTo( 0, circleRadius )
       //   .quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 )
       //   .quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius )
       //   .quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 )
       //   .quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );
       // var geometry = new THREE.ShapeBufferGeometry( circleShape );
       geometry = new THREE.CircleGeometry( 1, 30 );
       return geometry
    }


    function createCircle(data) {
    var scaler = 0.5
     var material = new THREE.MeshBasicMaterial( { color: data.customColor ||0x6dce9e } );
     var mesh = new THREE.Mesh( circleGeometry, material)
     mesh.scale.set( 1.0*scaler, 1.0*scaler, 1.0 );
     return mesh
    }
    function createBorderCircle(data) {
      let darkerColor = undefined
      if (data.customColor) {
        darkerColor = class2darkenCustomColor(data.customColor)
      }
    var scaler = 0.5
    var material = new THREE.MeshBasicMaterial( { color:darkerColor ||0x4c906f } );
     var mesh = new THREE.Mesh( circleGeometry, material)
     mesh.scale.set( 1.1*scaler, 1.1*scaler, 1.0 );
     return mesh
    }

    function createNode(data) {
     let circle = createCircle(data)
     circle.edata = data
     let borderCircle = createBorderCircle(data)
     borderCircle.position.set(0.0,0.0,-0.008)
     borderCircle.edata = data

     let title = makeTextSprite( data.name, {} )
     title.position.set(0,-0.8,-0.0001)
     var group = new THREE.Group();
     group.add( circle )
     group.add( borderCircle )
     group.add( title )
     if (data.extraLabel) {
       addGlyph(data.extraLabel, group)
     }
     nodes.push(borderCircle)
     nodesCore.push(circle)
     return group
    }

    function addGlyph(svgPath, group) {

      let svgtxt = `<svg style="cursor:pointer;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" data-id="eWAwvjEVAsZxRs5I">
      <path data-id="eWAwvjEVAsZxRs5I" fill="#ffffff" transform="scale(0.04) translate(10,0)" d="${svgPath}"></path>
    </svg>`

      let svgCont = document.createElement('div')
      // svgCont.innerHTML =svgtxt
      document.body.appendChild(svgCont)
      svgCont.style.height ="0px"
      svgCont.style.overflow ="hidden"
      svgCont.innerHTML = svgtxt

      // document.getElementById("svgContainer").innerHTML = svgtxt

      var svg = svgCont.querySelector("svg");
      // var svg = document.getElementById("svgContainer").querySelector("svg");
      var svgData = (new XMLSerializer()).serializeToString(svg);

      var canvas = document.createElement("canvas");
      var svgSize = svg.getBoundingClientRect();
      canvas.width = 150;
      canvas.height = 150;
      // canvas.width = svgSize.width;
      // canvas.height = svgSize.height;
      var ctx = canvas.getContext("2d");

      var img = document.createElement("img");
      //document.body.appendChild(img)
      img.setAttribute("src", "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgData))) );

      img.onload = function() {
        //ctx.globalAlpha = 0.4;

        ctx.drawImage(img, 0, 0);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        spriteTextureBuffer.push(texture)
        //
        // var geometry =  new THREE.PlaneGeometry( 1, 1 )
        // // var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
        // var material = new THREE.MeshBasicMaterial({ map: texture });
        // //material.map.minFilter = THREE.LinearFilter;
        // var mesh = new THREE.Mesh(geometry, material);

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        spriteBuffer.push(sprite)
        sprite.position.set(0.18,-0.25,0.05)
        group.add(sprite);
        svgCont.remove()
        //img.remove()
      };

    }

    function makeTextSprite( message, parameters )
    {
       if ( parameters === undefined ) parameters = {};
       var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
       var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 100;
       var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 0;
       var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:0.0 };
       var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:0.0 };
       var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

       var canvas = document.createElement('canvas');
       var context = canvas.getContext('2d');
       context.font = "Bold " + fontsize + "px " + fontface;
       var metrics = context.measureText( message );
       var textWidth = metrics.width;

       context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
       context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

       context.lineWidth = borderThickness;
       //roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

       context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
       context.fillText( message, borderThickness, fontsize + borderThickness);

       var texture = new THREE.Texture(canvas)
       texture.needsUpdate = true;
       spriteTextureBuffer.push(texture)

       var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
       var sprite = new THREE.Sprite( spriteMaterial );
       //sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
       sprite.scale.set(0.002 * canvas.width, 0.0025 * canvas.height);
       spriteBuffer.push(sprite)
       return sprite;
    }

    function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }

    function createRectangle() {
        const sqLength = 80;
				const squareShape = new THREE.Shape()
					.moveTo( 0, 0 )
					.lineTo( 0, sqLength )
					.lineTo( sqLength, sqLength )
					.lineTo( sqLength, 0 )
					.lineTo( 0, 0 );
        squareShape.autoClose = true;

  			const points = squareShape.getPoints();

  			const geometryPoints = new THREE.BufferGeometry().setFromPoints( points );

  			// solid line
        const matLine = new THREE.LineDashedMaterial( {
        	color: 0x0595d9,
        	linewidth: 3,
        	scale: 5,
        	dashSize: 3,
        	gapSize: 1,
        } );

  			let line = new THREE.Line( geometryPoints, matLine );
        line.computeLineDistances();
  			line.position.set( 0, 0, 0);
  			// line.scale.set( 0.1, 0.1, 0.1 );
  			stage.add( line );
        line.visible =false
        return line
    }
    function class2darkenCustomColor(cls) {
      function toHex(rgb) {
        var r = Math.round(rgb.r).toString(16);
        var g = Math.round(rgb.g).toString(16);
        var b = Math.round(rgb.b).toString(16);
        if(rgb.r < 16) r = "0" + r;
        if(rgb.g < 16) g = "0" + g;
        if(rgb.b < 16) b = "0" + b;
        return "#"+r+g+b;
      }
        return toHex(d3.rgb(cls).darker(1))
    }

    function dcText(txt, hWorldTxt, hWorldAll, hPxTxt, fgcolor, bgcolor) { // the routine
      // txt is the text.
      // hWorldTxt is world height of text in the plane.
      // hWorldAll is world height of whole rectangle containing the text.
      // hPxTxt is px height of text in the texture canvas; larger gives sharper text.
      // The plane and texture canvas are created wide enough to hold the text.
      // And wider if hWorldAll/hWorldTxt > 1 which indicates padding is desired.
      var kPxToWorld = hWorldTxt/hPxTxt;                // Px to World multplication factor
      // hWorldTxt, hWorldAll, and hPxTxt are given; get hPxAll
      var hPxAll = Math.ceil(hWorldAll/kPxToWorld);     // hPxAll: height of the whole texture canvas
      // create the canvas for the texture
      var txtcanvas = document.createElement("canvas"); // create the canvas for the texture
      var ctx = txtcanvas.getContext("2d");
      ctx.font = hPxTxt + "px sans-serif";
      // now get the widths
      var wPxTxt = ctx.measureText(txt).width;         // wPxTxt: width of the text in the texture canvas
      var wWorldTxt = wPxTxt*kPxToWorld;               // wWorldTxt: world width of text in the plane
      var wWorldAll = wWorldTxt+(hWorldAll-hWorldTxt); // wWorldAll: world width of the whole plane
      var wPxAll = Math.ceil(wWorldAll/kPxToWorld);    // wPxAll: width of the whole texture canvas
      // next, resize the texture canvas and fill the text
      txtcanvas.width =  wPxAll;
      txtcanvas.height = hPxAll;
      if (bgcolor != undefined) { // fill background if desired (transparent if none)
        ctx.fillStyle = "#" + bgcolor.toString(16).padStart(6, '0');
        ctx.fillRect( 0,0, wPxAll,hPxAll);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#" + fgcolor.toString(16).padStart(6, '0'); // fgcolor
      ctx.font = hPxTxt + "px sans-serif";   // needed after resize
      ctx.fillText(txt, wPxAll/2, hPxAll/2); // the deed is done
      // next, make the texture
      var texture = new THREE.Texture(txtcanvas); // now make texture
      texture.minFilter = THREE.LinearFilter;     // eliminate console message
      texture.needsUpdate = true;                 // duh
      // and make the world plane with the texture
      geometry = new THREE.PlaneGeometry(wWorldAll, hWorldAll);
      var material = new THREE.MeshBasicMaterial(
        { side:THREE.DoubleSide, map:texture, transparent:true, opacity:1.0 } );
      // and finally, the mesh
      var mesh = new THREE.Mesh(geometry, material);
      mesh.wWorldTxt = wWorldTxt; // return the width of the text in the plane
      mesh.wWorldAll = wWorldAll; //    and the width of the whole plane
      mesh.wPxTxt = wPxTxt;       //    and the width of the text in the texture canvas
                                  // (the heights of the above items are known)
      mesh.wPxAll = wPxAll;       //    and the width of the whole texture canvas
      mesh.hPxAll = hPxAll;       //    and the height of the whole texture canvas
      mesh.ctx = ctx;             //    and the 2d texture context, for any glitter
      // console.log(wPxTxt, hPxTxt, wPxAll, hPxAll);
      // console.log(wWorldTxt, hWorldTxt, wWorldAll, hWorldAll);
      return mesh;
    }

    function cleanAll() { //TODO use to avoid memory hog
      displayed = false
      renderer.dispose()

      const cleanMaterial = material => {
        material.dispose()

        // dispose textures
        for (const key of Object.keys(material)) {
          const value = material[key]
          if (value && typeof value === 'object' && 'minFilter' in value) {
            value.dispose()
          }
        }
      }

      scene.traverse(object => {
      	if (!object.isMesh) return

      	object.geometry.dispose()

      	if (object.material.isMaterial) {
      		cleanMaterial(object.material)
      	} else {
      		// an array of materials
      		for (const material of object.material) cleanMaterial(material)
      	}
      })

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].geometry.dispose()
        if (nodes[i].material.isMaterial) {
      		cleanMaterial(nodes[i].material)
      	} else {
      		// an array of materials
      		for (const material of object.material) cleanMaterial(material)
      	}
        nodes[i] = []
        nodesCore[i].geometry.dispose()
        if (nodesCore[i].material.isMaterial) {
      		cleanMaterial(nodesCore[i].material)
      	} else {
      		// an array of materials
      		for (const material of nodesCore[i].material) cleanMaterial(material)
      	}
        nodesCore[i] =[]
      }
      for (var i = 0; i < spriteTextureBuffer.length; i++) {
        spriteTextureBuffer[i].dispose()
      }
      for (var i = 0; i < spriteBuffer.length; i++) {
        spriteBuffer[i].geometry.dispose()
        if (spriteBuffer[i].material.isMaterial) {
      		cleanMaterial(spriteBuffer[i].material)
      	}
      }

    }

    function updateWithCustomData(customData) {
        var d3Data = customDataToD3Data(customData);
        updateWithD3Data(d3Data);
    }

    init(_selector, _options);

    return {
        appendRandomDataToNode: appendRandomDataToNode,
        customDataToD3Data: customDataToD3Data,
        randomD3Data: randomD3Data,
        size: size,
        updateWithD3Data: updateWithD3Data,
        updateWithCustomData: updateWithCustomData,
        exportNodesPosition: exportNodesPosition,
        importNodesPosition: importNodesPosition,
        exportHelpers:exportHelpers,
        setSelectionModeActive:setSelectionModeActive,
        setSelectionModeInactive:setSelectionModeInactive,
        setFocusedNodes:setFocusedNodes,
        setFadeOtherNodesOnHoover: setFadeOtherNodesOnHoover,
        getSelectedNodes: getSelectedNodes,
        // getCurrentMousePosition: getCurrentMousePosition,
        getlocalMousePositionFromLayerMousePosition: getlocalMousePositionFromLayerMousePosition,
        cleanAll: cleanAll,
        version: version
    };
}

module.exports = stellae;

},{}]},{},[1])(1)
});
