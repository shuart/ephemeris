var createWorkPhysicalSpacesView = function () {
  var self ={};
  var objectIsActive = false;
  var isExtraFieldsVisible = false
  var extraFields = undefined
  var currentVisibleList = undefined

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentVisibleList) {
        var store = await query.currentProject()
        ephHelpers.updateListElements(currentVisibleList,{
          items:store.physicalSpaces,
          links:store.links,
          metaLinks:store.metaLinks,
          displayRules:setDisplayRules(store)
        })
      }
    })
  }

  var setDisplayRules = function (store) {
    var displayRules = [
      {prop:"name", displayAs:"Name", edit:true},
      {prop:"desc", displayAs:"Description", fullText:true, edit:true},
      {prop:"contains", displayAs:"Products contained", meta:()=>store.metaLinks, choices:()=>store.currentPbs, edit:true}
    ]
    return displayRules
  }

  var setDisplayOrder = function (store) {
    return ephHelpers.setDisplayOrder(store,"physicalSpaces")
  }

  var render = async function () {
    var store = await query.currentProject()
    currentVisibleList = showListMenu({
      sourceData:store.physicalSpaces,
      sourceLinks:store.links,
      displayProp:"name",
      targetDomContainer:".center-container",
      fullScreen:true,// TODO: perhaps not full screen?
      display:setDisplayRules(store),
      displayOrder:setDisplayOrder(store),
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
          ev.select.updateData(store.physicalSpaces)
        }
      },
      onMove: (ev)=>{
        console.log("move");
        if (confirm("move item ?")) {
          push(act.move("physicalSpaces", {value:ev.newOrder}))
          //update links if needed
          push(act.removeLink("physicalSpaces",{target:ev.originTarget.dataset.id}))
          if (ev.targetParentId && ev.targetParentId != "undefined") {
            push(act.addLink("physicalSpaces",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
          }
          ev.select.updateData(store.physicalSpaces)
          ev.select.updateLinks(store.links)
        }
      },
      onAdd: async (ev)=>{
        var popup= await createPromptPopup({
          title:"Add a new Physical Space",
          iconHeader:"building",
          fields:{ type:"input",id:"functionName" ,label:"Physical Space name", placeholder:"Set a name for the new Physical Space" }
        })
        var physicalSpaces = popup.result
        push(act.add("physicalSpaces",{uuid:genuuid(), name:physicalSpaces}))
      },
      onAddFromPopup: (ev)=>{
        var uuid = genuuid()
        var newPhysicalSpaces = prompt("New Physical Space")
        if (newPhysicalSpaces) {
          push(act.add("physicalSpaces", {uuid:uuid,name:newPhysicalSpaces}))
          if (ev.target && ev.target != "undefined") {
            push(act.move("physicalSpaces", {origin:uuid, target:ev.target.dataset.id}))
            //check for parenting
            let parent = store.links.find(l=>l.target == ev.target.dataset.id)
            if (parent) {
              push(act.addLink("physicalSpaces",{source:parent.source, target:uuid}))
            }
          }
          ev.select.updateData(store.physicalSpaces)
          ev.select.updateLinks(store.links)
        }
      },
      onEditChoiceItem: (ev)=>{
        showUpdateLinksService.show(ev,"physicalSpaces")
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
      },
      onClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          // ev.select.updateData(store.physicalSpaces)
          // ev.select.updateLinks(store.links)
          // ev.select.refreshList()
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
            createImportTableWithScriptService("physicalSpaces")
          }
        },
        {
          name:"Diagramme",
          action:(ev)=>{
            showTreeFromListService.showByStoreGroup("physicalSpaces", function (e) {
              ev.select.updateData(store.physicalSpaces)
              ev.select.updateLinks(store.links)
              ev.select.update() //TODO find a better way
            })
          }
        }
      ]
    })
  }


  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.physicalSpaces.map(i=>{
      let linkToTextPbs = getRelatedItems(store, i, "currentPbs", {metalinksType:"contains"}).map(s=> s.name? s.name : "").join(",")
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
