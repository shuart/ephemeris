var createDocumentsView = function () {
  var self ={};
  var objectIsActive = false;
  var currentVisibleList = undefined

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentVisibleList) {
        var store = await query.currentProject()
        ephHelpers.updateListElements(currentVisibleList,{
          items:store.documents.items,
          metaLinks:store.metaLinks.items,
          displayRules:displayRules(store)
        })
      }
    })

  }

  var displayRules = function (store) {
    return [
      {prop:"name", displayAs:"Name", edit:true},
      {prop:"osPath", displayAs:"Local", fullText:true, localPath:true, edit:false},
      {prop:"link", displayAs:"Link", fullText:true, link:true, edit:true},
      {prop:"documents",isTarget:true, displayAs:"Products", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true},
      {prop:"documentsNeed",isTarget:true, displayAs:"requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true}

      // {prop:"documented", displayAs:"Products documented", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:false},
      // {prop:"documented", displayAs:"Requirements documented", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false}
    ]
  }

  var render = async function () {
    var store = await query.currentProject()
    let prependContent =undefined;
    let onLoaded =undefined;

    if (typeof nw !== "undefined") {//if using node webkit
      prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`
      onLoaded = function (ev) {
        dropAreaService.setDropZone(".prepend", function () {
          ev.select.updateData(store.documents.items)
          ev.select.refreshList()
          setTimeout(function () {
            ev.select.scrollDown()
          }, 1500);
        })
      }
    }

    currentVisibleList = showListMenu({
      sourceData:store.documents.items,
      displayProp:"name",
      targetDomContainer:".center-container",
      fullScreen:true,// TODO: perhaps not full screen?
      prependContent:prependContent,
      onLoaded:onLoaded,
      display:displayRules(store),
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("documents", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          let item = store.documents.items.find(i=>i.uuid == ev.target.dataset.id)
          //delete from db or FS
          if (item && item.osPath) {
            if (typeof nw !== "undefined" && link) {//if using node webkit
              deleteFromOs(item.osPath)//if nwjs
            }
          }

          //delete from list
          push(act.remove("documents",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.documents.items)

        }
      },
      onAdd: async (ev)=>{
        var popup= await createPromptPopup({
          title:"Add a new Document",
          iconHeader:"book",
          fields:[
            { type:"input",id:"docName" ,label:"Document Name", placeholder:"Set the document name" },
            { type:"input",id:"documentLink" ,label:"Document link", placeholder:"Set a web link to the file",optional:true }
          ]
        })
        if (!popup) {
          return undefined
        }
        let docName = popup.result.docName
        let docLink = popup.result.documentLink
        push(act.add("documents",{uuid:genuuid(), name:docName, link:docLink}))
      },
      onEditChoiceItem: (ev)=>{
        startSelection(ev)
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
      },
      onClick: (ev)=>{
        // showSingleItemService.showById(ev.target.dataset.id, function (e) {
        //   ev.select.updateData(store.workPackages.items)
        //   ev.select.updateLinks(store.workPackages.links)
        //   ev.select.refreshList()
        // })
      },
      extraActions:generateExtraActions()
    })
  }

  var generateExtraActions = function () {
    if (typeof nw !== "undefined") {//if using node webkit
      return [{
        name:"Folder",
        action:(ev)=>{
          let osDoc = query.currentProject().documents.items.find(i=>i.osPath)
          if (osDoc) {
            nw.Shell.showItemInFolder(osDoc.osPath);
          }else {
            alert("No local documents yet")
          }
        }
      }]
    }else {
      return []
    }
  }

  var deleteFromOs = function (path) {
    if (confirm('Delete file at '+path)) {
      let fs = require('fs');
      fs.unlink(path, (err) => {
        if (err) throw err;
        console.log(path+' was deleted');
      });
    }
  }



  // var exportToCSV = function () {
  //   let store = query.currentProject()
  //   let data = store.workPackages.items.map(i=>{
  //     let linkToTextsh = getRelatedItems(store, i, "stakeholders",{objectIs:"source", metalinksType:"assignedTo"}).map(s=> s[0]? s[0].name +" "+s[0].lastName : "").join(",")
  //     let linkToTextPbs = getRelatedItems(store, i, "currentPbs",{objectIs:"source", metalinksType:"WpOwn"}).map(s=> s[0]? s[0].name : '').join(",")
  //     let linkToTextReq = getRelatedItems(store, i, "requirements",{objectIs:"source", metalinksType:"WpOwnNeed"}).map(s=> s[0]? s[0].name : '').join(",")
  //
  //
  //     return {id:i.uuid, name:i.name, Owner:linkToTextsh, requirements:linkToTextReq, Products: linkToTextPbs}
  //   })
  //   JSONToCSVConvertor(data, 'Pbs', true)
  // }

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
    }else if (metalinkType == "documentsNeed") {
      sourceGroup="requirements"
      invert = true;
      sourceData=store.requirements.items
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.requirements.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ]
    }else if (metalinkType == "documents") {
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

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    currentVisibleList = undefined;
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var documentsView = createDocumentsView()
documentsView.init()
