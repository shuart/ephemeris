(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stellae = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var stellae = _dereq_('./scripts/stellae');

module.exports = stellae;

},{"./scripts/stellae":2}],2:[function(_dereq_,module,exports){
/* global d3, document */
/* jshint latedef:nofunc */
'use strict';

function stellae(_selector, _options) {
    var base, scale, translate, container, graph, info, node, nodes, relationship, relationshipOutline, relationshipOverlay, relationshipText, relationships, selector, simulation, svg, svgNodes, svgRelationships, svgScale, svgTranslate,
        selection,
        mouseCurrentPosition,
        classes2colors = {},
        justLoaded = false,
        numClasses = 0,
        options = {
            arrowSize: 4,
            colors: colors(),
            highlight: undefined,
            iconMap: fontAwesomeIcons(),
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
            showLinksOverlay:true
        },
        VERSION = '0.0.1';

    var linkModePreview = undefined;
    var linkMode = false;
    var linkModeStartNode = undefined;
    var linkModeEndNode = undefined;
    var currentSelectedNodes = undefined;
    var selectionModeActive = false;

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
        console.log("captured nodes");
        console.log(e.x);
        console.log(e.y);
        console.log(start);
        console.log(end);
        console.log(e.y < start[1]);

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
        console.log(currentSelectedNodes);
        selectionModeActive = false
        if (typeof options.onSelectionEnd === 'function') {
            options.onSelectionEnd();
        }
    };

    var zoom = d3.zoom().on('zoom', function() {

        svg.attr("transform", d3.event.transform); // updated for d3 v4
        // svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' + scale + ')');

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

    function appendGraph(container) {
        base = container.append('svg')
        svg = base
             .attr('width', '100%')
             .attr('height', '100%')
             .attr('class', 'stellae-graph')
             // .on("mousemove", function() {
             //   var xy  = d3.mouse(this);
             //   console.log(xy);
             //   var transform = d3.zoomTransform(base.node());
             //   mouseCurrentPosition = transform.invert(xy);
             // })
             .on("mousedown", function(e) {//Selection box creation
               function mouseTransform(mouse) {
                 var xy = mouse;
                 var transform = d3.zoomTransform(base.node());
                 return transform.invert(xy);
               }
               if (d3.event.ctrlKey || selectionModeActive) {
                    base.on('.zoom', null);
                    let start = mouseTransform(d3.mouse(this))
                     startSelection(start);
                     base
                       .on("mousemove.selection_box", function() {
                         moveSelection(start, mouseTransform(d3.mouse(this)));

                       })
                       .on("mouseup.selection_box", function() {
                         endSelection(start, mouseTransform(d3.mouse(this)));
                         base.on("mousemove.selection_box", null).on("mouseup.selection_box", null);
                         base.call(zoom)
                       });
                }
              })
             .call(zoom)
             .on('dblclick.zoom', null)
             .on('dblclick', function(d) {//catch dblclick on canvas
                 if (typeof options.onCanvasDoubleClick === 'function') {
                   var xy = d3.mouse(this);
                   var transform = d3.zoomTransform(base.node());
                   var xy1 = transform.invert(xy);

                   console.log("Mouse:[", xy[0], xy[1], "] Zoomed:[",xy1[0],xy1[1],"]")
                   options.onCanvasDoubleClick({x:xy1[0],y:xy1[1]})
                     //options.onNodeDoubleClick(d);
                 }
             })
             .append('g')
             .attr('width', '100%')
             .attr('height', '100%');

        selection = svg.append("path") //add selection rectangle
                 .attr("class", "selection_box")
                 .attr("visibility", "hidden");


        svgRelationships = svg.append('g')
                              .attr('class', 'relationships');

        svgNodes = svg.append('g')
                      .attr('class', 'nodes');
        //markers
        base.append("svg:defs").append("svg:marker")
        .attr("id", "markerstriangle")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
      // .append("svg:path")
      //   .attr("d", "M0,-5L10,0L0,5")
      .append("svg:circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 3)
        .style("fill", "#a5abb6");
    }

    function appendImageToNode(node) {
        return node.append('image')
                   .attr('height', function(d) {
                       return icon(d) ? '24px': '30px';
                   })
                   .attr('x', function(d) {
                       return icon(d) ? '5px': '-15px';
                   })
                   .attr('xlink:href', function(d) {
                       return image(d);
                   })
                   .attr('y', function(d) {
                       return icon(d) ? '5px': '-16px';
                   })
                   .attr('width', function(d) {
                       return icon(d) ? '24px': '30px';
                   });
    }

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

    function appendNode() {
        return node.enter()
                   .append('g')
                   .attr('class', function(d) {
                       var highlight, i,
                           classes = 'node',
                           label = d.labels[0];

                       if (icon(d)|| options.customPathIcons[d.labels[0]]["path"]) {
                           classes += ' node-icon';
                       }

                       if (image(d)) {
                           classes += ' node-image';
                       }

                       if (options.highlight) {
                           for (i = 0; i < options.highlight.length; i++) {
                               highlight = options.highlight[i];

                               if (d.labels[0] === highlight.class && d.properties[highlight.property] === highlight.value) {
                                   classes += ' node-highlighted';
                                   break;
                               }
                           }
                       }

                       return classes;
                   })
                   .on('click', function(d) {
                       if (options.unpinNodeOnClick) {
                         d.fx = d.fy = null;
                       }

                       if (typeof options.onNodeClick === 'function') {
                           options.onNodeClick(d);
                       }
                   })
                   .on('dblclick', function(d) {
                       stickNode(d);

                       if (typeof options.onNodeDoubleClick === 'function') {
                           options.onNodeDoubleClick(d);
                       }
                   })
                   .on('mouseenter', function(d) {
                       if (info) {
                           updateInfo(d);
                       }
                       if (options.fadeOtherNodesOnHoover) {
                         fadeNodes(0.5,d,this)
                       }
                       if (linkMode) {
                         linkModeEndNode = d
                       }

                       if (typeof options.onNodeMouseEnter === 'function') {
                           options.onNodeMouseEnter(d);
                       }
                   })
                   .on('mouseleave', function(d) {
                       if (info) {
                           clearInfo(d);
                       }
                       if (linkMode) {
                         linkModeEndNode = undefined
                       }
                       if (options.fadeOtherNodesOnHoover) {
                         unfadeAllNodes()
                       }


                       if (typeof options.onNodeMouseLeave === 'function') {
                           options.onNodeMouseLeave(d);
                       }
                   })
                   .on("contextmenu", function (d, i) {
                     if (typeof options.onNodeContextMenu === 'function') {
                        d3.event.preventDefault();
                        options.onNodeContextMenu(d);
                     }
                   })
                   .call(d3.drag()
                           .on('start', dragStarted)
                           .on('drag', dragged)
                           .on('end', dragEnded));
    }

    function appendNodeToGraph() {
        var n = appendNode();

        appendSelectionRingToNode(n)
        appendRingToNode(n);
        appendOutlineToNode(n);
        appendSideTextToNode(n);

        if (options.icons) {
            appendTextToNode(n);
        }
        if (options.customPathIcons) {
            appendCustomPathIcons(n);
        }
        if (options.extraLabels) {
            appendExtraLabelPathIcons(n);
        }

        if (options.images) {
            appendImageToNode(n);
        }

        return n;
    }

    function appendOutlineToNode(node) {
        return node.append('circle')
                   .attr('class', 'outline')
                   .attr('r', options.nodeRadius)
                   .style('fill', function(d) {
                     if (d.customColor) {
                       return d.customColor
                     }else {
                       return options.nodeOutlineFillColor ? options.nodeOutlineFillColor : class2color(d.labels[0]);
                     }
                   })
                   .style('stroke', function(d) {
                       if (d.customColor) {
                         return class2darkenCustomColor(d.customColor)
                       }else {
                         return options.nodeOutlineFillColor ? class2darkenColor(options.nodeOutlineFillColor) : class2darkenColor(d.labels[0]);
                       }
                   })
                   .append('title').text(function(d) {
                       return toString(d);
                   });
    }

    function appendRingToNode(node) {
        return node.append('circle')
                   .attr('class', 'ring')
                   .attr('r', options.nodeRadius * 1.16)
                   .on('mousedown', function(d) {
                       linkMode = true;
                       linkModeStartNode = d;
                   })
                   .append('title').text(function(d) {
                       return toString(d);
                   });
    }
    function appendSelectionRingToNode(node) {
        return node.append('circle')
                   .attr('class', 'selection_ring')
                   .attr('r', options.nodeRadius * 1.2)
                   // .on('mousedown', function(d) {
                   //     linkMode = true;
                   //     linkModeStartNode = d;
                   // })
                   // .append('title').text(function(d) {
                   //     return toString(d);
                   // });
    }

    function appendCustomPathIcons(node) {
          return node.append("path")
                  .attr('fill', function (d) {
                    return options.customPathIcons[d.labels[0]]["fill"]|| '#ffffff'
                  })
                .attr("transform", function (d) {
                  return options.customPathIcons[d.labels[0]]["transform"]|| "scale("+0.05+") translate(-250, -250)"
                })
                .attr("d", function (d) {
                  return options.customPathIcons[d.labels[0]]["path"]|| "M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"
                } )//todo chose beter default
    }
    function appendExtraLabelPathIcons(node) {
          return node.filter(function (d) {//only add to node with the extra la bel prop
              return d.extraLabel
          })
          .append("path")
                //   .attr('fill', function (d) {
                //     return options.customPathIcons[d.labels[0]]["fill"]|| '#ffffff'
                //   })
                // .attr("transform", function (d) {
                //   return options.customPathIcons[d.labels[0]]["transform"]|| "scale("+0.05+") translate(-250, -250)"
                // })
                // .attr("d", function (d) {
                //   return options.customPathIcons[d.labels[0]]["path"]|| "M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"
                // } )//todo chose beter default
              .attr('fill', function (d) {
                if (d.customLabelColor) {
                  return d.customColor
                }else {
                  return "#73787f";
                }
              })
              .attr('stroke', function (d) {
                // if (d.customColor) {
                //   return d.customColor
                // }else {
                //   return  '#ffffff';
                // }
                return  '#ffffff';
              })
              .attr('stroke-width', 10)
              .attr("transform", function (d) {
                  return "scale("+0.05+") translate(+200, -50)"
                })
                .attr("d", function (d) {
                  return d.extraLabel || "M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"
                } )//todo chose beter default
    }

    function appendTextToNode(node) {
        return node.append("text")        // Append a text element
                   .attr("class", "fa")   // Give it the font-awesome class
                   .attr('font-family', 'Font Awesome 5 Free !important' )
                   .attr('fill', '#ffffff')
                   .attr('font-size', function(d) { return "20px"} )
                   .attr('text-anchor', 'middle')
                   .html(function(d) {
                       var _icon = iconCode(d);
                       return _icon ? _icon : d.id;
                   })
                   .attr('y', function(d) {
                       return icon(d) ? (parseInt(Math.round(options.nodeRadius * 0.32)) + 'px') : '4px';
                   })
                   // .html(function(d) {
                   //     var _icon = iconCode(d);
                   //     return _icon ? '&#x' + _icon : d.id;
                   // });
                          // Specify your icon in unicode (https://fontawesome.com/cheatsheet)
                   //  .append('text')
                   // .attr('class', function(d) {
                   //     return 'text text_node' + (icon(d) ? ' icon' : '');
                   // })
                   // .attr('font-family', 'Font Awesome 5 Free')
                   //  .attr('font-size', function(d) { return d.size+'em'} )
                   //  .text(function(d) { return '\uf118' });
                   // .attr('fill', '#000000')
                   // .attr('font-size', function(d) {
                   //     return icon(d) ? (options.nodeRadius + 'px') : '10px';
                   // })
                   // .attr('pointer-events', 'none')
                   // .attr('text-anchor', 'middle')
                   // .html(function(d) {
                   //     return '<span><i class="fas fa-fish"></i></span>';
                   // })
                   // .append('i')
                   // .attr('class', function(d) {
                   //     return 'fas fa-fish';
                   // })
                   // .html(function(d) {
                   //     var _icon = icon(d);
                   //     return _icon ? '&#x' + _icon : d.id;
                   // });
    }
    function appendSideTextToNode(node) {
        return node.append("text")        // Append a text element
                   .attr("class", "side")
                   .attr('fill', '#000000')
                   .attr('font-size', function(d) { return "10px"} )
                   .attr('text-anchor', 'middle')
                   .text(function(d) {
                       return d.properties.name ? d.properties.name : d.id;
                   })
                   .attr('y', function(d) {
                       return icon(d)||options.customPathIcons[d.labels[0]]["path"]  ? (parseInt(Math.round(options.nodeRadius * 1.32)) + 'px') : '4px';
                   })
    }

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
    function class2darkenCustomColor(cls) {
        return d3.rgb(cls).darker(1);
    }

    function clearInfo() {
        info.html('');
    }

    function color() {
        return options.colors[options.colors.length * Math.random() << 0];
    }

    function colors() {
        // d3.schemeCategory10,
        // d3.schemeCategory20,
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

    function dragEnded(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }

        if (typeof options.onNodeDragEnd === 'function') {
            options.onNodeDragEnd(d);
        }
        if (linkMode) {
          enLinkMode()
        }
    }
    function enLinkMode() {
      if (options.onLinkingEnd && linkModeStartNode && linkModeEndNode && linkModeStartNode !=linkModeEndNode) {
        options.onLinkingEnd([linkModeStartNode,linkModeEndNode])
      }
      linkMode = false //get out of link creation
      linkModeStartNode = undefined //clear Node stored
      linkModeEndNode = undefined //clear Node stored
      linkModePreview.remove()
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
    }

    function extend(obj1, obj2) {
        var obj = {};

        merge(obj, obj1);
        merge(obj, obj2);

        return obj;
    }

    function fontAwesomeIcons() {//TODO remove
        return {'glass':'f000','music':'f001','search':'f002','envelope-o':'f003','heart':'f004','star':'f005','star-o':'f006','user':'f007','film':'f008','th-large':'f009','th':'f00a','th-list':'f00b','check':'f00c','remove,close,times':'f00d','search-plus':'f00e','search-minus':'f010','power-off':'f011','signal':'f012','gear,cog':'f013','trash-o':'f014','home':'f015','file-o':'f016','clock-o':'f017','road':'f018','download':'f019','arrow-circle-o-down':'f01a','arrow-circle-o-up':'f01b','inbox':'f01c','play-circle-o':'f01d','rotate-right,repeat':'f01e','refresh':'f021','list-alt':'f022','lock':'f023','flag':'f024','headphones':'f025','volume-off':'f026','volume-down':'f027','volume-up':'f028','qrcode':'f029','barcode':'f02a','tag':'f02b','tags':'f02c','book':'f02d','bookmark':'f02e','print':'f02f','camera':'f030','font':'f031','bold':'f032','italic':'f033','text-height':'f034','text-width':'f035','align-left':'f036','align-center':'f037','align-right':'f038','align-justify':'f039','list':'f03a','dedent,outdent':'f03b','indent':'f03c','video-camera':'f03d','photo,image,picture-o':'f03e','pencil':'f040','map-marker':'f041','adjust':'f042','tint':'f043','edit,pencil-square-o':'f044','share-square-o':'f045','check-square-o':'f046','arrows':'f047','step-backward':'f048','fast-backward':'f049','backward':'f04a','play':'f04b','pause':'f04c','stop':'f04d','forward':'f04e','fast-forward':'f050','step-forward':'f051','eject':'f052','chevron-left':'f053','chevron-right':'f054','plus-circle':'f055','minus-circle':'f056','times-circle':'f057','check-circle':'f058','question-circle':'f059','info-circle':'f05a','crosshairs':'f05b','times-circle-o':'f05c','check-circle-o':'f05d','ban':'f05e','arrow-left':'f060','arrow-right':'f061','arrow-up':'f062','arrow-down':'f063','mail-forward,share':'f064','expand':'f065','compress':'f066','plus':'f067','minus':'f068','asterisk':'f069','exclamation-circle':'f06a','gift':'f06b','leaf':'f06c','fire':'f06d','eye':'f06e','eye-slash':'f070','warning,exclamation-triangle':'f071','plane':'f072','calendar':'f073','random':'f074','comment':'f075','magnet':'f076','chevron-up':'f077','chevron-down':'f078','retweet':'f079','shopping-cart':'f07a','folder':'f07b','folder-open':'f07c','arrows-v':'f07d','arrows-h':'f07e','bar-chart-o,bar-chart':'f080','twitter-square':'f081','facebook-square':'f082','camera-retro':'f083','key':'f084','gears,cogs':'f085','comments':'f086','thumbs-o-up':'f087','thumbs-o-down':'f088','star-half':'f089','heart-o':'f08a','sign-out':'f08b','linkedin-square':'f08c','thumb-tack':'f08d','external-link':'f08e','sign-in':'f090','trophy':'f091','github-square':'f092','upload':'f093','lemon-o':'f094','phone':'f095','square-o':'f096','bookmark-o':'f097','phone-square':'f098','twitter':'f099','facebook-f,facebook':'f09a','github':'f09b','unlock':'f09c','credit-card':'f09d','feed,rss':'f09e','hdd-o':'f0a0','bullhorn':'f0a1','bell':'f0f3','certificate':'f0a3','hand-o-right':'f0a4','hand-o-left':'f0a5','hand-o-up':'f0a6','hand-o-down':'f0a7','arrow-circle-left':'f0a8','arrow-circle-right':'f0a9','arrow-circle-up':'f0aa','arrow-circle-down':'f0ab','globe':'f0ac','wrench':'f0ad','tasks':'f0ae','filter':'f0b0','briefcase':'f0b1','arrows-alt':'f0b2','group,users':'f0c0','chain,link':'f0c1','cloud':'f0c2','flask':'f0c3','cut,scissors':'f0c4','copy,files-o':'f0c5','paperclip':'f0c6','save,floppy-o':'f0c7','square':'f0c8','navicon,reorder,bars':'f0c9','list-ul':'f0ca','list-ol':'f0cb','strikethrough':'f0cc','underline':'f0cd','table':'f0ce','magic':'f0d0','truck':'f0d1','pinterest':'f0d2','pinterest-square':'f0d3','google-plus-square':'f0d4','google-plus':'f0d5','money':'f0d6','caret-down':'f0d7','caret-up':'f0d8','caret-left':'f0d9','caret-right':'f0da','columns':'f0db','unsorted,sort':'f0dc','sort-down,sort-desc':'f0dd','sort-up,sort-asc':'f0de','envelope':'f0e0','linkedin':'f0e1','rotate-left,undo':'f0e2','legal,gavel':'f0e3','dashboard,tachometer':'f0e4','comment-o':'f0e5','comments-o':'f0e6','flash,bolt':'f0e7','sitemap':'f0e8','umbrella':'f0e9','paste,clipboard':'f0ea','lightbulb-o':'f0eb','exchange':'f0ec','cloud-download':'f0ed','cloud-upload':'f0ee','user-md':'f0f0','stethoscope':'f0f1','suitcase':'f0f2','bell-o':'f0a2','coffee':'f0f4','cutlery':'f0f5','file-text-o':'f0f6','building-o':'f0f7','hospital-o':'f0f8','ambulance':'f0f9','medkit':'f0fa','fighter-jet':'f0fb','beer':'f0fc','h-square':'f0fd','plus-square':'f0fe','angle-double-left':'f100','angle-double-right':'f101','angle-double-up':'f102','angle-double-down':'f103','angle-left':'f104','angle-right':'f105','angle-up':'f106','angle-down':'f107','desktop':'f108','laptop':'f109','tablet':'f10a','mobile-phone,mobile':'f10b','circle-o':'f10c','quote-left':'f10d','quote-right':'f10e','spinner':'f110','circle':'f111','mail-reply,reply':'f112','github-alt':'f113','folder-o':'f114','folder-open-o':'f115','smile-o':'f118','frown-o':'f119','meh-o':'f11a','gamepad':'f11b','keyboard-o':'f11c','flag-o':'f11d','flag-checkered':'f11e','terminal':'f120','code':'f121','mail-reply-all,reply-all':'f122','star-half-empty,star-half-full,star-half-o':'f123','location-arrow':'f124','crop':'f125','code-fork':'f126','unlink,chain-broken':'f127','question':'f128','info':'f129','exclamation':'f12a','superscript':'f12b','subscript':'f12c','eraser':'f12d','puzzle-piece':'f12e','microphone':'f130','microphone-slash':'f131','shield':'f132','calendar-o':'f133','fire-extinguisher':'f134','rocket':'f135','maxcdn':'f136','chevron-circle-left':'f137','chevron-circle-right':'f138','chevron-circle-up':'f139','chevron-circle-down':'f13a','html5':'f13b','css3':'f13c','anchor':'f13d','unlock-alt':'f13e','bullseye':'f140','ellipsis-h':'f141','ellipsis-v':'f142','rss-square':'f143','play-circle':'f144','ticket':'f145','minus-square':'f146','minus-square-o':'f147','level-up':'f148','level-down':'f149','check-square':'f14a','pencil-square':'f14b','external-link-square':'f14c','share-square':'f14d','compass':'f14e','toggle-down,caret-square-o-down':'f150','toggle-up,caret-square-o-up':'f151','toggle-right,caret-square-o-right':'f152','euro,eur':'f153','gbp':'f154','dollar,usd':'f155','rupee,inr':'f156','cny,rmb,yen,jpy':'f157','ruble,rouble,rub':'f158','won,krw':'f159','bitcoin,btc':'f15a','file':'f15b','file-text':'f15c','sort-alpha-asc':'f15d','sort-alpha-desc':'f15e','sort-amount-asc':'f160','sort-amount-desc':'f161','sort-numeric-asc':'f162','sort-numeric-desc':'f163','thumbs-up':'f164','thumbs-down':'f165','youtube-square':'f166','youtube':'f167','xing':'f168','xing-square':'f169','youtube-play':'f16a','dropbox':'f16b','stack-overflow':'f16c','instagram':'f16d','flickr':'f16e','adn':'f170','bitbucket':'f171','bitbucket-square':'f172','tumblr':'f173','tumblr-square':'f174','long-arrow-down':'f175','long-arrow-up':'f176','long-arrow-left':'f177','long-arrow-right':'f178','apple':'f179','windows':'f17a','android':'f17b','linux':'f17c','dribbble':'f17d','skype':'f17e','foursquare':'f180','trello':'f181','female':'f182','male':'f183','gittip,gratipay':'f184','sun-o':'f185','moon-o':'f186','archive':'f187','bug':'f188','vk':'f189','weibo':'f18a','renren':'f18b','pagelines':'f18c','stack-exchange':'f18d','arrow-circle-o-right':'f18e','arrow-circle-o-left':'f190','toggle-left,caret-square-o-left':'f191','dot-circle-o':'f192','wheelchair':'f193','vimeo-square':'f194','turkish-lira,try':'f195','plus-square-o':'f196','space-shuttle':'f197','slack':'f198','envelope-square':'f199','wordpress':'f19a','openid':'f19b','institution,bank,university':'f19c','mortar-board,graduation-cap':'f19d','yahoo':'f19e','google':'f1a0','reddit':'f1a1','reddit-square':'f1a2','stumbleupon-circle':'f1a3','stumbleupon':'f1a4','delicious':'f1a5','digg':'f1a6','pied-piper-pp':'f1a7','pied-piper-alt':'f1a8','drupal':'f1a9','joomla':'f1aa','language':'f1ab','fax':'f1ac','building':'f1ad','child':'f1ae','paw':'f1b0','spoon':'f1b1','cube':'f1b2','cubes':'f1b3','behance':'f1b4','behance-square':'f1b5','steam':'f1b6','steam-square':'f1b7','recycle':'f1b8','automobile,car':'f1b9','cab,taxi':'f1ba','tree':'f1bb','spotify':'f1bc','deviantart':'f1bd','soundcloud':'f1be','database':'f1c0','file-pdf-o':'f1c1','file-word-o':'f1c2','file-excel-o':'f1c3','file-powerpoint-o':'f1c4','file-photo-o,file-picture-o,file-image-o':'f1c5','file-zip-o,file-archive-o':'f1c6','file-sound-o,file-audio-o':'f1c7','file-movie-o,file-video-o':'f1c8','file-code-o':'f1c9','vine':'f1ca','codepen':'f1cb','jsfiddle':'f1cc','life-bouy,life-buoy,life-saver,support,life-ring':'f1cd','circle-o-notch':'f1ce','ra,resistance,rebel':'f1d0','ge,empire':'f1d1','git-square':'f1d2','git':'f1d3','y-combinator-square,yc-square,hacker-news':'f1d4','tencent-weibo':'f1d5','qq':'f1d6','wechat,weixin':'f1d7','send,paper-plane':'f1d8','send-o,paper-plane-o':'f1d9','history':'f1da','circle-thin':'f1db','header':'f1dc','paragraph':'f1dd','sliders':'f1de','share-alt':'f1e0','share-alt-square':'f1e1','bomb':'f1e2','soccer-ball-o,futbol-o':'f1e3','tty':'f1e4','binoculars':'f1e5','plug':'f1e6','slideshare':'f1e7','twitch':'f1e8','yelp':'f1e9','newspaper-o':'f1ea','wifi':'f1eb','calculator':'f1ec','paypal':'f1ed','google-wallet':'f1ee','cc-visa':'f1f0','cc-mastercard':'f1f1','cc-discover':'f1f2','cc-amex':'f1f3','cc-paypal':'f1f4','cc-stripe':'f1f5','bell-slash':'f1f6','bell-slash-o':'f1f7','trash':'f1f8','copyright':'f1f9','at':'f1fa','eyedropper':'f1fb','paint-brush':'f1fc','birthday-cake':'f1fd','area-chart':'f1fe','pie-chart':'f200','line-chart':'f201','lastfm':'f202','lastfm-square':'f203','toggle-off':'f204','toggle-on':'f205','bicycle':'f206','bus':'f207','ioxhost':'f208','angellist':'f209','cc':'f20a','shekel,sheqel,ils':'f20b','meanpath':'f20c','buysellads':'f20d','connectdevelop':'f20e','dashcube':'f210','forumbee':'f211','leanpub':'f212','sellsy':'f213','shirtsinbulk':'f214','simplybuilt':'f215','skyatlas':'f216','cart-plus':'f217','cart-arrow-down':'f218','diamond':'f219','ship':'f21a','user-secret':'f21b','motorcycle':'f21c','street-view':'f21d','heartbeat':'f21e','venus':'f221','mars':'f222','mercury':'f223','intersex,transgender':'f224','transgender-alt':'f225','venus-double':'f226','mars-double':'f227','venus-mars':'f228','mars-stroke':'f229','mars-stroke-v':'f22a','mars-stroke-h':'f22b','neuter':'f22c','genderless':'f22d','facebook-official':'f230','pinterest-p':'f231','whatsapp':'f232','server':'f233','user-plus':'f234','user-times':'f235','hotel,bed':'f236','viacoin':'f237','train':'f238','subway':'f239','medium':'f23a','yc,y-combinator':'f23b','optin-monster':'f23c','opencart':'f23d','expeditedssl':'f23e','battery-4,battery-full':'f240','battery-3,battery-three-quarters':'f241','battery-2,battery-half':'f242','battery-1,battery-quarter':'f243','battery-0,battery-empty':'f244','mouse-pointer':'f245','i-cursor':'f246','object-group':'f247','object-ungroup':'f248','sticky-note':'f249','sticky-note-o':'f24a','cc-jcb':'f24b','cc-diners-club':'f24c','clone':'f24d','balance-scale':'f24e','hourglass-o':'f250','hourglass-1,hourglass-start':'f251','hourglass-2,hourglass-half':'f252','hourglass-3,hourglass-end':'f253','hourglass':'f254','hand-grab-o,hand-rock-o':'f255','hand-stop-o,hand-paper-o':'f256','hand-scissors-o':'f257','hand-lizard-o':'f258','hand-spock-o':'f259','hand-pointer-o':'f25a','hand-peace-o':'f25b','trademark':'f25c','registered':'f25d','creative-commons':'f25e','gg':'f260','gg-circle':'f261','tripadvisor':'f262','odnoklassniki':'f263','odnoklassniki-square':'f264','get-pocket':'f265','wikipedia-w':'f266','safari':'f267','chrome':'f268','firefox':'f269','opera':'f26a','internet-explorer':'f26b','tv,television':'f26c','contao':'f26d','500px':'f26e','amazon':'f270','calendar-plus-o':'f271','calendar-minus-o':'f272','calendar-times-o':'f273','calendar-check-o':'f274','industry':'f275','map-pin':'f276','map-signs':'f277','map-o':'f278','map':'f279','commenting':'f27a','commenting-o':'f27b','houzz':'f27c','vimeo':'f27d','black-tie':'f27e','fonticons':'f280','reddit-alien':'f281','edge':'f282','credit-card-alt':'f283','codiepie':'f284','modx':'f285','fort-awesome':'f286','usb':'f287','product-hunt':'f288','mixcloud':'f289','scribd':'f28a','pause-circle':'f28b','pause-circle-o':'f28c','stop-circle':'f28d','stop-circle-o':'f28e','shopping-bag':'f290','shopping-basket':'f291','hashtag':'f292','bluetooth':'f293','bluetooth-b':'f294','percent':'f295','gitlab':'f296','wpbeginner':'f297','wpforms':'f298','envira':'f299','universal-access':'f29a','wheelchair-alt':'f29b','question-circle-o':'f29c','blind':'f29d','audio-description':'f29e','volume-control-phone':'f2a0','braille':'f2a1','assistive-listening-systems':'f2a2','asl-interpreting,american-sign-language-interpreting':'f2a3','deafness,hard-of-hearing,deaf':'f2a4','glide':'f2a5','glide-g':'f2a6','signing,sign-language':'f2a7','low-vision':'f2a8','viadeo':'f2a9','viadeo-square':'f2aa','snapchat':'f2ab','snapchat-ghost':'f2ac','snapchat-square':'f2ad','pied-piper':'f2ae','first-order':'f2b0','yoast':'f2b1','themeisle':'f2b2','google-plus-circle,google-plus-official':'f2b3','fa,font-awesome':'f2b4'};
    }

    function icon(d) {//TODO remove
        var code;

        if (options.iconMap && options.showIcons && options.icons) {
            if (options.icons[d.labels[0]] && options.iconMap[options.icons[d.labels[0]]]) {
                code = options.iconMap[options.icons[d.labels[0]]];
            } else if (options.iconMap[d.labels[0]]) {
                code = options.iconMap[d.labels[0]];
            } else if (options.icons[d.labels[0]]) {
                code = options.icons[d.labels[0]];
            }
        }

        return code;
    }
    function iconCode(d) {
        var code;
        function faUnicode(name) {
          var testI = document.createElement('i');
          var char;

          testI.className = 'fa fa-' + name;
          document.body.appendChild(testI);

          char = window.getComputedStyle( testI, ':before' )
                   .content.replace(/'|"/g, '');

          testI.remove();

          return char;
        }
        console.log(options.icons[d.labels[0]]);
        console.log(faUnicode(options.icons[d.labels[0]]));
        code = faUnicode(options.icons[d.labels[0]])

        return code;
    }

    function image(d) {
        var i, imagesForLabel, img, imgLevel, label, labelPropertyValue, property, value;

        if (options.images) {
            imagesForLabel = options.imageMap[d.labels[0]];

            if (imagesForLabel) {
                imgLevel = 0;

                for (i = 0; i < imagesForLabel.length; i++) {
                    labelPropertyValue = imagesForLabel[i].split('|');

                    switch (labelPropertyValue.length) {
                        case 3:
                        value = labelPropertyValue[2];
                        /* falls through */
                        case 2:
                        property = labelPropertyValue[1];
                        /* falls through */
                        case 1:
                        label = labelPropertyValue[0];
                    }

                    if (d.labels[0] === label &&
                        (!property || d.properties[property] !== undefined) &&
                        (!value || d.properties[property] === value)) {
                        if (labelPropertyValue.length > imgLevel) {
                            img = options.images[imagesForLabel[i]];
                            imgLevel = labelPropertyValue.length;
                        }
                    }
                }
            }
        }

        return img;
    }

    function init(_selector, _options) {
        initIconMap();

        merge(options, _options);

        if (options.icons) {
            options.showIcons = true;
        }

        if (!options.minCollision) {
            options.minCollision = options.nodeRadius * 2;
        }

        initImageMap();

        selector = _selector;

        container = d3.select(selector);

        container.attr('class', 'stellae')
                 .html('');

        if (options.infoPanel) {
            info = appendInfoPanel(container);
        }

        appendGraph(container);

        simulation = initSimulation();

        if (options.customData) {
            loadCustomData(options.customData);
        } else if (options.customDataUrl) {
            loadCustomDataFromUrl(options.customDataUrl);
        } else {
            console.error('Error: both customData and customDataUrl are empty!');
        }
    }

    function initIconMap() {
        Object.keys(options.iconMap).forEach(function(key, index) {
            var keys = key.split(','),
                value = options.iconMap[key];

            keys.forEach(function(key) {
                options.iconMap[key] = value;
            });
        });
    }

    function initImageMap() {
        var key, keys, selector;

        for (key in options.images) {
            if (options.images.hasOwnProperty(key)) {
                keys = key.split('|');

                if (!options.imageMap[keys[0]]) {
                    options.imageMap[keys[0]] = [key];
                } else {
                    options.imageMap[keys[0]].push(key);
                }
            }
        }
    }

    function initSimulation() {
        if (options.startTransform && !justLoaded) {//check if graph need to be adjusted
            initialZoom(options.startTransform)
        }
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
                           .force('center', d3.forceCenter(svg.node().parentElement.parentElement.clientWidth / 2, svg.node().parentElement.parentElement.clientHeight / 2))
                           .alphaDecay(options.decay)
                           .alphaMin(0.035)
                           .on('tick', function() {
                               render()
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

    function renderInternal() {
        tick();
    }

    var rafId = null;
    function render() {
        // if (rafId == null) {
        //     rafId = requestAnimationFrame(function() {
        //         rafId = null;
        //         renderInternal();
        //     });
        // }
        renderInternal()
    }

    function loadCustomData() {
        nodes = [];
        relationships = [];

        updateWithCustomData(options.customData);
    }

    function loadCustomDataFromUrl(customDataUrl) {
        nodes = [];
        relationships = [];

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
            relationships: []
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
          //   console.log(d.delta);
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

    function updateWithD3Data(d3Data) {
        updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
    }

    function updateWithCustomData(customData) {
        var d3Data = customDataToD3Data(customData);
        updateWithD3Data(d3Data);
    }

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

    function updateNodes(n) {
        Array.prototype.push.apply(nodes, n);

        node = svgNodes.selectAll('.node')
                       .data(nodes, function(d) { return d.id; });
        var nodeEnter = appendNodeToGraph();
        node = nodeEnter.merge(node);
    }

    function updateNodesAndRelationships(n, r) {
      if (options.groupLabels ) {
        updateNodes(n);
        var newLinks = r.concat(createGroupLinks(nodes))
        if (options.rootNode) {
          newLinks = newLinks.concat(createRootNode(nodes))
        }
        updateRelationships(r);

        simulation.nodes(nodes);
        simulation.force('link').links(newLinks);
      }else {
        updateRelationships(r);
        updateNodes(n);

        simulation.nodes(nodes);
        simulation.force('link').links(relationships);
      }
    }

    function createGroupLinks(nodes) {
      function checkIfLabelMustGroup(label) {
        if (!Array.isArray(options.groupLabels) ) {
          return options.groupLabels
        }else {
          return options.groupLabels.includes(label)
        }
      }
      console.log(nodes);
      var lastLabel ='none'
      var currentNode = undefined
      var curentIndex =-1;
      var groupLinks = []
      nodes.forEach(function (i) {
        console.log(checkIfLabelMustGroup(i.labels[0]));
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
      console.log(groupLinks);
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
          console.log(i.labels[0] == limitToGroup);
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
      console.log("rootLinks");
      console.log(groupLinks);
      return groupLinks
    }

    function updateRelationships(r) {
        Array.prototype.push.apply(relationships, r);

        relationship = svgRelationships.selectAll('.relationship')
                                       .data(relationships, function(d) { return d.id; });

        var relationshipEnter = appendRelationshipToGraph();

        relationship = relationshipEnter.relationship.merge(relationship);

        relationshipOutline = svg.selectAll('.relationship .outline');
        relationshipOutline = relationshipEnter.outline.merge(relationshipOutline);

        if (options.showLinksOverlay) {
          relationshipOverlay = svg.selectAll('.relationship .overlay');
          relationshipOverlay = relationshipEnter.overlay.merge(relationshipOverlay);
        }


        if (options.showLinksText) {
          relationshipText = svg.selectAll('.relationship .text');
          relationshipText = relationshipEnter.text.merge(relationshipText);
        }


    }

    function version() {
        return VERSION;
    }
    function exportNodesPosition(condition) {
      var exportedData = []
      if (condition == "all") {
        exportedData = nodes.map(e=>{
          return {uuid:e.uuid,fx : e.x,fy : e.y}
        });
      }else {
        exportedData = nodes.filter(e=> e.fx).map(e=>{
          return {uuid:e.uuid,fx : e.fx,fy : e.fy}
        });
      }
        console.log(exportedData);
        return exportedData
    }
    function importNodesPosition() {
        nodes.forEach(function (n) {
          console.log(n); //TODO not working
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
    }
    function setSelectionModeInactive() {
      selectionModeActive = false;
    }

    // function getCurrentMousePosition() {
    //         var xy1 = mouseCurrentPosition
    //         console.log("Zoomed:[",xy1[0],xy1[1],"]")
    //         return{x:xy1[0],y:xy1[1]}
    // }
    function getlocalMousePositionFromLayerMousePosition(xy) {
            var transform = d3.zoomTransform(base.node());
            var xy1 = transform.invert(xy);
            console.log("Zoomed:[",xy1[0],xy1[1],"]")
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
        setSelectionModeActive:setSelectionModeActive,
        setSelectionModeInactive:setSelectionModeInactive,
        setFocusedNodes:setFocusedNodes,
        setFadeOtherNodesOnHoover: setFadeOtherNodesOnHoover,
        getSelectedNodes: getSelectedNodes,
        // getCurrentMousePosition: getCurrentMousePosition,
        getlocalMousePositionFromLayerMousePosition: getlocalMousePositionFromLayerMousePosition,
        version: version
    };
}

module.exports = stellae;

},{}]},{},[1])(1)
});
