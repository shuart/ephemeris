var createWorkPackagesView = function () {
  var self ={};
  var objectIsActive = false;
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
          items:store.workPackages,
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
      {prop:"assignedTo", displayAs:"Assigned to", meta:()=>store.metaLinks, choices:()=>store.stakeholders, edit:true},
      {prop:"WpOwn", displayAs:"Products Owned", meta:()=>store.metaLinks, choices:()=>store.currentPbs, edit:true},
      {prop:"WpOwnNeed", displayAs:"Requirements Owned", meta:()=>store.metaLinks, choices:()=>store.requirements, edit:true}
    ]
    return displayRules
  }

  var render = async function () {
    var store = await query.currentProject()
    currentVisibleList = showListMenu({
      sourceData:store.workPackages,
      displayProp:"name",
      targetDomContainer:".center-container",
      fullScreen:true,// TODO: perhaps not full screen?
      display:setDisplayRules(store),
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("workPackages", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("workPackages",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.workPackages)
        }
      },
      onAdd: async (ev)=>{
        var popup= await createPromptPopup({
          title:"Add a new Work Package",
          iconHeader:"briefcase",
          fields:{ type:"input",id:"wpName" ,label:"Work Package name", placeholder:"Set a name for the new Work Package" }
        })
        var workPackages = popup.result
        if (workPackages !="") {
          push(act.add("workPackages",{uuid:genuuid(), name:workPackages}))
        }

      },
      onEditChoiceItem: (ev)=>{
        showUpdateLinksService.show(ev,"workPackages")
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
      },
      onClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          ev.select.updateData(store.workPackages)
          ev.select.updateLinks(store.links)
          ev.select.refreshList()
        })
      },
      extraButtons : [
        {name:"Relations", class:"fuse", prop:"projectId", action: (orev)=>{
          console.log('fesfsefsef');
          pageManager.setActivePage("relations", {param:{context:"extract", uuid:orev.dataset.id}})//TODO should not call page ma,ager directly
        }}
      ],
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
    let data = store.workPackages.map(i=>{
      let linkToTextsh = getRelatedItems(store, i, "stakeholders",{objectIs:"source", metalinksType:"assignedTo"}).map(s=> s[0]? s[0].name +" "+s[0].lastName : "").join(",")
      let linkToTextPbs = getRelatedItems(store, i, "currentPbs",{objectIs:"source", metalinksType:"WpOwn"}).map(s=> s[0]? s[0].name : '').join(",")
      let linkToTextReq = getRelatedItems(store, i, "requirements",{objectIs:"source", metalinksType:"WpOwnNeed"}).map(s=> s[0]? s[0].name : '').join(",")


      return {id:i.uuid, name:i.name, Owner:linkToTextsh, requirements:linkToTextReq, Products: linkToTextPbs}
    })
    JSONToCSVConvertor(data, 'Pbs', true)
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

var workPackagesView = createWorkPackagesView()
workPackagesView.init()
