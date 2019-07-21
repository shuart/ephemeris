var createPbsView = function () {
  var self ={};
  var objectIsActive = false;
  var simpleView = true;
  var isExtraFieldsVisible =false;

  var init = function () {
    connections()
    //update()

  }
  var connections =function () {

  }

  var render = function () {

    var displayRules = [
      {prop:"name", displayAs:"name", edit:"true"},
      {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:"true"},
      {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:"true"}
    ]
    if (!simpleView) {
      displayRules = [
        {prop:"name", displayAs:"name", edit:"true"},
        {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:"true"},
        {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:"true"},
        {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true},
        {prop:"contains",isTarget:true, displayAs:"Physical Spaces", meta:()=>store.metaLinks.items, choices:()=>store.physicalSpaces.items, edit:true}
      ]
    }


    var store = query.currentProject()
    console.log(store.currentPbs.items);
      showListMenu({
        sourceData:store.currentPbs.items,
        sourceLinks:store.currentPbs.links,
        metaLinks:store.metaLinks.items,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:displayRules,
        extraFields: generateExtraFieldsList(),
        idProp:"uuid",
        onEditItem: (ev)=>{
          createInputPopup({
            originalData:ev.target.dataset.value,
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
          startSelection(ev)
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            push(removePbs({uuid:ev.target.dataset.id}))
            ev.select.updateData(store.currentPbs.items)
          }
        },
        onMove: (ev)=>{
          console.log("move");
          if (confirm("move item ?")) {
            push(movePbs({origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
            //update links if needed
            push(removePbsLink({target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(addPbsLink({source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }
            ev.select.updateData(store.currentPbs.items)
            ev.select.updateLinks(store.currentPbs.links)
          }
        },
        onAdd: (ev)=>{
          var id = genuuid()
          var newReq = prompt("Nouveau Besoin")
          if (newReq) {
            push(addPbs({uuid:id, name:newReq}))
            push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:id}))
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
            ev.select.updateData(store.currentPbs.items)
            ev.select.updateLinks(store.currentPbs.links)
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
            name:"Extras",
            action:(ev)=>{
              simpleView = !simpleView;
              setTimeout(function () {
                document.querySelector(".center-container").innerHTML=""//clean main view again because of tag. TODO find a better way
                update()
              }, 200);
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
                let startImport = confirm(results.data.length+" Products will be imported")
                if (startImport) {
                  for (importedElement of results.data) {
                    var id = genuuid()
                    push(act.add("currentPbs", {uuid:id,name:importedElement[0],desc:importedElement[1]}))
                    push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:id}))
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
      let linkToTextFunc = getRelatedItems(i, "functions").map(s=> s[0] ? s[0].name:"").join(",")
      let linkToTextReq = getRelatedItems(i, "requirements").map(s=> s[0] ? s[0].name:"").join(",")
      let linkToTextSpaces = getRelatedItems(i, "physicalSpaces",{objectIs:"target", metalinksType:"contains"}).map(s=> s[0]? s[0].name : '').join(",")
      let linkToTextWorkpackages = getRelatedItems(i, "workPackages",{objectIs:"target", metalinksType:"WpOwn"}).map(s=> s[0]? s[0].name : '').join(",")


      return {id:i.uuid, name:i.name, description:i.desc, functions:linkToTextFunc, requirements:linkToTextReq, physicalSpaces: linkToTextSpaces, workPackages:linkToTextWorkpackages}
    })
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

  function startSelection(ev) {
    var store = query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var invert = false
    var source = "source"
    var target = "target"
    var sourceData = undefined
    var sourceLinks= undefined
    var displayRules=[
      {prop:"name", displayAs:"Name", edit:false},
      {prop:"desc", displayAs:"Description", fullText:true, edit:false}
    ]
    if (metalinkType == "originNeed") {
      sourceData=store.requirements.items
      sourceLinks= store.requirements.links
    }else if (metalinkType == "originFunction") {
      sourceData=store.functions.items
      sourceLinks=store.functions.links
    }else if (metalinkType == "tags") {
      sourceData=store.tags.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "contains") {
      invert = true;
      sourceData=store.currentPbs.items
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.physicalSpaces.links
      sourceData=store.physicalSpaces.items
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
        console.log(ev.select.getSelected());
        console.log(store.metaLinks.items);
        store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l[source] == sourceTriggerId && currentLinksUuidFromDS.includes(l[target])))
        console.log(store.metaLinks.items);
        for (newSelected of ev.select.getSelected()) {
          if (!invert) {
            push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
          }else {
            push(act.add("metaLinks",{type:metalinkType, source:newSelected, target:sourceTriggerId}))
          }
          // push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
        }
        ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
        ev.select.getParent().refreshList()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  // function showPbsTree(sourceList) {
  //   var store = query.currentProject()
  //   var tree = renderDTree(store.db)
  //   console.log(tree);
  //   var data =undefined
  //   if (store.currentPbs.items[0]) {
  //     data = hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0]
  //     console.log(data);
  //   }
  //   displayThree({
  //     data:data,
  //     edit:true,
  //     onClose:(e)=>{
  //       renderCDC()
  //       sourceList.select.update()
  //       sourceList.select.updateData(store.currentPbs.items)
  //       sourceList.select.updateLinks(store.currentPbs.links)
  //       sourceList.select.refreshList()
  //     },
  //     onAdd:(ev)=>{
  //       var uuid = genuuid()
  //       var newName = prompt("Name?")
  //       push(addPbs({uuid:uuid, name:newName}))
  //       push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
  //       ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
  //       //ev.sourceTree.updateFromRoot(ev.element)
  //     },
  //     onMove:(ev)=>{
  //       push(removePbsLink({source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))
  //       push(addPbsLink({source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
  //       ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
  //
  //     },
  //     onRemove:(ev)=>{
  //       if (confirm("Keep Childs?")) {
  //         var originalLinks = store.currentPbs.links.filter(e=>e.source == ev.element.data.uuid)
  //         for (link of originalLinks) {
  //           push(addPbsLink({source:ev.element.parent.data.uuid, target:link.target}))
  //         }
  //       }
  //       //remove all links
  //       push(removePbsLink({source:ev.element.data.uuid}))
  //       //addNewLinks
  //       push(removePbs({uuid:ev.element.data.uuid}))
  //       //push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
  //       ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
  //     },
  //     onLabelClicked:(originev)=>{
  //       showSingleItemService.showById(originev.element.data.uuid)
  //     },
  //     onStoreUpdate:(originev)=>{
  //       originev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
  //     }
  //   })
  // }

  function generateExtraFieldsList() {
    if (isExtraFieldsVisible) {
      var store = query.currentProject()
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
