var createChangeManagerView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = async function () {
    var store = await query.currentProject()
    showListMenu({
      sourceData:store.changes.items,
      displayProp:"name",
      targetDomContainer:".center-container",
      fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:true},
        {prop:"desc", displayAs:"Description", edit:true},
        {prop:"reqChangedBy",isTarget:true, displayAs:"Changed Requirement", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"assignedTo", displayAs:"Assigned to", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
        {prop:"createdAt", displayAs:"Added", edit:"true", time:true}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("changes", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onEditItemTime: (ev)=>{
        push(act.edit("changes",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.valueAsDate}))
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("changes",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.workPackages.items)
        }
      },
      onAdd: (ev)=>{
        let workPackages = prompt("New Change")
        push(act.add("changes",{uuid:genuuid(), name:"New Change", createdAt:Date.now()}))
      },
      onEditChoiceItem: (ev)=>{
        startSelection(ev)
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
      },
      onClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          ev.select.updateData(store.changes.items)
          ev.select.updateLinks(store.changes.links)
          ev.select.refreshList()
        })
      },
      // extraButtons : [
      //   {name:"Relations", class:"fuse", prop:"projectId", action: (orev)=>{
      //     console.log('fesfsefsef');
      //     pageManager.setActivePage("relations", {param:{context:"extract", uuid:orev.dataset.id}})//TODO should not call page ma,ager directly
      //   }}
      // ],
      extraActions:[
        {
          name:"Export",
          action:(ev)=>{
            exportToCSV()
          }
        }
      ]
    })
  }

  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.changes.items.map(i=>{
      let linkToTextsh = getRelatedItems(i, "stakeholders",{objectIs:"source", metalinksType:"assignedTo"}).map(s=> s[0]? s[0].name +" "+s[0].lastName : "").join(",")
      let linkToTextReq = getRelatedItems(i, "requirements",{objectIs:"target", metalinksType:"reqChangedBy"}).map(s=> s[0]? s[0].name : '').join(",")

      return {id:i.uuid, name:i.name, description:i.desc, Owner:linkToTextsh,  requirements:linkToTextReq}
    })
    JSONToCSVConvertor(data, 'Changes', true)
  }

  async function  startSelection(ev) {
    var store = await query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceGroup = undefined
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
      sourceGroup="currentPbs"
      sourceData=store.currentPbs.items
      sourceLinks=store.currentPbs.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "WpOwnNeed") {
      sourceGroup="requirements"
      sourceData=store.requirements.items
      sourceLinks=store.requirements.links
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "originNeed") {
      sourceGroup="currentPbs"
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
    }else if (metalinkType == "reqChangedBy") {
      sourceGroup="requirements"
      invert = true;
      sourceData=store.requirements.items
      sourceLinks=store.requirements.links
      source = "target"//invert link order for after
      target = "source"
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
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
      onAdd:(ev)=>{//TODO experimental, replace with common service
        var uuid = genuuid()
        push(act.add(sourceGroup, {uuid:uuid,name:"Edit Item"}))
        if (sourceGroup == "currentPbs") {
          push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:uuid}))
        }
        ev.select.setEditItemMode({
          item:store[sourceGroup].items.filter(e=> e.uuid == uuid)[0],
          onLeave: (ev)=>{
            push(act.remove(sourceGroup,{uuid:uuid}))
            if (sourceGroup == "currentPbs") {
              push(removePbsLink({target:uuid}))
            }
            ev.select.updateData(store[sourceGroup].items)
            ev.select.updateLinks(store[sourceGroup].links)          }
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
        ev.select.getParent().refreshList()
      },
      onChangeSelect: (ev)=>{
        batchRemoveMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)
        batchAddMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)

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
    //update()
    setTimeout(function () {
      update()
    }, 40);//TODO discover why it's needed and remove
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

var changeManagerView = createChangeManagerView()
changeManagerView.init()
