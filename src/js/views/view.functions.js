var createFunctionsView = function () {
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
          {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:"true"}
        ],
        idProp:"uuid",
        onEditItem: (ev)=>{
          console.log("Edit");
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            push(act.edit("functions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          }
        },
        onEditChoiceItem: (ev)=>{
          var metalinkType = ev.target.dataset.prop;
          var sourceTriggerId = ev.target.dataset.id;
          var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
          showListMenu({
            sourceData:store.requirements.items,
            sourceLinks:store.requirements.links,
            parentSelectMenu:ev.select ,
            multipleSelection:currentLinksUuidFromDS,
            displayProp:"name",
            searchable : true,
            display:[
              {prop:"name", displayAs:"Name", edit:false},
              {prop:"desc", displayAs:"Description",fullText:true, edit:false}
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
        onLabelClick: (ev)=>{
          showSingleItemService.showById(ev.target.dataset.id)
        },
        onClick: (ev)=>{
          var originItem = store.functions.items.filter(e=> e.uuid == ev.target.dataset.id)
          showListMenu({
            sourceData:store.functions.items,
            sourceLinks:store.functions.links,
            metaLinks:store.metaLinks.items,
            parentSelectMenu:ev.select ,
            displayProp:"name",
            searchable : false,
            singleElement:originItem[0],
            rulesToDisplaySingleElement:[
              {prop:"name", displayAs:"Name", edit:"true"},
              {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
              {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false}
            ],
            display:[
              {prop:"name", displayAs:"Name", edit:false},
              {prop:"desc", displayAs:"Description", fullText:true, edit:false},
              {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false}
            ],
            idProp:"uuid",
            onCloseMenu: (ev)=>{
              //console.log("fefsefse");
              console.log(ev.select);
              ev.select.getParent().update()
            },
            onEditItem: (ev)=>{
              console.log("Edit");
              var newValue = prompt("Edit Item",ev.target.dataset.value)
              if (newValue) {
                push(act.edit("functions",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
              }
            }
          })
        },
        extraActions:[
          {
            name:"Diagramme",
            action:(ev)=>{
              renderGraph(ev)
            }
          },
          {
            name:"CSV",
            action:(ev)=>{
              exportToCSV()
            }
          }
        ]
      })
  }

  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.functions.items.map(i=>{
      let linkToText = getRelatedItems(i, "requirements").map(s=> s[0] ? s[0].name:'').join(",")
      return {id:i.uuid, name:i.name, description:i.desc, Requirements:linkToText}
    })
    JSONToCSVConvertor(data, 'Functions', true)
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

  var renderGraph = function (ev) {
    var store = query.currentProject()
    if (true) {
      function generateDataSource() {
        var placeholder = false
        var data =undefined
        if (store.functions.items[0]) {
          var targets = store.functions.links.map(item => item.target)
          var roots = store.functions.items.filter(item => !targets.includes(item.uuid))
          if (roots && roots[1]) {//if more than one root node
            placeholder = true
            var newData = store.functions.items.slice()
            var newLinks = store.functions.links.slice()
            newData.push({uuid:"placeholder", name:"placeholder"})
            for (root of roots) {
              newLinks.push({source:"placeholder", target:root.uuid})
            }
            data = hierarchiesList(newData, newLinks)[0]
          }else {
            data = hierarchiesList(store.functions.items, store.functions.links)[0]
          }
          console.log(data);
        }
        return data
      }

      displayThree({
        data:generateDataSource(),
        edit:true,
        onClose:(e)=>{
          renderCDC()
          renderCDC()
          ev.select.update() //TODO find a better way
        },
        onAdd:(ev)=>{
          var uuid = genuuid()
          var newName = prompt("Name?")
          push(act.add("functions",{uuid:uuid, name:newName}))
          push(act.addLink("functions",{source:ev.element.data.uuid, target:uuid}))
          ev.sourceTree.setData(generateDataSource())
          //ev.sourceTree.updateFromRoot(ev.element)
        },
        onMove:(ev)=>{
          push(act.removeLink("functions",{source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))
          push(act.addLink("functions",{source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
          ev.sourceTree.setData(generateDataSource())
        },
        onRemove:(ev)=>{
          if (confirm("Keep Childs?")) {
            var originalLinks = store.functions.links.filter(e=>e.source == ev.element.data.uuid)
            for (link of originalLinks) {
              push(act.addLink({source:ev.element.parent.data.uuid, target:link.target}))
            }
          }
          //remove all links
          push(act.removeLink("functions",{source:ev.element.data.uuid}))
          //addNewLinks
          push(act.remove("functions",{uuid:ev.element.data.uuid}))
          //push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
          ev.sourceTree.setData(generateDataSource())
        },
        onLabelClicked:(originev)=>{
          showSingleItemService.showById(originev.element.data.uuid)
        },
        onStoreUpdate:(originev)=>{
          originev.sourceTree.setData(generateDataSource())
        }
      })
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
