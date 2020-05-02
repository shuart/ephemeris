var createPbsView = function () {
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
          items:store.currentPbs.items,
          links:store.currentPbs.links,
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
      {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:"true"},
      {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:"true"}
    ]

    extraFields = [
      {uuid:"name", prop:"name", displayAs:"Name", edit:"true"},
      {uuid:"desc", prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {uuid:"originNeed", prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:"true"},
      {uuid:"originFunction", prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:"true"},
      {uuid:"tags", prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true},
      {uuid:"category", prop:"category", displayAs:"Category", meta:()=>store.metaLinks.items, choices:()=>store.categories.items, edit:true},
      {uuid:"contains", prop:"contains",isTarget:true, displayAs:"Physical Spaces", meta:()=>store.metaLinks.items, choices:()=>store.physicalSpaces.items, edit:true},
      {uuid:"fakeInterfaces", prop:"fakeInterfaces", displayAs:"Interfaces", meta:()=>workarounds.generateLinksToInterfaceTargets(store.interfaces.items), choices:()=>store.currentPbs.items, customChoiceName:e=>e.target, dataIdIsLinkId:true,edit:false},//TODO clean as this is a bit of an hack
      {uuid:"WpOwn", prop:"WpOwn",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks.items, choices:()=>store.workPackages.items, edit:true},
      {uuid:"documents", prop:"documents", displayAs:"Documents", meta:()=>store.metaLinks.items, choices:()=>store.documents.items, edit:true}
    ]

    let storeSettings = store.settings.items.find(s=>s.type == "pbsListViewVisibleFields")
    if (storeSettings && storeSettings.value[0]) { //if store settings exist and array is populated
      displayRules = extraFields.filter(ef=> storeSettings.value.includes(ef.uuid))
      //displayRules = extraFields
    }
    return displayRules
  }

  var setDisplayOrder = function (store) {
    return ephHelpers.setDisplayOrder(store,"currentPbs")
  }

  var render = async function () {
    var store = await query.currentProject()
    console.log(store.currentPbs.items);
      currentVisibleList = showListMenu({
        sourceData:store.currentPbs.items,
        sourceLinks:store.currentPbs.links,
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
            ev.select.updateData(store.currentPbs.items)
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
              push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:ev.originTarget.dataset.id}))

            }
            // ev.select.updateData(store.currentPbs.items)
            // ev.select.updateLinks(store.currentPbs.links)
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
            push(addPbsLink({source:store.currentPbs.items[0].uuid, target:id}))
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
              let parent = store.currentPbs.links.find(l=>l.target == ev.target.dataset.id)
              if (parent) {
                push(act.addLink("currentPbs",{source:parent.source, target:uuid}))
              }else {
                push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:uuid}))
              }
            }
            ev.select.updateData(store.currentPbs.items)
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
            // ev.select.updateData(store.currentPbs.items)
            // ev.select.updateLinks(store.currentPbs.links)
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
              importCSVfromFileSelector(async function(results) {
                let startImport = confirm(results.data.length+" Products will be imported")
                if (startImport) {

                  // if (confirm("Use a custom importFuntion?")) {
                  if (true) {
                    // let importFunction = prompt("import function")
                    var popup= await createPromptPopup({
                      title:"Use a custom import function",
                      iconHeader:"dolly",
                      fields:{ type:"textArea",id:"customFunc" ,label:"Function", placeholder:"Write your custom function" }
                    })
                    let importFunction = popup.result
                    console.log(importFunction);
                    var preview = {items:[],links:[]}

                    function addItem (data) {
                      var id = genuuid()
                      // push(act.add("currentPbs", {uuid:data.uuid,name:data.name,desc:data.desc}))
                      // push(addPbsLink({source:store.currentPbs.items[0].uuid, target:id}))
                      preview.items.push({uuid:data.uuid,name:data.name,desc:data.desc})
                      return id
                    }
                    var addLink = function (data) {
                      var id = genuuid()
                      // push(addPbsLink({source:data.source, target:data.target}))
                      preview.links.push({source:data.source, target:data.target})
                      return id
                    }
                    var message = function (data) {
                      alert(data.message)
                    }
                    var getImportedData = function () {
                      return results.data
                    }
                    var getId = function () {
                      return genuuid()
                    }

                    var showPreview = function () {
                      currentVisibleList = showListMenu({
                        sourceData:preview.items,
                        sourceLinks:preview.links,
                        displayProp:"name",
                        display: [{prop:"name", displayAs:"Name", edit:"true"}],
                        idProp:"uuid"
                      })
                    }

                    var addToEphemeris = function () {
                      preview.items.forEach(i=>{
                        push(act.add("currentPbs", i))
                      })
                      preview.links.forEach(l=>{
                        push(addPbsLink(l))
                      })
                    }

                    let localApi ={
                      preview,
                      addItem,
                      addLink,
                      message,
                      getId,
                      getImportedData,
                      showPreview,
                      addToEphemeris
                    }

                    let importer = new Function('api', '"use strict";' + importFunction);

                    console.log(importer(localApi));
                    // var looseJsonParse = function(obj){
                    //     // return Function('"use strict";return (' + obj + ')')()(getImportedData,addItem,addLink,message);
                    //     return Function('api','"use strict";return (' + obj + ')')();
                    // }
                    // console.log(
                    //   looseJsonParse(
                    //    // "{a:(4-1), b:function(){}, c:new Date()}"
                    //    importFunction
                    //   )
                    // )

                  }else {
                    for (importedElement of results.data) {
                      var id = genuuid()
                      push(act.add("currentPbs", {uuid:id,name:importedElement[0],desc:importedElement[1]}))
                      push(addPbsLink({source:store.currentPbs.items[0].uuid, target:id}))
                    }
                  }



                  alert("Close and re-open the view to complete the import")
                }
              })

            }
          },
          {
            name:"Diagramme",
            action:(ev)=>{
              // showPbsTree(ev)
              showTreeFromListService.showByStoreGroup("currentPbs", function (e) {
                ev.select.updateData(store.currentPbs.items)
                ev.select.updateLinks(store.currentPbs.links)
                ev.select.update() //TODO find a better way
              })
            }
          }
        ]
      })
  }

  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.currentPbs.items.map(i=>{
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

  function generateExtraFieldsList(store) {
    if (isExtraFieldsVisible) {
      let extras = store.extraFields.items.filter(i=>(i.type == "currentPbs" && i.hidden != true)).map(f=>({prop:f.prop, displayAs:f.name, edit:"true"}))
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
    var newReq = prompt("add a new Field?")
    if (newReq) {
      let clearedName = "_"+slugify(newReq)+"_"+(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5));
      if (store.extraFields.items.filter(i=>i.prop == clearedName)[0]) {
        console.log(store.extraFields.items.filter(i=>i.prop == clearedName)[0]);
        alert("This field has already been registered")//in rare case where an identical field would be generated
      }
      if (true) {
        console.log('adding');
        push(act.add("extraFields",{name: newReq, prop:clearedName, type: "currentPbs"}))
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

var pbsView = createPbsView()
pbsView.init()
