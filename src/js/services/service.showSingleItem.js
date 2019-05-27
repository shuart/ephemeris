var createShowSingleItemService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function (uuid) {
    showEditMenu(uuid)
  }
  var showEditMenu = function (uuid) {
    var store = query.currentProject()


    var storeGroup=undefined
    var label=undefined
    if (store.currentPbs.items.find(i=>i.uuid == uuid)) { storeGroup = "currentPbs"; label='Pbs'}
    else if (store.requirements.items.find(i=>i.uuid == uuid)) { storeGroup = "requirements"; label='Requirements'}
    else if (store.functions.items.find(i=>i.uuid == uuid)) { storeGroup = "functions"; label='Functions'}
    else if (store.stakeholders.items.find(i=>i.uuid == uuid)) { storeGroup = "stakeholders"; label='Users'}

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

      },
      onEditChoiceItem: (ev)=>{
        startSelectionFromParametersView(ev)
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
        ev.select.remove()//TODO add history
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
    if (metalinkType == "originNeed") {
      sourceGroup="requirements"
    }else if (metalinkType == "originFunction") {
      sourceGroup="functions"
    }else if (metalinkType == "origin") {
      sourceGroup="stakeholders"
    }
    var sourceData = store[sourceGroup].items
    showListMenu({
      sourceData:sourceData,
      parentSelectMenu:ev.select ,
      multipleSelection:currentLinksUuidFromDS,
      displayProp:"name",
      searchable : true,
      display:[
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ],
      idProp:"uuid",
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

  function generateRulesFromNodeType(type, store) {
    var store = query.currentProject()
    if (type == "Functions") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true}
      ]
    }else if (type =="Requirements") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"origin", displayAs:"Received from", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
        {prop:"originNeed",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:false}
      ]
    }else if (type =="Pbs") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:true}
      ]
    }else {
      return [{prop:"name", displayAs:"Name", edit:"true"},
              {prop:"desc", displayAs:"Description", edit:"true"}
      ]
    }
  }

  var update = function () {
    render()
  }
  var showById = function (id) {
    render(id)
  }


  self.showById = showById
  self.update = update
  self.init = init

  return self
}

var showSingleItemService = createShowSingleItemService()
showSingleItemService.init()