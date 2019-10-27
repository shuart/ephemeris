var createInterfacesListView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var getObjectNameByUuid = function (uuid) {
    let foundItem = query.items("all", i=> i.uuid == uuid)[0]
    if (foundItem) {
      return foundItem.name
    }else {
      return "Missing item"
    }
  }

  var readifyInterfaces = function () {
    var originalLinks = query.currentProject().interfaces.items
    let data = originalLinks.map(function (l) {

      let newItem = {uuid:l.uuid,
        description:l.description,
        name:l.name,
        source: getObjectNameByUuid(l.source),
        target:getObjectNameByUuid(l.target),
        type:l.type
      };
      return newItem
    })
    return data
  }

  var render = function () {
    var store = query.currentProject()
    console.log(readifyInterfaces());
    showListMenu({
      sourceData:readifyInterfaces(),
      targetDomContainer:".center-container",
      fullScreen:true,
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"type", displayAs:"Type", edit:false},
        {prop:"name", displayAs:"Name", edit:true},
        {prop:"description", displayAs:"Description", edit:true},
        {prop:"source", displayAs:"Source item", edit:false},
        {prop:"target", displayAs:"Target item", edit:false},
        {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true},
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        createInputPopup({
          originalData:ev.target.dataset.value,
          onSave:e =>{
            push(act.edit("interfaces",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            ev.select.updateData(readifyInterfaces())
          },
          onClose:e =>{
            push(act.edit("interfaces",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            ev.select.remove()
            ev.select.updateData(readifyInterfaces())
            ev.select.update()//TODO Why is it necessary?
          }
        })
      },
      onEditChoiceItem: (ev)=>{
        startSelection(ev)
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("interfaces",{uuid:ev.target.dataset.id}))
          ev.select.updateData(readifyInterfaces())
        }
      },
      // onAdd: (ev)=>{
      //   let tagName = prompt("New tag")
      //   push(act.add("tags",{uuid:genuuid(), name:tagName, color:"#ffffff"}))
      // },
      onClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          ev.select.remove()
          ev.select.updateData(readifyInterfaces())
          ev.select.update()//TODO Why is it necessary?
        })
      },
      extraActions:[
        {
          name:"Export",
          action:(ev)=>{
            exportToCSV()
          }
        },
        {
          name:"Matrix",
          action:(ev)=>{
            createInterfaceMatrix()
          }
        }
      ]
    })
  }

  function startSelection(ev) {
    var store = query.currentProject()
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
    var showColoredIconsRule = undefined
    if (metalinkType == "origin") {
      sourceGroup="stakeholders";
      sourceData=store.stakeholders.items
      showColoredIconsRule= lettersFromNames,
      displayRules = [
        {prop:"name", displayAs:"First Name", edit:false},
        {prop:"lastName", displayAs:"Last name", edit:false}
      ]
    }else if (metalinkType == "originNeed") {
      sourceGroup="currentPbs"
      invert = true;
      sourceData=store.currentPbs.items
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.currentPbs.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "tags") {
      sourceGroup="tags";
      sourceData=store.tags.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "WpOwnNeed") {
      sourceGroup="workPackages"
      invert = true;
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.workPackages.links
      sourceData=store.workPackages.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
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
      showColoredIcons:showColoredIconsRule,
      idProp:"uuid",
      onAdd:(ev)=>{//TODO experimental, replace with common service
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

  var exportToCSV = function () {
    let store = query.currentProject()
    let data = readifyInterfaces().map(i=>{
      let linkToTextTags = getRelatedItems(i, "tags", {metalinksType:"tags"}).map(s=> s[0]? s[0].name : "").join(",")

      return {id:i.uuid, type:i.type, description:i.description, source:i.source, target:i.target, tags:linkToTextTags}
    })
    JSONToCSVConvertor(data, 'Interfaces', true)

  }

  var createInterfaceMatrix = function () {
    let store  = query.currentProject()
    let data = readifyInterfaces().map(i=>{
      let linkToTextTags = getRelatedItems(i, "tags", {metalinksType:"tags"}).map(s=> s[0]? s[0].name : "").join(",")

      return {id:i.uuid, type:i.type, description:i.description, source:i.source, target:i.target, tags:linkToTextTags}
    })
    let nodes = []
    let links = []
    store.currentPbs.items.forEach(function (p,index) {
      nodes.push({name:p.name, group:undefined, index:index, uuid:p.uuid})
    })
    store.interfaces.items.forEach(function (i) {
      console.log(nodes.find(n=>n.uuid == i.source));
      let sourceNode=nodes.find(n=>n.uuid == i.source)
      let source=sourceNode.index
      let targetNode=nodes.find(n=>n.uuid == i.target)
      let target=targetNode.index

      sourceNode.linkUuid = i.uuid
      targetNode.linkUuid = i.uuid
      links.push({source: source, target: target, value: 1, uuid:i.uuid})
    })
    console.log({nodes:nodes, links:links});
    createOccurrenceDiagram({originalData:{nodes:nodes, links:links}})
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

var interfacesListView = createInterfacesListView()
interfacesListView.init()
