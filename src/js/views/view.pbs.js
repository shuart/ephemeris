var createPbsView = function () {
  var self ={};
  var objectIsActive = false;
  var simpleView = true;
  var isExtraFieldsVisible =false;
  var extraFields = undefined
  var currentVisibleList = undefined
  var table = undefined
  var tableComp = undefined
  var treeMode = true

  var init = function () {
    connections()
    tableComp = createTableComp()
    //update()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && table) {
        var store = await query.currentProject()
        let data = getData(store)
        table.updateData(data)


        // ephHelpers.updateListElements(currentVisibleList,{
        //   items:store.currentPbs,
        //   links:store.links,
        //   metaLinks:store.metaLinks,
        //   displayRules:setDisplayRules(store)
        // })
      }
    })
  }

  var setDisplayRules = function (store) {
    var displayRules = [
      {prop:"name", displayAs:"Name", edit:"true"},
      {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks, choices:()=>store.requirements, edit:"true"},
      {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks, choices:()=>store.functions, edit:"true"}
    ]

    extraFields = [
      {uuid:"name", prop:"name", displayAs:"Name", edit:"true"},
      {uuid:"desc", prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {uuid:"originNeed", prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks, choices:()=>store.requirements, edit:"true"},
      {uuid:"originFunction", prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks, choices:()=>store.functions, edit:"true"},
      {uuid:"tags", prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks, choices:()=>store.tags, edit:true},
      {uuid:"category", prop:"category", displayAs:"Category", meta:()=>store.metaLinks, choices:()=>store.categories, edit:true},
      {uuid:"contains", prop:"contains",isTarget:true, displayAs:"Physical Spaces", meta:()=>store.metaLinks, choices:()=>store.physicalSpaces, edit:true},
      {uuid:"fakeInterfaces", prop:"fakeInterfaces", displayAs:"Interfaces", meta:()=>workarounds.generateLinksToInterfaceTargets(store.interfaces), choices:()=>store.currentPbs, customChoiceName:e=>e.target, dataIdIsLinkId:true,edit:false},//TODO clean as this is a bit of an hack
      {uuid:"WpOwn", prop:"WpOwn",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks, choices:()=>store.workPackages, edit:true},
      {uuid:"documents", prop:"documents", displayAs:"Documents", meta:()=>store.metaLinks, choices:()=>store.documents, edit:true}
    ]

    let storeSettings = store.settings.find(s=>s.type == "pbsListViewVisibleFields")
    if (storeSettings && storeSettings.value[0]) { //if store settings exist and array is populated
      displayRules = extraFields.filter(ef=> storeSettings.value.includes(ef.uuid))
      //displayRules = extraFields
    }
    let customFields = store.extraFields.filter(s=>s.linkedTo == "currentPbs")
    if (customFields && customFields[0]) { //if store settings exist and array is populated
      displayRules = displayRules.concat(ephHelpers.formatCustomFields(customFields))
      //displayRules = extraFields
    }
    return displayRules
  }

  var setDisplayOrder = function (store) {
    return ephHelpers.setDisplayOrder(store,"currentPbs")
  }

  var getData = function (store, typeId) {
    let nodes =  store.currentPbs
    if (treeMode) {

      nodes = tableComp.tools.hierarchiesList(nodes, store.links)
    }
    return nodes
  }


  var render = async function () {
    var store = await query.currentProject()
    let data = getData(store)
    let columns = [
      // {formatter:'action', formatterParams:{name:"test"}, width:40, hozAlign:"center", cellClick:function(e, cell){alert("Printing row data for: " + cell.getRow().getData().name)}},
      {title:"Name", field:"name", editor:"modalInput"},
      {title:"Description", field:"desc", formatter:"textarea", editor:"modalInput"}
      // {title:"Name", field:"name", editor:"input"}
    ]
    let addAction = async function () {
      var popup= await createPromptPopup({
        title:"Add a new item",
        iconHeader:"plus",
        fields:{ type:"input",id:"requirementName" ,label:"Item name", placeholder:"Set a name for the new item" }
      })
      var newReq = popup.result
      let id = genuuid()
      push(act.add("currentPbs",{uuid:id,name:newReq}))
    }
    let categoryField = {
      title:"Category",
      formatter:'relation',
      cellClick:function (event, cell) {
        console.log(event);
        if (event.target.dataset.id) {
          showSingleItemService.showById(event.target.dataset.id)
        }else {
          createEditRelationPopup(cell.getRow().getData().uuid,e.relationId,store.interfaces.filter(i=>i.typeId==e.relationId),store.currentPbs)
        }
      },
      formatterParams:{
        relationList:store.metaLinks.filter(i=>i.type=="category"),
        relationTargets: store.categories
      },
      field:"category",
      editor:"modalRelation"
    }
    columns.push(categoryField)
    let tagsField = {
      title:"Tags",
      formatter:'relation',
      cellClick:function (event, cell) {
        console.log(event);
        if (event.target.dataset.id) {
          showSingleItemService.showById(event.target.dataset.id)
        }else {
          createEditRelationPopup(cell.getRow().getData().uuid,e.relationId,store.interfaces.filter(i=>i.typeId==e.relationId),store.currentPbs)
        }
      },
      formatterParams:{
        relationList:store.metaLinks.filter(i=>i.type=="tags"),
        relationTargets: store.tags
      },
      field:"tags",
      editor:"modalRelation"
    }
    columns.push(tagsField)

    let showTreeAction = function () {
      showTreeFromListService.showAll(undefined, function (e) {
      })
    }

    let menu = [
      {type:'action', name:"Add", color:"#29b5ad", onClick:e=>{addAction()}},
      {type:'action', name:"Tree", color:"grey", onClick:e=>{showTreeAction()}},
      {type:'search', name:"Add", color:"grey"}
    ]
    table = tableComp.create({data:data, columns:columns, menu:menu, dataTree:treeMode})

  }

  var renderLegacy = async function () {
    var store = await query.currentProject()
    console.log(store.currentPbs);
      currentVisibleList = showListMenu({
        sourceData:store.currentPbs,
        sourceLinks:store.links,
        metaLinks:store.metaLinks,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:setDisplayRules(store),
        displayOrder:setDisplayOrder(store),
        idProp:"uuid",
        allowBatchActions:true,
        onEditItem: (ev)=>{
          createInputPopup({
            originalData:ev.target.dataset.value || "",
            onSave:e =>{
              push(editPbs({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
              ev.select.refreshList()
            },
            onClose:e =>{
              push(editPbs({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
              ev.select.refreshList()
            }
          })
          // console.log("Edit");
          // var newValue = prompt("Edit Item",ev.target.dataset.value)
          // if (newValue) {
          //   push(editPbs({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          // }
        },
        onEditChoiceItem: (ev)=>{
          // startSelection(ev)
          showUpdateLinksService.show(ev,"currentPbs")
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            push(removePbs({uuid:ev.target.dataset.id}))
            push(removePbsLink({target:ev.target.dataset.id}))
            ev.select.updateData(store.currentPbs)
          }
        },
        onMove: (ev)=>{
          console.log("move");
          if (confirm("move item ?")) {
            // push(movePbs({origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
            push(act.move("currentPbs", {value:ev.newOrder}))
            //update links if needed
            push(removePbsLink({target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(addPbsLink({source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }else {
              push(addPbsLink({source:query.currentProject().currentPbs[0].uuid, target:ev.originTarget.dataset.id}))

            }
            // ev.select.updateData(store.currentPbs)
            // ev.select.updateLinks(store.links)
          }
        },
        onAdd: async (ev)=>{
          var popup= await createPromptPopup({
            title:"Add a new product",
            iconHeader:"dolly",
            fields:{ type:"input",id:"producttName" ,label:"Product name", placeholder:"Set a name for the new product" }
          })
          var id = genuuid()
          var newReq = popup.result
          if (newReq) {
            push(addPbs({uuid:id, name:newReq}))
            push(addPbsLink({source:store.currentPbs[0].uuid, target:id}))
          }
        },
        onAddFromPopup: (ev)=>{
          var uuid = genuuid()
          var newReq = prompt("New Product")
          if (newReq) {
            push(act.add("currentPbs", {uuid:uuid,name:newReq}))
            if (ev.target && ev.target != "undefined") {
              push(act.move("currentPbs", {origin:uuid, target:ev.target.dataset.id}))
              //check for parenting
              let parent = store.links.find(l=>l.target == ev.target.dataset.id)
              if (parent) {
                push(act.addLink("currentPbs",{source:parent.source, target:uuid}))
              }else {
                push(addPbsLink({source:query.currentProject().currentPbs[0].uuid, target:uuid}))
              }
            }
            ev.select.updateData(store.currentPbs)
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
            // ev.select.updateData(store.currentPbs)
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
          // {
          //   name:"Extras",
          //   action:(ev)=>{
          //     simpleView = !simpleView;
          //     setTimeout(function () {
          //       document.querySelector(".center-container").innerHTML=""//clean main view again because of tag. TODO find a better way
          //       update()
          //     }, 200);
          //     // ev.select.remove();
          //   }
          // },
          {
            name:"Fields",
            action:(ev)=>{
                ephHelpers.startSelectionToShowFields(ev,extraFields, "pbsListViewVisibleFields", "Visible Fields in Product list", function () {
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
              createImportTableWithScriptService("currentPbs")
            }
          },
          {
            name:"Diagramme",
            action:(ev)=>{
              // showPbsTree(ev)
              showTreeFromListService.showByStoreGroup("currentPbs", function (e) {
                ev.select.updateData(store.currentPbs)
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
    let data = store.currentPbs.map(i=>{
      let linkToTextFunc = getRelatedItems(store, i, "functions").map(s=> s.name ? s.name:"").join(",")
      let linkToTextReq = getRelatedItems(store, i, "requirements").map(s=> s.name ? s.name:"").join(",")
      let linkToTextSpaces = getRelatedItems(store, i, "physicalSpaces",{objectIs:"target", metalinksType:"contains"}).map(s=> s.name? s.name : '').join(",")
      let linkToTextWorkpackages = getRelatedItems(store, i, "workPackages",{objectIs:"target", metalinksType:"WpOwn"}).map(s=> s.name? s.name : '').join(",")


      return {id:i.uuid, name:i.name, description:i.desc, functions:linkToTextFunc, requirements:linkToTextReq, physicalSpaces: linkToTextSpaces, workPackages:linkToTextWorkpackages}
    })
    console.log(data);
    JSONToCSVConvertor(data, 'Pbs', true)
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

  // function generateExtraFieldsList(store) {
  //   if (isExtraFieldsVisible) {
  //     let extras = store.extraFields.filter(i=>(i.type == "currentPbs" && i.hidden != true)).map(f=>({prop:f.prop, displayAs:f.name, edit:"true"}))
  //     if (!extras[0]) {
  //       if (confirm("No custom Fields yet. Add one?")) {
  //         addCustomField()
  //         setTimeout(function () {
  //           document.querySelector(".center-container").innerHTML=""//TODO Why? should rest all
  //           update()
  //         }, 400);
  //       }else {
  //         isExtraFieldsVisible = !isExtraFieldsVisible
  //       }
  //     }else {
  //       return extras
  //     }
  //   }else {
  //     return undefined
  //   }
  // }
  // function addCustomField(callback){
  //   var uuid = genuuid()
  //   var newReq = prompt("add a new Field?")
  //   if (newReq) {
  //     let clearedName = "_"+slugify(newReq)+"_"+(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5));
  //     if (store.extraFields.filter(i=>i.prop == clearedName)[0]) {
  //       console.log(store.extraFields.filter(i=>i.prop == clearedName)[0]);
  //       alert("This field has already been registered")//in rare case where an identical field would be generated
  //     }
  //     if (true) {
  //       console.log('adding');
  //       push(act.add("extraFields",{name: newReq, prop:clearedName, type: "currentPbs"}))
  //     }else {//add to main item (only pbs)
  //       // push(addPbsLink({source:query.currentProject().currentPbs[0].uuid, target:id}))
  //     }
  //   }
  //   if (callback) {
  //     callback()
  //   }
  // }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var pbsView = createPbsView()
pbsView.init()
