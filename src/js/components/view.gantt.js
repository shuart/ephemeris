var createGanttView = function ({
  targetSelector = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var currentWidth =1800

  var gantt
  var tasks = []

  var lastHoverBandGroup = undefined
  var lastHoverClass = undefined
  var lastHoverElement = undefined
  var draggedElement = false
  var dragMode = false

  var init = function () {
    connections()
    update()

  }
  var connections =function () {

  }

  var render = function (data, links) {
    var data = [{
      startDate: '2017-02-27',
      endDate: '2017-03-04',
      label: 'milestone 01',
      id: 'm01',
      dependsOn: []
    }, {
      startDate: '2017-02-23',
      endDate: '2017-03-01',
      label: 'milestone 06',
      id: 'm06',
      dependsOn: ['m01']
    }, {
      duration: [7, 'days'],
      endDate: '2017-03-24',
      label: 'milestone 02',
      id: 'm02',
      dependsOn: ['m04']
    }, {
      startDate: '2017-02-27',
      duration: [12, 'days'],
      label: 'milestone 03',
      id: 'm03',
      dependsOn: ['m01']
    }, {
      endDate: '2017-03-17',
      duration: [5, 'days'],
      label: 'milestone 04',
      id: 'm04',
      dependsOn: ['m01']
    }];

    createGanttChart(document.querySelector(targetSelector), data, {
      elementHeight: 20,
      sortMode: 'date', // alternatively, 'childrenCount'
      svgOptions: {
        width: 1200,
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
    const svg = d3.select(placeholder).append('svg').attr('width', svgWidth).attr('height', svgHeight);

    const xScale = d3.scaleTime()
      .domain([minStartDate.toDate(), maxEndDate.toDate()])
      .range([0, scaleWidth])

    const make_x_gridlines = function() {
      return d3.axisBottom(xScale)
          .ticks(d3.timeDay.every(1))
    }

    // prepare data for every data element
    const rectangleData = createElementData(data, elementHeight, xScale, fontSize);

    // create data describing connections' lines
    const polylineData = createPolylineData(rectangleData, elementHeight);

    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeDay.every(1))
      // .tickSize(200, 0, 0)
      .tickFormat(d3.timeFormat('%d %b'));

    // create container for the data
    const g1 = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const linesContainer = g1.append('g').attr('transform', `translate(0,${margin.top})`);
    const barsContainer = g1.append('g').attr('transform', `translate(0,${margin.top})`);

    g1.append('g').call(xAxis);
    g1.append("g")
      .attr("class", "grid")
      .attr("style", "opacity:0.1")
      .attr("transform", "translate(0," + 500 + ")")
      .call(make_x_gridlines()
          .tickSize(-500)
          .tickFormat("")
      )

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
    bars
    .on('mousedown', function(d) {
        console.log("dragMode ChartBand");
        dragmode = true;
        console.log(dragmode);
        draggedElement = d3.select(this);
    })

    bars
      .append('rect')
      .attr("class","chartBand")
      .attr('rx', elementHeight / 2)
      .attr('ry', elementHeight / 2)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .style('fill', '#ddd')
      .style('stroke', '#ddd')
      .on("mouseover",function (d,i) {
        lastHoverClass = d3.select(this).attr("class");
        lastHoverBandGroup = this
        lastHoverElement = d3.select(this);
        console.log(lastHoverBandGroup);
      })//TODO shoudl add group first
      // .on('mousedown', function(d) {
      //     console.log("dragMode ChartBand");
      //     dragmode = true;
      //     console.log(dragmode);
      //     draggedElement = d3.select(this);
      // })

    bars
      .append('text')
      .style('fill', 'black')
      .style('font-family', 'sans-serif')
      .attr('x', d => d.labelX)
      .attr('y', d => d.labelY)
      .text(d => d.label);

    bars //handles
      .append('rect')
      .attr("class","leftHandle")
      .attr('rx', elementHeight / 2)
      .attr('ry', elementHeight / 2)
      .attr('x', d => d.x)
      .attr('y', d => d.y + elementHeight / 4)
      .attr('width', elementHeight / 2)
      .attr('height', elementHeight / 2)
      .style('fill', '#ffffff')
      .style('stroke', '#ddd')
      .on("mouseover",function (d,i) {
        lastHoverClass = d3.select(this).attr("class");
        console.log(lastHoverClass);
      })//TODO shoudl add group first
    bars //handles
      .append('rect')
      .attr("class","rightHandle")
      .attr('rx', elementHeight / 2)
      .attr('ry', elementHeight / 2)
      .attr('x', d => d.x + d.width - elementHeight / 2)
      .attr('y', d => d.y + elementHeight / 4)
      .attr('width', elementHeight / 2)
      .attr('height', elementHeight / 2)
      .style('fill', '#ffffff')
      .style('stroke', '#ddd')
      .on("mouseover",function (d,i) {
        lastHoverClass = d3.select(this).attr("class");
        lastHoverElement = d3.select(this);
        console.log(lastHoverClass);
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
        })
        .on('mousemove', function(){
          console.log("dragging");
          console.log(dragMode);
          console.log(draggedElement);
          if (draggedElement) {
            xy0 = d3.mouse(this);
            console.log(xScale.invert(d3.mouse(this)[0]));
            var currentDate = xScale.invert(d3.mouse(this)[0])
            console.log(currentDate);

            draggedElement.attr("transform", function(d) {
              return "translate(" + (xScale(currentDate)-d.x) + "," + 0+ ")"
              })
            // draggedElement
            // .attr('x', xScale(currentDate))
            // .attr('y', d => d.y)
            //
          }
        })
  };

  const createGanttChart = (placeholder, data, { elementHeight, sortMode, showRelations, svgOptions }) => {
    // prepare data
    const margin = (svgOptions && svgOptions.margin) || {
      top: elementHeight * 2,
      left: elementHeight * 2
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
    minStartDate.subtract(2, 'days');
    maxEndDate.add(2, 'days');

    createChartSVG(data, placeholder, { svgWidth, svgHeight, scaleWidth, elementHeight, scaleHeight, fontSize, minStartDate, maxEndDate, margin, showRelations });
  };

  var update = function (data, links) {
    render(data,links)
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
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
