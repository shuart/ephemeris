var createVvReport = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentReportUuid = undefined

  let theme = {
    menu : function () {
      return `
      <div class="ui mini menu">
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
    connect(".action_vv_report_close","click",(e)=>{
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
    mainEl.style.left= "10%";
    mainEl.style.padding = "50px";
    mainEl.style.overflow = "auto";
    // mainEl.style.left= "25%";
    var container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "90%"
    container.style.overflow = "auto"
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

  var renderSet =function (){
    var store = query.currentProject()
    let relevantSet = generateRelevantActions(currentReportUuid)
    let workSet = deepCopy(relevantSet)
    displayWorkSet(workSet, ".vvActionsArea")
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }

  //UTILS

  var generateRelevantActions = function (currentReportUuid) {
    var store = query.currentProject()
    return store.vvActions.items.filter(i=>i.sourceReport == currentReportUuid)
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
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"vvReportNeed", displayAs:"Related Requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false},
        {prop:"other", displayAs:"Shall Statement", edit:false},
        {prop:"other", displayAs:"Success Criteria", edit:false},
        {prop:"other", displayAs:"Verification Method", edit:false},
        {prop:"relatedObjects", displayAs:"Related Products", edit:false},
        {prop:"relatedObjects", displayAs:"Related Products", edit:false},
        {prop:"result", displayAs:"Result", edit:true},
        {prop:"status", displayAs:"Status", edit:true}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("vvActions", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          ev.select.updateData(generateRelevantActions(currentReportUuid))
        }
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("vvActions",{uuid:ev.target.dataset.id}))
          ev.select.updateData(generateRelevantActions(currentReportUuid))
        }
      },
      onAdd: (ev)=>{
        let definitionName = prompt("New Defintion")
        push(act.add("vvActions",{uuid:genuuid(), sourceReport:currentReportUuid, name:definitionName, color:"#ffffff"}))
        ev.select.updateData(generateRelevantActions(currentReportUuid))
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
      }
    })
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
