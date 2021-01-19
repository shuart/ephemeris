var createInterfacesListView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var getObjectNameByUuid = function (uuid, store) {
    // let foundItem = query.items("all", i=> i.uuid == uuid)[0]
    let foundItem= store.currentPbs.find(i=> i.uuid == uuid)
    if (foundItem) {
      return foundItem.name
    }else {
      return "Missing item"
    }
  }

  var readifyInterfaces = function (store) {
    var originalLinks = store.interfaces
    let data = originalLinks.map(function (l) {

      let newItem = {uuid:l.uuid,//TODO check if still necessary
        description:l.description,
        name:l.name,
        source: l.source,
        target:l.target,
        type:l.type
      };
      return newItem
    })
    return data
  }

  var render = async function () {
    var store = await query.currentProject()
    // console.log(readifyInterfaces());
    showListMenu({
      sourceData:readifyInterfaces(store),
      targetDomContainer:".center-container",
      fullScreen:true,
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:true},
        {prop:"interfacesType", displayAs:"Type", meta:()=>store.metaLinks, choices:()=>store.interfacesTypes, edit:true},
        {prop:"description", displayAs:"Description", edit:true},
        {prop:"source", displayAs:"Source item", custom:e=>getObjectNameByUuid(e, store), actionable:e=>e,edit:false},
        {prop:"target", displayAs:"Target item", custom:e=>getObjectNameByUuid(e, store), actionable:e=>e,edit:false},
        {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks, choices:()=>store.tags, edit:true}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        createInputPopup({
          originalData:ev.target.dataset.value || "",
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
      onClick: async  (ev)=>{
        var store = await query.currentProject()
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          ev.select.remove()
          ev.select.updateData(readifyInterfaces(store))
          ev.select.update()//TODO Why is it necessary?
        })
      },
      onLabelClick: (ev)=>{
          showSingleItemService.showById(ev.target.dataset.id)
      },
      extraActions:[
        {
          name:"Export",
          action:(ev)=>{
            exportToCSV()
          }
        },
        {
          name:"Types",
          action:(ev)=>{
            interfacesTypesView.update()
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

  async function startSelection(ev) {
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
    var showColoredIconsRule = undefined
    if (metalinkType == "origin") {
      sourceGroup="stakeholders";
      sourceData=store.stakeholders
      showColoredIconsRule= lettersFromNames,
      displayRules = [
        {prop:"name", displayAs:"First Name", edit:false},
        {prop:"lastName", displayAs:"Last name", edit:false}
      ]
    }else if (metalinkType == "originNeed") {
      sourceGroup="currentPbs"
      invert = true;
      sourceData=store.currentPbs
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "tags") {
      sourceGroup="tags";
      sourceData=store.tags
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "interfacesType") {
      sourceGroup="interfacesTypes";
      sourceData=store.interfacesTypes
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "WpOwnNeed") {
      sourceGroup="workPackages"
      invert = true;
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.links
      sourceData=store.workPackages
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
          item:store[sourceGroup].filter(e=> e.uuid == uuid)[0],
          onLeave: (ev)=>{
            push(act.remove(sourceGroup,{uuid:uuid}))
            ev.select.updateData(store[sourceGroup])
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

        ev.select.getParent().updateMetaLinks(store.metaLinks)//TODO remove extra call
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
      let linkToTextTags = getRelatedItems(store, i, "tags", {metalinksType:"tags"}).map(s=> s[0]? s[0].name : "").join(",")
      let linkToTextTypes = getRelatedItems(store, i, "interfacesTypes", {metalinksType:"interfacesType"}).map(s=> s[0]? s[0].name : "").join(",")

      return {id:i.uuid, type:linkToTextTypes||"Interface", description:i.description, source:i.source, target:i.target, tags:linkToTextTags}
    })
    JSONToCSVConvertor(data, 'Interfaces', true)

  }

  var createInterfaceMatrix = function () {
    let store  = query.currentProject()
    let data = readifyInterfaces().map(i=>{
      let linkToTextTags = getRelatedItems(store, i, "tags", {metalinksType:"tags"}).map(s=> s[0]? s[0].name : "").join(",")

      return {id:i.uuid, type:i.type, description:i.description, source:i.source, target:i.target, tags:linkToTextTags}
    })
    let nodes = []
    let links = []
    store.currentPbs.forEach(function (p,index) {
      nodes.push({name:p.name, group:undefined, index:index, uuid:p.uuid})
    })
    store.interfaces.forEach(function (i) {
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
