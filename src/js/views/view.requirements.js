var createRequirementsView = function () {
  var self ={};
  var objectIsActive = false;
  var simpleView = true;
  var isExtraFieldsVisible =false;
  var extraFields = undefined
  var currentVisibleList = undefined

  var init = function () {
    connections()
    //update()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentVisibleList) {
        var store = await query.currentProject()
        ephHelpers.updateListElements(currentVisibleList,{
          items:store.requirements.items,
          links:store.requirements.links,
          metaLinks:store.metaLinks.items,
          displayRules:setDisplayRules(store)
        })
      }
    })
  }

  var setDisplayRules = function (store) {
    var displayRules = [
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
        {prop:"origin", displayAs:"Received from", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
        {prop:"originNeed",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true},
      ]

    extraFields = [
      {uuid:"name", prop:"name", displayAs:"Name", edit:"true"},
      {uuid:"desc", prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {uuid:"origin", prop:"origin", displayAs:"Received from", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
      {uuid:"originNeed", prop:"originNeed",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true},
      {uuid:"tags", prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true},
      {uuid:"WpOwnNeed", prop:"WpOwnNeed",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks.items, choices:()=>store.workPackages.items, edit:true},
      {uuid:"reqChangedBy", prop:"reqChangedBy", displayAs:"Changed by", meta:()=>store.metaLinks.items, choices:()=>store.changes.items, edit:true},
      {uuid:"documentsNeed", prop:"documentsNeed", displayAs:"Documents", droppable:true,meta:()=>store.metaLinks.items, choices:()=>store.documents.items, edit:true},
      {uuid:"vvReportNeed", prop:"vvReportNeed", isTarget:true, displayAs:"V&V", choiceStyle: (item) =>item.status=="Pass"? 'background-color:#21ba45 !important;':'background-color:#dd4b39 !important;', meta:()=>store.metaLinks.items, choices:()=>store.vvActions.items, edit:false}
    ]

    let storeSettings = store.settings.items.find(s=>s.type == "requirementsListViewVisibleFields")
    if (storeSettings && storeSettings.value[0]) { //if store settings exist and array is populated
      displayRules = extraFields.filter(ef=> storeSettings.value.includes(ef.uuid))
      //displayRules = extraFields
    }
    return displayRules
  }

  var setDisplayOrder = function (store) {
    return ephHelpers.setDisplayOrder(store,"requirements")
  }

  var render = async function () {
    var store = await query.currentProject()
      currentVisibleList = showListMenu({
        sourceData:store.requirements.items,
        sourceLinks:store.requirements.links,
        metaLinks:store.metaLinks.items,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:setDisplayRules(store),
        displayOrder:setDisplayOrder(store),
        extraFields: generateExtraFieldsList(store),
        idProp:"uuid",
        allowBatchActions:true,
        onEditItem: (ev)=>{
          createInputPopup({
            originalData:ev.target.dataset.value || "",
            onSave:e =>{
              push(editRequirement({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
              ev.select.refreshList()
            },
            onClose:e =>{
              push(editRequirement({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
              ev.select.refreshList()
            }
          })
        },
        onEditChoiceItem: (ev)=>{
          showUpdateLinksService.show(ev,"requirements")
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            push(removeRequirement({uuid:ev.target.dataset.id}))
            ev.select.updateData(store.requirements.items)
          }
        },
        onMove: (ev)=>{
          console.log("move");
          if (confirm("move item ?")) {
            push(act.move("requirements", {value:ev.newOrder}))
            //update links if needed
            push(removeRequirementLink({target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(addRequirementLink({source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }
            ev.select.updateData(store.requirements.items)
            ev.select.updateLinks(store.requirements.links)
          }
        },
        onAdd: (ev)=>{
          var newReq = prompt("New Need")
          push(addRequirement({name:newReq}))
        },
        onAddFromPopup: (ev)=>{
          var uuid = genuuid()
          var newReq = prompt("New Need")
          if (newReq) {
            push(act.add("requirements", {uuid:uuid,name:newReq}))
            if (ev.target && ev.target != "undefined") {
              push(act.move("requirements", {origin:uuid, target:ev.target.dataset.id}))
              //check for parenting
              let parent = store.requirements.links.find(l=>l.target == ev.target.dataset.id)
              if (parent) {
                push(act.addLink("requirements",{source:parent.source, target:uuid}))
              }
            }
            ev.select.updateData(store.requirements.items)
            ev.select.updateLinks(store.requirements.links)
          }
        },
        onAddFromExtraField: (ev)=>{
          addCustomField(function () {
            document.querySelector(".center-container").innerHTML=""//clean main view again because of tag. TODO find a better way
            update()
          })
        },
        onLabelClick: (ev)=>{
          showSingleItemService.showById(ev.target.dataset.id)
        },
        onClick: (ev)=>{
          showSingleItemService.showById(ev.target.dataset.id, function (e) {
            // ev.select.updateData(store.requirements.items)
            // ev.select.updateLinks(store.requirements.links)
            // ev.select.refreshList()
          })
        },
        extraActions:[
          {
            name:"CustomFields",
            action:(ev)=>{
              isExtraFieldsVisible = !isExtraFieldsVisible;
              setTimeout(function () {
                document.querySelector(".center-container").innerHTML=""//clean main view again because of tag. TODO find a better way
                update()
              }, 100);
              // ev.select.remove();
            }
          },
          {
            name:"Fields",
            action:(ev)=>{
              ephHelpers.startSelectionToShowFields(ev,extraFields, "requirementsListViewVisibleFields", "Visible Fields in Requirements list", function () {
                document.querySelector(".center-container").innerHTML=""//clean main view again because of tag. TODO find a better way
                update()
              })
            }
          },
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
                let startImport = confirm(results.data.length+" requirements will be imported")
                if (startImport) {
                  for (requirement of results.data) {
                    push(addRequirement({name:requirement[0], desc:requirement[1]}))
                  }
                  alert("Close and re-open the view to complete the import")
                }
              })

            }
          },
          {
            name:"Diagramme",
            action:(ev)=>{
              showTreeFromListService.showByStoreGroup("requirements", function (e) {
                ev.select.updateData(store.requirements.items)
                ev.select.updateLinks(store.requirements.links)
                ev.select.update() //TODO find a better way
              })
            }
          }
        ]
      })
  }

  var exportToCSV = async function () {
    let store = await query.currentProject()
    let data = store.requirements.items.map(i=>{
      let linkToText = getRelatedItems(store, i, "stakeholders", {metalinksType:"origin"}).map(s=> s.name? s.name +" "+s.lastName : "").join(",")
      let linkToTextPbs = getRelatedItems(store, i, "currentPbs",{objectIs:"target", metalinksType:"originNeed"}).map(s=> s.name? s.name : '').join(",")
      let linkToTextTags = getRelatedItems(store, i, "tags", {metalinksType:"tags"}).map(s=> s.name? s.name : "").join(",")
      let linkToTextWorkpackages = getRelatedItems(store, i, "workPackages",{objectIs:"target", metalinksType:"WpOwnNeed"}).map(s=> s.name? s.name : '').join(",")
      return {id:i.uuid, name:i.name, description:i.desc, stakeholders:linkToText, products:linkToTextPbs, tags:linkToTextTags, workPackages:linkToTextWorkpackages}
    })
    JSONToCSVConvertor(data, 'Requirements', true)

  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    isExtraFieldsVisible = false; //rest to avoid extra alert TODO find a better way
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  // async function startSelection(ev) {
  //   var store = await query.currentProject()
  //   var metalinkType = ev.target.dataset.prop;
  //   var sourceTriggerId = ev.target.dataset.id;
  //   var batch = ev.batch;
  //   var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
  //   var sourceGroup = undefined
  //   var sourceData = undefined
  //   var invert = false
  //   var source = "source"
  //   var target = "target"
  //   var sourceLinks= undefined
  //   var displayRules= undefined
  //   var showColoredIconsRule = undefined
  //   var prependContent=undefined
  //   var onLoaded = undefined
  //   if (metalinkType == "origin") {
  //     sourceGroup="stakeholders";
  //     sourceData=store.stakeholders.items
  //     showColoredIconsRule= lettersFromNames,
  //     displayRules = [
  //       {prop:"name", displayAs:"First Name", edit:false},
  //       {prop:"lastName", displayAs:"Last name", edit:false}
  //     ]
  //   }else if (metalinkType == "originNeed") {
  //     sourceGroup="currentPbs"
  //     invert = true;
  //     sourceData=store.currentPbs.items
  //     source = "target"//invert link order for after
  //     target = "source"
  //     sourceLinks=store.currentPbs.links
  //     displayRules = [
  //       {prop:"name", displayAs:"Name", edit:false},
  //       {prop:"desc", displayAs:"Description", fullText:true, edit:false}
  //     ]
  //   }else if (metalinkType == "tags") {
  //     sourceGroup="tags";
  //     sourceData=store.tags.items
  //     displayRules = [
  //       {prop:"name", displayAs:"Name", edit:false}
  //     ]
  //   }else if (metalinkType == "WpOwnNeed") {
  //     sourceGroup="workPackages"
  //     invert = true;
  //     source = "target"//invert link order for after
  //     target = "source"
  //     sourceLinks=store.workPackages.links
  //     sourceData=store.workPackages.items
  //     displayRules = [
  //       {prop:"name", displayAs:"Name", edit:false}
  //     ]
  //   }else if (metalinkType == "reqChangedBy") {
  //     sourceGroup="changes"
  //     sourceLinks=store.changes.links
  //     sourceData=store.changes.items
  //     displayRules = [
  //       {prop:"name", displayAs:"Name", edit:false},
  //       {prop:"desc", displayAs:"Description", edit:false}
  //     ]
  //   }else if (metalinkType == "documentsNeed") {
  //     if (typeof nw !== "undefined") {//if using node webkit
  //       prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`
  //       onLoaded = function (ev) {
  //         dropAreaService.setDropZone(".prepend", function () {
  //           ev.select.updateData(store.documents.items)
  //           ev.select.refreshList()
  //         })
  //       }
  //     }
  //     sourceGroup="documents"
  //     sourceLinks=store.documents.links
  //     sourceData=store.documents.items
  //     displayRules = [
  //       {prop:"name", displayAs:"Name", edit:false}
  //     ]
  //   }
  //   showListMenu({
  //     sourceData:sourceData,
  //     sourceLinks:sourceLinks,
  //     parentSelectMenu:ev.select ,
  //     multipleSelection:currentLinksUuidFromDS,
  //     displayProp:"name",
  //     searchable : true,
  //     display:displayRules,
  //     showColoredIcons:showColoredIconsRule,
  //     prependContent:prependContent,
  //     onLoaded:onLoaded,
  //     idProp:"uuid",
  //     onAdd:(ev)=>{//TODO experimental, replace with common service
  //       var uuid = genuuid()
  //       var linkUuid = genuuid()
  //       push(act.add(sourceGroup, {uuid:uuid,name:"Edit Item"}))
  //       if (sourceGroup == "currentPbs") {
  //         push(addPbsLink({uuid:linkUuid,source:query.currentProject().currentPbs.items[0].uuid, target:uuid}))
  //       }
  //       if (sourceGroup == "changes") {
  //         push(act.edit("changes",{uuid:uuid, prop:"createdAt", value:Date.now()}))
  //       }
  //       ev.select.setEditItemMode({
  //         item:store[sourceGroup].items.filter(e=> e.uuid == uuid)[0],
  //         onLeave: (ev)=>{
  //           push(act.remove(sourceGroup,{uuid:uuid}))
  //           if (sourceGroup == "currentPbs") {
  //             push(removePbsLink({target:uuid}))
  //           }
  //           ev.select.updateData(store[sourceGroup].items)
  //           ev.select.updateLinks(store[sourceGroup].links)
  //         }
  //       })
  //     },
  //     onEditItem: (ev)=>{
  //       var newValue = prompt("Edit Item",ev.target.dataset.value)
  //       if (newValue) {
  //         push(act.edit(sourceGroup, {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
  //       }
  //     },
  //     onCloseMenu: (ev)=>{
  //       console.log(ev.select);
  //       ev.select.getParent().refreshList()
  //     },
  //     onChangeSelect: (ev)=>{
  //       var changeProp = function (sourceTriggerId) {
  //         batchRemoveMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)
  //         batchAddMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)
  //
  //         ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
  //         ev.select.getParent().refreshList()
  //       }
  //       if (batch[0]) { //check if batch action is needed
  //         batch.forEach(function (sourceTriggerId) {
  //           changeProp(sourceTriggerId)
  //         })
  //       }else {
  //         changeProp(sourceTriggerId)
  //       }
  //     },
  //     onClick: (ev)=>{
  //       console.log("select");
  //     }
  //   })
  // }

  function generateExtraFieldsList(store) {
    if (isExtraFieldsVisible) {

      let extras = store.extraFields.items.filter(i=>(i.type == "requirements" && i.hidden != true)).map(f=>({prop:f.prop, displayAs:f.name, edit:"true"}))
      if (!extras[0]) {
        if (confirm("No custom Fields yet. Add one?")) {
          addCustomField()
          setTimeout(function () {
            document.querySelector(".center-container").innerHTML=""//TODO Why? should rest all
            update()
          }, 400);
        }else {
          isExtraFieldsVisible = false
        }
      }else {
        return extras
      }
    }else {
      return undefined
    }
  }
  function addCustomField(callback){
    var uuid = genuuid()
    var newReq = prompt("add a new Field?")
    if (newReq) {
      let clearedName = "_"+slugify(newReq)+"_"+(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5));
      if (store.extraFields.items.filter(i=>i.prop == clearedName)[0]) {
        console.log(store.extraFields.items.filter(i=>i.prop == clearedName)[0]);
        alert("This field has already been registered")//in rare case where an identical field would be generated
      }
      if (true) {
        push(act.add("extraFields",{name: newReq, prop:clearedName, type: "requirements"}))
      }else {//add to main item (only pbs)
        // push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:id}))
      }
    }
    if (callback) {
      callback()
    }
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var requirementsView = createRequirementsView()
requirementsView.init()
