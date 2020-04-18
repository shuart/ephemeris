var createShowSingleEventService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function (uuid, callback) {
    showEditMenu(uuid, callback)
  }
  var showEditMenu = async function (uuid, callback) {
    var store = await query.currentProject()


    var storeGroup=undefined
    var label=undefined
    if (store.timeTracks.items.find(i=>i.uuid == uuid)) { storeGroup = store.timeTracks; label='timeTracks'}

    // for (var i = 0; i < store.plannings.items.length; i++) {
    //   let currentPlanning = store.plannings.items[i]
    //   if (currentPlanning.items.find(i=>i.uuid == uuid)) {
    //     storeGroup = currentPlanning; label='plannings'
    //   }
    // }

    var originItem = undefined
    if (!storeGroup) {
      console.log("no group available");
      return
    }

    if (label == "timeTracks") {
      originItem = prepareEventDataFromTrack(uuid,store)
    }

    showListMenu({
      sourceData:storeGroup.items,
      sourceLinks:storeGroup.links,
      displayProp:"name",
      searchable : false,
      singleElement:originItem,
      rulesToDisplaySingleElement:generateRulesFromNodeType(label,store),
      display:[
        {prop:"name", displayAs:"Name", edit:false}
      ],
      idProp:"uuid",
      onCloseMenu: (ev)=>{
        if (callback) {
          callback(ev)
        }
      },
      onEditChoiceItem: (ev)=>{
        startSelectionFromParametersView(ev)
      },
      onEditItemTime: (ev)=>{
        push(act.edit("timeTracks",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.value}))
        showById(uuid, callback)
        setTimeout(function () {ev.select.remove()}, 100);
      },
      onLabelClick: (ev)=>{
        //check if label as a target or difined as a target in func checkIfTargetIsReachable
        if (checkIfTargetIsReachable(ev.target.dataset.id, store)) {
          showSingleItemService.showById(ev.target.dataset.id)
          ev.select.remove()//TODO add history
        }else {
          console.log('no target');
        }
      },
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          if (ev.target.dataset.prop=="duration") {
            push(act.edit("timeTracks",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          }else {
            let eventsUuid = store.timeTracks.items.find(t => t.uuid == ev.target.dataset.id).relatedEvent
            console.log(eventsUuid);
            push(act.edit("events",{uuid:eventsUuid, prop:ev.target.dataset.prop, value:newValue}))
          }
        }

        showById(uuid, callback)
        setTimeout(function () {ev.select.remove()}, 100);

      }
    })
  }

  async function startSelectionFromParametersView(ev) {
    var store = await query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceGroup = undefined
    var displayRules = [
      {prop:"name", displayAs:"Name", edit:false},
      {prop:"desc", displayAs:"Description", fullText:true, edit:false}
    ];
    var showColoredIconsRule = undefined
    var prependContent=undefined
    var onLoaded = undefined
    if (metalinkType == "originNeed") {
      sourceGroup="requirements"
    }else if (metalinkType == "originFunction") {
      sourceGroup="functions"
    }else if (metalinkType == "origin") {
      sourceGroup="stakeholders";
      showColoredIconsRule= lettersFromNames,
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"lastName", displayAs:"Last name", fullText:true, edit:false}
      ];
    }else if (metalinkType == "contains") {
      sourceGroup="currentPbs";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "tags") {
      sourceGroup="tags";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "category") {
      sourceGroup="categories";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "WpOwn") {
      sourceGroup="currentPbs";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "WpOwnNeed") {
      sourceGroup="requirements";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "documents") {
      sourceGroup="documents";
      if (typeof nw !== "undefined") {//if using node webkit
        prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`
        onLoaded = function (ev) {
          dropAreaService.setDropZone(".prepend", function () {
            ev.select.updateData(store.documents.items)
            ev.select.refreshList()
            setTimeout(function () {
              ev.select.scrollDown()
            }, 100);
            // ev.select.scrollDown()
          })
        }
      }
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "documentsNeed") {
      sourceGroup="documents";
      prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`,
      onLoaded = function (ev) {
        dropAreaService.setDropZone(".prepend", function () {
          ev.select.updateData(store.documents.items)
          ev.select.refreshList()
          setTimeout(function () {
            ev.select.scrollDown()
          }, 100);
        })
      },
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "assignedTo") {
      sourceGroup="stakeholders";
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"lastName", displayAs:"Last name", fullText:true, edit:false}
      ];
    }else if (metalinkType == "eventContainsPbs") {
      sourceGroup="currentPbs";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }

    var sourceData = store[sourceGroup].items
    showListMenu({
      sourceData:sourceData,
      parentSelectMenu:ev.select ,
      multipleSelection:currentLinksUuidFromDS,
      displayProp:"name",
      searchable : true,
      display:displayRules,
      idProp:"uuid",
      showColoredIcons:showColoredIconsRule,
      prependContent:prependContent,
      onLoaded:onLoaded,
      onAdd:(ev)=>{
        var uuid = genuuid()
        push(act.add(sourceGroup, {uuid:uuid,name:"Edit Item"}))
        // setTimeout(function () {
        //   ev.select.scrollDown()
        // }, 100);
        ev.select.setEditItemMode({
          item:store[sourceGroup].items.filter(e=> e.uuid == uuid)[0],
          onLeave: (ev)=>{
            push(act.remove(sourceGroup,{uuid:uuid}))
            ev.select.updateData(store[sourceGroup].items)
          }
        })
      },
      onEditItem: (ev)=>{
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit(sourceGroup, {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onCloseMenu: (ev)=>{
        console.log(ev.select);
        ev.select.getParent().update()
      },
      onChangeSelect: (ev)=>{
        console.log(ev.select.getSelected());
        console.log(store.metaLinks.items);
        store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
        console.log(store.metaLinks.items);
        for (newSelected of ev.select.getSelected()) {
          push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
        }
        //ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
        // ev.select.getParent().update()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  function checkIfTargetIsReachable(uuid, store){
    if (store.currentPbs.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.requirements.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.functions.items.find(i=>i.uuid == uuid)) { return true}
    else if (store.stakeholders.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.physicalSpaces.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.workPackages.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.interfaces.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.documents.items.find(i=>i.uuid == uuid)) {return true }
    else {
      return false
    }
  }

  function generateRulesFromNodeType(type, store) {
    if (type == "Functions") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"originFunction",isTarget:true, displayAs:"linked to products", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:false}
      ]
    }else if (type =="Requirements") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"origin", displayAs:"Received from", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
        {prop:"originNeed",isTarget:true, displayAs:"linked to products", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:false},
        {prop:"originNeed",isTarget:true, displayAs:"linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:false},
        {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true},
        {prop:"WpOwnNeed",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks.items, choices:()=>store.workPackages.items, edit:false},
        {prop:"documentsNeed", displayAs:"Documents", meta:()=>store.metaLinks.items, choices:()=>store.documents.items, edit:true}
      ]
    }else if (type =="Pbs") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:true},
        {prop:"contains",isTarget:true, displayAs:"Linked to physical spaces", meta:()=>store.metaLinks.items, choices:()=>store.physicalSpaces.items, edit:false},
        {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true},
        {prop:"category", displayAs:"Category", meta:()=>store.metaLinks.items, choices:()=>store.categories.items, edit:true},
        {prop:"WpOwn",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks.items, choices:()=>store.workPackages.items, edit:false},
        {prop:"documents", displayAs:"Documents", meta:()=>store.metaLinks.items, choices:()=>store.documents.items, edit:true}
      ]
    }else if (type =="physicalSpaces") {
      return [{prop:"name", displayAs:"Name", edit:true},
        {prop:"desc", displayAs:"Description", fullText:true, edit:true},
        {prop:"contains", displayAs:"Products contained", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true}
      ]
    }else if (type =="Users"){
      return [{prop:"name", displayAs:"First name", edit:true},
              {prop:"lastName", displayAs:"Last name", edit:true},
              {prop:"org", displayAs:"Organisation", edit:true},
              {prop:"role", displayAs:"Role", edit:true},
              {prop:"mail", displayAs:"E-mail", edit:true},
              {prop:"origin",isTarget:true, displayAs:"linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false},
              {prop:"assignedTo",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks.items, choices:()=>store.workPackages.items, edit:false}
      ]
    }else if (type =="workPackages"){
      return [{prop:"name", displayAs:"First name", edit:true},
              {prop:"assignedTo", displayAs:"Assigned To", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
              {prop:"WpOwn", displayAs:"Products Owned", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true},
              {prop:"WpOwnNeed", displayAs:"Requirements Owned", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true}
      ]
    }else if (type =="interfaces"){
      return [
              {prop:"type", displayAs:"Type", edit:false},
              {prop:"name", displayAs:"Name", edit:true},
              {prop:"description", displayAs:"Description", edit:true},
              {prop:"source", displayAs:"Source", custom:e=>getObjectNameByUuid(e), edit:false},
              {prop:"target", displayAs:"Target", custom:e=>getObjectNameByUuid(e), edit:false}
      ]
    }else if (type =="documents"){
      return [
              {prop:"name", displayAs:"Name", edit:true},
              {prop:"osPath", displayAs:"Local", fullText:true, localPath:true, edit:false},
              {prop:"link", displayAs:"Link", fullText:true, link:true, edit:true},
              {prop:"documents",isTarget:true, displayAs:"Products", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:false},
              {prop:"documentsNeed",isTarget:true, displayAs:"requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false}
      ]
    }else if (type =="plannings"){
      return [
        {prop:"name", displayAs:"name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"start", displayAs:"Début", edit:"true", time:true},
        {prop:"duration", displayAs:"Durée", edit:"true"},
        {prop:"eventContainsPbs", displayAs:"Products contained", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true}
      ]
    }else if (type =="timeTracks"){
      return [
        {prop:"name", displayAs:"name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"start", displayAs:"Début", edit:"true", time:true},
        {prop:"duration", displayAs:"Durée", edit:"true"},
        {prop:"eventContainsPbs", displayAs:"Products contained", deferredIdProp:"relatedEvent", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true}
      ]
    }
  }

  var prepareEventDataFromTrack = function (trackUuid, store) {
    let relevantTimeTracks = store.timeTracks.items.filter(l => l.uuid == trackUuid)
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
    return planningData[0]
  }

  var update = function () {
    render()
  }
  var showById = function (id, callback) {
    render(id, callback)
  }


  self.showById = showById
  self.update = update
  self.init = init

  return self
}

var showSingleEventService = createShowSingleEventService()
showSingleEventService.init()
