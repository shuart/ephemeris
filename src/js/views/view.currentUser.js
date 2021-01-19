var createCurrentUserView = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentActionUuid = undefined
  let sourceOccElement = undefined

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
        editCurrentUserItem(e.target.dataset.value, newValue)
      }
      sourceOccElement.remove()
      update()
    })

    connect(".action_current_user_close","click",(e)=>{
      sourceOccElement.remove()
    })


    connect(".action_current_user_edit_time_item","click",(e)=>{
      console.log(event.target.parentElement.querySelector("input"));
      event.target.parentElement.querySelector("input").style.display ="inline-block"
      event.target.parentElement.querySelector("input").style.borderRadius ="8px"
      event.target.parentElement.querySelector("input").style.borderStyle ="dashed"
      event.target.parentElement.querySelector("input").style.borderColor ="#9ed2ce"
      event.target.parentElement.querySelector("input").style.borderColor ="#e8e8e8"
      event.target.parentElement.querySelector("input").style.backgroundColor= "#e8e8e8"
      event.target.parentElement.querySelector("input").previousSibling.previousSibling.remove()
      event.target.style.display ="none"
      event.target.parentElement.querySelector("input").onchange = function (ev) {
        //onEditItemTime({select:self, selectDiv:sourceEl, target:ev.target})

        console.log(ev);
        push(act.edit("actions",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.valueAsDate, project:ev.target.dataset.project}))
        sourceOccElement.remove()
        update()
      }
      //sourceEl.remove()
    })

    connect(".action_current_user_select_item_assigned","click",(e)=>{
      var metalinkType = e.target.dataset.prop;
      var sourceTriggerId = e.target.dataset.id;
      var projectStore = query.items("projects").filter(i=>i.uuid == e.target.dataset.project)[0];
      var metaLinks = query.items("projects").filter(i=>i.uuid == e.target.dataset.project)[0].metaLinks;
      var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)
      showListMenu({
        sourceData:projectStore.stakeholders,
        parentSelectMenu:e.select ,
        multipleSelection:currentLinksUuidFromDS,
        displayProp:"name",
        searchable : true,
        display:[
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", edit:false}
        ],
        idProp:"uuid",
        onCloseMenu: (ev)=>{
          sourceOccElement.remove()
          update()
        },
        onChangeSelect: (ev)=>{
          console.log(ev.select.getSelected());
          console.log(projectStore.metaLinks);
          projectStore.metaLinks = projectStore.metaLinks.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
          for (newSelected of ev.select.getSelected()) {
            projectStore.metaLinks.push({type:metalinkType, source:sourceTriggerId, target:newSelected})//TODO remove this side effect
          }
          console.log(projectStore.metaLinks);
          saveDB()
          sourceOccElement.remove()
          update()
        },
        onClick: (ev)=>{
          console.log("select");
        }
      })
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
    container.appendChild(toNode(renderProfile(uuid)))

    document.body.appendChild(sourceOccElement)

  }

  var renderProfile =function (uuid){

    let dataSourceStore = app.store.userData.info
    let i = deepCopy(dataSourceStore)
    if (!i.userUuid || !i.userLastName  || !i.userUuid) {
      i.userFirstName =i.userFirstName || 'Set your First Name'
      i.userLastName =i.userLastName || 'Set your First Name'
      i.userUuid =i.userUuid|| 'Set your uuid - You can find it in the "manage stakehoder" view'
    }

    let html =`
    <h2 class="header">
      My profile
    </h2>
    <div data-id="${i.uuid}" class="ui segment">
      <div class="content">
        <h3 class="header">First name</h3>
        ${i.userFirstName}
        <i data-prop="userFirstName" data-value="${i.userFirstName}" data-id="${i.userUuid}" class="edit icon action_current_user_edit_item" style="opacity:0.2"></i>
        <div class="ui divider"></div>

        <h3 class="header">Last name</h3>
        ${i.userLastName}
        <i data-prop="userLastName" data-value="${i.userLastName}" data-id="${i.userUuid}" class="edit icon action_current_user_edit_item" style="opacity:0.2"></i>
        <div class="ui divider"></div>

        <h3 class="header">UUID</h3>
        ${i.userUuid}
        <i data-prop="userUuid" data-value="${i.userUuid}" data-id="${i.userUuid}" class="edit icon action_current_user_edit_item" style="opacity:0.2"></i>

        <div class="ui divider"></div>

      </div>
    </div>
    <div class="ui divider"></div>
    `
    return html
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }


  //UTILS
  var getActionObjectCopyFromUuid = function (uuid) {
    let allActions = []
    query.items("projects").forEach(function (store) {
      let formatedActions = store.actions.map(a=>{//TODO only check open action
        let copy = deepCopy(a)
        copy.projectName = store.name;
        copy.urgent = lessThanInSomeDays(a.dueDate,2)
        copy.projectUuid = store.uuid
        return copy
      })
      allActions = allActions.concat(formatedActions)
    })
    return allActions.find(a=>a.uuid == uuid)
  }
  var generateListeFromMeta = function (propName, sourceId, targetList, projectuuid, isEditable) {
    var meta = query.items("projects").filter(i=>i.uuid == projectuuid)[0].metaLinks;
    var metalist = meta.filter(e => (e.type == propName && e.source == sourceId )).map(e => e.target)
    var editHtml = `<i data-prop="${propName}" data-value='${JSON.stringify(metalist)}' data-id="${sourceId}" data-project="${projectuuid}" class="edit icon action_single_action_select_item_assigned" style="opacity:0.2"></i>`
    function reduceChoices(acc, e) {
      console.log(e);
      var foudItem = targetList.find(i=>i.uuid == e)
      var newItem = foudItem.name + " "+ (foudItem.lastName || " ")+" "
      var formatedNewItem = newItem
      if(formatedNewItem.length > 25) {
          formatedNewItem = newItem.substring(0,10)+".. ";
      }
      var htmlNewItem = `<div data-inverted="" data-tooltip="${newItem}" class="ui mini teal label">${formatedNewItem}</div>`
      return acc += htmlNewItem
    }
    var mainText = `<div class="ui mini label">Nobody</div>`
    if (metalist[0]) {
      mainText = metalist.reduce(reduceChoices,"")
    }
    return mainText + editHtml
  }
  var generateTimeFromMeta = function (propName, sourceId, value, projectuuid, isEditable) {
    let today
    let propDisplay ="No due Date";
    let labelColor = ""
    if (value) {
      today = new Date(value).toISOString().substr(0, 10);
      propDisplay = moment(value).format("MMMM Do YY");
      console.log(new Date(value));
      if (lessThanInSomeDays(new Date(value),10 )) {
        labelColor = "orange"
      }
      if (lessThanInSomeDays(new Date(value),2 )) {
        labelColor = "red"//redish
      }
    }else {
      today = new Date().toISOString().substr(0, 10);
    }
    var mainText = `<div class="ui mini ${labelColor} label">${propDisplay}</div>`
    var editHtml=`
    <input data-project="${projectuuid}" data-prop="${propName}" data-id="${sourceId}" style="display:none;" type="date" class="dateinput ${sourceId} action_list_edit_time_input" name="trip-start" value="${today}">
    <i data-project="${projectuuid}" data-prop="${propName}" data-value='${JSON.stringify(value)}' data-id="${sourceId}" class="edit icon action_single_action_edit_time_item" style="opacity:0.2">
    </i>`
    return mainText + editHtml
  }
  var generateCloseInfo = function (value) {
    let mainText =''
    if (value && value != "") {
      mainText = `<div class="ui mini green label">Closed ${moment(value).fromNow() }</div>`
    }
    return mainText
  }

  var editCurrentUserItem = function (prop, newValue) {
    //TODO move to reducer
    app.store.userData.info[prop] = newValue
    dbConnector.setUserInfo(app.state.currentUser , prop, newValue)
    // push(act.edit("actions",{project:e.target.dataset.project, uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newValue}))

  }



  var update = function (uuid) {
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
  self.editCurrentUserItem = editCurrentUserItem
  self.update = update
  self.init = init

  return self
}

var currentUserView = createCurrentUserView()
currentUserView.init()
// createInputPopup({originalData:jsonFile})
