var createVvSet = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentSetUuid = undefined
  let currentSetGenerateBuffer = []
  let currentSetGenerateInterfaceBuffer = []

  let theme = {
    menu : function (name) {
      return `
      <div class="ui mini secondary menu">
        <div class="item">
          <h2>V&V plan, ${name?name:""}</h2>
        </div>
        <div class="item">

        </div>
        <div class="right menu">
          <div class="item">
              <div class="ui red button action_vv_set_close">close</div>
          </div>
        </div>
        </div>
      `
    }
  }



  var init = function () {
    connections()
  }
  var connections =function () {
    connect(".action_vv_set_close","click",(e)=>{
      sourceOccElement.remove()
    })
  }

  var render = function (uuid) {
    sourceOccElement = document.createElement('div');
    sourceOccElement.style.height = "100%"
    sourceOccElement.style.width = "100%"
    sourceOccElement.style.zIndex = "11"
    sourceOccElement.style.position = "fixed"

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer occurence-dimmer"
    var mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "9999999999"
    mainEl.style.backgroundColor = "white"

    mainEl.classList ="ui raised padded container segment"
    // mainEl.style.width = "50%"
    mainEl.style.width = "80%"
    mainEl.style.maxHeight = "90%"
    mainEl.style.height = "90%"
    mainEl.style.left= "10%";
    mainEl.style.padding = "50px";
    mainEl.style.overflow = "auto";
    // mainEl.style.left= "25%";
    var container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "90%"
    container.style.overflow = "hidden"
    container.classList = "vvDefinitionsArea"

    var menuArea = document.createElement("div");

    // menuArea.appendChild(saveButton)

    sourceOccElement.appendChild(dimmer)
    sourceOccElement.appendChild(mainEl)
    mainEl.appendChild(menuArea)
    mainEl.appendChild(container)

    menuArea.appendChild(toNode(renderMenu(uuid)))
    // container.appendChild(toNode(renderSet(uuid)))
    document.body.appendChild(sourceOccElement)
    renderSet()
  }

  var renderSet =function (){
    var store = query.currentProject()
    let relevantSet = generateRelevantSet(currentSetUuid)
    let workSet = deepCopy(relevantSet)
    displayWorkSet(workSet, ".vvDefinitionsArea")
  }
  var renderMenu =function (uuid){
    var store = query.currentProject()
    let currentSet = store.vvSets.items.find(s=>s.uuid == currentSetUuid)
    return theme.menu(currentSet.name)
  }

  //UTILS

  var generateRelevantSet = function (currentSetUuid) {
    var store = query.currentProject()
    return store.vvDefinitions.items.filter(i=>i.sourceSet == currentSetUuid)
  }

  var displayWorkSet = function (workSet, container) {
    var store = query.currentProject()
    showListMenu({
      sourceData:workSet,
      metaLinks:store.metaLinks.items,
      displayProp:"name",
      targetDomContainer:container,
      fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"vvDefinitionNeed", displayAs:"Related Requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"vvDefinitionInterface", displayAs:"Related Interface", meta:()=>store.metaLinks.items, choices:()=>store.interfaces.items, edit:true},
        {prop:"shallStatement", displayAs:"Shall Statement", edit:true},
        {prop:"successCriteria", displayAs:"Success Criteria", edit:true},
        {prop:"verificationMethod", displayAs:"Verification Method", options:listOptions.vv_verification_type, edit:true},
        {uuid:"documents", prop:"documents", displayAs:"Documents", meta:()=>store.metaLinks.items, choices:()=>store.documents.items, edit:true}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("vvDefinitions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          ev.select.updateData(generateRelevantSet(currentSetUuid))
        }
      },
      onEditOptionsItem: (ev)=>{
        console.log("Edit_option");
          let newValue = ev.value
          push(act.edit("vvDefinitions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          ev.select.updateData(generateRelevantSet(currentSetUuid))
      },
      onEditChoiceItem: (ev)=>{
        startSelection(ev)
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("vvDefinitions",{uuid:ev.target.dataset.id}))
          ev.select.updateData(generateRelevantSet(currentSetUuid))
        }
      },
      onAdd: (ev)=>{
        let definitionName = prompt("New Defintion")
        push(act.add("vvDefinitions",{uuid:genuuid(), sourceSet:currentSetUuid, name:definitionName, color:"#ffffff"}))
        ev.select.updateData(generateRelevantSet(currentSetUuid))
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
      },
      onClick: (ev)=>{
        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      },
      extraActions:[
        {
          name:"Export",
          action:(ev)=>{
            exportToCSV()
          }
        },
        {
          name:"Generate-Requirements",
          action:(ev)=>{
            generateFromRequirements()
          }
        },
        {
          name:"Generate-Interfaces",
          action:(ev)=>{
            generateFromInterfaces()
          }
        },
        {
          name:"Rename",
          action:(ev)=>{
            var store = query.currentProject()
            let currentSet = store.vvSets.items.find(s=>s.uuid == currentSetUuid)
            let newName = prompt("Change Set Name", currentSet.name)
            if (newName) {
              push(act.edit("vvSets", {uuid:currentSetUuid, prop:"name", value:newName}))
              setTimeout(function () {
                sourceOccElement.remove()
                update()
              }, 100);
            }
          }
        }
      ]
    })
  }

  function generateFromRequirements() {
    var store = query.currentProject()
    showListMenu({
      sourceData:store.requirements.items,
      sourceLinks:store.requirements.links,
      multipleSelection:currentSetGenerateBuffer,
      metaLinks:store.metaLinks.items,
      displayProp:"name",
      // targetDomContainer:container,
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}

      ],
      idProp:"uuid",
      onClick: (ev)=>{
      },
      onChangeSelect: (ev)=>{
        //prepare func to changeItems
        var changeProp = function (sourceTriggerId) {
          console.log(currentLinksUuidFromDS)
          currentSetGenerateBuffer = currentLinksUuidFromDS
        }
      },
      extraActions:[
        {
          name:"Create",
          action:(ev)=>{
            console.log(currentSetGenerateBuffer);
            // createListFromBuffer()
            currentSetGenerateBuffer.forEach(b=>{
              let id = genuuid()
              let relatedRequirement = store.requirements.items.find(r=>r.uuid == b)
              push(act.add("vvDefinitions",{
                uuid:id,
                sourceSet:currentSetUuid,
                name:relatedRequirement.name,
                shallStatement:relatedRequirement.desc || relatedRequirement.name,
                successCriteria:"Fulfill statement",
                color:"#ffffff"}))
              push(act.add("metaLinks",{type:"vvDefinitionNeed", source:id, target:b}))
            })
            sourceOccElement.remove()
            update()
          }
        }
      ]
    })
  }
  function generateFromInterfaces() {
    var store = query.currentProject()
    showListMenu({
      sourceData:store.interfaces.items,
      sourceLinks:store.interfaces.links,
      multipleSelection:currentSetGenerateInterfaceBuffer,
      metaLinks:store.metaLinks.items,
      displayProp:"name",
      // targetDomContainer:container,
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false},
        {prop:"type", displayAs:"Type", edit:false}

      ],
      idProp:"uuid",
      onClick: (ev)=>{
      },
      onChangeSelect: (ev)=>{
        //prepare func to changeItems
        var changeProp = function (sourceTriggerId) {
          console.log(currentLinksUuidFromDS)
          currentSetGenerateInterfaceBuffer = currentLinksUuidFromDS
        }
      },
      extraActions:[
        {
          name:"Create",
          action:(ev)=>{
            console.log(currentSetGenerateInterfaceBuffer);
            // createListFromBuffer()
            currentSetGenerateInterfaceBuffer.forEach(b=>{
              let id = genuuid()
              let relatedInterfaces = store.interfaces.items.find(r=>r.uuid == b)
              push(act.add("vvDefinitions",{
                uuid:id,
                sourceSet:currentSetUuid,
                name:relatedInterfaces.name,
                shallStatement:relatedInterfaces.desc || relatedInterfaces.name,
                successCriteria:"Fulfill statement",
                color:"#ffffff"}))
              push(act.add("metaLinks",{type:"vvDefinitionInterface", source:id, target:b}))
            })
            sourceOccElement.remove()
            update()
          }
        }
      ]
    })
  }




  function startSelection(ev) {
    var store = query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var batch = ev.batch;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceGroup = undefined
    var invert = false
    var source = "source"
    var target = "target"
    var sourceData = undefined
    var sourceLinks= undefined
    var displayRules=[
      {prop:"name", displayAs:"Name", edit:false},
      {prop:"desc", displayAs:"Description", fullText:true, edit:false}
    ]
    var prependContent=undefined
    var onLoaded = undefined
    if (metalinkType == "originNeed") {
      sourceGroup="requirements"
      sourceData=store.requirements.items
      sourceLinks= store.requirements.links
    }else if (metalinkType == "originFunction") {
      sourceGroup="functions"
      sourceData=store.functions.items
      sourceLinks=store.functions.links
    }else if (metalinkType == "tags") {
      sourceGroup="tags"
      sourceData=store.tags.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "category") {
      sourceGroup="categories"
      sourceData=store.categories.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "contains") {
      sourceGroup="physicalSpaces"
      invert = true;
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.physicalSpaces.links
      sourceData=store.physicalSpaces.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "WpOwn") {
      sourceGroup="workPackages"
      invert = true;
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.workPackages.links
      sourceData=store.workPackages.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "vvDefinitionNeed") {
      sourceGroup="requirements"
      sourceLinks=store.requirements.links
      sourceData=store.requirements.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "vvDefinitionInterface") {
      sourceGroup="interfaces"
      sourceLinks=store.interfaces.links
      sourceData=store.interfaces.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"type", displayAs:"Type", edit:false},
        {prop:"desc", displayAs:"Description", edit:false}
      ]
    }else if (metalinkType == "documents") {
      if (typeof nw !== "undefined") {//if using node webkit
        prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`
        onLoaded = function (ev) {
          dropAreaService.setDropZone(".prepend", function () {
            ev.select.updateData(store.documents.items)
            ev.select.refreshList()
          })
        }
      }
      sourceGroup="documents"
      sourceLinks=store.documents.links
      sourceData=store.documents.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "documentsNeed") {
      sourceGroup="documents";
      prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`,
      onLoaded = function (ev) {
        dropAreaService.setDropZone(".prepend", function () {
          ev.select.updateData(store.documents.items)
          ev.select.refreshList()
          setTimeout(function () {
            ev.select.scrollDown()
          }, 100);
        })
      },
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }
    showListMenu({
      sourceData:sourceData,
      sourceLinks:sourceLinks,
      parentSelectMenu:ev.select ,
      multipleSelection:currentLinksUuidFromDS,
      simpleMenuStyling:true,
      displayProp:"name",
      searchable : true,
      display:displayRules,
      prependContent:prependContent,
      onLoaded:onLoaded,
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
        //prepare func to changeItems
        var changeProp = function (sourceTriggerId) {
          console.log(currentLinksUuidFromDS)
          batchRemoveMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)
          //store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l[source] == sourceTriggerId && currentLinksUuidFromDS.includes(l[target])))
          // for (newSelected of ev.select.getSelected()) {
          //   if (!invert) {
          //     push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
          //   }else {
          //     push(act.add("metaLinks",{type:metalinkType, source:newSelected, target:sourceTriggerId}))
          //   }
          //   // push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
          // }
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

  var exportToCSV = function () {
    let store = query.currentProject()
    let data = generateRelevantSet(currentSetUuid).map(i=>{
      let linkToTextReq = getRelatedItems(i, "requirements", {metalinksType:"vvDefinitionNeed"}).map(s=> s[0]? s[0].name : "").join(",")
      let linkToTextInt= getRelatedItems(i, "interfaces", {metalinksType:"vvDefinitionInterface"}).map(s=> s[0]? s[0].name : "").join(",")
      let linkToTextVerif = listOptions.vv_verification_type[i.verificationMethod]? listOptions.vv_verification_type[i.verificationMethod].name:listOptions.vv_verification_type[0].name
      return {id:i.uuid, name:i.name, ReportNeed:linkToTextReq, ReportInterfaces:linkToTextInt, shallStatement:i.shallStatement, successCriteria:i.successCriteria,verificationMethod:linkToTextVerif}
    })
    JSONToCSVConvertor(data, 'V&V Set', true)
  }

  var update = function (uuid) {
    if (uuid) {
      currentSetUuid = uuid
      render(uuid)
    }else if(currentSetUuid) {
      render(currentSetUuid)
    }else {
      console.log("no set found");
      return
    }

  }

  var setActive =function () {
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }


  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var vvSet = createVvSet()
vvSet.init()
// createInputPopup({originalData:jsonFile})
