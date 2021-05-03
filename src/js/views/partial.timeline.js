var createTimelinePartial = function ({
  onSave= undefined,
  onClose= undefined,
  container=undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;
  var catId = undefined
  var startField = undefined
  var endField = undefined
  var timeline = undefined

  var containerBottom = undefined

  var ganttObject = undefined
  var ganttDataSet = undefined
  var capacityDataset = undefined
  var ganttGroups = undefined
  var capacityGroups = undefined
  var currentPlanning = undefined
  var currentList = undefined
  var ganttMode = "events"
  var showCapacity = true;

  let currentSetUuid = undefined
  let currentSetGenerateBuffer = []
  let currentSetGenerateInterfaceBuffer = []
  let currentSetList = undefined

  let theme = {
    menu : function (name) {
      return `
      <div class="ui mini secondary menu">
        <div class="item">
          <h2>V&V plan, ${name?name:""}</h2>
        </div>
        <div class="item">

        </div>
        <div class="right menu">
          <div class="item">
            <div class="ui clearable multiple dropdown target_timeline_elements_list">
              <div class="text">Filter Capacity</div>
              <i class="filter icon"></i>
              <i class="dropdown icon"></i>
            </div>
          </div>
          <div class="item">
              <div class="ui red button action_vv_set_close">close</div>
          </div>
        </div>
        </div>
      `
    }
  }



  var init = function () {
    connections()
  }
  var connections =function () {
    // document.addEventListener("storeUpdated", async function () {
    //   console.log(objectIsActive,currentSetList);
    //   if (objectIsActive && currentSetList) {
    //
    //   }
    // })
    // connect(".action_vv_set_close","click",(e)=>{
    //   $('.target_timeline_elements_list').dropdown('destroy')
    //   objectIsActive = false;
    //   currentPlanning = undefined;
    //   capacityDataset = undefined;
    //   container.innerHTML=""
    //   ganttObject.destroy()
    //   ganttObject = undefined
    //   sourceOccElement.remove()
    // })
  }

  var prepareData = function (store) {
    let data = []
    let catData = ephHelpers.createCatData(store)
    let cat = catData.dic[catId]
    let ef = cat._assignedExtraFields
    let efTime = cat._assignedExtraFields.filter(ef=>ef.uuid ==startField)
    let efTimeEnd = cat._assignedExtraFields.filter(ef=>ef.uuid ==endField)
    // let efTime = cat._assignedExtraFields.filter(ef=>ef.type =="time")
    if (efTime[0]) {

      let typeToDisplay = catId
      let relatedNodes = store.metaLinks.filter(m=>m.target==typeToDisplay)
      let relatedNodesId = relatedNodes.map(rn=>rn.source)
      console.log(relatedNodesId);
      // let nodeMap = {}
      // let nodes=[]
      for (var i = 0; i < store.currentPbs.length; i++) {
        // nodeMap[store.currentPbs[i].uuid] = store.currentPbs[i]
        if (relatedNodesId.includes(store.currentPbs[i].uuid)) {
          // nodes.push(store.currentPbs[i])
          let elem = store.currentPbs[i]
          let endDate = undefined
          if (efTimeEnd[0]) {
            endDate = elem[ efTimeEnd[0].uuid ]
          }
          let visElement = {id: genuuid(), content: store.currentPbs[i].name, start: elem[ efTime[0].uuid ]|| Date.now(),end: endDate}
          data.push(visElement)
        }
      }
    }
    return data
  }

   var render = async function () {
    var store = await query.currentProject()
    let data = prepareData(store)
    let domElement = document.querySelector(container)
    // Create a DataSet (allows two way data-binding)
    // let dataTemp =[
    //   {id: 1, content: 'item 1', start: '2014-04-20'},
    //   {id: 2, content: 'item 2', start: '2014-04-14'},
    //   {id: 3, content: 'item 3', start: '2014-04-18'},
    //   {id: 4, content: 'item 4', start: '2014-04-16', end: '2014-04-19'},
    //   {id: 5, content: 'item 5', start: '2014-04-25'},
    //   {id: 6, content: 'item 6', start: '2014-04-27', type: 'point'}
    // ]

    var items = new vis.DataSet(data);

    // Configuration for the Timeline
    var options = {};

    // Create a Timeline
    timeline = new vis.Timeline(domElement, items, options);
    // timeline.setItems(dataTemp)

  }




  //UTILS

  var setupDropdown = function () {
    if (ganttMode != "capacity") {
      sourceOccElement.querySelector('.target_timeline_elements_list').remove()//not used
      return undefined
    }
    $('.target_timeline_elements_list')
      .dropdown({
        onChange:function (value, text, choice) {
          function filterGroup(group, value) {
            let elementsToShow = value.split(',')
            if (true) {
              console.log(elementsToShow);
              console.log(group);
              let newCapacityGroups = group.map(c=>{
                if(value == ""){
                  c.visible = true;
                  return c
                }else if (elementsToShow.includes(c.id)) {
                  c.visible = true;
                  return c
                }else {
                  c.visible = false;
                  return c
                }
              })
              group.clear()
              group.add(newCapacityGroups)
            }
          }
          filterGroup(capacityGroups, value)
          filterGroup(ganttGroups, value)

        },
        values:capacityGroups.map(c=>{return {name:c.content, value:c.id};})
      })
    ;
  }

  var loadCapacityChart = function (days, simplifiedGroups) {
    // create a dataSet with groups
   var names = ['SquareShaded', 'Bargraph', 'Blank', 'CircleShaded'];
   capacityGroups = new vis.DataSet();
   for (var i = 0; i < simplifiedGroups.length; i++) {
     simplifiedGroups[i]
     capacityGroups.add({
        id: simplifiedGroups[i].id,
        content: simplifiedGroups[i].content,
        visible:true,
        options: {
            drawPoints: {
                style: 'square' // square, circle
            },
            shaded: {
                orientation: 'bottom' // top, bottom
            }
        }});
   }

   // groups.update({id:simplifiedGroups[0].id, visible:true})

 //     groups.add({
 //     id: 0,
 //     content: names[0],
 //     options: {
 //         drawPoints: {
 //             style: 'square' // square, circle
 //         },
 //         shaded: {
 //             orientation: 'bottom' // top, bottom
 //         }
 //     }});
 //
 // groups.add({
 //     id: 1,
 //     content: names[1],
 //     options: {
 //         style:'bar'
 //     }});
 //
 // groups.add({
 //     id: 2,
 //     content: names[2],
 //     options: {drawPoints: false}
 // });
 //
 // groups.add({
 //     id: 3,
 //     content: names[3],
 //     options: {
 //         drawPoints: {
 //             style: 'circle' // square, circle
 //         },
 //         shaded: {
 //             orientation: 'top' // top, bottom
 //         }
 //     }});

     // container = document.getElementById('visualization');
    // var items = [
    //  {x: '2014-06-29', y: 25, group: 3},
    //  {x: '2014-06-30', y: 30, group: 3}
    // ];

    capacityDataset = new vis.DataSet(days);
    var options = {
       defaultGroup: 'ungrouped',
       legend: true,
       height:"100%",
       start: moment(Date.now()).subtract(30, 'days').format('YYYY-MM-DD'),
       end: moment(Date.now()).add(30, 'days').format('YYYY-MM-DD')
    };
    var graph2d = new vis.Graph2d(containerBottom, capacityDataset, capacityGroups, options);
  }




  var prepareGanttData = async function () {
    var store = await query.currentProject()
    var newPlanningData =  await preparePlanningData(currentPlanning)
    let items = []
    let groups = []
    if (ganttMode == "events") {
      //create the data to display each element on his own lane
      for (var i = 0; i < newPlanningData.length; i++) {
        let item = newPlanningData[i]
        console.log(item.start);
        console.log(item.duration);
        console.log(moment(item.start || Date.now(), "DD-MM-YYYY").add(parseInt(item.duration), 'days'));
        console.log();
        items.push({
          start: item.start|| Date.now(),
          duration: parseInt(item.duration),
          end: moment(item.start || Date.now(), "DD-MM-YYYY").add(parseInt(item.duration), 'days'),
          content: item.name,
          group:item.uuid,
          id: item.uuid,
          dependsOn: []
        })
        groups.push({id:item.uuid, content:item.name})
      }

    }
    if (ganttMode == "capacity") {

      let relevantMetalinks = store.metaLinks.filter(i=> i.type== "eventContainsStakeholders")
      //create the data to display each element on his own lane
      for (var i = 0; i < newPlanningData.length; i++) {
        let item = newPlanningData[i]
        let relatedEvent = store.events.find(e=>e.uuid == item.relatedEvent)
        let relevantStakeholders = relevantMetalinks.filter(m=> m.source == relatedEvent.uuid)
        let relevantStakeholder =undefined
        if (!relevantStakeholders[0]) {//in case the iutem is not connected add it to a default group
          relevantStakeholder = {uuid:"unallocated", name:"unallocated", lastName:""}
        }else {
          relevantStakeholder =store.stakeholders.find(i=> i.uuid== relevantStakeholders[0].target )
        }

        items.push({
          start: item.start|| Date.now(),
          duration: parseInt(item.duration),
          end: moment(item.start || Date.now(), "DD-MM-YYYY").add(parseInt(item.duration), 'days'),
          content: item.name,
          group:relevantStakeholder.uuid,
          capacityToll:relatedEvent.capacityToll,
          id: item.uuid,
          dependsOn: []
        })
        if (relevantStakeholder.uuid != "unallocated" && !groups.find(g=>g.id == relevantStakeholder.uuid )) {//if unallocated add the group only at the end
          groups.push({id:relevantStakeholder.uuid, content:relevantStakeholder.name+" "+relevantStakeholder.lastName})
        }

      }
      groups.push({id:"unallocated", content:"unallocated"})
    }


    if (!items[0]) {
      ganttData = undefined
    }
    console.log("data prepared");
    return {items, groups}
  }

  var preparePlanningData = async function (planningUuid) {
    var store = await query.currentProject()
    let relevantTimeLinks = store.timeLinks.filter(l=>l.type == "planning" && l.source == planningUuid)
    let relevantTimeTracksUuid = relevantTimeLinks.map(r => r.target)
    console.log(relevantTimeTracksUuid);
    let relevantTimeTracks = store.timeTracks.filter(l => relevantTimeTracksUuid.includes(l.uuid))
    console.log(relevantTimeTracks);
    if (!relevantTimeTracks || !relevantTimeTracks[0]) {
      return []
    }
    let planningData = relevantTimeTracks.map(function (t) {
      let relatedEvent = store.events.find(e=>e.uuid == t.relatedEvent)
      return {
        uuid:t.uuid,
        relatedEvent:relatedEvent.uuid,
        name:relatedEvent.name,
        desc:relatedEvent.desc,
        start:t.start,
        duration:t.duration
      }
    })
    return planningData
  }

  async function loadGantt() {
    if (ganttObject) {
      container.innerHTML=""
      ganttObject.destroy()
      ganttObject = undefined
    }else {
      let ganttData = await prepareGanttData()

      //prepare capacity graph

      if (ganttMode == "capacity" && showCapacity) {
        let days = await prepareCapacityData(ganttData)
        let capacityGroups = ganttData.groups.map(g=>{
          return Object.assign({},g,{visible:false})
        })
        // let capacityGroupsVisibility = {}
        // for (var i = 0; i < ganttData.groups.length; i++) {
        //   capacityGroupsVisibility[ganttData.groups[i].id] = false;
        // }
        // graph2d1.setOptions(
        //   {groups:
        //     {visibility:{0:true, 1:false, 2:false, 3:false, "__ungrouped__":false}
        //   }
        // })

        loadCapacityChart(days, capacityGroups)
      }



      var container = document.querySelector('.timeLineArea');
      // Create a DataSet (allows two way data-binding)
      // ganttGroups = new vis.DataSet([
      //   {id: 1, content: 'Truck&nbsp;1'},
      //   {id: 2, content: 'Truck&nbsp;2'},
      //   {id: 3, content: 'Truck&nbsp;3'},
      //   {id: "t5454", content: 'Truck&nbsp;4'}
      // ]);
      if (ganttGroups || ganttDataSet) {
        ganttGroups.clear()
        ganttDataSet.clear()
      }
      console.log('injecting data');
      ganttGroups = new vis.DataSet(ganttData.groups);
      ganttDataSet = new vis.DataSet(ganttData.items);
      // var items = new vis.DataSet([
      //  {id: 4, group:3, content: 'item 4', start: '2014-04-16', end: '2014-04-19'},
      //  {id: 5, group:"t5454", content: 'item 5', start: '2014-04-25'},
      //  {id: 6, group:"t5454", content: 'item 6', start: '2014-04-27', type: 'point'}
      // ]);

      var options = {
        editable: true,
        orientation: 'top',
        height:"100%"
      };

      ganttObject = new vis.Timeline(container, null, options);
      ganttObject.setGroups(ganttGroups);
      ganttObject.setItems(ganttDataSet);

      ganttObject.on('contextmenu', function (props) {

        props.event.preventDefault();
        let content =event.target.innerText
        let element = ganttDataSet.get().find(s=>s.content== content)

        showSingleEventService.showById(element.id, async function (e) {
              // var newPlanningData = await preparePlanningData(currentPlanning.uuid)
              // ev.select.updateData(newPlanningData)
              // ev.select.refreshList()
              // if (ganttObject) {  ganttObject.update(await prepareGanttData()); changeListSize()}//TODO why needed?
              //
            })
      });

      ganttDataSet.on('*', async function (event, properties) {
        console.log(event, properties);
        if (event == "update") {
          console.log(properties);
          if (properties.data[0].start != properties.oldData[0].start) {
            let newStartDate = properties.data[0].start
            let id = properties.data[0].id
            push(act.edit("timeTracks",{uuid:id, prop:'start', value:newStartDate}))
          }

          var startD = moment(properties.data[0].start);
          var endD = moment(properties.data[0].end);
          let newDuration = endD.diff(startD, 'days')+1
          var oldstartD = moment(properties.oldData[0].start);
          var oldendD = moment(properties.oldData[0].end);
          let oldDuration = oldendD.diff(oldstartD, 'days')+1
          console.log(oldDuration,newDuration);

          if (oldDuration != newDuration) {
            let id = properties.data[0].id
            push(act.edit("timeTracks",{uuid:id, prop:'duration', value:newDuration}))
          }

        }

        if (capacityDataset) {//updata capacity graphs
          let days = await prepareCapacityData()
          capacityDataset.clear()
          capacityDataset.add(days)
        }

      });
      //   onElementClicked : async function (e) {
      //     showSingleEventService.showById(e.id, async function (e) {
      //       var newPlanningData = await preparePlanningData(currentPlanning.uuid)
      //       ev.select.updateData(newPlanningData)
      //       ev.select.refreshList()
      //       if (ganttObject) {  ganttObject.update(await prepareGanttData()); changeListSize()}//TODO why needed?
      //
      //     })
      if (ganttMode == "capacity" && showCapacity) {
          setupDropdown()
      }else {
          sourceOccElement.querySelector('.target_timeline_elements_list').remove()
      }
    }
  }

  var prepareCapacityData = async function (inputGanttData) {
    let ganttData = undefined
    if (inputGanttData) {
      ganttData = inputGanttData
    }else {
      ganttData = await prepareGanttData()
    }

    //prepare capacity graph

    if (ganttMode == "capacity" && showCapacity) {
      let days = []

      var a = moment('2020-04-27');
      var b = moment('2020-08-01');

      // If you want an exclusive end date (half-open interval)
      let interestDate =[]
      for (var i = 0; i < ganttData.items.length; i++) {
        let item= ganttData.items[i]
        console.log(item);
        if (item.start._isAMomentObject) {
          if (item.start._isValid) {
            // interestDate.push(item.start)
            interestDate.push(item.start.clone().add(1, 'days'))
            interestDate.push(item.start.clone().subtract(1, 'days'))
          }
        }else {
          // interestDate.push(moment(item.start))
          interestDate.push(moment(item.start).add(1, 'days'))
          interestDate.push(moment(item.start).subtract(1, 'days'))
        }
        if (item.end._isAMomentObject) {
          if (item.end._isValid) {
            // interestDate.push(item.end)
            interestDate.push(item.end.clone().add(1, 'days'))
            interestDate.push(item.end.clone().subtract(1, 'days'))
          }else {
            alert()
          }
        }else {
          // interestDate.push(moment(item.end))
          interestDate.push(moment(item.end).add(1, 'days'))
          interestDate.push(moment(item.end).subtract(1, 'days'))
        }

      }
      console.log(interestDate);
      for (var l = 0; l < interestDate.length; l++) {
      // for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {

        // console.log(interestDate[l]);
        let m =moment(interestDate[l])
        // console.log(m);
        let valueAtPoint = ganttData.groups.map(g=>{ return {id:g.id, value:0};})
        for (var i = 0; i < ganttData.items.length; i++) {

          let gItem = ganttData.items[i]
          var startM = moment(gItem.start)
          var endM = moment(gItem.end)
          if ((startM.isBefore(m)||startM.isSame(m) )&& ( m.isBefore(endM) || endM.isSame(m)) ) {
            let weightedValue = gItem.capacityToll || 1
            valueAtPoint.find(v=>v.id==gItem.group).value += parseInt(weightedValue)

          }


        }
        for (var j = 0; j < valueAtPoint.length; j++) {
          // console.log(valueAtPoint);
          let currentValueElement = valueAtPoint[j]
          days.push({x: m.format('YYYY-MM-DD'), y: currentValueElement.value, group: currentValueElement.id})
        }

      }
      return days
    }
  }




  var setPlanningMode = async  function (mode) {
    ganttMode = mode
  }
  var eventsTimeline = async  function (uuid) {
    currentPlanning = uuid
    await loadGantt()
    // loadCapacityChart()
  }
  var updateModule = function (store) {
    let data = prepareData(store)
    timeline.setItems(data)
  }
  var update = function () {
      render()
  }
  // var update = function (uuid) {
  //   if (uuid) {
  //     currentSetUuid = uuid
  //     render(uuid)
  //   }else if(currentSetUuid) {
  //     render(currentSetUuid)
  //   }else {
  //     render()
  //     console.log("no set found");
  //     return
  //   }
  //
  // }

  var setActive =function (data) {
    if (data) {
      catId = data.catId
      startField = data.startField
      endField = data.endField
    }
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.updateModule = updateModule
  self.setPlanningMode = setPlanningMode
  self.eventsTimeline = eventsTimeline
  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

// var timelinePartial = createTimelinePartial()
// timelinePartial.init()
// createInputPopup({originalData:jsonFile})
