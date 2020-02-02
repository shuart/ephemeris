var createFunctionsView = function () {
  var self ={};
  var objectIsActive = false;
  var isExtraFieldsVisible = false

  var init = function () {
    connections()
    //update()

  }
  var connections =function () {

  }

  var render = async function () {
      var store = await query.currentProject()
      showListMenu({
        sourceData:store.functions.items,
        sourceLinks:store.functions.links,
        metaLinks:store.metaLinks.items,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"Name", edit:"true"},
          {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
          {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:"true"},
          {prop:"originFunction",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true}
        ],
        extraFields: generateExtraFieldsList(store),
        idProp:"uuid",
        allowBatchActions:true,
        onEditItem: (ev)=>{
          console.log("Edit");
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            push(act.edit("functions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          }
        },
        onEditChoiceItem: (ev)=>{
          showUpdateLinksService.show(ev,"functions")
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            push(act.remove("functions",{uuid:ev.target.dataset.id}))
            ev.select.updateData(store.functions.items)
          }
        },
        onMove: (ev)=>{
          console.log("move");
          if (confirm("move item ?")) {
            push(act.move("functions", {origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
            //update links if needed
            push(act.removeLink("functions",{target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(act.addLink("functions",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }
            ev.select.updateData(store.functions.items)
            ev.select.updateLinks(store.functions.links)
          }
        },
        onAdd: (ev)=>{
          //var newReq = prompt("Nouveau Besoin")
          var uuid = genuuid()
          push(act.add("functions", {uuid:uuid,name:"Add a function"}))
          console.log(ev);
          ev.select.setEditItemMode({
              item:store.functions.items.filter(e=> e.uuid == uuid)[0],
              onLeave: (ev)=>{
                push(act.remove("functions",{uuid:uuid}))
                ev.select.updateData(store.functions.items)
              }
            }
          )
        },
        onAddFromPopup: (ev)=>{
          var uuid = genuuid()
          var newReq = prompt("New Function")
          if (newReq) {
            push(act.add("functions", {uuid:uuid,name:newReq}))
            if (ev.target && ev.target != "undefined") {
              push(act.move("functions", {origin:uuid, target:ev.target.dataset.id}))
              //check for parenting
              let parent = store.functions.links.find(l=>l.target == ev.target.dataset.id)
              console.log(parent);

              if (parent) {
                push(act.addLink("functions",{source:parent.source, target:uuid}))
              }
            }else {//add to main item (only pbs)
              // push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:id}))
            }
            ev.select.updateData(store.functions.items)
            ev.select.updateLinks(store.functions.links)
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
            ev.select.updateData(store.functions.items)
            ev.select.updateLinks(store.functions.links)
            ev.select.refreshList()
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
            name:"Export",
            action:(ev)=>{
              exportToCSV()
            }
          },
          {
            name:"Import",
            action:(ev)=>{
              importCSVfromFileSelector(function (results) {
                let startImport = confirm(results.data.length+" Functions will be imported")
                if (startImport) {
                  for (importedElement of results.data) {
                    push(act.add("functions", {name:importedElement[0],desc:importedElement[1]}))
                  }
                  alert("Close and re-open the view to complete the import")
                }
              })

            }
          },
          {
            name:"Diagramme",
            action:(ev)=>{
              showTreeFromListService.showByStoreGroup("functions", function (e) {
                ev.select.updateData(store.functions.items)
                ev.select.updateLinks(store.functions.links)
                ev.select.update() //TODO find a better way
              })
            }
          }
        ]
      })
  }

  async function startSelection(ev) {
    var store = await query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var batch = ev.batch;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceGroup = undefined
    var sourceData = undefined
    var invert = false
    var source = "source"
    var target = "target"
    var sourceLinks= undefined
    var displayRules= undefined
    if (metalinkType == "originNeed") {
      sourceGroup="requirements";
      sourceData=store.requirements.items
      sourceLinks=store.requirements.links
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description",fullText:true, edit:false}
      ]
    }else if (metalinkType == "originFunction") {
      sourceGroup="currentPbs";
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
      sourceGroup="tags";
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
        var changeProp = function (sourceTriggerId) {
          batchRemoveMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)
          batchAddMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)

          ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
          ev.select.getParent().refreshList()
        }
        if (batch[0]) { //check if batch action is needed
          batch.forEach(function (sourceTriggerId) {
            changeProp(sourceTriggerId)
          })
        }else {
          changeProp(sourceTriggerId)
        }
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  var exportToCSV = async function () {
    let store = await query.currentProject()
    let data = store.functions.items.map(i=>{
      let linkToText = getRelatedItems(store, i, "requirements").map(s=> s[0] ? s[0].name:'').join(",")
      let linkToTextPbs = getRelatedItems(store, i, "currentPbs",{objectIs:"target", metalinksType:"originFunction"}).map(s=> s[0]? s[0].name : '').join(",")
      return {id:i.uuid, name:i.name, description:i.desc, Requirements:linkToText, Products:linkToTextPbs}
    })
    JSONToCSVConvertor(data, 'Functions', true)
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    isExtraFieldsVisible =false; //rest to avoid extra alert TODO find a better way
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  function generateExtraFieldsList(store) {
    if (isExtraFieldsVisible) {
      let extras = store.extraFields.items.filter(i=>(i.type == "functions" && i.hidden != true)).map(f=>({prop:f.prop, displayAs:f.name, edit:"true"}))
      if (!extras[0]) {
        if (confirm("No custom Fields yet. Add one?")) {
          addCustomField()
          setTimeout(function () {
            document.querySelector(".center-container").innerHTML=""//TODO Why? should rest all
            update()
          }, 400);
        }else {
          isExtraFieldsVisible = !isExtraFieldsVisible
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
    var newReq = prompt("add a new Fieldss?")
    if (newReq) {
      let clearedName = "_"+slugify(newReq)+"_"+(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5));
      if (store.extraFields.items.filter(i=>i.prop == clearedName)[0]) {
        console.log(store.extraFields.items.filter(i=>i.prop == clearedName)[0]);
        alert("This field has already been registered")//in rare case where an identical field would be generated
      }
      if (true) {
        console.log('adding');
        push(act.add("extraFields",{name: newReq, prop:clearedName, type: "functions"}))
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

var functionsView = createFunctionsView()
functionsView.init()
