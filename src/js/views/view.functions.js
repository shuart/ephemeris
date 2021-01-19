var createFunctionsView = function () {
  var self ={};
  var objectIsActive = false;
  var isExtraFieldsVisible = false
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
          items:store.functions,
          links:store.links,
          metaLinks:store.metaLinks,
          displayRules:setDisplayRules(store)
        })
      }
    })
  }

  var setDisplayRules = function (store) {
    var displayRules = [
      {prop:"name", displayAs:"Name", edit:"true"},
      {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks, choices:()=>store.requirements, edit:"true"},
      {prop:"originFunction",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks, choices:()=>store.currentPbs, edit:true}
    ]

    extraFields = [
      {prop:"name", displayAs:"Name", edit:"true"},
      {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks, choices:()=>store.requirements, edit:"true"},
      {prop:"originFunction",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks, choices:()=>store.currentPbs, edit:true}
    ]

    // let storeSettings = store.settings.find(s=>s.type == "requirementsListViewVisibleFields")
    // if (storeSettings && storeSettings.value[0]) { //if store settings exist and array is populated
    //   displayRules = extraFields.filter(ef=> storeSettings.value.includes(ef.uuid))
    //   //displayRules = extraFields
    //}
    return displayRules
  }

  var setDisplayOrder = function (store) {
    return ephHelpers.setDisplayOrder(store,"functions")
  }

  var render = async function () {
      var store = await query.currentProject()
      currentVisibleList = showListMenu({
        sourceData:store.functions,
        sourceLinks:store.links,
        metaLinks:store.metaLinks,
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
              push(act.edit("functions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            },
            onClose:e =>{
              push(act.edit("functions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            }
          })

        },
        onEditChoiceItem: (ev)=>{
          showUpdateLinksService.show(ev,"functions")
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            push(act.remove("functions",{uuid:ev.target.dataset.id}))
            // ev.select.updateData(store.functions)
          }
        },
        onMove: (ev)=>{
          console.log("move");
          if (confirm("move item ?")) {
            // let currentDisplayOrder =  ephHelpers.setDisplayOrder(store,"functions")
            //let newDisplayOrder = moveElementInArray (currentDisplayOrder, ev.originTarget.dataset.id, ev.target.dataset.id)
            push(act.move("functions", {value:ev.newOrder}))
            // var sourceItem = storeGroup.filter((item)=>item.uuid == pl.origin)[0]
            // var targetItem = storeGroup.filter((item)=>item.uuid == pl.target)[0]
            // storeGroup = moveElementInArray(storeGroup,sourceItem,targetItem)
            //console.log(newDisplayOrder);


            //update links if needed
            push(act.removeLink("functions",{target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(act.addLink("functions",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }
            //ev.select.updateData(store.functions)
            //ev.select.updateLinks(store.links)
          }
        },
        onAdd: async (ev)=>{
          //var newReq = prompt("Nouveau Besoin")
          var popup= await createPromptPopup({
            title:"Add a new Function",
            iconHeader:"cogs",
            fields:{ type:"input",id:"functionName" ,label:"Function name", placeholder:"Set a name for the new Function" }
          })
          var newReq = popup.result
          push(act.add("functions", {name:newReq}))
          // var uuid = genuuid()
          // push(act.add("functions", {uuid:uuid,name:"Add a function"}))
          // console.log(ev);
          // ev.select.setEditItemMode({
          //     item:store.functions.filter(e=> e.uuid == uuid)[0],
          //     onLeave: (ev)=>{
          //       push(act.remove("functions",{uuid:uuid}))
          //       ev.select.updateData(store.functions)
          //     }
          //   }
          // )
        },
        onAddFromPopup: (ev)=>{
          var uuid = genuuid()
          var newReq = prompt("New Function")
          if (newReq) {
            push(act.add("functions", {uuid:uuid,name:newReq}))
            if (ev.target && ev.target != "undefined") {
              push(act.move("functions", {origin:uuid, target:ev.target.dataset.id}))
              //check for parenting
              let parent = store.links.find(l=>l.target == ev.target.dataset.id)
              console.log(parent);

              if (parent) {
                push(act.addLink("functions",{source:parent.source, target:uuid}))
              }
            }else {//add to main item (only pbs)
              // push(addPbsLink({source:query.currentProject().currentPbs[0].uuid, target:id}))
            }
            ev.select.updateData(store.functions)
            ev.select.updateLinks(store.links)
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
            // ev.select.updateData(store.functions)
            // ev.select.updateLinks(store.links)
            // ev.select.refreshList()
          })
        },
        extraActions:[
          // {
          //   name:"CustomFields",
          //   action:(ev)=>{
          //     isExtraFieldsVisible = !isExtraFieldsVisible;
          //     setTimeout(function () {
          //       document.querySelector(".center-container").innerHTML=""//clean main view again because of tag. TODO find a better way
          //       update()
          //     }, 100);
          //     // ev.select.remove();
          //   }
          // },
          {
            name:"Export",
            action:(ev)=>{
              exportToCSV()
            }
          },
          {
            name:"Import",
            action:(ev)=>{
              createImportTableWithScriptService("functions")
            }
          },
          {
            name:"Diagramme",
            action:(ev)=>{
              showTreeFromListService.showByStoreGroup("functions", function (e) {
                ev.select.updateData(store.functions)
                ev.select.updateLinks(store.links)
                ev.select.update() //TODO find a better way
              })
            }
          }
        ]
      })
  }


  var exportToCSV = async function () {
    let store = await query.currentProject()
    let data = store.functions.map(i=>{
      let linkToText = getRelatedItems(store, i, "requirements").map(s=> s.name ? s.name:'').join(",")
      let linkToTextPbs = getRelatedItems(store, i, "currentPbs",{objectIs:"target", metalinksType:"originFunction"}).map(s=> s.name? s.name : '').join(",")
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
      let extras = store.extraFields.filter(i=>(i.type == "functions" && i.hidden != true)).map(f=>({prop:f.prop, displayAs:f.name, edit:"true"}))
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
      if (store.extraFields.filter(i=>i.prop == clearedName)[0]) {
        console.log(store.extraFields.filter(i=>i.prop == clearedName)[0]);
        alert("This field has already been registered")//in rare case where an identical field would be generated
      }
      if (true) {
        console.log('adding');
        push(act.add("extraFields",{name: newReq, prop:clearedName, type: "functions"}))
      }else {//add to main item (only pbs)
        // push(addPbsLink({source:query.currentProject().currentPbs[0].uuid, target:id}))
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
