var createRequirementsView = function () {
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
      {prop:"name", displayAs:"Name", edit:"true"},
      {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
      {prop:"origin", displayAs:"Received from", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
      {prop:"originNeed",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true},
      {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:true}
    ]
    if (simpleView) {
      displayRules = [
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", fullText:true, edit:"true"},
        {prop:"origin", displayAs:"Received from", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true},
        {prop:"originNeed",isTarget:true, displayAs:"linked to", meta:()=>store.metaLinks.items, choices:()=>store.currentPbs.items, edit:true},
      ]
    }

    var store = query.currentProject()
      showListMenu({
        sourceData:store.requirements.items,
        sourceLinks:store.requirements.links,
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
          startSelection(ev)
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
            push(moveRequirement({origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
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
          var originItem = store.requirements.items.filter(e=> e.uuid == ev.target.dataset.id)
          showListMenu({
            sourceData:store.requirements.items,
            sourceLinks:store.requirements.links,
            metaLinks:store.metaLinks.items,
            parentSelectMenu:ev.select ,
            displayProp:"name",
            searchable : false,
            singleElement:originItem[0],
            rulesToDisplaySingleElement:[
              {prop:"name", displayAs:"Name", edit:"true"},
              {prop:"desc", displayAs:"Description", edit:"true"},
              {prop:"origin", displayAs:"Reçu de", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:false}
            ],
            display:[
              {prop:"name", displayAs:"Name", edit:false},
              {prop:"desc", displayAs:"Description", edit:false},
              {prop:"origin", displayAs:"Reçu de", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:false}
            ],
            idProp:"uuid",
            onCloseMenu: (ev)=>{
              //console.log("fefsefse");
              console.log(ev.select);
              ev.select.getParent().refreshList()
            },
            onEditItem: (ev)=>{
              console.log("Edit");
              var newValue = prompt("Edit Item",ev.target.dataset.value)
              if (newValue) {
                push(editRequirement({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
              }
            }
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
            name:"Tags",
            action:(ev)=>{
              simpleView = !simpleView;
              setTimeout(function () {
                document.querySelector(".center-container").innerHTML=""//clean main view again because of tag. TODO find a better way
                update()
              }, 1000);
              // ev.select.remove();
            }
          },
          {
            name:"Diagramme",
            action:(ev)=>{
              renderRequirementsTree(ev)
            }
          }
        ]
      })
  }

  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.requirements.items.map(i=>{
      let linkToText = getRelatedItems(i, "stakeholders", {metalinksType:"origin"}).map(s=> s[0]? s[0].name +" "+s[0].lastName : "").join(",")
      let linkToTextTags = getRelatedItems(i, "tags", {metalinksType:"tags"}).map(s=> s[0]? s[0].name : "").join(",")
      let linkToTextWorkpackages = getRelatedItems(i, "workPackages",{objectIs:"target", metalinksType:"WpOwnNeed"}).map(s=> s[0]? s[0].name : '').join(",")
      return {id:i.uuid, name:i.name, description:i.desc, stakeholders:linkToText, tags:linkToTextTags, workPackages:linkToTextWorkpackages}
    })
    JSONToCSVConvertor(data, 'Requirements', true)

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

  var renderRequirementsTree = function (ev) {
    var store = query.currentProject()
    if (true) {
      function generateDataSource() {
        var placeholder = false
        var data =undefined
        if (store.requirements.items[0]) {
          var targets = store.requirements.links.map(item => item.target)
          var roots = store.requirements.items.filter(item => !targets.includes(item.uuid))
          if (roots && roots[1]) {//if more than one root node
            placeholder = true
            var newData = store.requirements.items.slice()
            var newLinks = store.requirements.links.slice()
            newData.push({uuid:"placeholder", name:"placeholder"})
            for (root of roots) {
              newLinks.push({source:"placeholder", target:root.uuid})
            }
            data = hierarchiesList(newData, newLinks)[0]
          }else {
            data = hierarchiesList(store.requirements.items, store.requirements.links)[0]
          }
          console.log(data);
        }
        return data
      }

      displayThree({
        data:generateDataSource(),
        edit:true,
        onClose:(e)=>{
          ev.select.updateData(store.requirements.items)
          ev.select.updateLinks(store.requirements.links)
          ev.select.update() //TODO find a better way

        },
        onAdd:(ev)=>{
          var uuid = genuuid()
          var newName = prompt("Name?")
          push(addRequirement({uuid:uuid, name:newName}))
          if (ev.element.data.uuid != "placeholder") {
            push(addRequirementLink({source:ev.element.data.uuid, target:uuid}))
          }
          ev.sourceTree.setData(generateDataSource())
          //ev.sourceTree.updateFromRoot(ev.element)
        },
        onMove:(ev)=>{
          push(removeRequirementLink({source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))
          if (ev.newParent.data.uuid != "placeholder") {
            push(act.addLink("requirements",{source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
          }
          ev.sourceTree.setData(generateDataSource())
        },
        onRemove:(ev)=>{
          if (confirm("Keep Childs?")) {
            var originalLinks = store.requirements.links.filter(e=>e.source == ev.element.data.uuid)
            for (link of originalLinks) {
              push(addRequirementLink({source:ev.element.parent.data.uuid, target:link.target}))
            }
          }
          //remove all links
          push(removeRequirementLink({source:ev.element.data.uuid}))
          //addNewLinks
          push(removeRequirement({uuid:ev.element.data.uuid}))
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

  function startSelection(ev) {
    var store = query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceData = undefined
    var invert = false
    var source = "source"
    var target = "target"
    var sourceLinks= undefined
    var displayRules= undefined
    if (metalinkType == "origin") {
      sourceData=store.stakeholders.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"lastName", displayAs:"Last name", edit:false}
      ]
    }else if (metalinkType == "originNeed") {
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
      onCloseMenu: (ev)=>{
        console.log(ev.select);
        ev.select.getParent().refreshList()
      },
      onChangeSelect: (ev)=>{
        store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l[source] == sourceTriggerId && currentLinksUuidFromDS.includes(l[target])))
        for (newSelected of ev.select.getSelected()) {
          if (!invert) {
            push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
          }else {
            push(act.add("metaLinks",{type:metalinkType, source:newSelected, target:sourceTriggerId}))
          }
        }
        ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
        ev.select.getParent().refreshList()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  function generateExtraFieldsList() {
    if (isExtraFieldsVisible) {
      var store = query.currentProject()
      let extras = store.extraFields.items.filter(i=>(i.type == "requirements" && i.hidden != false)).map(f=>({prop:f.prop, displayAs:f.name, edit:"true"}))
      if (!extras[0]) {
        addCustomField()
        setTimeout(function () {
          document.querySelector(".center-container").innerHTML=""//TODO Why? should rest all
          update()
        }, 400);
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
