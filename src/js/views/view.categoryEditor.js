var createCategoryEditorView = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentActionUuid = undefined
  let sourceOccElement = undefined
  let catID = undefined

  let theme = {
    menu : function (action) {
      return `
      <div class="ui mini menu">

        <div class="right menu">
          <div class="item">
              <div class="ui red button action_current_user_close">close</div>
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

    connect(".action_current_user_edit_item","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      if (newValue) {
        editCurrentUserItem(e.target.dataset.prop, newValue)
      }
      sourceOccElement.remove()
      update()
    })
    connect(".action_add_extra_field","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      if (newValue) {
        push(act.add("extraFields", {target:e.target.dataset.id, name:newValue, type:"text"}))
      }
      sourceOccElement.remove()
      update()
    })

    connect(".action_current_user_close","click",(e)=>{
      sourceOccElement.remove()
    })


    //
    // connect(".action_current_user_select_item_assigned","click",(e)=>{
    //   var metalinkType = e.target.dataset.prop;
    //   var sourceTriggerId = e.target.dataset.id;
    //   var projectStore = query.items("projects").filter(i=>i.uuid == e.target.dataset.project)[0];
    //   var metaLinks = query.items("projects").filter(i=>i.uuid == e.target.dataset.project)[0].metaLinks;
    //   var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)
    //   showListMenu({
    //     sourceData:projectStore.stakeholders,
    //     parentSelectMenu:e.select ,
    //     multipleSelection:currentLinksUuidFromDS,
    //     displayProp:"name",
    //     searchable : true,
    //     display:[
    //       {prop:"name", displayAs:"Name", edit:false},
    //       {prop:"desc", displayAs:"Description", edit:false}
    //     ],
    //     idProp:"uuid",
    //     onCloseMenu: (ev)=>{
    //       sourceOccElement.remove()
    //       update()
    //     },
    //     onChangeSelect: (ev)=>{
    //       console.log(ev.select.getSelected());
    //       console.log(projectStore.metaLinks);
    //       projectStore.metaLinks = projectStore.metaLinks.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
    //       for (newSelected of ev.select.getSelected()) {
    //         projectStore.metaLinks.push({type:metalinkType, source:sourceTriggerId, target:newSelected})//TODO remove this side effect
    //       }
    //       console.log(projectStore.metaLinks);
    //       saveDB()
    //       sourceOccElement.remove()
    //       update()
    //     },
    //     onClick: (ev)=>{
    //       console.log("select");
    //     }
    //   })
    // })
  }

  var render = async function (uuid) {
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
    mainEl.style.width = "50%"
    mainEl.style.maxHeight = "90%"
    mainEl.style.left= "25%";
    mainEl.style.padding = "50px";
    mainEl.style.overflow = "auto";
    // mainEl.style.left= "25%";
    var container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "90%"
    container.style.overflow = "auto"

    var menuArea = document.createElement("div");

    // menuArea.appendChild(saveButton)

    sourceOccElement.appendChild(dimmer)
    sourceOccElement.appendChild(mainEl)
    mainEl.appendChild(menuArea)
    mainEl.appendChild(container)

    menuArea.appendChild(toNode(renderMenu()))
    container.appendChild(toNode(await renderProfile(catID)))

    document.body.appendChild(sourceOccElement)

  }

  var renderProfile = async function (uuid){

    var store = await query.currentProject()
    var cat = store.categories.find(i=>i.uuid == uuid)
    let fieldsHtml = store.extraFields.filter(i=>i.target == cat.uuid).map(e=> `<div>Name:${e.name}, type:${e.type}</div><div class="ui divider"></div>`)

    let html =`
    <h2 class="header">
      My profile
    </h2>
    <div data-id="${cat.uuid}" class="ui segment">
      <div class="content">
        <h3 class="header">First name</h3>
        ${cat.name}
        <i data-prop="userFirstName" data-value="${cat.name}" data-id="${cat.name}" class="edit icon action_current_user_edit_item" style="opacity:0.2"></i>

        <div class="ui divider"></div>
        ADD<i data-prop="userFirstName" data-value="${cat.name}" data-id="${cat.uuid}" class="edit icon action_add_extra_field" style="opacity:0.2"></i>



        <div class="ui divider"></div>
        ${fieldsHtml}
      </div>
    </div>
    <div class="ui divider"></div>
    `
    return html
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }







  var update = function (uuid) {
    if (uuid) {
      catID= uuid
    }
      render()
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

var categoryEditorView = createCategoryEditorView()
categoryEditorView.init()
// createInputPopup({originalData:jsonFile})
