var createVvReport = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentReportUuid = undefined
  let currentReportList = undefined

  let theme = {
    menu : function () {
      return `
      <div class="ui mini secondary menu">
        <div class="item">

        </div>
        <div class="item">

        </div>
        <div class="right menu">
          <div class="item">
              <div class="ui red button action_vv_report_close">close</div>
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
    document.addEventListener("storeUpdated", async function () {
      console.log(objectIsActive,currentReportList);
      if (objectIsActive && currentReportList) {
        var store = await query.currentProject()
        let updatedWorkSet = await generateRelevantActions(currentReportUuid)
        console.log(updatedWorkSet);
        ephHelpers.updateListElements(currentReportList,{
          items:updatedWorkSet,
          metaLinks:store.metaLinks,
          displayRules:generateDisplayRules(store),
        })
      }
    })
    connect(".action_vv_report_close","click",(e)=>{
      objectIsActive = false;
      sourceOccElement.remove()
    })
  }

  var render = function (uuid) {
    objectIsActive = true;
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
    container.classList = "vvActionsArea"

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

  var renderSet = async function (){
    let relevantSet = await generateRelevantActions(currentReportUuid)
    // let workSet = deepCopy(relevantSet)
    console.log(relevantSet);
    displayWorkSet(relevantSet, ".vvActionsArea")
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }

  //UTILS

  var generateRelevantActions = async function (currentReportUuid) {
    var store = await query.currentProject()
    console.log(currentReportUuid)
    console.log(store.vvActions.filter(i=>i.sourceReport == currentReportUuid));
    return store.vvActions.filter(i=>i.sourceReport == currentReportUuid)
  }

  var generateDisplayRules = function (store) {
    return [
      {prop:"name", displayAs:"Name", edit:false},
      {prop:"vvReportNeed", displayAs:"Related Requirements", meta:()=>store.metaLinks, choices:()=>store.requirements, edit:false},
      {prop:"vvReportInterface", displayAs:"Related Interfaces", meta:()=>store.metaLinks, choices:()=>store.interfaces, edit:false},
      {prop:"shallStatement", displayAs:"Shall Statement", edit:false},
      {prop:"successCriteria", displayAs:"Success Criteria", edit:false},
      {prop:"verificationMethod", displayAs:"Verification Method", options:listOptions.vv_verification_type, edit:false},
      {prop:"documents", displayAs:"Documents",droppable:true,meta:()=>store.metaLinks, choices:()=>store.documents, edit:true},
      {prop:"result", displayAs:"Result", edit:true},
      {prop:"status", displayAs:"Status", options:listOptions.vv_status,edit:true}
    ]
  }

  var displayWorkSet = async function (workSet, container) {
    console.log(workSet);
    var store = await query.currentProject()
    currentReportList = showListMenu({
      sourceData:workSet,
      metaLinks:store.metaLinks,
      displayProp:"name",
      targetDomContainer:container,
      fullScreen:true,// TODO: perhaps not full screen?
      display:generateDisplayRules(store),
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("vvActions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          // ev.select.updateData(generateRelevantActions(currentReportUuid))
        }
      },
      onEditOptionsItem: (ev)=>{
        console.log("Edit_option");
          let newValue = ev.value
          push(act.edit("vvActions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          // ev.select.updateData(generateRelevantActions(currentReportUuid))
      },
      onEditChoiceItem: (ev)=>{
        startSelection(ev)
      },

      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("vvActions",{uuid:ev.target.dataset.id}))
          // ev.select.updateData(generateRelevantActions(currentReportUuid))
        }
      },
      onAdd: (ev)=>{
        let definitionName = prompt("New Defintion")
        push(act.add("vvActions",{uuid:genuuid(), sourceReport:currentReportUuid, name:definitionName, color:"#ffffff"}))
        // ev.select.updateData(generateRelevantActions(currentReportUuid))
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
          name:"Rename",
          action:(ev)=>{
            var store = query.currentProject()
            let currentReport = store.vvReports.find(s=>s.uuid == currentReportUuid)
            let newName = prompt("Change Report Name", currentReport.name)
            if (newName) {
              push(act.edit("vvReports", {uuid:currentReportUuid, prop:"name", value:newName}))

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
      sourceData=store.requirements
      sourceLinks= store.links
    }else if (metalinkType == "originFunction") {
      sourceGroup="functions"
      sourceData=store.functions
      sourceLinks=store.links
    }else if (metalinkType == "tags") {
      sourceGroup="tags"
      sourceData=store.tags
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "category") {
      sourceGroup="categories"
      sourceData=store.categories
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "contains") {
      sourceGroup="physicalSpaces"
      invert = true;
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.links
      sourceData=store.physicalSpaces
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "WpOwn") {
      sourceGroup="workPackages"
      invert = true;
      source = "target"//invert link order for after
      target = "source"
      sourceLinks=store.links
      sourceData=store.workPackages
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "vvDefinitionNeed") {
      sourceGroup="requirements"
      sourceLinks=store.links
      sourceData=store.requirements
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "vvDefinitionInterface") {
      sourceGroup="interfaces"
      sourceLinks=store.links
      sourceData=store.interfaces
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
            ev.select.updateData(store.documents)
            ev.select.refreshList()
          })
        }
      }
      sourceGroup="documents"
      sourceLinks=store.links
      sourceData=store.documents
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "documentsNeed") {
      sourceGroup="documents";
      prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`,
      onLoaded = function (ev) {
        dropAreaService.setDropZone(".prepend", function () {
          ev.select.updateData(store.documents)
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
          item:store[sourceGroup].filter(e=> e.uuid == uuid)[0],
          onLeave: (ev)=>{
            push(act.remove(sourceGroup,{uuid:uuid}))
            ev.select.updateData(store[sourceGroup])
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
          //store.metaLinks = store.metaLinks.filter(l=>!(l.type == metalinkType && l[source] == sourceTriggerId && currentLinksUuidFromDS.includes(l[target])))
          // for (newSelected of ev.select.getSelected()) {
          //   if (!invert) {
          //     push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
          //   }else {
          //     push(act.add("metaLinks",{type:metalinkType, source:newSelected, target:sourceTriggerId}))
          //   }
          //   // push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
          // }
          batchAddMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)

          // ev.select.getParent().updateMetaLinks(store.metaLinks)//TODO remove extra call
          // ev.select.getParent().refreshList()
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
    let data = generateRelevantActions(currentReportUuid).map(i=>{
      let linkToTextReq = getRelatedItems(store, i, "requirements", {metalinksType:"vvReportNeed"}).map(s=> s[0]? s[0].name : "").join(",")
      let linkToTextInt= getRelatedItems(store, i, "interfaces", {metalinksType:"vvReportInterface"}).map(s=> s[0]? s[0].name : "").join(",")
      let linkToTextVerif = listOptions.vv_verification_type[i.verificationMethod]? listOptions.vv_verification_type[i.verificationMethod].name:listOptions.vv_verification_type[0].name
      let linkToTextStatus = listOptions.vv_status[i.status] ? listOptions.vv_status[i.status].name : listOptions.vv_status[0].name
      return {id:i.uuid, name:i.name, ReportNeed:linkToTextReq, ReportInterface:linkToTextInt, shallStatement:i.shallStatement, successCriteria:i.successCriteria,verificationMethod:linkToTextVerif, result:i.result, Status:linkToTextStatus}
    })
    JSONToCSVConvertor(data, 'Report', true)
  }


  var update = function (uuid) {
    if (uuid) {
      currentReportUuid = uuid
      render(uuid)
    }else if(currentReportUuid) {
      render(currentReportUuid)
    }else {
      console.log("no set found");
      return
    }

  }

  var setActive =function () {
    objectIsActive = true;
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

var vvReport = createVvReport()
vvReport.init()
// createInputPopup({originalData:jsonFile})
