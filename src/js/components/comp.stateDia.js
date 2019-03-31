var test={
  items:[
    {uuid:"fefsfse", name:"Ajouter des besoins"},
    {uuid:"555sfse", name:"Un besoin dépendant du précédent"},
    {uuid:"444sfse", name:"Un autre besoin dépendant du précédent"},
    {uuid:"789sfse", name:"Encore un besoin dépendant du précédent"},
    {uuid:"999sfse", name:"Un sous sous besoin"},
    {uuid:"f54846e", name:"Un autre besoin"}
  ],
  links:[
    {source:"fefsfse", target:"555sfse"},
    {source:"fefsfse", target:"789sfse"},
    {source:"444sfse", target:"999sfse"},
    {source:"fefsfse", target:"444sfse"}
  ],
  positionsz : [
      { x : 43, y : 67, suuid : "fefsfse"},
      { x : 340, y : 150, suuid : "555sfse"},
      { x : 200, y : 250, suuid : "444sfse"},
      { x : 300, y : 320, suuid : "789sfse"},
      { x : 50, y : 250, suuid : "999sfse"},
      { x : 90, y : 170, suuid : "f54846e"}
  ]
}


var createStateDiagram = function ({
  container ="body",
  data = undefined,
  positions = undefined,
  links = undefined,
  groupLinks = undefined
}={}) {
  var self ={};
  var objectIsActive = false;

  var svgcontainer;
  var svg;
  var drag_line;
  var gTransitions;
  var gStates;

  var radius = 40;

  var states = [
      { x : 43, y : 67, label : "fefsfse", transitions : [] },
  ];

  var formatData = function (data, positions) {
    if (positions) {
      var states = data.map((e) => {
        e.label = e.name
        var position = positions.filter(i=>i.suuid == e.uuid)[0]
        e.x = position.x
        e.y = position.y
        e.color = e.color || "white"
        return e
      })
    } else {
      var states = data.map((e) => {
        e.label = e.name
        e.x = 0
        e.y = 0
        e.color = e.color || "white"
        return e
      })
    }
    console.log(states);
    return states
  }
  var formatDataLinks = function (data, links) {
    var states = data.map((e) => {
      e.transitions = links.filter(i=> i.source == e.uuid).map((link) => {
        var target = data.filter(t=>t.uuid == link.target)[0]
        return { label : genuuid(), points : [], target : target};
      })
      return e
    })
    return states
  }

  var useForces = function (nodes, links) {
    function ticked(e) {
      console.log(e);
      svg.selectAll(".state").attr("transform" , function( d) {return "translate("+ [d.x,d.y] + ")";})
      update()
    }
    var simulation = d3.forceSimulation();
    simulation.nodes(nodes);
    if (links) {
      simulation.force('link', d3.forceLink().links(links).distance(120))
    }
    // simulation.force('charge', d3.forceManyBody())
    simulation.force('charge', d3.forceManyBody().strength(-1500).distanceMax(150)
      .distanceMin(55));
    simulation.force('center', d3.forceCenter(960 / 2, 960 / 2))
    //simulation.alpha(0.9);
    simulation.on('tick', ticked);
    setTimeout(function () {
      simulation.stop();
    }, 1500);

  }
  states = formatData(data);
  states = formatDataLinks(data,links);
  useForces(states, groupLinks)

  var init = function () {

    //states[0].transitions.push( { label : 'whooo', points : [ { x : 150, y : 50}, { x : 200, y : 30}], target : states[1]})

    //states[1].transitions.push( { label : 'waaa!', points : [ { x : 250, y : 30}], target : states[2]})

    svgcontainer = d3.select(container)
    .append("svg")
    .attr("width", "960px")
    .attr("height", "900px");

    if (true) {
      svgcontainer.call(d3.zoom().on("zoom", function () {
           svg.attr("transform", d3.event.transform)
        }))
    } else {
        svgcontainer.on('.zoom', null);
    }

        // define arrow markers for graph links
    svgcontainer.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('class', 'end-arrow')
    ;

    svg =svgcontainer.append("g");


        // line displayed when dragging new nodes
    drag_line = svg.append('svg:path')
        .attr('class', 'dragline hidden')
        .attr('d' , 'M0,0L0,0')
    ;

    gTransitions = svg.append( 'g').selectAll( "path.transition");
    gStates = svg.append("g").selectAll( "g.state");
    connections()
    update()

  }
  var connections =function () {

  }

  var render = function () {


    var transitions = function() {
        return states.reduce( function( initial, state) {
            return initial.concat(
                state.transitions.map( function( transition) {
                    return { source : state, transition : transition};
                })
            );
        }, []);
    };

    var transformTransitionEndpoints = function( d, i) {
        var endPoints = d.endPoints();

        var point = [
            d.type=='start' ? endPoints[0].x : endPoints[1].x,
            d.type=='start' ? endPoints[0].y : endPoints[1].y
        ];

        return "translate("+ point + ")";
    }

    var transformTransitionPoints = function( d, i) {
        return "translate("+ [d.x,d.y] + ")";
    }

    var computeTransitionPath = (function() {
        var line = d3.line()
        .x( function( d, i){
           return d.x;
        })
        .y( function(d, i){
            return d.y;
        });

        return function( d) {

            var source = d.source,
                target = d.transition.points.length && d.transition.points[0] || d.transition.target,
                deltaX = target.x - source.x,
                deltaY = target.y - source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = radius + 4,//d.left ? 17 : 12,
                sourceX = source.x + (sourcePadding * normX),
                sourceY = source.y + (sourcePadding * normY);

                source = d.transition.points.length && d.transition.points[ d.transition.points.length-1] || d.source;
                target = d.transition.target;
                deltaX = target.x - source.x;
                deltaY = target.y - source.y;
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                normX = deltaX / dist;
                normY = deltaY / dist;
                targetPadding = radius + 8;//d.right ? 17 : 12,
                targetX = target.x - (targetPadding * normX);
                targetY = target.y - (targetPadding * normY);

            var points =
                [ { x : sourceX, y : sourceY}].concat(
                    d.transition.points,
                    [{ x : targetX, y : targetY}]
                )
            ;

            var l = line( points);
            console.log(l);

            return l;
        };
    })();

    function subject(d) {return { x: 0, y: d3.event.y }};
    var dragPoint = d3.drag()
     .subject(subject)
    .on("drag", function( d, i) {
        console.log( "transitionmidpoint drag");
        var gTransitionPoint = d3.select( this);

        gTransitionPoint.attr( "transform", function( d, i) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            return "translate(" + [ d.x,d.y ] + ")"
        });

            // refresh transition path
            console.log(gTransitions);
        svg.selectAll( ".foreground").attr( 'd', computeTransitionPath);
        svg.selectAll( ".background").attr( 'd', computeTransitionPath);
            // refresh transition endpoints
        svg.selectAll( "circle.endpoint").attr("transform", transformTransitionEndpoints);

          // refresh transition points
        svg.selectAll( "circle.point").attr("transform", transformTransitionPoints);

        d3.event.sourceEvent.stopPropagation();
    });

    var renderTransitionMidPoints = function( gTransition) {
        gTransition.each( function( transition) {
            var transitionPoints = d3.select( this).selectAll('circle.point').data( transition.transition.points, function( d) {
                return transition.transition.points.indexOf( d);
            });

            transitionPoints.enter().append( "circle")
                .attr('class', 'point')
                .attr( "r"               , 4)
                .attr("transform"       , transformTransitionPoints)
                .on(
                    "dblclick", function( d) {
                        console.log( "transitionmidpoint dblclick");

                        var gTransition = d3.select( d3.event.target.parentElement),
                            transition  = gTransition.datum(),
                            index       = transition.transition.points.indexOf( d);

                        if( gTransition.classed( "selected")) {
                            transition.transition.points.splice( index, 1);

                            gTransition.selectAll( 'path').attr(  "d"  , computeTransitionPath);

                            renderTransitionMidPoints( gTransition);

                            //renderTransitionPoints( gTransition);
                            gTransition.selectAll( "circle.endpoint").attr(  "transform" , transformTransitionEndpoints);
                        }
                        d3.event.stopPropagation();
                    }
                )
                .call( dragPoint)
            ;
            transitionPoints.exit().remove();
        });
    };

    var renderTransitionPoints = function( gTransition) {
        gTransition.each( function( d) {
            var endPoints = function() {
                var source = d.source,
                target = d.transition.points.length && d.transition.points[0] || d.transition.target,
                deltaX = target.x - source.x,
                deltaY = target.y - source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourceX = source.x + (radius * normX),
                sourceY = source.y + (radius * normY);

                source = d.transition.points.length && d.transition.points[ d.transition.points.length-1] || d.source;
                target = d.transition.target;
                deltaX = target.x - source.x;
                deltaY = target.y - source.y;
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                normX = deltaX / dist;
                normY = deltaY / dist;
                targetPadding = radius + 8;//d.right ? 17 : 12,
                targetX = target.x - (radius * normX);
                targetY = target.y - (radius * normY);

                return [ { x : sourceX, y : sourceY}, { x : targetX, y : targetY}];
            };

            var transitionEndpoints = d3.select( this).selectAll('circle.endpoint').data( [
                { endPoints : endPoints, type : 'start' },
                { endPoints : endPoints, type : 'end' }
            ]);

            transitionEndpoints.enter().append( "circle")
                .attr(
                    'class'   , function( d) {
                        return 'endpoint ' + d.type;
                    })
                  .attr(  "r"        , 4)
                  .attr(  "transform" , transformTransitionEndpoints
                )
            ;
            transitionEndpoints.exit().remove();
        });
    };

    var renderTransitions = function() {
      console.log(gTransitions.enter());
        gTransition = gTransitions.enter().append( 'g')
            .attr('class', 'transition')
            .on("click" , function() {
                    console.log( "transition click");
                    d3.selectAll( 'g.state.selection').classed( "selection", false);
                    d3.selectAll( 'g.selected').classed( "selected", false);

                    d3.select(this).classed( "selected", true);
                    d3.event.stopPropagation();
                })
            .on("mouseover", function() {
                  svg.select( "rect.selection").empty() && d3.select( this).classed( "hover", true);
              })
            .on("mouseout", function() {
                  svg.select( "rect.selection").empty() && d3.select( this).classed( "hover", false);
              });
        ;
        console.log(gTransition);
        gTransition.append( 'path')
            .attr("d" , computeTransitionPath)
            .attr("class", 'background')
            .on(
                "dblclick", function( d, i) {
                    gTransition = d3.select( d3.event.target.parentElement);
                    if( d3.event.ctrlKey) {
                        var p = d3.mouse( this);

                        gTransition.classed( 'selected', true);
                        d.transition.points.push( { x : p[0], y : p[1]});

                        renderTransitionMidPoints( gTransition, d);
                        gTransition.selectAll( 'path').attr("d ", computeTransitionPath);
                    } else {
                        var gTransition = d3.select( d3.event.target.parentElement),
                        transition = gTransition.datum(),
                        index = transition.source.transitions.indexOf( transition.transition);

                        transition.source.transitions.splice( index, 1)
                        gTransition.remove();

                        d3.event.stopPropagation();
                    }
                }
            )
        ;

        gTransition.append( 'path')
            .attr("d" , computeTransitionPath)
            .attr("class" , 'foreground')
        ;

        renderTransitionPoints( gTransition);
        renderTransitionMidPoints( gTransition);

        gTransitions.exit().remove();
    };

    var renderStates = function() {
        console.log(gStates);
        var gState = gStates.enter()
            .append( "g")
            .attr(
                "transform" , function( d) {
                    return "translate("+ [d.x,d.y] + ")";
                  }
            )
            .attr('class', 'state')
          .call( drag);

        gState.append( "circle")
            .attr( "r", radius + 4)
            .attr(  "class" , 'outer')
            .on(
                "mousedown", function( d) {
                    console.log( "state circle outer mousedown");
                    startState = d, endState = undefined;

                        // reposition drag line
                    drag_line
                        .style('marker-end', 'url(#end-arrow)')
                        .classed('hidden', false)
                        .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y)
                    ;

                        // force element to be an top
                    this.parentNode.parentNode.appendChild( this.parentNode);
                    //d3.event.stopPropagation();
                })
                .on("mouseover" , function() {
                    svg.select( "rect.selection").empty() && d3.select( this).classed( "hover", true);

                    // http://stackoverflow.com/questions/9956958/changing-the-position-of-bootstrap-popovers-based-on-the-popovers-x-position-in
                    // http://bl.ocks.org/zmaril/3012212
                    // $( this).popover( "show");
                })
                .on("mouseout", function() {
                    svg.select( "rect.selection").empty() && d3.select( this).classed( "hover", false);
                    //$( this).popover( "hide");
                }
            );
        ;

        gState.append( "circle")
            .attr("r",radius)
            .attr("class" , 'inner')
            .attr(  "fill" , function(d) {
              console.log(d);
              return d.color
            })
            .attr(  "stroke" , function(d) {
              console.log(d);
              return d.color
            })
            .on(
                "click", function( d, i) {
                    console.log( "state circle inner mousedown");

                    var e = d3.event,
                        g = this.parentNode,
                        isSelected = d3.select( g).classed( "selected");

                    if( !e.ctrlKey) {
                        d3.selectAll( 'g.selected').classed( "selected", false);
                    }

                    d3.select( g).classed( "selected", !isSelected);

                        // reappend dragged element as last
                        // so that its stays on top
                    g.parentNode.appendChild( g);
                    //d3.event.stopPropagation();
                })
              .on(  "mouseover", function() {
                    svg.select( "rect.selection").empty() && d3.select( this).classed( "hover", true);
                })
              .on(  "mouseout", function() {
                    svg.select( "rect.selection").empty() && d3.select( this).classed( "hover", false);
                })
              .on(  "dblclick", function() {
                    console.log( "state circle outer dblclick");
                    var d = d3.select( this.parentNode).datum();

                    var index = states.indexOf( d);
                    states.splice( index, 1);

                        // remove transitions targeting the removed state
                    states.forEach( function( state) {
                        state.transitions.forEach( function( transition, index) {
                            if( transition.target===d) {
                                state.transitions.splice( index, 1);
                            }
                        });
                    });

                    //console.log( "removed state " + d.label);

                    //d3.select( this.parentNode).remove();
                    update();
                }
            );

        gState.append( "text")
            .attr(  'text-anchor' , 'middle')
            .attr("y" , 4)
            .text( function( d) {
                return d.label;
            })
        ;

        gState.append( "title")
            .text( function( d) {
                return d.label;
            })
        ;
        gStates.exit().remove();
    };

    var startState, endState;
    function subject(d) {return { x: 0, y: d3.event.y }};
    var drag = d3.drag()
     .subject(subject)
    .on("drag", function( d, i) {
        console.log( "drag");
        if( startState) {
          console.log("is StartState");
          console.log(startState);
          //TODO, not best place to do that
          var p = d3.mouse( svg.node())

          drag_line.attr('d', 'M' + startState.x + ',' + startState.y + 'L' + p[0] + ',' + p[1]);

          var state = d3.select( 'g.state .inner.hover');
          endState = (!state.empty() && state.data()[0]) || undefined;
            return;
        }

        var selection = d3.selectAll( '.selected');
        console.log(selection);
            // if dragged state is not in current selection
            // mark it selected and deselect all others
            console.log(selection);
            console.log(selection[0]);
            console.log(this);
        if( selection.nodes().indexOf( this)==-1) {
            selection.classed( "selected", false);
            selection = d3.select( this);
            selection.classed( "selected", true);
        }

            // move states
        selection.attr("transform", function( d, i) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            return "translate(" + [ d.x,d.y ] + ")"
        });
        console.log(selection);

            // move transistion points of each transition
            // where transition target is also in selection
        var selectedStates = d3.selectAll( 'g.state.selected').data();
        var affectedTransitions = selectedStates.reduce( function( array, state) {
            return array.concat( state.transitions);
        }, [])
        .filter( function( transition) {
            return selectedStates.indexOf( transition.target)!=-1;
        });
        console.log(affectedTransitions);

        affectedTransitions.forEach( function( transition) {
            for( var i = transition.points.length - 1; i >= 0; i--) {
                var point = transition.points[i];
                point.x += d3.event.dx;
                point.y += d3.event.dy;
            }
        });

            // reappend dragged element as last
            // so that its stays on top
        selection.each( function() {
            this.parentNode.appendChild( this);
        });
            // refresh transition path
            console.log('fesfsfsffs');
            console.log(gTransitions.select( "path"));
        //gTransitions.select( "path").attr( 'd', computeTransitionPath);
        svg.selectAll(".foreground").attr( 'd', computeTransitionPath)
        svg.selectAll(".background").attr( 'd', computeTransitionPath)

            // refresh transition endpoints
        svg.selectAll("circle.endpoint").attr(  "transform" , transformTransitionEndpoints);
          // refresh transition points
        svg.selectAll("circle.point").attr("transform", transformTransitionPoints);

        d3.event.sourceEvent.stopPropagation();
    })
    .on( "end", function( d) {
        console.log( "dragend");
        // TODO : http://stackoverflow.com/questions/14667401/click-event-not-firing-after-drag-sometimes-in-d3-js
        console.log(drag_line);
        // needed by FF
        drag_line
            .classed('hidden', true)
            .style('marker-end', '')
        ;

        if( startState && endState) {
            startState.transitions.push( { label : "transition label 1", points : [], target : endState});
            update();
            console.log(states);
        }

        startState = undefined;
        d3.event.sourceEvent.stopPropagation();
    });

    svgcontainer.on(  "mousedown", function() {
            console.log( "mousedown", d3.event.target);
            if( d3.event.target.tagName=='svg') {
            // if( !d3.event.target && d3.event.ctrlKey) {
              console.log('fzqfqzfqzfqzf');
                if( !d3.event.ctrlKey) {
                    d3.selectAll( 'g.selected').classed( "selected", false);
                }

                var p = d3.mouse( this);

                svgcontainer.append( "rect")
                .attr("rx"    , 6)
                  .attr(  "ry"    , 6)
                  .attr(  "class" , "selection")
                  .attr(  "x"     , p[0])
                  .attr(  "y"     , p[1])
                  .attr(  "width" , 0)
                  .attr(  "height", 0)
            }
        })
        .on("mousemove", function() {
            //console.log( "mousemove");
            var p = d3.mouse( this),
                s = svgcontainer.select( "rect.selection");
                console.log(startState)
            if( !s.empty()) {

                var d = {
                        x       : parseInt( s.attr( "x"), 10),
                        y       : parseInt( s.attr( "y"), 10),
                        width   : parseInt( s.attr( "width"), 10),
                        height  : parseInt( s.attr( "height"), 10)
                    },
                    move = {
                        x : p[0] - d.x,
                        y : p[1] - d.y
                    }
                ;

                if( move.x < 1 || (move.x*2<d.width)) {
                    d.x = p[0];
                    d.width -= move.x;
                } else {
                    d.width = move.x;
                }

                if( move.y < 1 || (move.y*2<d.height)) {
                    d.y = p[1];
                    d.height -= move.y;
                } else {
                    d.height = move.y;
                }

                s.attr( 'x'     , d.x)
                .attr( 'y'     , d.y)
                .attr( 'width' , d.width)
                .attr( 'height', d.height);

                    // deselect all temporary selected state objects
                d3.selectAll( 'g.state.selection.selected').classed( "selected", false);

                d3.selectAll( 'g.state >circle.inner').each( function( state_data, i) {
                    if(
                        !d3.select( this).classed( "selected") &&
                            // inner circle inside selection frame
                        state_data.x-radius>=d.x && state_data.x+radius<=d.x+d.width &&
                        state_data.y-radius>=d.y && state_data.y+radius<=d.y+d.height
                    ) {

                        d3.select( this.parentNode)
                        .classed( "selection", true)
                        .classed( "selected", true);
                    }
                });
            } else if( startState) {
                    // update drag line
                    //TODO remove, not wokring
                drag_line.attr('d', 'M' + startState.x + ',' + startState.y + 'L' + p[0] + ',' + p[1]);

                var state = d3.select( 'g.state .inner.hover');
                endState = (!state.empty() && state.data()[0]) || undefined;
            }
        })

        .on("mouseup", function() {
            console.log( "mouseup");
                // remove selection frame
            svgcontainer.selectAll( "rect.selection").remove();

                // remove temporary selection marker class
            d3.selectAll( 'g.state.selection').classed( "selection", false);
        })
        .on("mouseout", function() {
            if( !d3.event.relatedTarget || d3.event.relatedTarget.tagName=='HTML') {
                    // remove selection frame
                svgcontainer.selectAll( "rect.selection").remove();

                    // remove temporary selection marker class
                d3.selectAll( 'g.state.selection').classed( "selection", false);
            }
        })
        .on("dblclick", function() {
            console.log( "dblclick");
            var p = d3.mouse( this);

            if( d3.event.target.tagName=='svg') {
                states.push( { x : p[0], y : p[1], label : "tst", transitions : [] });
                update();
            }
        })

    update();

    function update() {
        svg.selectAll(".state").remove() //TODO use exit...
        gStates = gStates.data( states, function( d) {
            // return states.indexOf( d);
            console.log(d.label);
            return d.label;
        });
        console.log(gStates);
        renderStates();

        svg.selectAll(".transition").remove() //TODO use exit...
        var _transitions = transitions();
        gTransitions = gTransitions.data( _transitions, function( d) {
            return _transitions.indexOf( d);
        });
        renderTransitions();
    };
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.update = update
  self.init = init

  return self
}

//var state = createStateDiagram({data:test.items, links:test.links,positions :test.positions})
//state.init()
