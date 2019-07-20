var createShowSingleItemService = function () {
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
  var showEditMenu = function (uuid, callback) {
    var store = query.currentProject()


    var storeGroup=undefined
    var label=undefined
    if (store.currentPbs.items.find(i=>i.uuid == uuid)) { storeGroup = "currentPbs"; label='Pbs'}
    else if (store.requirements.items.find(i=>i.uuid == uuid)) { storeGroup = "requirements"; label='Requirements'}
    else if (store.functions.items.find(i=>i.uuid == uuid)) { storeGroup = "functions"; label='Functions'}
    else if (store.stakeholders.items.find(i=>i.uuid == uuid)) { storeGroup = "stakeholders"; label='Users'}
    else if (store.physicalSpaces.items.find(i=>i.uuid == uuid)) { storeGroup = "physicalSpaces"; label='physicalSpaces'}

    if (!store[storeGroup]) {
      console.log("no group available");
      return
    }
    var originItem = store[storeGroup].items.filter(e=> e.uuid == uuid)
    showListMenu({
      sourceData:store[storeGroup].items,
      sourceLinks:store[storeGroup].links,
      displayProp:"name",
      searchable : false,
      singleElement:originItem[0],
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
      onLabelClick: (ev)=>{
        //check if label as a target or difined as a target in func checkIfTargetIsReachable
        if (checkIfTargetIsReachable(ev.target.dataset.id)) {
          showSingleItemService.showById(ev.target.dataset.id)
          ev.select.remove()//TODO add history
        }else {
          console.log('no target');
        }
      },
      onEditItem: (ev)=>{
        createInputPopup({
          originalData:ev.target.dataset.value,
          onSave:e =>{
            push(act.edit(storeGroup,{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            ev.select.update()
          },
          onClose:e =>{
            push(act.edit(storeGroup,{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            ev.select.update()
          }
        })
      }
    })
  }

  function startSelectionFromParametersView(ev) {
    var store = query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceGroup = undefined
    var displayRules = [
      {prop:"name", displayAs:"Name", edit:false},
      {prop:"desc", displayAs:"Description", fullText:true, edit:false}
    ];
    var showColoredIconsRule = undefined
    if (metalinkType == "originNeed") {
      sourceGroup="requirements"
    }else if (metalinkType == "originFunction") {
      sourceGroup="functions"
    }else if (metalinkType == "origin") {
      sourceGroup="stakeholders";
      showColoredIconsRule= (e)=>{return e.name[0]+e.lastName[0];},
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
      onAdd:(ev)=>{
        var uuid = genuuid()
        push(act.add(sourceGroup, {uuid:uuid,name:"Edit Item"}))
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

  function checkIfTargetIsReachable(uuid){
    var store = query.currentProject()
    if (store.currentPbs.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.requirements.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.functions.items.find(i=>i.uuid == uuid)) { return true}
    else if (store.stakeholders.items.find(i=>i.uuid == uuid)) {return true }
    else {
      return false
    }
  }

  function generateRulesFromNodeType(type, store) {
    var store = query.currentProject()
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
        {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true}
      ]
    }else if (type =="Pbs") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:true}
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


      ]
    }
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

var showSingleItemService = createShowSingleItemService()
showSingleItemService.init()
