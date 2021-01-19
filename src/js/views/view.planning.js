var createPlanningView = function () {
  var self ={};
  var objectIsActive = false;
  var ganttObject = undefined
  var ganttDataSet = undefined
  var ganttGroups = undefined
  var currentPlanning = undefined
  var currentList = undefined
  var ganttMode = "events"

  let theme = {}
  theme.noPlanning = function () {
    return `
    <div class="ui placeholder segment">
      <div class="ui icon header">
        <i class="sticky calendar outline icon"></i>
        Select a planning to display
      </div>
    </div>`
  }
  theme.planningVisible = function () {
    return `
      <div style="height:0%;" class="planning-gantt-area"></div>
      <div style="height:100%;" class="planning-list-area"></div>`
  }
  theme.planningPreviewItem = function (i) {
     html =`
     <div data-id="${i.uuid}" class="searchable_planning list-item action_planning_manager_load_planning">
       <div class="relaxed" data-id="${i.uuid}" >
        <strong data-id="${i.uuid}" >${i.name || "Untitled"}</strong>
       </div>
       <i class="fas fa-calendar-alt"></i>
     </div>`

    return html
  }
  theme.planningPreviewItemAlt = function (i) {
     html =`
     <div data-id="${i.uuid}" class="searchable_planning list-item action_planning_manager_load_planning">
       <div class="relaxed" data-id="${i.uuid}" >
        <strong data-id="${i.uuid}" >${i.name || "Untitled"}</strong>
        <div data-id="${i.uuid}" >${i.content.substring(0,135)+".. "}</div>
       </div>
       <i class="fas fa-calendar-alt"></i>
     </div>`

    return html
  }
  theme.planningPreviewTitle= function (html) {
     html =`
        Plannings
        <span class="action_planning_manager_add_planning small button"> Add</span>
    `
    return html
  }
  theme.planningSearchArea= function () {
     html =`
        <input class="planning_search_input search_input" type="text" placeholder="Search..">
        <span class=""> <i class="fas fa-search"></i></span>
    `
    return html
  }

  var init = function () {
    //  ganttView= createGanttView({
    //   targetSelector:".center-container",
    //   onConnect:(data)=>{
    //     push(addPlanningLink({source:data.origin, target:data.target}))
    //   }
    // });
    // ganttView.init();

    connections()
    //update()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentList) {
        var store = await query.currentProject()
        let updatedData = await preparePlanningData(currentPlanning.uuid)
        ephHelpers.updateListElements(currentList,{
          items:updatedData,
          metaLinks:store.metaLinks,
          displayRules:prepareListDisplay(store),
        })
      }
    })
    connect(".action_planning_manager_load_planning", "click", (e)=>{
      console.log(e.target.dataset.id);
      let planningId = e.target.dataset.id
      document.querySelector(".center-container").innerHTML=theme.planningVisible()
      ganttObject = undefined
      setCurrentPlanning(planningId)
    })
    connect(".action_planning_manager_add_planning", "click", async (e)=>{
      var popup= await createPromptPopup({
        title:"Add a new Planning",
        iconHeader:"calendar outline",
        fields:{ type:"input",id:"planningName" ,label:"Planning name", placeholder:"Set a name for the new Planning" }
      })
      let newName = popup.result
      if (newName) {
        push(act.add("plannings",{name:newName}))
        update()
      }
    })
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
        duration:t.duration,
        capacityToll:relatedEvent.capacityToll
      }
    })
    return planningData
  }

  var render = async function () {

      var store = await query.currentProject()
      document.querySelector(".center-container").innerHTML=theme.noPlanning()
      let treeContainer = document.querySelector(".left-menu-area")
      let planningTitleArea = document.querySelector(".left-menu-area .title")
      let planningPreviewArea = treeContainer.querySelector('.left-list')
      let searchArea = treeContainer.querySelector('.side_searchArea')
      if (planningPreviewArea && searchArea) { //reuse what is already setup
        planningTitleArea.innerHTML = theme.planningPreviewTitle()
        searchArea.innerHTML=theme.planningSearchArea()
        updatePlanningTree(planningPreviewArea, store)
      //update search event
      setUpSearch(document.querySelector(".planning_search_input"), store.plannings)
    }else {
      alert("element missing")
    }

  }

  var updatePlanningTree = async function(container, store) {
    let html = ""
    store.plannings.slice()
    .sort(function(a, b) {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {return -1;}
        if (nameA > nameB) {return 1;}
        return 0;
      })
    .forEach(function (e) {//todo add proper routes
      html += theme.planningPreviewItem(e)
    })
    container.innerHTML = html
  }

  var setCurrentPlanning = async function (uuid) {
    let store = await query.currentProject()
    currentPlanning = store.plannings.find(p=>p.uuid == uuid)//TODO remove
    if (currentPlanning) {
      renderPlanning()
    }
  }

  var prepareListDisplay = function (store) {
    return [
      {prop:"name", displayAs:"name", edit:"true"},
      {prop:"desc", displayAs:"Description", edit:"true"},
      {prop:"start", displayAs:"Start", edit:"true", time:true},
      {prop:"duration", displayAs:"Duration", edit:"true"},
      {prop:"eventContainsPbs", displayAs:"Products contained", deferredIdProp:"relatedEvent", meta:()=>store.metaLinks, choices:()=>store.currentPbs, edit:true},
      {prop:"eventContainsStakeholders", displayAs:"Stakeholders", deferredIdProp:"relatedEvent", meta:()=>store.metaLinks, choices:()=>store.stakeholders, edit:true},
      {prop:"capacityToll", displayAs:"Capacity toll", edit:true},
    ]
  }
  var renderPlanning = async function () {
      var store = await query.currentProject()
      var planningData = await preparePlanningData(currentPlanning.uuid);
      currentList= showListMenu({
        sourceData:planningData,
        // sourceLinks:store.plannings[0].links,
        targetDomContainer:".planning-list-area",
        fullScreen:true,
        displayProp:"name",
        display:prepareListDisplay(store),
        idProp:"uuid",
        onEditItem: async(ev)=>{
          console.log("Edit");
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            if (ev.target.dataset.prop=="duration") {
              push(act.edit("timeTracks",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
              var newPlanningData = await preparePlanningData(currentPlanning.uuid)
              ev.select.updateData(newPlanningData)
            }else {
              let eventsUuid = store.timeTracks.find(t => t.uuid == ev.target.dataset.id).relatedEvent
              console.log(eventsUuid);
              push(act.edit("events",{uuid:eventsUuid, prop:ev.target.dataset.prop, value:newValue}))
              var newPlanningData = await preparePlanningData(currentPlanning.uuid)
              ev.select.updateData(newPlanningData)
            }
          }
          updateGant()
        },
        onEditItemTime: async(ev)=>{
          push(act.edit("timeTracks",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.value}))
          var newPlanningData = await preparePlanningData(currentPlanning.uuid)
          ev.select.updateData(newPlanningData)

          if (ganttObject) {  updateGant(); changeListSize()}//TODO why needed?
        },
        onRemove: async(ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            // push(act.add("events",{uuid:eventUuid, name:newReq}))
            push(act.remove("timeTracks",{uuid:ev.target.dataset.id}))
            // push(act.add("timeLinks",{type:"planning", source:currentPlanning.uuid, target:trackUuid}))
            var newPlanningData = await preparePlanningData(currentPlanning.uuid)
            ev.select.updateData(newPlanningData)

            updateGant()
          }
        },
        onMove: async(ev)=>{
          console.log("move");
          // if (confirm("move item ?")) {
          //   push(act.move("timeTracks", {origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
          //   //update links if needed
          //   push(act.removeLink("timeTracks",{target:ev.originTarget.dataset.id}))
          //   if (ev.targetParentId && ev.targetParentId != "undefined") {
          //     push(act.addLink("timeTracks",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
          //   }
          //   var newPlanningData = await preparePlanningData(currentPlanning.uuid)
          //   ev.select.updateData(newPlanningData)
          //
          //   updateGant()
          // }
          console.log("move");
          if (confirm("move item ?")) {
            // let currentDisplayOrder =  ephHelpers.setDisplayOrder(store,"functions")
            //let newDisplayOrder = moveElementInArray (currentDisplayOrder, ev.originTarget.dataset.id, ev.target.dataset.id)
            push(act.move("timeTracks", {value:ev.newOrder}))
            // var sourceItem = storeGroup.filter((item)=>item.uuid == pl.origin)[0]
            // var targetItem = storeGroup.filter((item)=>item.uuid == pl.target)[0]
            // storeGroup = moveElementInArray(storeGroup,sourceItem,targetItem)
            //console.log(newDisplayOrder);


            //update links if needed
            push(act.removeLink("timeTracks",{target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(act.addLink("timeTracks",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }
            //ev.select.updateData(store.functions)
            //ev.select.updateLinks(store.functions.links)
          }
        },
        // onMove: (ev)=>{
        //   console.log("move");
        //   if (confirm("move item ?")) {
        //     push(movePlanning({origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
        //     //update links if needed
        //     push(removePlanningLink({target:ev.originTarget.dataset.id}))
        //     if (ev.targetParentId && ev.targetParentId != "undefined") {
        //       push(addPlanningLink({source:ev.targetParentId, target:ev.originTarget.dataset.id}))
        //     }
        //     ev.select.updateData(store.plannings[0])
        //     ev.select.updateLinks(store.plannings[0].links)
        //   }
        // },
        onAdd: async(ev)=>{
          var popup= await createPromptPopup({
            title:"Add a new planning Track",
            iconHeader:"calendar",
            fields:{ type:"input",id:"trackName" ,label:"Track name", placeholder:"Set a name for the new Track" }
          })
          var newReq = popup.result
          if (newReq) {
            let eventUuid = uuid()
            let trackUuid = uuid()
            push(act.add("events",{uuid:eventUuid, name:newReq}))
            push(act.add("timeTracks",{uuid:trackUuid,start:new Date(),relatedEvent:eventUuid, duration:5}))
            push(act.add("timeLinks",{type:"planning", source:currentPlanning.uuid, target:trackUuid}))
            var newPlanningData = await preparePlanningData(currentPlanning.uuid)
            ev.select.updateData(newPlanningData)
          }
          console.log(store);

          updateGant()
        },
        onEditChoiceItem: (ev)=>{
          startSelection(ev)
        },
        onLabelClick: (ev)=>{
          showSingleItemService.showById(ev.target.dataset.id)
        },
        onClick: async (ev)=>{
          showSingleEventService.showById(ev.target.dataset.id, async function (e) {
            var newPlanningData = await preparePlanningData(currentPlanning.uuid)
            ev.select.updateData(newPlanningData)
            ev.select.refreshList()
            // if (ganttObject) {  ganttObject.update(await prepareGanttData()); changeListSize()}//TODO why needed?
            if (ganttObject) {  updateGant(); changeListSize()}//TODO why needed?

          })
        },
        extraActions:[
          {
            name:"Remove",
            action:(ev)=>{
              var newReq = confirm("Remove current Planning")
              if (newReq) {
                push(act.remove("plannings",{uuid:currentPlanning.uuid}))
                currentPlanning = undefined
                setTimeout(function () {
                  update()
                }, 100);
              }

            }
          },
          {
            name:"Rename",
            action:(ev)=>{
              var newReq = prompt("New planning name",currentPlanning.name)
              if (newReq) {
                push(act.edit("plannings",{uuid:currentPlanning.uuid, prop:"name", value:newReq}))
                setTimeout(function () {
                  update()
                  document.querySelector(".center-container").innerHTML=""
                  setCurrentPlanning(currentPlanning.uuid)
                }, 100);
              }

            }
          },
          {
            name:"Duplicate",
            action:(ev)=>{
              var newReq = confirm("Duplicate current Planning")
              if (newReq) {
                let newId = uuid()
                push(act.add("plannings",{uuid:newId, name:currentPlanning.name+"_copy"}))

                //duplicate tracks and links
                let relevantTimeLinks = store.timeLinks.filter(l=>l.type == "planning" && l.source == currentPlanning.uuid)
                let relevantTimeTracksUuid = relevantTimeLinks.map(r => r.target)
                let relevantTimeTracks = store.timeTracks.filter(l => relevantTimeTracksUuid.includes(l.uuid))
                relevantTimeTracks.forEach(function (t) {
                  let newTrack = deepCopy(t)
                  let newTrackId = uuid()
                  newTrack.uuid = newTrackId
                  push(act.add("timeTracks",newTrack))
                  push(act.add("timeLinks",{type:"planning", source:newId, target:newTrackId}))
                })

                setTimeout(function () {
                  update()
                  document.querySelector(".center-container").innerHTML=""
                  setCurrentPlanning(newId)
                }, 100);
              }

            }
          },
          {
            name:"Gantt",
            action: async (ev)=>{
              ganttMode = "events"
              timelineView.update()
              timelineView.setPlanningMode("events")
              timelineView.eventsTimeline(currentPlanning.uuid)

              setTimeout(function () {
                updateComponents()
              }, 200);
              // await loadGantt()
              //
              //  if (ganttObject) {//change siz of list if gant is activated
              //     // let data = await prepareGanttData()
              //     // ganttObject.update(data)
              //      changeListSize()
              //      updateComponents()
              //  }
            }
          },
          {
            name:"Capacity",
            action: async (ev)=>{
              ganttMode = "capacity"
              timelineView.update()
              timelineView.setPlanningMode("capacity")
              timelineView.eventsTimeline(currentPlanning.uuid)

              setTimeout(function () {
                updateComponents()
              }, 200);
              // await loadGantt()
              //
              //  if (ganttObject) {//change siz of list if gant is activated
              //     // let data = await prepareGanttData()
              //     // ganttObject.update(data)
              //      changeListSize()
              //      updateComponents()
              //  }
            }
          }
        ]
      })
      updateComponents()
  }

  var updateComponents = function () {
    setTimeout(async function () {
      if (true) { //TODO dirty bugfix
        var store = await query.currentProject()
        let updatedData = await preparePlanningData(currentPlanning.uuid)
        ephHelpers.updateListElements(currentList,{
          items:updatedData,
          metaLinks:store.metaLinks,
          displayRules:prepareListDisplay(store),
        })
      }
    }, 100);
  }

  var changeListSize = function () {
    setTimeout(function () {
      document.querySelector(".center-container").children[1].style.height ="50%"
    }, 700);
  }

  var prepareGanttData = async function () {
    var store = await query.currentProject()
    var newPlanningData =  await preparePlanningData(currentPlanning.uuid)
    let items = []
    let groups = []
    if (ganttMode == "events") {
      //create the data to display each element on his own lane
      for (var i = 0; i < newPlanningData.length; i++) {
        let item = newPlanningData[i]
        items.push({
          start: item.start|| Date.now(),
          duration: item.duration,
          end: moment(item.start || Date.now(), "DD-MM-YYYY").add(item.duration, 'days'),
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
          duration: [item.duration, 'days'],
          end: moment(item.start || Date.now(), "DD-MM-YYYY").add(item.duration, 'days'),
          content: item.name,
          group:relevantStakeholder.uuid,
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

  async function loadGantt() {
    if (ganttObject) {
      document.querySelector(".planning-gantt-area").innerHTML=""
      ganttObject.destroy()
      ganttObject = undefined
    }else {
      let ganttData = await prepareGanttData()
      var container = document.querySelector('.planning-gantt-area');
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
      ganttDataSet = new vis.DataSet(ganttData);
      // var items = new vis.DataSet([
      //  {id: 4, group:3, content: 'item 4', start: '2014-04-16', end: '2014-04-19'},
      //  {id: 5, group:"t5454", content: 'item 5', start: '2014-04-25'},
      //  {id: 6, group:"t5454", content: 'item 6', start: '2014-04-27', type: 'point'}
      // ]);

      var options = {
        editable: true,
        orientation: 'top'
      };

      ganttObject = new vis.Timeline(container, null, options);
      ganttObject.setGroups(ganttGroups);
      ganttObject.setItems(ganttDataSet);

      ganttDataSet.on('*', function (event, properties) {
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
      });
      //   onElementClicked : async function (e) {
      //     showSingleEventService.showById(e.id, async function (e) {
      //       var newPlanningData = await preparePlanningData(currentPlanning.uuid)
      //       ev.select.updateData(newPlanningData)
      //       ev.select.refreshList()
      //       if (ganttObject) {  ganttObject.update(await prepareGanttData()); changeListSize()}//TODO why needed?
      //
      //     })
    }
  }

  async  function startSelection(ev) {
    var store = await query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id; //alredy modified by defferedIdProp rule
    // var sourceTriggerId = store.timeTracks.find(t => t.uuid == ev.target.dataset.id).relatedEvent;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceData = undefined
    var invert = false
    var source = "source"
    var target = "target"
    var sourceLinks= undefined
    var displayRules= undefined
    if (metalinkType == "assignedTo") {
      sourceData=store.stakeholders
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"lastName", displayAs:"Last name", edit:false}
      ]
    }else if (metalinkType == "WpOwn") {
      sourceData=store.currentPbs
      sourceLinks=store.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "WpOwnNeed") {
      sourceData=store.requirements
      sourceLinks=store.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "contains") {
      sourceData=store.currentPbs
      sourceLinks=store.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "originNeed") {
      invert = true;
      sourceData=store.currentPbs
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "tags") {
      sourceData=store.tags
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "eventContainsPbs") {
      sourceData=store.currentPbs
      sourceLinks=store.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "eventContainsStakeholders") {
      sourceData=store.stakeholders
      sourceLinks=store.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"lastName", displayAs:"Last Name", fullText:true, edit:false}
      ]
    }
    showListMenu({
      sourceData:sourceData,
      sourceLinks:sourceLinks,
      parentSelectMenu:ev.select ,
      multipleSelection:currentLinksUuidFromDS,
      displayProp:"name",
      searchable : true,
      display:displayRules,
      idProp:"uuid",
      onCloseMenu: (ev)=>{
        console.log(ev.select);
        ev.select.getParent().refreshList()
      },
      onChangeSelect: (ev)=>{
        batchRemoveMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)
        batchAddMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)

        ev.select.getParent().updateMetaLinks(store.metaLinks)//TODO remove extra call
        ev.select.getParent().refreshList()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  function setUpSearch(searchElement, sourceData) {
    searchElement.addEventListener('keyup', function(e){
      //e.stopPropagation()
      var value = document.querySelector(".planning_search_input").value
      console.log("fefsefsef");
      console.log(sourceData);
      var filteredData = sourceData.filter((item) => {
        // console.log(fuzzysearch(value, item.name));
        if (fuzzysearch(value, item.name) || fuzzysearch (value, item.name.toLowerCase()) ) {
          console.log(item.name);
          return true
        }
        return false
      })
      console.log(filteredData);
      var filteredIds = filteredData.map(x => x.uuid);
      var searchedItems = document.querySelectorAll(".searchable_planning")
      for (item of searchedItems) {
        if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "block"}else{item.style.display = "none"}
      }
    });
  }

  var updateGant=async  function () {
    if (ganttObject) {
      let ganttData = await prepareGanttData()
       ganttDataSet.clear()
       ganttGroups.clear()
       console.log('updating data');
       ganttGroups.add(ganttData.groups)
       ganttDataSet.add(ganttData.items)
     }
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

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var planningView = createPlanningView()
planningView.init()
