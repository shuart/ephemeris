var createPlanningView = function () {
  var self ={};
  var objectIsActive = false;
  var ganttObject = undefined
  var currentPlanning = undefined

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

  }

  var preparePlanningData = function (planningUuid) {
    var store = query.currentProject()
    let relevantTimeLinks = store.timeLinks.items.filter(l=>l.type == "planning" && l.source == planningUuid)
    let relevantTimeTracksUuid = relevantTimeLinks.map(r => r.target)
    console.log(relevantTimeTracksUuid);
    let relevantTimeTracks = store.timeTracks.items.filter(l => relevantTimeTracksUuid.includes(l.uuid))
    console.log(relevantTimeTracks);
    if (!relevantTimeTracks || !relevantTimeTracks[0]) {
      return []
    }
    let planningData = relevantTimeTracks.map(function (t) {
      let relatedEvent = store.events.items.find(e=>e.uuid == t.relatedEvent)
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


  var render = function () {
      currentPlanning = query.currentProject().plannings.items[0] //TODO remove
      var store = query.currentProject()
      console.log(preparePlanningData(currentPlanning.uuid));
      showListMenu({
        sourceData:preparePlanningData(currentPlanning.uuid),
        // sourceLinks:store.plannings.items[0].links,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"name", edit:"true"},
          {prop:"desc", displayAs:"Description", edit:"true"},
          {prop:"start", displayAs:"Début", edit:"true", time:true},
          {prop:"duration", displayAs:"Durée", edit:"true"},
          {prop:"eventContainsPbs", displayAs:"Products contained", deferredIdProp:"relatedEvent", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true}
        ],
        idProp:"uuid",
        onEditItem: (ev)=>{
          console.log("Edit");
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            if (ev.target.dataset.prop=="duration") {
              push(act.edit("timeTracks",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
              ev.select.updateData(preparePlanningData(currentPlanning.uuid))
            }else {
              let eventsUuid = store.timeTracks.items.find(t => t.uuid == ev.target.dataset.id).relatedEvent
              console.log(eventsUuid);
              push(act.edit("events",{uuid:eventsUuid, prop:ev.target.dataset.prop, value:newValue}))
              ev.select.updateData(preparePlanningData(currentPlanning.uuid))
            }
          }
          if (ganttObject) {  ganttObject.update(prepareGanttData())}
        },
        onEditItemTime: (ev)=>{
          push(act.edit("timeTracks",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.valueAsDate}))
          ev.select.updateData(preparePlanningData(currentPlanning.uuid))

          if (ganttObject) {  ganttObject.update(prepareGanttData()); changeListSize()}//TODO why needed?
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            // push(act.add("events",{uuid:eventUuid, name:newReq}))
            push(act.remove("timeTracks",{uuid:ev.target.dataset.id}))
            // push(act.add("timeLinks",{type:"planning", source:currentPlanning.uuid, target:trackUuid}))
            ev.select.updateData(preparePlanningData(currentPlanning.uuid))

            if (ganttObject) {  ganttObject.update(prepareGanttData())}
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
        //     ev.select.updateData(store.plannings.items[0].items)
        //     ev.select.updateLinks(store.plannings.items[0].links)
        //   }
        // },
        onAdd: (ev)=>{
          var newReq = prompt("Nouveau Besoin")
          if (newReq) {
            let eventUuid = uuid()
            let trackUuid = uuid()
            push(act.add("events",{uuid:eventUuid, name:newReq}))
            push(act.add("timeTracks",{uuid:trackUuid,relatedEvent:eventUuid, duration:1}))
            push(act.add("timeLinks",{type:"planning", source:currentPlanning.uuid, target:trackUuid}))
            ev.select.updateData(preparePlanningData(currentPlanning.uuid))
          }
          console.log(store);

          if (ganttObject) {  ganttObject.update(prepareGanttData())}
        },
        onEditChoiceItem: (ev)=>{
          startSelection(ev)
        },
        onLabelClick: (ev)=>{
          showSingleItemService.showById(ev.target.dataset.id)
        },
        onClick: (ev)=>{
          showSingleEventService.showById(ev.target.dataset.id, function (e) {
            ev.select.updateData(store.plannings.items[0].items)
            ev.select.updateLinks(store.plannings.items[0].links)
            ev.select.refreshList()
            if (ganttObject) {  ganttObject.update(prepareGanttData()); changeListSize()}//TODO why needed?

          })
        },
        extraActions:[

          {
            name:"Gantt",
            action:(ev)=>{
              if (ganttObject) {
                document.querySelector(".center-container").innerHTML=""
                ganttObject = undefined
              }else {
                let ganttData = prepareGanttData()
                ganttObject = createGanttView({
                  targetSelector:".center-container",
                  initialData:ganttData,
                  elementDefaultColor :"rgb(104, 185, 181)",
                  elementDefaultTextColor :"#fff",
                  onChangeLengthEnd:function (e) {
                    console.log(e);

                    var a = moment(e.mouseTime);
                    var b = moment(e.startTime);
                    var dayDiff = a.diff(b, 'days')

                    // push(editPlanning({uuid:e.target.id, prop:'duration', value:dayDiff}))
                    push(act.edit("timeTracks",{uuid:e.target.id, prop:'duration', value:dayDiff}))

                    ev.select.updateData(preparePlanningData(currentPlanning.uuid))
                    // ev.select.updateLinks(store.plannings.items[0].links)
                    ev.select.update()
                    if (ganttObject) {  ganttObject.update(prepareGanttData())}
                    changeListSize()

                  },
                  onChangeStartEnd:function (e) {
                    console.log(e);
                    // push(editPlanning({uuid:e.target.id, prop:'start', value:e.mouseTime}))

                    push(act.edit("timeTracks",{uuid:e.target.id, prop:'start', value:e.mouseTime}))
                    ev.select.updateData(preparePlanningData(currentPlanning.uuid))
                    // ev.select.updateLinks(store.plannings.items[0].links)
                    ev.select.update()
                    if (ganttObject) {  ganttObject.update(prepareGanttData())}
                    changeListSize()

                  },
                  onElementClicked : function (e) {
                    showSingleEventService.showById(e.id, function (e) {
                      ev.select.updateData(preparePlanningData(currentPlanning.uuid))
                      // ev.select.updateLinks(store.plannings.items[0].links)
                      ev.select.refreshList()
                      if (ganttObject) {  ganttObject.update(prepareGanttData()); changeListSize()}//TODO why needed?
                    })
                  }
                 })
              }

               if (ganttObject) {//change siz of list if gant is activated
                   changeListSize()
               }
            }
          }
        ]
      })
  }

  var changeListSize = function () {
    setTimeout(function () {
      document.querySelector(".center-container").children[1].style.height ="50%"
    }, 700);
  }

  var prepareGanttData = function () {
    var store = query.currentProject()
    let ganttData = preparePlanningData(currentPlanning.uuid).map(function (i) {
      return {
        startDate: i.start|| Date.now(),
        duration: [i.duration, 'days'],
        // endDate: moment(i.start || Date.now(), "DD-MM-YYYY").add(5, 'days').toDate(),
        label: i.name,
        id: i.uuid,
        dependsOn: []
      }
    })
    if (!ganttData[0]) {
      ganttData = undefined
    }
    return ganttData
  }

  function startSelection(ev) {
    var store = query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id; //alredy modified by defferedIdProp rule
    // var sourceTriggerId = store.timeTracks.items.find(t => t.uuid == ev.target.dataset.id).relatedEvent;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceData = undefined
    var invert = false
    var source = "source"
    var target = "target"
    var sourceLinks= undefined
    var displayRules= undefined
    if (metalinkType == "assignedTo") {
      sourceData=store.stakeholders.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"lastName", displayAs:"Last name", edit:false}
      ]
    }else if (metalinkType == "WpOwn") {
      sourceData=store.currentPbs.items
      sourceLinks=store.currentPbs.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "WpOwnNeed") {
      sourceData=store.requirements.items
      sourceLinks=store.requirements.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "contains") {
      sourceData=store.currentPbs.items
      sourceLinks=store.currentPbs.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "originNeed") {
      invert = true;
      sourceData=store.currentPbs.items
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.currentPbs.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "tags") {
      sourceData=store.tags.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "eventContainsPbs") {
      sourceData=store.currentPbs.items
      sourceLinks=store.currentPbs.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
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
        store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l[source] == sourceTriggerId && currentLinksUuidFromDS.includes(l[target])))
        for (newSelected of ev.select.getSelected()) {
          if (!invert) {
            push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
          }else {
            push(act.add("metaLinks",{type:metalinkType, source:newSelected, target:sourceTriggerId}))
          }
        }
        ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
        ev.select.getParent().refreshList()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
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
