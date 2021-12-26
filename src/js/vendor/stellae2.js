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

      var getImageData = false;
      var imgData = undefined;

      var displayed = true;

      var renderer = undefined;

      var geometry = undefined
      var squareGeometry = undefined;
      var material = undefined
      var mainMaterial = undefined

      var selectedObject = undefined
      var selectedHelper = undefined
      var selectedHandle = undefined
      var currentNodesInActiveGroup =[]
      var selectionBox = undefined
      var selectionBoxActive = false
      var selectionBoxPosition = {x:0,y:0,xEnd:0,yEnd:0};
      var currentSelectedNodes = [];
      var nodes = []
      var nodesCore = []
      var nodesData = []
      var nodesNotes = []
      var nodesGroups = []
      var objectsHandles = []
      var relationshipTextElement=[]
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



      function moveCurrentGroupedNodes(nodes, delta, active) {
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


      function setUpGraph(container) {

      let containerDim = container.getBoundingClientRect();

      let h =containerDim.height;
      let w =containerDim.width;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 75,w/h, 0.1, 1000 );

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias :true,   });
      renderer.setSize( w,  h );
      container.appendChild( renderer.domElement );

      geometry = new THREE.BoxGeometry( 1, 1, 1 );
      material = new THREE.MeshBasicMaterial( { color: 0x35bdb2 } );
      mainMaterial = new THREE.MeshBasicMaterial( { color: 0x35bdb2 } );
      cube = new THREE.Mesh( geometry, material );
      cube.position.x = 5
      // scene.add(cube)

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
      controls = new THREE.MapControls( camera, renderer.domElement ) //TODO: remove for module
      // controls = new MapControls( camera, renderer.domElement )



      // camera.position.z = 20;
      camera.position.y = 20;
      if (options.startTransform && options.startTransform.translate) {
        console.log(options.startTransform);
        camera.position.x = options.startTransform.translate.x
        camera.position.y = options.startTransform.translate.y
        camera.position.z = options.startTransform.translate.z
        controls.target.set(options.startTransform.target.x,options.startTransform.target.y,options.startTransform.target.z)
        // camera.rotation.x = options.startTransform.rotation.x
        // camera.rotation.y = options.startTransform.rotation.y
        // camera.rotation.z = options.startTransform.rotation.z
      }
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

      plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 18, 18), new THREE.MeshBasicMaterial({
                  color: 0x00ff00,
                  opacity: 0.50,
                  transparent: false
              }));
              plane.visible = false;
              //plane.rotation.x = -Math.PI / 2;
              stage.add(plane);

      container.onclick = function (event) {
        // get the mouse positions
        let clickType = "single"
        if ( event.detail == 1 ) {//singleClick
          clickType = "single"
        } else if ( event.detail == 2 ) {
          clickType = "double"
        }
        var mouse_x = ( (event.clientX-containerDim.x) / containerDim.width ) * 2 - 1;
        var mouse_y = -( (event.clientY-containerDim.y) / (containerDim.height) ) * 2 + 1;
        console.log(event.clientY )
        var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5);
        vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position,
                vector.sub(camera.position).normalize());

        //  scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 10, 0xff0000) );
        var intersects1 = raycaster.intersectObjects(nodesNotes);
        var intersects2 = raycaster.intersectObjects(nodes);
        var intersects3 = raycaster.intersectObjects(relationshipTextElement)
        var intersects4 = raycaster.intersectObjects(objectsHandles)
        
        console.log(intersects2);
        if (intersects2.length>0) {
            console.log("node clicked");
            if (typeof options.onNodeClick === 'function' && clickType == "single") {
              options.onNodeClick(intersects2[0].object.edata,{canvasPosition: undefined});
            }
            if (typeof options.onNodeDoubleClick === 'function' && clickType == "double") {
              options.onNodeDoubleClick(intersects2[0].object.edata,{canvasPosition: undefined});
            }
        }else if (intersects1.length>0) {
            console.log("note clicked");
            let node = intersects1[0].object
            let group = intersects1[0].object.parent
            let data = group.edata
            if (typeof options.onNoteClick === 'function' && clickType == "single") {
              options.onNoteClick(group.edata,{canvasPosition: undefined});
            }else if (typeof options.onNoteDoubleClick === 'function' && clickType == "double") {
              options.onNoteDoubleClick(group.edata,{canvasPosition: undefined});
            } else if (clickType == "double") {
            
            var newName = prompt("Content", data.content)
            if (newName == "") {
              if (confirm("Remove note?")) {
                notes=notes.filter(n=>n.uuid!= data.uuid)//remove the note from data
                nodesNotes=nodesNotes.filter(n=>n!=node)//remove the note from data
                options.onNoteRemove(data);
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
        }else if(intersects3.length>0){
            console.log("relation clicked");
            if (typeof options.onRelationshipClick === 'function' && clickType == "single") {
              options.onRelationshipClick(intersects3[0].object.edata);
            }
            if (typeof options.onRelationshipDoubleClick === 'function' && clickType == "double") {
              options.onRelationshipDoubleClick(intersects3[0].object.edata);
            }
            
        }else if(intersects4.length>0){
          //  alert("fdsfes")
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
          var mouse_y = -( (event.clientY-containerDim.y) / (containerDim.height) ) * 2 + 1;
          // get the 3D position and create a raycaster
          mouse.x = mouse_x;
          mouse.y = mouse_y;
          // mouse.x = ( (event.clientX -containerDim.x) / containerDim.width ) * 2 - 1;
          // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
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
            selectionBoxPosition.x=basePoint_x
            selectionBoxPosition.y=basePoint_y
            selectionBoxPosition.xEnd=newPosition.x
            selectionBoxPosition.yEnd=-newPosition.z

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
              if (!selectedObject.edata.fx) {
                selectedObject.edata.fx =selectedObject.edata.x
                selectedObject.edata.fy =selectedObject.edata.y
              }
              selectedObject.edata.x = newPosition.x/canvasScale
              selectedObject.edata.y = -newPosition.z/canvasScale
              let delta = [selectedObject.edata.x-selectedObject.edata.fx, selectedObject.edata.y-selectedObject.edata.fy]
              selectedObject.edata.fx = newPosition.x/canvasScale
              selectedObject.edata.fy = -newPosition.z/canvasScale
              if (currentSelectedNodes[0]) {
                moveCurrentSelectedNodes(delta, selectedObject)
              }
          } else if (selectedHelper) {
            var intersects = raycaster.intersectObject(plane);
            let newPosition =intersects[0].point
            let delta = [-(selectedHelper.edata.x-newPosition.x)/canvasScale, -(selectedHelper.edata.y+newPosition.z)/canvasScale]
            selectedHelper.position.x = newPosition.x
            selectedHelper.position.y = -newPosition.z
            //  selectedHelper.edata.x = newPosition.x/canvasScale
            //  selectedHelper.edata.y = -newPosition.z/canvasScale
            selectedHelper.edata.x = newPosition.x
            selectedHelper.edata.y = -newPosition.z
            if (selectedHelper.edata.width && currentNodesInActiveGroup[0]) { //if group
                simulation.alphaTarget(0.3).restart();
                for (let index = 0; index < currentNodesInActiveGroup.length; index++) {
                  const element = currentNodesInActiveGroup[index];
                  moveNode(delta,element)
                }
            }
          }else if(selectedHandle){
            controls.enabled = false;
            var intersects = raycaster.intersectObject(plane);
            let newPosition =intersects[0].point
            let groupData = selectedHandle.linkedGroup.edata
            let scaleBaseX = groupData.x+groupData.height
            let scaleBaseY = groupData.y-groupData.width
              //update
              groupData.width = newPosition.x+2 - groupData.x
              groupData.height = (newPosition.z+0.8 + groupData.y)*1
              selectedHandle.linkedShape.scale.set(groupData.width ,groupData.height ,0.5)
              selectedHandle.linkedShape.position.set((groupData.width/2)-2,(-groupData.height/2)+groupData.topBarHeight,-0.08)
              //hanndle
              selectedHandle.position.set((groupData.width)-2,(-groupData.height)+groupData.topBarHeight,-0.03)

            //  selectedHandle.linkedGroup.
            console.debug(scaleBaseX,newPosition.z )
          }else {//nothing selected
              // if we haven't selected an object, we check if we might need
              // to reposition our plane. We neez to do this here, since
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
          updateTransformCallback()
      };

          container.onmousedown = function (event) {

              // get the mouse positions
              var mouse_x = ( (event.clientX-containerDim.x) / containerDim.width ) * 2 - 1;
              var mouse_y = -( (event.clientY-containerDim.y) / (containerDim.height) ) * 2 + 1;
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
                var intersectsHandle = raycaster.intersectObjects(objectsHandles)
                if (intersects.length > 0) {//if notes or group title
                  selectedHelper = intersects[0].object.parent
                  if (selectedHelper.edata.width) { //if group
                      let boundaries = {
                        r:(selectedHelper.edata.x-((selectedHelper.edata.width-2)/2) )/canvasScale,
                        l:(selectedHelper.edata.x+((selectedHelper.edata.width-2)) )/canvasScale,
                        t:(selectedHelper.edata.y+selectedHelper.edata.topBarHeight)/canvasScale,
                        b:(selectedHelper.edata.y+((-selectedHelper.edata.height)+selectedHelper.edata.topBarHeight))/canvasScale,
                      }
                    for (let index = 0; index < nodes.length; index++) {
                      const element = nodes[index];
                      if (element.edata.x > boundaries.r &&  element.edata.x < boundaries.l && element.edata.y > boundaries.b && element.edata.y < boundaries.t ) {
                        currentNodesInActiveGroup.push(element)
                      }
                    }
                  }
                  console.log(intersects[0].object.parent);
                }else if(intersectsHandle.length > 0){
                  selectedHandle = intersectsHandle[0].object
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
                if (currentSelectedNodes[0]) {
                    restoreSelectedElementsSize()
                    currentSelectedNodes = [] //revome selected nodes from selection
                }

              }else if  (selectedHelper) {
                if (typeof options.onHelperDragEnd === 'function') {
                    options.onHelperDragEnd(selectedHelper.edata);
                }

              }
              if (selectionBoxActive) {
                currentSelectedNodes = checkSelectedNode(selectionBoxPosition, nodesCore)
                //markNodesSelected(currentSelectedNodes)
                console.log(currentSelectedNodes);
                //clean selection box
                selectionBoxActive = false
                selectionBox.visible =false
                setSelectionModeInactive()
                updateSelectedElementsSize()

                if (typeof options.onSelectionEnd === 'function') {
                    options.onSelectionEnd();
                }
              }
              //reset linkMode
              newLinkSource = undefined
              newLinkTarget = undefined
              //orbit.enabled = true;
              //reset Slected oBject Mode
              selectedObject = null;
              selectedHelper = null;
              selectedHandle = null;
              currentNodesInActiveGroup = [],

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
      if(getImageData == true){
            imgData = renderer.domElement.toDataURL('image/png',0.2);
            getImageData = false;
            //
            // var link = document.createElement("a");
            // link.download = "demo.png";
            // link.href = imgData;
            // link.target = "_blank";
            // link.click();
        }
      stats.update();
      };

      function updateTransformCallback() {
          if (typeof options.onCanvasZoom === 'function') {
            //console.log(camera.position);
            options.onCanvasZoom({translate:camera.position,rotation:camera.rotation, target:controls.target})
          }
      }

      function checkSelectedNode(selectionBoxPosition, nodes) {
      console.log(nodesCore);
      console.log(selectionBoxPosition);
      let selectedNodes = nodesCore.filter(e=>{
        return (e.parent.position.x > selectionBoxPosition.x && e.parent.position.x < selectionBoxPosition.xEnd && e.parent.position.y < selectionBoxPosition.y && e.parent.position.y > selectionBoxPosition.yEnd )
      });
      return selectedNodes.map(n=>n.parent)
      }

      function moveCurrentSelectedNodes(delta, active) {
      for (var i = 0; i < currentSelectedNodes.length; i++) {

        let currentNode = currentSelectedNodes[i]
        if (currentNode.edata.uuid != active.edata.uuid) {
          if (!currentNode.edata.fx) {
            currentNode.edata.fx = currentNode.edata.x
            currentNode.edata.fy = currentNode.edata.y
          }
          currentNode.edata.fx += delta[0]
          currentNode.edata.fy += delta[1]
          currentNode.edata.x += delta[0]
          currentNode.edata.y += delta[1]
        }

      }
      }

      function moveNode(delta,currentNode) {
      console.debug(currentNode)
      if (!currentNode.edata.fx) {
        currentNode.edata.fx = currentNode.edata.x
        currentNode.edata.fy = currentNode.edata.y
      }
      currentNode.edata.fx += delta[0]
      currentNode.edata.fy += delta[1]
      currentNode.edata.x += delta[0]
      currentNode.edata.y += delta[1]
      }

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
        let text = rData.relatedObjectText
        line.geometry.attributes.position.needsUpdate = true;
        line.geometry.attributes.position.array[0] =rData.source.x*canvasScale
        line.geometry.attributes.position.array[1] =rData.source.y*canvasScale
        line.geometry.attributes.position.array[3] =rData.target.x*canvasScale
        line.geometry.attributes.position.array[4] =rData.target.y*canvasScale
        let center = findLineCenterPoint(rData.source, rData.target)
        text.position.x =center.x*canvasScale
        text.position.y =center.y*canvasScale

        var p0 = new THREE.Vector3(rData.source.x, rData.source.y, 1);
        var p1 = new THREE.Vector3(rData.target.x, rData.target.y, 1);
        var pc = new THREE.Vector3(center.x, center.y, 1);
        // // get direction of line p0-p1
        // var direction = p1.clone().sub(p0).normalize();
        // // // project p2 on line p0-p1
        // // var line0 = new THREE.Line3(p0, p1);
        // // any random point outside the line will define plane orientation
        // var p2 = p1.clone().add(new THREE.Vector3(0.4, 0.8, 1));
        // // // project p2 on line p0-p1
        // // var line0 = new THREE.Line3(p0, p1);
        // var proj = new THREE.Vector3();
        // line0.closestPointToPoint(p2, true, proj);
        //
        // // get plane side direction
        // var localUp = p2.clone().sub(proj).normalize();
        //
        // var proj = new THREE.Vector3();
        // line0.closestPointToPoint(p2, true, proj);
        //text.up.copy(new THREE.Vector3(0, 1, 0))
        // text.lookAt(rData.target.x*canvasScale, rData.target.y*canvasScale)
        // console.log(rotation(rData.source, rData.target));
        let angle = rotation(rData.source, rData.target)
        let mirror = (angle > 90 && angle < 180)
        let mirror2 = angle < -90 && angle > -180
        if (mirror || mirror) {
          angle += 180
        }
        text.rotation.z =angle* (3.1416/180)
        //text.up.copy(new THREE.Vector3(0, 1, 0))
        // text.lookAt(center.x*canvasScale, center.y*canvasScale)
      }
      }


      function findLineCenterPoint(a, b) {
      return { x: (b.x - a.x) / 2 + a.x, y: (b.y - a.y) / 2 + a.y };
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

      function updateSelectedElementsSize() {
      if (currentSelectedNodes[0]) {
        for (var i = 0; i < currentSelectedNodes.length; i++) {
          currentSelectedNodes[i].children[0].scale.x = currentSelectedNodes[i].children[0].scale.x -0.1
          currentSelectedNodes[i].children[0].scale.y = currentSelectedNodes[i].children[0].scale.y -0.1
        }

      }
      }
      function restoreSelectedElementsSize() {
      if (currentSelectedNodes[0]) {
        for (var i = 0; i < currentSelectedNodes.length; i++) {
          currentSelectedNodes[i].children[0].scale.x = currentSelectedNodes[i].children[0].scale.x +0.1
          currentSelectedNodes[i].children[0].scale.y = currentSelectedNodes[i].children[0].scale.y +0.1
        }

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

        simulation.nodes(nodesData);
        simulation.force('link').links(relationshipsData);
      }
      }
      function updateHelpers(n,g) {
      // g = [{uuid:"54646", id:'55645646', x:78, y:45, h:88, w:66}]
      // TODO: restore
      console.debug(n)
      updateNotes(n);
      updateGroups(g);
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

        let text = dcText(relData.displayType, 5, 7, 25, "#a5abb60", 0xffffff);      // text #2, TRANSPARENT
        text.scale.set(0.05,0.05,0.05); // move geometry up and out
        text.position.z= -0.11;
        text.edata=relData
        relData.relatedObjectText = text
        relationshipTextElement.push(text)
        instancegroup.add(text)
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
        createGroup(g[i])
      }
      }

      function createNewNote(n) {
      var textGroup = new THREE.Group();
      textGroup.edata = n
      let text = createTextPlane(n.content)
      console.debug(n)
      textGroup.position.set(n.x,n.y, 0.02); // move geometry up and out
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
      groupGroup.edata = n
      n.width = n.width ||8
      n.height = n.height ||5
      n.topBarHeight = n.topBarHeight ||0.7
      let text = createTextPlane(n.content)
      let shape = createSquare(n)
      let handle = createCircleHandle(n)
      //background
      shape.scale.set(n.width ,n.height ,0.5)
      shape.position.set((n.width/2)-2,(-n.height/2)+n.topBarHeight,-0.08)
      //hanndle
      handle.scale.set(0.2 ,0.2 ,0.5)
      handle.position.set((n.width)-2,(-n.height)+n.topBarHeight,-0.03)
      handle.linkedGroup =groupGroup
      handle.linkedShape =shape

      console.debug(n)
      groupGroup.position.set(n.x,n.y, 0.02); // move geometry up and out

      groupGroup.add(text);
      groupGroup.add(shape);
      groupGroup.add(handle);
      objectsHandles.push(handle)
      nodesNotes.push(text) //TODO remiove
      stage.add(groupGroup);
      }

      function createCircleHandle() {
      var scaler = 0.5
      var material = new THREE.MeshBasicMaterial( { color: 0x6dce9e } );
      var mesh = new THREE.Mesh( circleGeometry, material)
      mesh.scale.set( 1.0*scaler, 1.0*scaler, 1.0 );
      return mesh
      }

      function createSquare(n) {
      squareGeometry = new THREE.PlaneGeometry(  1, 1 );
      const material = new THREE.MeshBasicMaterial( {color: 0xeadfd5, side: THREE.DoubleSide} );
      const plane = new THREE.Mesh( squareGeometry, material );
      return plane
      }


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

      function labelNodes(labels) {//data should be {uuid:{label:"label"} }

      for (let index = 0; index < nodesData.length; index++) {
        const element = nodesData[index];
        if (labels[element.uuid]) {
          //Create label
          let label =dcText(labels[element.uuid].label, 4, 7, 25, 0xffffff,0x626262);
          label.scale.set(0.06,0.06,0.06)
          label.position.set(+0.5,+0.8,-0.0001)
          label.name="label"
          //group.add( label )
          element.relatedObject.add( label )
        }
      }
      }
      function clearAllLabels(labels) {

      for (let index = 0; index < nodesData.length; index++) {
        const element = nodesData[index];
        let label = element.relatedObject.children.find(o=>o.name=="label")
        if (label) {
          element.relatedObject.remove(label);
        }
        
      }
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

      function enLinkMode() {
      if (options.onLinkingEnd && newLinkSource && newLinkTarget && newLinkSource !=newLinkTarget) {
        options.onLinkingEnd([newLinkSource.edata,newLinkTarget.edata])
      }
      newLinkSource = undefined //clear Node stored
      newLinkTarget = undefined //clear Node stored
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



      function appendRandomDataToNode(d, maxNodesToGenerate) {
        var data = randomD3Data(d, maxNodesToGenerate);
        updateWithCustomData(data);
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

        container.classList+=" stellae"

        setUpGraph(container)

        simulation = initSimulation();
  
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




      function toString(d) {
        var s = d.labels ? d.labels[0] : d.type;

        s += ' (<id>: ' + d.id;

        Object.keys(d.properties).forEach(function(property) {
            s += ', ' + property + ': ' + JSON.stringify(d.properties[property]);
        });

        s += ')';

        return s;
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


      function version() {
        return VERSION;
      }

      function importNodesPosition(positions) {
        // nodes.forEach(function (n) {
        //   // n.fx = 10;
        //   // n.fy = 100;
        //   // n.x = 10;
        //   // n.y = 100;
        // })
        positions.forEach(f =>{
          console.log(f);
          var match = nodes.find(c => c.edata.uuid == f.uuid)
          console.log(match, nodes);
          if (match) {
            console.log("zzzzz");
            console.log(f.fx);
            match.vx =f.fx ; match.x =f.fx;
            match.vy=f.fy; match.y =f.fy;
          }
        })
        console.log(nodes)
        
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
      return currentSelectedNodes.map(s=>s.edata)
      }
      function setSelectionModeActive() {
      selectionModeActive = true;
      controls.enabled = false;
      }
      function setSelectionModeInactive() {
      selectionModeActive = false;
      controls.enabled = true;
      }

      function getlocalMousePositionFromLayerMousePosition(xy) {
            var transform = d3.zoomTransform(base.node());
            var xy1 = transform.invert(xy);
            return{x:xy1[0],y:xy1[1]}
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

      //let title = makeTextSprite( data.name, {} )
      let title =dcText(data.name, 5, 7, 25, 0x464646,);
      title.scale.set(0.06,0.06,0.06)
      title.position.set(0,-0.8,-0.0001)
      var group = new THREE.Group();
      group.edata = data
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

      let svgtxt = `<svg style="cursor:pointer;" width="160px" height="160px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" data-id="eWAwvjEVAsZxRs5I">
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
      if (fgcolor[0]=="#") {
        ctx.fillStyle = "grey"
      }
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
      function getScreenshot(callback) {
      getImageData = true;
      setTimeout(function () {
        console.log(imgData);
        callback(imgData)
      }, 100);

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
        getScreenshot: getScreenshot,
        labelNodes:labelNodes,
        clearAllLabels:clearAllLabels,
        // getCurrentMousePosition: getCurrentMousePosition,
        getlocalMousePositionFromLayerMousePosition: getlocalMousePositionFromLayerMousePosition,
        cleanAll: cleanAll,
        version: version
      };
}


module.exports = stellae;

},{}]},{},[1])(1)
});
