var createWorkPhysicalSpacesView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    showListMenu({
      sourceData:store.physicalSpaces.items,
      sourceLinks:store.physicalSpaces.links,
      displayProp:"name",
      targetDomContainer:".center-container",
      fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:true},
        {prop:"desc", displayAs:"Description", fullText:true, edit:true},
        {prop:"contains", displayAs:"Products contained", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true}      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("physicalSpaces", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("physicalSpaces",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.physicalSpaces.items)
        }
      },
      onMove: (ev)=>{
        console.log("move");
        if (confirm("move item ?")) {
          push(act.move("physicalSpaces", {origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
          //update links if needed
          push(act.removeLink("physicalSpaces",{target:ev.originTarget.dataset.id}))
          if (ev.targetParentId && ev.targetParentId != "undefined") {
            push(act.addLink("physicalSpaces",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
          }
          ev.select.updateData(store.physicalSpaces.items)
          ev.select.updateLinks(store.physicalSpaces.links)
        }
      },
      onAdd: (ev)=>{
        let physicalSpaces = prompt("New Physical Space")
        push(act.add("physicalSpaces",{uuid:genuuid(), name:physicalSpaces}))
      },
      onEditChoiceItem: (ev)=>{
        startSelection(ev)
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
      },
      onClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          ev.select.updateData(store.physicalSpaces.items)
          ev.select.updateLinks(store.physicalSpaces.links)
          ev.select.refreshList()
        })
        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      },
      extraButtons : [
        {name:"Relations", class:"fuse", prop:"projectId", action: (orev)=>{
          pageManager.setActivePage("relations", {param:{context:"extract", uuid:orev.dataset.id}})//TODO should not call page ma,ager directly
        }}
      ],
      extraActions:[
        {
          name:"Export",
          action:(ev)=>{
            exportToCSV()
          }
        },
        {
          name:"Import",
          action:(ev)=>{
            importCSVfromFileSelector(function (results) {
              let startImport = confirm(results.data.length+" Physical Spaces will be imported")
              if (startImport) {
                for (physicalSpaces of results.data) {
                  push(addRequirement({name:physicalSpaces[0], desc:physicalSpaces[1]}))
                }
                alert("Close and re-open the view to complete the import")
              }
            })

          }
        },
        {
          name:"Diagramme",
          action:(ev)=>{
            showTreeFromListService.showByStoreGroup("physicalSpaces", function (e) {
              ev.select.updateData(store.physicalSpaces.items)
              ev.select.updateLinks(store.physicalSpaces.links)
              ev.select.update() //TODO find a better way
            })
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

  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.physicalSpaces.items.map(i=>{
      let linkToTextPbs = getRelatedItems(i, "currentPbs", {metalinksType:"contains"}).map(s=> s[0]? s[0].name : "").join(",")
      return {id:i.uuid, name:i.name, description:i.desc, products:linkToTextPbs}
    })
    JSONToCSVConvertor(data, 'PhysicalSpaces', true)

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

var physicalSpacesView = createWorkPhysicalSpacesView()
physicalSpacesView.init()
