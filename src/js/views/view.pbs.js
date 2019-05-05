var createPbsView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()
    //update()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    console.log(store.currentPbs.items);
      showListMenu({
        sourceData:store.currentPbs.items,
        sourceLinks:store.currentPbs.links,
        metaLinks:store.metaLinks.items,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"name", edit:"true"},
          {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
          {prop:"originNeed", displayAs:"Lié aux besoins", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:"true"},
          {prop:"originFunction", displayAs:"Lié a la fonction", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:"true"}
        ],
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
          push(addPbs({uuid:id, name:newReq}))
          push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:id}))
        },
        onClick: (ev)=>{
          showSingleItem(ev)
        },
        onClear: (ev)=>{
          renderCDC()
        },
        extraActions:[
          {
            name:"Diagramme",
            action:(ev)=>{
              showPbsTree(ev)
            }
          }
        ]
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
    objectIsActive = false;
  }

  function showSingleItem(ev) {
    var store = query.currentProject()
    var originItem = store.currentPbs.items.filter(e=> e.uuid == ev.target.dataset.id)
    showListMenu({
      sourceData:store.currentPbs.items,
      sourceLinks:store.currentPbs.links,
      metaLinks:store.metaLinks.items,
      parentSelectMenu:ev.select ,
      displayProp:"name",
      searchable : false,
      singleElement:originItem[0],
      rulesToDisplaySingleElement:[
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
        {prop:"origin", displayAs:"Reçu de", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false},
        {prop:"originFunction", displayAs:"Lié a la fonction", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:true}
      ],
      display:[
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true,edit:false},
        {prop:"origin", displayAs:"Reçu de", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false},
        {prop:"originFunction", displayAs:"Lié a la fonction", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:false}
      ],
      idProp:"uuid",
      onCloseMenu: (ev)=>{
        //console.log("fefsefse");
        console.log(ev.select);
        ev.select.getParent().updateMetaLinks(store.metaLinks.items)
        ev.select.getParent().updateData(store.currentPbs.items)
        ev.select.getParent().updateLinks(store.currentPbs.links)
        ev.select.getParent().refreshList()
      },
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(editPbs({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onEditTextItem: (ev)=>{
        push(editPbs({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.value}))
      },
      onEditChoiceItem: (ev)=>{
        startSelection(ev)
      }
    })
  }

  function startSelection(ev) {
    var store = query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceData = undefined
    if (metalinkType == "originNeed") {
      sourceData=store.requirements.items
    }else if (metalinkType == "originFunction") {
      sourceData=store.functions.items
    }
    showListMenu({
      sourceData:sourceData,
      parentSelectMenu:ev.select ,
      multipleSelection:currentLinksUuidFromDS,
      displayProp:"name",
      searchable : true,
      display:[
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ],
      idProp:"uuid",
      onCloseMenu: (ev)=>{
        console.log(ev.select);
        ev.select.getParent().refreshList()
      },
      onChangeSelect: (ev)=>{
        console.log(ev.select.getSelected());
        console.log(store.metaLinks.items);
        store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
        console.log(store.metaLinks.items);
        for (newSelected of ev.select.getSelected()) {
          push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
        }
        ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
        ev.select.getParent().refreshList()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  function showPbsTree(sourceList) {
    var store = query.currentProject()
    var tree = renderDTree(store.db)
    console.log(tree);
    var data =undefined
    if (store.currentPbs.items[0]) {
      data = hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0]
      console.log(data);
    }
    displayThree({
      data:data,
      edit:true,
      onClose:(e)=>{
        renderCDC()
        // sourceList.select.updateData(store.currentPbs.items)
        // sourceList.select.updateLinks(store.currentPbs.links)
        sourceList.select.update()
      },
      onAdd:(ev)=>{
        var uuid = genuuid()
        var newName = prompt("Name?")
        push(addPbs({uuid:uuid, name:newName}))
        push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
        ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
        //ev.sourceTree.updateFromRoot(ev.element)
      },
      onMove:(ev)=>{
        push(removePbsLink({source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))
        push(addPbsLink({source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
        ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
      },
      onRemove:(ev)=>{
        if (confirm("Keep Childs?")) {
          var originalLinks = store.currentPbs.links.filter(e=>e.source == ev.element.data.uuid)
          for (link of originalLinks) {
            push(addPbsLink({source:ev.element.parent.data.uuid, target:link.target}))
          }
        }
        //remove all links
        push(removePbsLink({source:ev.element.data.uuid}))
        //addNewLinks
        push(removePbs({uuid:ev.element.data.uuid}))
        //push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
        ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
      },
      onNodeClicked:(originev)=>{
        var originItem = store.currentPbs.items.filter(e=> e.uuid == originev.element.data.uuid)
        showListMenu({
          sourceData:store.currentPbs.items,
          sourceLinks:store.currentPbs.links,
          metaLinks:store.metaLinks.items,
          displayProp:"name",
          searchable : false,
          singleElement:originItem[0],
          rulesToDisplaySingleElement:[
            {prop:"name", displayAs:"Name", edit:"true"},
            {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
            {prop:"origin", displayAs:"Reçu de", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true}
          ],
          display:[
            {prop:"name", displayAs:"Name", edit:false},
            {prop:"desc", displayAs:"Description", fullText:true,edit:false},
            {prop:"origin", displayAs:"Reçu de", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false}
          ],
          idProp:"uuid",
          onCloseMenu: (ev)=>{
            //console.log("fefsefse");
            console.log(originev.sourceTree);
            // ev.select.getParent().update()
            originev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
            originev.sourceTree.hardUpdate()//TODO find better way
          },
          onEditChoiceItem: (ev)=>{
            var metalinkType = ev.target.dataset.prop;
            var sourceTriggerId = ev.target.dataset.id;
            var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
            console.log(ev.selectDiv);
            //ev.selectDiv.remove()
            showListMenu({
              sourceData:store.requirements.items,
              parentSelectMenu:ev.select ,
              multipleSelection:currentLinksUuidFromDS,
              displayProp:"name",
              searchable : true,
              display:[
                {prop:"name", displayAs:"Name", edit:false},
                {prop:"desc", displayAs:"Description", fullText:true, edit:false}
              ],
              idProp:"uuid",
              onCloseMenu: (ev)=>{
                console.log(ev.select);
                ev.select.getParent().refreshList()
              },
              onChangeSelect: (ev)=>{
                console.log(ev.select.getSelected());
                console.log(store.metaLinks.items);
                store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
                console.log(store.metaLinks.items);
                for (newSelected of ev.select.getSelected()) {
                  push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
                }
                ev.select.getParent().updateMetaLinks(store.metaLinks.items)
                ev.select.getParent().refreshList()
              },
              onClick: (ev)=>{
                console.log("select");
              }
            })
          },
          onEditItem: (ev)=>{
            console.log("Edit");
            var newValue = prompt("Edit Item",ev.target.dataset.value)
            if (newValue) {
              push(editPbs({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
            }
            ev.select.refreshList()
          }
        })
      }
    })
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var pbsView = createPbsView()
pbsView.init()
