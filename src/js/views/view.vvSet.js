var createVvSet = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentSetUuid = undefined

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
    mainEl.style.width = "75%"
    mainEl.style.maxHeight = "90%"
    mainEl.style.left= "12%";
    mainEl.style.padding = "50px";
    mainEl.style.overflow = "auto";
    // mainEl.style.left= "25%";
    var container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "90%"
    container.style.overflow = "auto"
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
    return theme.menu()
  }

  //UTILS

  var generateRelevantSet = function (currentSetUuid) {
    var store = query.currentProject()
    return store.vvDefinitions.items.filter(i=>i.sourceSet == currentSetUuid)
  }

  var displayWorkSet = function (workSet, container) {
    showListMenu({
      sourceData:workSet,
      displayProp:"name",
      targetDomContainer:container,
      fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"color", displayAs:"Color", edit:"true"}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("tags", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("tags",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.tags.items)
        }
      },
      onAdd: (ev)=>{
        let definitionName = prompt("New Defintion")
        push(act.add("vvDefinitions",{uuid:genuuid(), sourceSet:currentSetUuid, name:definitionName, color:"#ffffff"}))
        ev.select.updateData(generateRelevantSet(currentSetUuid))
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
