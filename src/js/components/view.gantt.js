var createGanttView = function ({
  targetSelector = undefined,
  initialData = undefined,
  onChangeLengthEnd = undefined,
  onElementClicked = undefined,
  elementDefaultColor = 'rgb(238, 238, 238)',
  elementDefaultTextColor = 'black',
  onChangeStartEnd = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var currentWidth =1800

  var sourceEl = undefined
  var gantt
  var tasks = []

  var lastHoverBandGroup = undefined
  var lastHoverClass = undefined
  var lastHoverElement = undefined
  var draggedElement = false
  var draggedElementType = undefined
  var dragMode = false
  var lastAction = undefined
  var zoomLevel = 30

  var theme ={
    slider:function (value) {
      return `
      <div>
        <input class="zoominput" type="range" id="start" name="zoom"
               min="1" max="100" value="${value}" >
        <label for="zoom">Zoom</label>
      </div>`
    }
  }

  var data = initialData || [{
    startDate: '2019-02-27',
    endDate: '2019-04-04',
    label: 'Exemple milestone 01',
    id: 'm01',
    dependsOn: []
  }, {
    endDate: '2019-03-17',
    duration: [25, 'days'],
    label: 'Add milestone in the list',
    id: 'm04',
    dependsOn: ['m01']
  }];

  var init = function () {
    sourceEl = document.createElement('div');
    sourceEl.classList="ganttArea"
    sourceEl.style.height="50%"

    menuEl = document.createElement('div');
    menuEl.classList="ganttMenuArea"
    sourceEl.appendChild(menuEl)
    ganttEl = document.createElement('div');
    ganttEl.classList="ganttDiagramArea"
    ganttEl.style.overflow="auto"
    ganttEl.style.maxWidth="100%"
    ganttEl.style.maxHeight="90%"
    sourceEl.appendChild(ganttEl)

    document.querySelector(targetSelector).appendChild(sourceEl)
    connections()
    update()


  }
  var connections =function () {

  }

  var render = function () {
    //Render Menu
    renderMenu()

    //render Gantt
    renderGantt()
  }

  var renderMenu = function () {
    menuEl.innerHTML=""
    menuEl.innerHTML = theme.slider(zoomLevel)
    //connectMenuEvents
    menuEl.querySelector(".zoominput").oninput = function(e) {
      zoomLevel = (this.value)
      renderGantt()
    }
  }

  var renderGantt =function () {
    ganttEl.innerHTML=""
    createGanttChart(ganttEl, data, {
      elementHeight: 20,
      sortMode: 'none', // alternatively, 'childrenCount' or 'date'
      svgOptions: {
        width: zoomLevel/100*10000,
        height: 400,
        fontSize: 12
      }
    });
  }

  const prepareDataElement = ({ id, label, startDate, endDate, duration, dependsOn }) => {
    if ((!startDate || !endDate) && !duration) {
      throw new Exception('Wrong element format: should contain either startDate and duration, or endDate and duration or startDate and endDate');
    }

    if (startDate) startDate = moment(startDate);

    if (endDate) endDate = moment(endDate);

    if (startDate && !endDate && duration) {
      endDate = moment(startDate);
      endDate.add(duration[0], duration[1]);
    }

    if (!startDate && endDate && duration) {
      startDate = moment(endDate);
      startDate.subtract(duration[0], duration[1]);
    }

    if (!dependsOn)
      dependsOn = [];

    return {
      id,
      label,
      startDate,
      endDate,
      duration,
      dependsOn
    };
  };

  const findDateBoundaries = data => {
    let minStartDate, maxEndDate;

    data.forEach(({ startDate, endDate }) => {
      if (!minStartDate || startDate.isBefore(minStartDate)) minStartDate = moment(startDate);

      if (!minStartDate || endDate.isBefore(minStartDate)) minStartDate = moment(endDate);

      if (!maxEndDate || endDate.isAfter(maxEndDate)) maxEndDate = moment(endDate);

      if (!maxEndDate || startDate.isAfter(maxEndDate)) maxEndDate = moment(startDate);
    });

    return {
      minStartDate,
      maxEndDate
    };
  };

  const createDataCacheById = data => data.reduce((cache, elt) => Object.assign(cache, { [elt.id]: elt }), {});

  const createChildrenCache = data => {
    const dataCache = createDataCacheById(data);

    const fillDependenciesForElement = (eltId, dependenciesByParent) => {
      dataCache[eltId].dependsOn.forEach(parentId => {
        if (!dependenciesByParent[parentId])
          dependenciesByParent[parentId] = [];

        if (dependenciesByParent[parentId].indexOf(eltId) < 0)
          dependenciesByParent[parentId].push(eltId);

        fillDependenciesForElement(parentId, dependenciesByParent);
      });
    };

    return data.reduce((cache, elt) => {
      if (!cache[elt.id])
        cache[elt.id] = [];

      fillDependenciesForElement(elt.id, cache);

      return cache;
    }, {});
  }

  const sortElementsByChildrenCount = data => {
    const childrenByParentId = createChildrenCache(data);

    return data.sort((e1, e2) => {
      if (childrenByParentId[e1.id] && childrenByParentId[e2.id] && childrenByParentId[e1.id].length > childrenByParentId[e2.id].length)
        return -1;
      else
        return 1;
    });
  };

  const sortElementsByEndDate = data =>
    data.sort((e1, e2) => {
      if (moment(e1.endDate).isBefore(moment(e2.endDate)))
        return -1;
      else
        return 1;
    });

  const sortElements = (data, sortMode) => {
    if (sortMode === 'childrenCount') {
      return sortElementsByChildrenCount(data);
    } else if (sortMode === 'date') {
      return sortElementsByEndDate(data);
    } else if (sortMode === 'none') {
      return data;
    }
  }

  const parseUserData = data => data.map(prepareDataElement);

  const createPolylineData = (rectangleData, elementHeight) => {
    // prepare dependencies polyline data
    const cachedData = createDataCacheById(rectangleData);

    // used to calculate offsets between elements later
    const storedConnections = rectangleData.reduce((acc, e) => Object.assign(acc, { [e.id]: 0 }), {});

    // create data describing connections' lines
    return rectangleData.flatMap(d =>
      d.dependsOn
        .map(parentId => cachedData[parentId])
        .map(parent => {
          const color = '#' + (Math.max(0.1, Math.min(0.9, Math.random())) * 0xFFF << 0).toString(16);

          // increase the amount rows occupied by both parent and current element (d)
          storedConnections[parent.id]++;
          storedConnections[d.id]++;

          const deltaParentConnections = storedConnections[parent.id] * (elementHeight / 4);
          const deltaChildConnections = storedConnections[d.id] * (elementHeight / 4);

          const points = [
            d.x, (d.y + (elementHeight / 2)),
            d.x - deltaChildConnections, (d.y + (elementHeight / 2)),
            d.x - deltaChildConnections, (d.y - (elementHeight * 0.25)),
            parent.xEnd + deltaParentConnections, (d.y - (elementHeight * 0.25)),
            parent.xEnd + deltaParentConnections, (parent.y + (elementHeight / 2)),
            parent.xEnd, (parent.y + (elementHeight / 2))
          ];

          return {
            points: points.join(','),
            color
          };
        })
    );
  };

  const createElementData = (data, elementHeight, xScale, fontSize) =>
    data.map((d, i) => {
      const x = xScale(d.startDate.toDate());
      const xEnd = xScale(d.endDate.toDate());
      const y = i * elementHeight * 1.5;
      const width = xEnd - x;
      const height = elementHeight;

      const charWidth = (width / fontSize);
      const dependsOn = d.dependsOn;
      const id = d.id;

      const tooltip = d.label;

      const singleCharWidth = fontSize * 0.5;
      const singleCharHeight = fontSize * 0.45;

      let label = d.label;

      if (label.length > charWidth) {
        label = label.split('').slice(0, charWidth - 3).join('') + '...';
      }

      const labelX = x + ((width / 2) - ((label.length / 2) * singleCharWidth));
      const labelY = y + ((height / 2) + (singleCharHeight));

      return {
        x,
        y,
        xEnd,
        width,
        height,
        id,
        dependsOn,
        label,
        labelX,
        labelY,
        tooltip
      };
    });



  const createChartSVG = (data, placeholder, { svgWidth, svgHeight, elementHeight, scaleWidth, scaleHeight, fontSize, minStartDate, maxEndDate, margin, showRelations }) => {
    // create container element for the whole chart
    const svgMenu = d3.select(placeholder)
      .append('svg')
      .attr('style', "position:sticky; top:0px; display:block;")
      .attr('width', svgWidth)
      .attr('height', 40);
    const gAxis = svgMenu.append('g').attr('transform', `translate(${margin.left},0)`);
    //gaxis repacle g1 as a target for the axis to allow it to stic on top

    const svg = d3.select(placeholder).append('svg').attr('width', svgWidth).attr('height', svgHeight);
    // .call(d3.zoom().on("zoom", function () {
    //    svg.attr("transform", d3.event.transform)
    // }))
    const xScale = d3.scaleTime()
      .domain([minStartDate.toDate(), maxEndDate.toDate()])
      .range([0, scaleWidth])

    const make_x_gridlines = function() {
      return d3.axisBottom(xScale)
          .ticks(d3.timeDay.every(getGridDensityFromZoom(zoomLevel)))
    }

    // prepare data for every data element
    const rectangleData = createElementData(data, elementHeight, xScale, fontSize);

    // create data describing connections' lines
    const polylineData = createPolylineData(rectangleData, elementHeight);

    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeDay.every(1))
      // .tickSize(200, 0, 0)
      .tickFormat(d3.timeFormat( getTimeFormatFromZoom(zoomLevel) ));


    const xAxisMonth = d3.axisBottom(xScale)
      .ticks(d3.timeMonth.every(1))
      // .tickSize(200, 0, 0)
      .tickFormat(d3.timeFormat('%B %y'));

    // create container for the data
    const g1 = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g1
    .append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('fill', '#fff')

    // g1.append('g').call(xAxis);
    gAxis.append('g').call(xAxisMonth).call(gAxis => gAxis.select(".domain").remove());
    gAxis.append('g')
      .attr('transform', `translate(0,20)`)
      .call(xAxis);
      //.selectAll("text")
      //   .style("text-anchor", "end")
      //   .attr("dx", "-.8em")
      //   .attr("dy", ".15em")
      //   .attr("transform", "rotate(-65)");


    g1.append("g")
      .attr("class", "grid")
      .attr("style", "opacity:0.1")
      .attr("transform", "translate(0," + data.length*35 + ")")
      .call(make_x_gridlines()
          .tickSize(-data.length*35 )
          .tickFormat("")
      )

    const linesContainer = g1.append('g').attr('transform', `translate(0,${margin.top})`);
    const barsContainer = g1.append('g').attr('transform', `translate(0,${margin.top})`);

    g1
      .append("line")
      .attr("class", "selectpath")
      .attr("marker-end","url(#arrow)")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0)
      .attr("stroke-width", 0)
      .attr("stroke", "#00b5ad");

    // create axes
    const bars = barsContainer
      .selectAll('g')
      .data(rectangleData)
      .enter()
      .append('g');

    // add stuff to the SVG
    if (showRelations) {
      linesContainer
        .selectAll('polyline')
        .data(polylineData)
        .enter()
        .append('polyline')
        .style('fill', 'none')
        .style('stroke', d => d.color)
        .attr('points', d => d.points);
    }

    //Add the event elements
    // bars
    // .on('mousedown', function(d) {
    //     console.log("dragMode ChartBand");
    //     dragmode = true;
    //     console.log(dragmode);
    //     draggedElement = d3.select(this);
    //     draggedElementType = "bar";
    // })

    //set bar group position
    bars
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y+ ")"
      })

    bars
      .append('rect')
      .attr("class","chartBand")
      .attr('rx', elementHeight / 2)
      .attr('ry', elementHeight / 2)
      // .attr('x', d => d.x)
      // .attr('y', d => d.y)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .style('fill', elementDefaultColor)
      .style('stroke', elementDefaultColor)
      .on("mouseover",function (d,i) {
        lastHoverClass = d3.select(this).attr("class");
        lastHoverBandGroup = this
        lastHoverElement = d3.select(this);
        console.log(lastHoverBandGroup);
      })
      .on("click",function (d,i) {
        // lastHoverClass = d3.select(this).attr("class");
        // lastHoverBandGroup = this
        // lastHoverElement = d3.select(this);
        console.log(d3.select(this).datum());
        if (onElementClicked) { onElementClicked( d3.select(this).datum() ) }
      })
      .on('mousedown', function(d) {
          console.log("dragMode ChartBand");
          dragmode = true;
          console.log(dragmode);
          draggedElement = this;
          draggedElementType = "bar";
      })
      //TODO shoudl add group first
      // .on('mousedown', function(d) {
      //     console.log("dragMode ChartBand");
      //     dragmode = true;
      //     console.log(dragmode);
      //     draggedElement = d3.select(this);
      // })

    bars
      .append('text')
      .style('fill', elementDefaultTextColor)
      .style('font-family', 'sans-serif')
      .attr('x', d => d.labelX-d.x)
      .attr('y', d => elementHeight/1.3)
      .text(d => d.label);

    bars //handles
      .append('rect')
      .attr("class","leftHandle")
      .attr('rx', elementHeight / 2)
      .attr('ry', elementHeight / 2)
      .attr('x', d => 0)
      .attr('y', d => elementHeight / 4)
      .attr('width', elementHeight / 2)
      .attr('height', elementHeight / 2)
      .style('fill', '#ffffff')
      .style('stroke', '#ddd')
      .on("mousedown",function (d,i) {
        console.log("dragMode left Handle");
        dragmode = true;
        console.log(dragmode);
        draggedElement = this;
        draggedElementType = "leftHandle";
      })//TODO shoudl add group first
    bars //Connector
      .append('rect')
      .attr("class","connector")
      .attr('rx', elementHeight / 2)
      .attr('ry', elementHeight / 2)
      .attr('x', d => 20)
      .attr('y', d => elementHeight / 4)
      .attr('width', elementHeight / 2)
      .attr('height', elementHeight / 2)
      .style('fill', 'rgba(221, 221, 221, 0)')
      .style('stroke', '#ffffff')
      .on("mousedown",function (d,i) {
        console.log("dragMode connector");
        dragmode = true;
        console.log(dragmode);
        draggedElement = this;
        draggedElementType = "connector";
        //set start of line
        let xy0 = d3.mouse(this.parentNode.parentNode.parentNode);

        g1.select('.selectpath').attr("stroke-width", 2)
          .attr("x1", xy0[0])
          .attr("y1", xy0[1]);
      })//TODO shoudl add group first
    bars //handles
      .append('rect')
      .attr("class","rightHandle")
      .attr('rx', elementHeight / 2)
      .attr('ry', elementHeight / 2)
      .attr('x', d =>d.width - elementHeight / 2)
      .attr('y', d =>elementHeight / 4)
      .attr('width', elementHeight / 2)
      .attr('height', elementHeight / 2)
      .style('fill', '#ffffff')
      .style('stroke', '#ddd')
      .on("mouseover",function (d,i) {
        lastHoverClass = d3.select(this).attr("class");
        lastHoverElement = d3.select(this);
        console.log(lastHoverClass);
      })
      .on("mousedown",function (d,i) {
        console.log("dragMode right Handle");
        dragmode = true;
        console.log(dragmode);
        draggedElement = this;
        draggedElementType = "rightHandle";
      })//TODO shoudl add group first

    bars
      .append('title')
      .text(d => d.tooltip);

      //interactions
    g1
      .on('mousedown', function(d){
          console.log(d);
          console.log(this);
          console.log(lastHoverClass);
          // if (lastHoverClass == "chartBand") {
          //   // origin = lastHoover
          //   dragMode = true;
          //   console.log('dragmode started');
          //   xy0 = d3.mouse(this);
          //   console.log(xy0);
          //   // path = d3.select(selector).select('.selectpath').attr("stroke-width", 2)
          //   //   .attr("x1", xy0[0])
          //   //   .attr("y1", xy0[1]);
          //   // console.log(path);
          //   console.log(this);
          // }
        })
        .on('mouseup', function(){
          console.log('mouseup');
          dragMode = false;
          draggedElement = undefined
          g1.select('.selectpath').attr("stroke-width", 0)

          triggerPostActionEvents()//trigger the callback if defined

        })
        .on('mousemove', function(){
          console.log("dragging");
          console.log(dragMode);
          console.log(draggedElement);
          if (draggedElement && draggedElementType == "connector") {
            let xy0 = d3.mouse(this);
            let path = g1.select('.selectpath').attr("stroke-width", 2)
              .attr("x2", xy0[0])
              .attr("y2", xy0[1]);
          }
          if (draggedElement && draggedElementType == "bar") {
            xy0 = d3.mouse(this);
            console.log(xScale.invert(d3.mouse(this)[0]));
            var currentDate = xScale.invert(d3.mouse(this)[0])
            console.log(currentDate);

            d3.select(draggedElement.parentNode).attr("transform", function(d) {
              return "translate(" + (xScale(currentDate)) + "," + d.y+ ")"
              })

            lastAction = {type: 'changeStart',target:d3.select(draggedElement).datum(), mouseTime:currentDate}
            //TODO, date are not correct here
            // draggedElement
            // .attr('x', xScale(currentDate))
            // .attr('y', d => d.y)
            //
          }
          if (draggedElement && draggedElementType == "leftHandle") {
            xy0 = d3.mouse(this);
            console.log(xScale.invert(d3.mouse(this)[0]));
            var currentDate = xScale.invert(d3.mouse(this)[0])
            console.log(currentDate);

            // d3.select(draggedElement).attr("transform", function(d) {
            //   return "translate(" + (xScale(currentDate)-d.x) + "," + 0+ ")"
            //   })
            d3.select(draggedElement.parentNode).attr("transform", function(d) {
              return "translate(" + (xScale(currentDate)) + "," + d.y+ ")"
              })

            lastAction = {type: 'changeStart',target:d3.select(draggedElement).datum(), mouseTime:currentDate}

            // draggedElement
            // .attr('x', xScale(currentDate))
            // .attr('y', d => d.y)
            //
          }
          if (draggedElement && draggedElementType == "rightHandle") {
            xy0 = d3.mouse(this);
            console.log(xScale.invert(d3.mouse(this)[0]));
            var currentDate = xScale.invert(d3.mouse(this)[0])
            console.log(currentDate);


            let groupTransform = getTransformation(d3.select(draggedElement.parentNode).attr("transform"))
            let startOfGroup =[groupTransform.translateX,groupTransform.translateY]

            let lengthToDate =  xScale(currentDate) - startOfGroup[0]

            if (lengthToDate>10) {
              d3.select(draggedElement).attr("x", lengthToDate-10)
              d3.select(draggedElement.parentNode).select('.chartBand').attr("width", lengthToDate)

              lastAction = {type: 'changeLength',target:d3.select(draggedElement).datum(), startTime:xScale.invert(startOfGroup[0]),mouseTime:currentDate}
            }
            // d3.select(draggedElement.parentNode).select('.chartBand')
            //   .attr("width", function(d) {
            //     return "translate(" + (xScale(currentDate)) + "," + d.y+ ")"
            //   })

            // draggedElement
            // .attr('x', xScale(currentDate))
            // .attr('y', d => d.y)
            //
          }

        })
  };

  const getTimeFormatFromZoom = function (zoom) {
    if (zoom < 30) {
      return ''
    }else if (zoom < 50){
      return '%d'
    }else {
      return '%d-%m'
    }
  }
  const getGridDensityFromZoom = function (zoom) {
    if (zoom < 5) {
      return 62
    }else if (zoom < 20){
      return 31
    }else {
      return 1
    }
  }

  const triggerPostActionEvents = function () {
    if (lastAction.type == 'changeLength') {
      if (onChangeLengthEnd) { onChangeLengthEnd(lastAction) }
    }
    if (lastAction.type == 'changeStart') {
      if (onChangeStartEnd) { onChangeStartEnd(lastAction) }
    }

    lastAction = undefined
  }


  const createGanttChart = (placeholder, data, { elementHeight, sortMode, showRelations, svgOptions }) => {
    // prepare data
    const margin = (svgOptions && svgOptions.margin) || {
      top: elementHeight * 0,
      left: elementHeight * 1
    };

    const scaleWidth = ((svgOptions && svgOptions.width) || 600) - (margin.left * 2);
    const scaleHeight = Math.max((svgOptions && svgOptions.height) || 200, data.length * elementHeight * 2) - (margin.top * 2);

    const svgWidth = scaleWidth + (margin.left * 2);
    const svgHeight = scaleHeight + (margin.top * 2);

    const fontSize = (svgOptions && svgOptions.fontSize) || 12;

    if (!sortMode) sortMode = 'date';

    if (typeof(showRelations) === 'undefined') showRelations = true;

    data = parseUserData(data); // transform raw user data to valid values
    data = sortElements(data, sortMode);

    const { minStartDate, maxEndDate } = findDateBoundaries(data);

    // add some padding to axes
    minStartDate.subtract(20, 'days');

    if (zoomLevel < 5) {
      minStartDate.subtract(450, 'days');
    }else if (zoomLevel < 20){
      minStartDate.subtract(292, 'days');
    }else {
      minStartDate.subtract(20, 'days');
    }
    if (zoomLevel < 5) {
      maxEndDate.add(450, 'days');
    }else if (zoomLevel < 20){
      maxEndDate.add(292, 'days');
    }else {
      maxEndDate.add(92, 'days');
    }


    createChartSVG(data, placeholder, { svgWidth, svgHeight, scaleWidth, elementHeight, scaleHeight, fontSize, minStartDate, maxEndDate, margin, showRelations });
  };

  var update = function (newData) {
    if (newData) {
      data = newData
    }
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  function getTransformation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix.
    var matrix = g.transform.baseVal.consolidate().matrix;

    // Below calculations are taken and adapted from the private function
    // transform/decompose.js of D3's module d3-interpolate.
    var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
    // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * 180 / Math.PI,
      skewX: Math.atan(skewX) * 180 / Math.PI,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  function buildTasksListB(sourceData,links,ganttLink){
    var data = sourceData.map((e) => {
      return {uuid:e.uuid, taskName:e.name,startDate:e.start||moment().toDate(), duration:e.duration,status:"RUNNING", resolved:false}
    })
    var sources = links.map(item => item.source)
    var targets = links.map(item => item.target)

    for (task of data) {
      if (!task.resolved) {
        resolveActualDates(task)
      }
    }

    function resolveActualDates(task) {
      var linksWithTaskAsTarget = links.filter(item => item.target == task.uuid)
      //plaholder Date
      //task.startDate =moment().toDate();
      for (link of linksWithTaskAsTarget) {
        var parentTask = data.filter(e => e.uuid == link.source)[0]
        if (!task.resolved) {
          task.startDate = new Date(resolveActualDates(parentTask).endDate.getTime())
        }else {
          task.startDate = new Date(parentTask.endDate.getTime())
        }
        if (ganttLink) {//see if a store for the object link is due
          ganttLink.push({start:parentTask.endDate, end:task.startDate, source:parentTask.uuid, target:task.uuid})
        }
      }

      task.endDate  = moment(task.startDate).add(task.duration, 'days').toDate();
      task.resolved = true;
      return task;
    }
    console.log(data);
    return data
  }

  function changeTimeDomain(timeDomainString,tasks) {

    gantt.tickFormat(format);
    gantt.redraw();
  }

  function getEndDate(tasks) {
      var lastEndDate = Date.now();
      if (tasks.length > 0) {
        lastEndDate = tasks[tasks.length - 1].endDate;
      }
      return lastEndDate;
  }
  function getStartDate(tasks) {
      var lastEndDate = Date.now();
      if (tasks.length > 0) {
        lastEndDate = tasks[0].startDate;
      }
      return lastEndDate;
  }

  function show({
    items = undefined,
    links = undefined,
    onConnect = (data) => {console.log(data);},
    onLinkClickedAction = (data) => {console.log(data);},
    onChangeLengthAction = (data) => {console.log(data);}
  }={}) {
    console.log(onLinkClickedAction);
    update(query.currentProject().plannings.items[0].items,query.currentProject().plannings.items[0].links, onConnect,onLinkClickedAction,onChangeLengthAction)
  }
  function updateCurrentData(items, links) {
    var taskNames = []
    var tasks = []
    var tasksRelations = []
    tasks = buildTasksListB(items,links,tasksRelations)
    var taskNames = tasks.map(e =>e.uuid)
    tasks.sort(function(a, b) {
        return a.endDate - b.endDate;
    });
    var maxDate = tasks[tasks.length - 1].endDate;
    tasks.sort(function(a, b) {
        return a.startDate - b.startDate;
    });
    var minDate = tasks[0].startDate;
    console.log(tasks);
    gantt.updateData(tasks,tasksRelations)
    console.log(getEndDate(tasks) );
    changeTimeDomain(timeDomainString,tasks);
    gantt.redraw();

    //update(store.plannings.items[0].items,store.plannings.items[0].links)
  }

  init()

  self.setActive = setActive
  self.setInactive = setInactive
  self.show = show
  self.updateCurrentData = updateCurrentData
  self.update = update
  self.init = init

  return self
}

// var ganttView = createGanttView({targetSelector:".center-container" });
// ganttView.init();
