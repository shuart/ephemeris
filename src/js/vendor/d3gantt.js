/**
 * @author Dimitry Kudrayvtsev
 * @version 2.0
 *
 * Ported to d3 v4 by Keyvan Fatehi on October 16th, 2016
 */

d3.gantt = function(selector) {
  var FIT_TIME_DOMAIN_MODE = "fit";
  var FIXED_TIME_DOMAIN_MODE = "fixed";

  var tasks = undefined
  var tasksRelations = undefined

  var margin = {
    top : 20,
    right : 40,
    bottom : 20,
    left : 150
  };
  var timeDomainStart = d3.timeDay.offset(new Date(),-3);
  var timeDomainEnd = d3.timeHour.offset(new Date(),+3);
  var timeDomainMode = FIXED_TIME_DOMAIN_MODE;// fixed or fit
  var taskTypes = [];
  var taskStatus = [];
  var height = document.body.clientHeight - margin.top - margin.bottom-5;
  var width = document.body.clientWidth - margin.right - margin.left-5;
  var lastHover;
  var lastHoverLink =[undefined,undefined];
  var lastHoverClass;
  var lastHoverBandGroup;

  var tickFormat = "%H:%M";

  var onConnectFunc = function (data) {
    console.log(data);
  }
  var onLinkClicked = function (data) {
    console.log(data);
  }
  var onChangeLength = function (data) {
    console.log(data);
  }

  var keyFunction = function(d) {
    // return d.startDate + d.taskName + d.endDate;
    // return d.startDate + d.taskName + d.endDate;
    return d.uuid;
  };

  var rectTransform = function(d) {
    return "translate(" + x(d.startDate) + "," + y(d.uuid) + ")";
  };

  var x,y,xAxis,yAxis;
  var xMonths;
  var xAxisMonth;

  initAxis();

  var initTimeDomain = function() {
    if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
      if (tasks === undefined || tasks.length < 1) {
        timeDomainStart = d3.timeDay.offset(new Date(), -3);
        timeDomainEnd = d3.timeHour.offset(new Date(), +3);
        return;
      }
      tasks.sort(function(a, b) {
        return a.endDate - b.endDate;
      });
      timeDomainEnd = tasks[tasks.length - 1].endDate;
      tasks.sort(function(a, b) {
        return a.startDate - b.startDate;
      });
      timeDomainStart = tasks[0].startDate;
    }
  };

  function monthDiff(d1, d2) {
    var d2 = new Date(d2)
    var d1 = new Date(d1)
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  function getAllMonthsBetween(d1, d2) {
    var startDate = moment(d1);
    var endDate = moment(d2);

    var result = [];

    if (endDate.isBefore(startDate)) {
        throw "End date must be greated than start date."
    }

    var currentDate = startDate.clone();

    while (startDate.isBefore(endDate)) {
        result.push(currentDate.format("YYYY-MM-01"));
        startDate.add(1, 'month');
    }
    console.log(result);
    return result
  }

 function initAxis() {
    x = d3.scaleTime().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
    xMonths = d3.scaleTime().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);;

    // xMonths = d3.scaleBand().domain(getAllMonthsBetween(timeDomainStart, timeDomainEnd)).range([ 0, width ]).padding(0.1);

    y = d3.scaleBand().domain(taskTypes).range([ 0, height - margin.top - margin.bottom ]).padding(0.1);

    xAxis = d3.axisBottom().ticks(d3.timeDay).scale(x).tickFormat((d) => {
      return moment(d).format("DD MM YYYY");
    })
      .tickSize(8).tickPadding(8);

    xAxisMonth = d3.axisBottom().ticks(d3.timeMonth).scale(xMonths).tickFormat((d) => {
      return moment(d).format("MMMM YYYY");
    })
      .tickSize(8).tickPadding(8);

    yAxis = d3.axisLeft().scale(y).tickFormat((d) => {
      var task= tasks.filter(e=>e.uuid==d)[0]
      return task.taskName;
    }).tickSize(0);
  };

  function gantt(initialTasks,initialTasksRelations) {
    tasks = initialTasks
    tasksRelations = initialTasksRelations
    initTimeDomain();
    initAxis();

    var svg = d3.select(selector)
      .append("svg")
      .attr("class", "chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .call(draw)
      .append("g")
      .attr("class", "gantt-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      // .call(draw);

    var defs = svg.append("svg:defs")

		defs.append("svg:marker")
          .attr("id", "arrow")
          .attr("viewBox", "0 -5 10 10")
          .attr('refX', -1)//so that it comes towards the center.
          .attr("markerWidth", 5)
          .attr("markerHeight", 5)
          .attr("orient", "auto")
          .attr("stroke", "#00b5ad")
          .attr("fill", "#00b5ad")
        .append("svg:path")
          .attr("d", "M0,-5L10,0L0,5");

    d3.select(selector).select(".chart")
      .append("line")
      .attr("class", "selectpath")
      .attr("marker-end","url(#arrow)")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0)
      .attr("stroke-width", 0)
      .attr("stroke", "#00b5ad");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
      .transition()
      .call(xAxis);
    svg.append("g")
      .attr("class", "xMonths axis months")
      .attr("transform", "translate(0, " + (height - margin.top - margin.bottom +25) + ")")
      .transition()
      .call(xAxisMonth);

    svg.append("g").attr("class", "y axis").transition().call(yAxis);

    var controlsUp = svg.selectAll("g.controlup").data(tasks, keyFunction).enter()
    .append("g")
      .attr("class","controlup")

    controlsUp.append("rect")
      .attr("class","moveup")
      .on("mouseover",function (d,i) {
        lastHoover = d.uuid
        lastHoverClass = d3.select(this).attr("class");
      })
      .attr("fill", "red")
      .attr("height", function(d) { return 5; })
      .attr("width", 5)
      .attr("transform", function(d) {
        return "translate(" + (10) + "," + y(d.uuid) + ")"
      })

    var rectGroup = svg.selectAll("g.charttask")
      .data(tasks, keyFunction).enter()
      .append("g")
        .attr("class","charttask")
        .on("mouseover",function (d,i) {
          lastHoverBandGroup = this
          console.log(lastHoverBandGroup);
        })

      rectGroup.append("rect")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("class", function(d){
          if(taskStatus[d.status] == null){ return "bar";}
          return taskStatus[d.status];
        })
        .attr("y", 0)
        .attr("fill", "#e0e1e2")
        .attr("transform", rectTransform)
        .attr("height", function(d) { return 70; })
        .attr("width", function(d) {
          console.log(d.endDate);
          console.log(x(d.endDate));
          console.log(x(d.endDate) - x(d.startDate));
          return (x(d.endDate) - x(d.startDate));
        })
        .attr("class","charttaskband")
        .on("mouseover",function (d,i) {
          lastHoover = d.uuid
          lastHoverClass = d3.select(this).attr("class");
          console.log(lastHoverClass);
        })


      rectGroup.append("rect")
        .attr("class","charttaskhandleleft")
        .on("mouseover",function (d,i) {
          lastHoover = d.uuid
          lastHoverClass = d3.select(this).attr("class");
        })
        .attr("fill", "lightgrey")
        .attr("height", function(d) { return 50; })
        .attr("width", 8)
        .attr("transform", function(d) {
          return "translate(" + (x(d.startDate)+10) + "," + y(d.uuid) + ")"
        })
      rectGroup.append("rect")
        .attr("class","charttaskhandleright")
        .on("mouseover",function (d,i) {
          lastHoover = d.uuid
          lastHoverClass = d3.select(this).attr("class");
        })
        .attr("fill", "lightgrey")
        .attr("height", function(d) { return 50; })
        .attr("width", 8)
        .attr("transform", function(d) {
          return "translate(" + (x(d.endDate)-20) + "," + y(d.uuid) + ")"
        })


      svg.selectAll("g.taskpath")
        .data(tasksRelations).enter()
        .append("g")
          .attr("class", "taskpath")
        .append( "path" )//append path
        .attr( "class", "link" )
        .style( "stroke", "#00b5ad" )
        .attr('marker-end', (d) => "url(#arrow)")//attach the arrow from defs
        .style( "stroke-width", 2 )
        .attr( "d", (d) => {
          return ("M" + x(d.start) + ',' + y(d.source) + ','+ (x(d.start)+15) + ',' + y(d.source) + ',' + (x(d.end)+15) + ',' + (y(d.target)-20))
        })
        .on("mouseover",function (d,i) {
          lastHooverLinks = [d.source, d.target]
          lastHoverClass = d3.select(this).attr("class");
          console.log(lastHoverClass);
        })

      return gantt;

  };

  gantt.redraw = function() {

    initTimeDomain();
    initAxis();

    var svg = d3.select(selector).select("svg");
    var ganttChartGroup = svg.select(".gantt-chart");
    var rect = ganttChartGroup.selectAll(".charttask").data(tasks, keyFunction);
    var arrowPaths = ganttChartGroup.selectAll("g.taskpath").data(tasksRelations);
    var controlsUp = svg.selectAll("g.controlup").data(tasks, keyFunction)

    controlsUp.enter()
    .append("g")
      .attr("class","controlup")
      .append("rect")
      .attr("class","moveup")
      .on("mouseover",function (d,i) {
        lastHoover = d.uuid
        lastHoverClass = d3.select(this).attr("class");
      })
      .attr("fill", "red")
      .attr("height", function(d) { return 5; })
      .attr("width", 5)
      .attr("transform", function(d) {
        return "translate(" + (10) + "," + y(d.uuid) + ")"
      })
    controlsUp.merge(controlsUp).select(".moveup").transition()
      .attr("transform", function(d) {
        return "translate(" + (10) + "," + y(d.uuid) + ")"
      })
    controlsUp.exit().remove()


    rect.enter()
      .on("mouseover",function (d,i) {
        lastHoverBandGroup = this
        console.log(lastHoverBandGroup);
      })//TODO shoudl add group first
      .insert("rect",":first-child")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("class", function(d){
        if(taskStatus[d.status] == null){ return "bar";}
        return taskStatus[d.status];
      })
      .transition()
      .attr("y", 0)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.bandwidth(); })
      .attr("width", function(d) {
         return (x(d.endDate) - x(d.startDate));
      });

      rect.merge(rect).select("rect").transition()
      	.attr("transform", rectTransform)
	      .attr("height", function(d) { return y.bandwidth(); })
        .attr("width", function(d) {
           return (x(d.endDate) - x(d.startDate));
        });
      rect.merge(rect).select(".charttaskhandleleft").transition()
        .attr("height", function(d) { return y.bandwidth(); })
        .attr("transform", function(d) {
          return "translate(" + (x(d.startDate)+10) + "," + y(d.uuid) + ")"
        })
      rect.merge(rect).select(".charttaskhandleright").transition()
        .attr("height", function(d) { return y.bandwidth(); })
        .attr("transform", function(d) {
          return "translate(" + (x(d.endDate)-20) + "," + y(d.uuid) + ")"
        })

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".xMonths").transition().call(xAxisMonth);
        svg.select(".y").transition().call(yAxis);

        arrowPaths.enter()
          .append("g")
            .attr("class", "taskpath")
          .append( "path" )//append path
          .attr( "class", "link" )
          .style( "stroke", "#00b5ad" )
          .attr('marker-end', (d) => "url(#arrow)")//attach the arrow from defs
          .style( "stroke-width", 2 )
          .attr( "d", (d) => {
            return ("M" + (x(d.start)+150) + ',' + (y(d.source)+20) + ','+ (x(d.start)+165) + ',' + (y(d.source)+20) + ',' + (x(d.end)+165) + ',' + (y(d.target)))
          })
          .on("mouseover",function (d,i) {
            lastHooverLinks = [d.source, d.target]
            lastHoverClass = d3.select(this).attr("class");
            console.log(lastHoverClass);
          })

        arrowPaths.merge(arrowPaths).select("path").transition()
        .attr( "d", (d) => {
          return ("M" + (x(d.start)+0) + ',' + (y(d.source)+0) + ','+ (x(d.start)+45) + ',' + (y(d.source)+0) + ',' + (x(d.end)+45) + ',' + (y(d.target)))
        });

        arrowPaths.exit().remove();

        return gantt;
  };

  function draw(selection){
    var xy0,
        path,
        keep = false
        keepHandle = false;
    var origin =undefined;
    var target = undefined;
    var mouseStart={x:0,y:0}

    selection
        .on('mousedown', function(d){
          console.log(d);
          console.log(this);
          console.log(lastHoverClass);
          console.log(lastHoverClass == "charttaskband");
          if (lastHoverClass == "charttaskband") {
            origin = lastHoover
            keep = true;
            xy0 = d3.mouse(this);
            console.log(xy0);
            path = d3.select(selector).select('.selectpath').attr("stroke-width", 2)
              .attr("x1", xy0[0])
              .attr("y1", xy0[1]);
            console.log(path);
            console.log(this);
          }
          if (lastHoverClass == "link") {
            console.log(lastHooverLinks);
            onLinkClicked({origin:lastHooverLinks[0], target:lastHooverLinks[1]})
          }
          if (lastHoverClass == "charttaskhandleleft") {
            keepHandle = "left"
            xy0 = d3.mouse(this);
            mouseStart.x=xy0[0]
            mouseStart.y=xy0[1]
          }
          if (lastHoverClass == "charttaskhandleright") {
            keepHandle = "right"
            xy0 = d3.mouse(this);
            mouseStart.x=xy0[0]
            mouseStart.y=xy0[1]
          }
        })
        .on('mouseup', function(){
          if (keep) {
            target = lastHoover
            if (origin != target) {
              onConnectFunc({origin, target})
            }
          }else if (keepHandle == "right") {
            target = lastHoover
            var currentDate = x.invert(d3.mouse(this)[0])
            if (true) {
              onChangeLength({target, endDate: currentDate})
            }
          }
          keepHandle = false;
          keep = false;
          path = d3.select(selector).select('.selectpath').attr("stroke-width", 0)
        })
        .on('mousemove', function(){
            if (keep) {
              xy0 = d3.mouse(this);
              path = d3.select(selector).select('.selectpath').attr("stroke-width", 2)
                .attr("x2", xy0[0])
                .attr("y2", xy0[1]);
            }else if (keepHandle) {
              xy0 = d3.mouse(this);
              console.log(x.invert(d3.mouse(this)[0]));
              var currentDate = x.invert(d3.mouse(this)[0])
              if (keepHandle == "left") {
                d3.select(lastHoverBandGroup).select(".charttaskband").attr("transform", function(d) {
                  return "translate(" + (x(currentDate)-margin.left) + "," + y(d.uuid) + ")"
                })
                d3.select(lastHoverBandGroup).select(".charttaskhandleleft").attr("transform", function(d) {
                  return "translate(" + (x(currentDate)+10-margin.left) + "," + y(d.uuid) + ")"
                })
              }else if (keepHandle =="right") {
                d3.select(lastHoverBandGroup).select(".charttaskband").attr("width", function(d) {
                    var finalWidth = x(currentDate)-margin.left - x(d.startDate)
                    console.log(finalWidth);
                    if (finalWidth<0) {
                      finalWidth = 0
                    }
                   return finalWidth;
                });
                d3.select(lastHoverBandGroup).select(".charttaskhandleright").attr("transform", function(d) {
                  return "translate(" + (x(currentDate)-20-margin.left) + "," + y(d.uuid) + ")"
                })
              }
            }
        });
}

  gantt.margin = function(value) {
    if (!arguments.length)
      return margin;
    margin = value;
    return gantt;
  };

  gantt.timeDomain = function(value) {
    if (!arguments.length)
      return [ timeDomainStart, timeDomainEnd ];
    timeDomainStart = +value[0], timeDomainEnd = +value[1];
    return gantt;
  };

    /**
  * @param {string}
  *                vale The value can be "fit" - the domain fits the data or
  *                "fixed" - fixed domain.
  */
  gantt.timeDomainMode = function(value) {
    if (!arguments.length)
      return timeDomainMode;
    timeDomainMode = value;
    return gantt;

  };

  gantt.taskTypes = function(value) {
    if (!arguments.length)
      return taskTypes;
    taskTypes = value;
    return gantt;
  };

  gantt.taskStatus = function(value) {
    if (!arguments.length)
      return taskStatus;
    taskStatus = value;
    return gantt;
  };

  gantt.width = function(value) {
    if (!arguments.length)
      return width;
    width = +value;
    return gantt;
  };

  gantt.height = function(value) {
    if (!arguments.length)
      return height;
    height = +value;
    return gantt;
  };

  gantt.tickFormat = function(value) {
    if (!arguments.length)
      return tickFormat;
    tickFormat = value;
    return gantt;
  };

  gantt.onConnect = function (callback) {
    onConnectFunc = callback
  }
  gantt.onLinkClicked = function (callback) {
    onLinkClicked = callback
  }
  gantt.onChangeLength = function (callback) {
    onChangeLength = callback
  }
  gantt.updateData = function (newTasks, newTasksRelations) {
    tasks = newTasks
    tasksRelations = newTasksRelations
  }

  return gantt;
};
