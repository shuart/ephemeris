var createGanttView = function ({
  targetSelector = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var currentWidth =1800

  var gantt
  var tasks = []

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function (data, links, callback, onLinkClickedAction,onChangeLengthAction) {



    tasks = [
    {"startDate":new Date("Sun Dec 09 00:00:45 EST 2012"),"endDate":new Date("Sun Dec 09 02:36:45 EST 2012"),"taskName":"E Job","status":"RUNNING"},
    {"startDate":new Date("Sun Dec 09 08:49:53 EST 2012"),"endDate":new Date("Sun Dec 09 06:34:04 EST 2012"),"taskName":"D Job","status":"RUNNING"},
    {"startDate":new Date("Sun Dec 09 03:27:35 EST 2012"),"endDate":new Date("Sun Dec 09 03:58:43 EST 2012"),"taskName":"P Job","status":"SUCCEEDED"},
    {"startDate":new Date("Sun Dec 09 03:27:35 EST 2012"),"endDate":new Date("Sun Dec 09 03:58:43 EST 2012"),"taskName":"N Job","status":"KILLED"}
    ];

    taskNames = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];

    if (false) {
      console.log(data);
      // tasks = data.map((x) => {
      //   return {startDate}
      // })
      taskNames = []
      tasks = []
      tasksRelations = []
      var currentStartDate =moment().toDate();
      var currentEndDate =moment().toDate();
      for (task of data) {
        var StartDate
        currentStartDate = moment(currentEndDate).add(0, 'days').toDate();
        currentEndDate = moment(currentStartDate).add(task.duration, 'days').toDate();
        // currentStartDate.setDate(currentEndDate.getDate() + 0);
        // currentEndDate.setDate(currentStartDate.getDate() + task.duration);
        var startDate = new Date(currentStartDate.getTime())
        var endDate = new Date(currentEndDate.getTime())
        console.log(currentStartDate, currentEndDate);
        tasks.push({
          "startDate":startDate,
          "endDate":endDate,
          "taskName":task.name,
          "status":"RUNNING"
        });
        taskNames.push(task.name);
      }

    }
    if (true) {
      taskNames = []
      tasks = []
      tasksRelations = []
      //buildTasksList(taskss, taskNames, moment().toDate(), data, links) //TODO remove this method
      tasks = buildTasksListB(data,links,tasksRelations)
      taskNames = tasks.map(e =>e.uuid)
      console.log(tasksRelations);
      console.log(tasks);

    }


      var taskStatus = {
          "SUCCEEDED" : "bar",
          "FAILED" : "bar-failed",
          "RUNNING" : "bar-running",
          "KILLED" : "bar-killed"
      };



      tasks.sort(function(a, b) {
          return a.endDate - b.endDate;
      });
      var maxDate = tasks[tasks.length - 1].endDate;
      tasks.sort(function(a, b) {
          return a.startDate - b.startDate;
      });
      var minDate = tasks[0].startDate;

      var format = "%H:%M";
      var timeDomainString = "all";
      // var timeDomainString = "1day";
      var existingChart = container.querySelector(".ganttChartArea")
      if (existingChart) {
        existingChart.remove()
        container.querySelector(".ganttChartMenuArea").remove()
      }
      var chartArea = document.createElement("div")
      var menuArea = document.createElement("div")
      var menuArea = document.createElement("div")

      menuArea.classList="ganttChartMenuArea";
      chartArea.classList="ganttChartArea";
      chartArea.style.width="100%"
      chartArea.style.overflow="auto"

      var buttonPlus = document.createElement("button")
      buttonPlus.innerHTML="Plus"
      buttonPlus.addEventListener("click",function () {
        currentWidth = currentWidth + 200
        gantt.width(currentWidth)
        gantt.redraw()
        container.querySelector(".chart").style.width = currentWidth+200;
      }, false)
      var buttonMinus = document.createElement("button")
      buttonMinus.innerHTML="Moins"
      buttonMinus.addEventListener("click",function () {
        currentWidth = currentWidth - 200
        gantt.width(currentWidth)
        gantt.redraw()
        container.querySelector(".chart").style.width = currentWidth+200;
      }, false)

      menuArea.appendChild(buttonMinus)
      menuArea.appendChild(buttonPlus)
      container.appendChild(chartArea)
      container.appendChild(menuArea)

      //var gantt = d3.gantt(targetSelector).height(450).width(800).taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);
      gantt = d3.gantt(".ganttChartArea").height(450).width(currentWidth).taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);
      gantt.onConnect(function (data) {
        callback(data)
      })
      gantt.onLinkClicked(function (data) {
        onLinkClickedAction(data)
      })
      gantt.onChangeLength(function (data) {
        onChangeLengthAction(data)
      })


      gantt.timeDomainMode("fixed");
      gantt(tasks,tasksRelations);
      changeTimeDomain(timeDomainString,tasks);
      console.log("plouf",tasks);

      updateCurrentData(data, links) //TODO should not be necessary but without the duration is not right the first time. Why?
      // gantt.updateData(tasks,tasksRelations)
      // gantt.redraw();
      //gantt(tasks,tasksRelations);


    function addTask() {

        var lastEndDate = getEndDate();
        var taskStatusKeys = Object.keys(taskStatus);
        var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
        var taskName = taskNames[Math.floor(Math.random() * taskNames.length)];

        tasks.push({
    	"startDate" : d3.timeHour.offset(lastEndDate, Math.ceil(1 * Math.random())),
    	"endDate" : d3.timeHour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 1),
    	"taskName" : taskName,
    	"status" : taskStatusName
        });

        changeTimeDomain(timeDomainString,tasks);
        gantt.redraw(tasks);
    };

  }

  var update = function (data, links, callback,callBack2,onChangeLengthAction) {
    render(data,links, callback, callBack2, onChangeLengthAction)
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
    this.timeDomainString = timeDomainString;
    switch (timeDomainString) {
    case "1hr":
      format = "%H:%M:%S";
      gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -1), getEndDate() ]);
      break;
    case "3hr":
      format = "%H:%M";
      gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -3), getEndDate() ]);
      break;

    case "6hr":
      format = "%H:%M";
      gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -6), getEndDate() ]);
      break;

    case "1day":
      format = "%H:%M";
      gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -1), getEndDate() ]);
      break;

    case "1week":
      format = "%a %H:%M";
      gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -7), getEndDate() ]);
      break;
    case "all":
      format = "%a %H:%M";
      gantt.timeDomain([ d3.timeDay.offset(getStartDate(tasks), -1), d3.timeDay.offset(getEndDate(tasks), +10) ]);
      break;
    default:
  format = "%H:%M"

    }
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

  self.setActive = setActive
  self.setInactive = setInactive
  self.show = show
  self.updateCurrentData = updateCurrentData
  self.update = update
  self.init = init

  return self
}

var ganttView = createGanttView({targetSelector:".center-container" });
ganttView.init();
