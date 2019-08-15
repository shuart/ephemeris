var createPlanningView = function () {
  var self ={};
  var objectIsActive = false;
  ganttObject = undefined

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

  var render = function () {
      var store = query.currentProject()
      console.log(store.plannings.items[0].items);
      showListMenu({
        sourceData:store.plannings.items[0].items,
        sourceLinks:store.plannings.items[0].links,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"name", edit:"true"},
          {prop:"desc", displayAs:"Description", edit:"true"},
          {prop:"start", displayAs:"Début", edit:"true", time:true},
          {prop:"duration", displayAs:"Durée", edit:"true"},
          {prop:"eventContainsPbs", displayAs:"Products contained", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true}
        ],
        idProp:"uuid",
        onEditItem: (ev)=>{
          console.log("Edit");
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            push(editPlanning({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          }
          if (ganttObject) {  ganttObject.update(prepareGanttData())}
        },
        onEditItemTime: (ev)=>{
          push(editPlanning({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.valueAsDate}))
          console.log(ev.target.valueAsDate);

          if (ganttObject) {  ganttObject.update(prepareGanttData())}
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            push(removePlanningItem({uuid:ev.target.dataset.id}))
            ev.select.updateData(store.plannings.items[0].items)

            if (ganttObject) {  ganttObject.update(prepareGanttData())}
          }
        },
        onMove: (ev)=>{
          console.log("move");
          if (confirm("move item ?")) {
            push(movePlanning({origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
            //update links if needed
            push(removePlanningLink({target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(addPlanningLink({source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }
            ev.select.updateData(store.plannings.items[0].items)
            ev.select.updateLinks(store.plannings.items[0].links)
          }
        },
        onAdd: (ev)=>{
          var newReq = prompt("Nouveau Besoin")
          push(addPlanningItem({name:newReq, duration:1}))
          console.log(store.plannings);

          if (ganttObject) {  ganttObject.update(prepareGanttData())}
        },
        onEditChoiceItem: (ev)=>{
          startSelection(ev)
        },
        onLabelClick: (ev)=>{
          showSingleItemService.showById(ev.target.dataset.id)
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
                  onChangeLengthEnd:function (e) {
                    console.log(e);

                    var a = moment(e.mouseTime);
                    var b = moment(e.startTime);
                    var dayDiff = a.diff(b, 'days')

                    push(editPlanning({uuid:e.target.id, prop:'duration', value:dayDiff}))

                    ev.select.updateData(store.plannings.items[0].items)
                    ev.select.updateLinks(store.plannings.items[0].links)
                    ev.select.update()
                    if (ganttObject) {  ganttObject.update(prepareGanttData())}
                    changeListSize()

                  },
                  onChangeStartEnd:function (e) {
                    console.log(e);
                    push(editPlanning({uuid:e.target.id, prop:'start', value:e.mouseTime}))

                    ev.select.updateData(store.plannings.items[0].items)
                    ev.select.updateLinks(store.plannings.items[0].links)
                    ev.select.update()
                    if (ganttObject) {  ganttObject.update(prepareGanttData())}
                    changeListSize()

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
    let ganttData = store.plannings.items[0].items.map(function (i) {
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
    var sourceTriggerId = ev.target.dataset.id;
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
