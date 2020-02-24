var createSingleActionView = function ({
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
        <div class="item">
            <div data-value ='${action.open}'  data-id="${action.uuid}" data-project="${action.projectUuid}" class="ui ${action.open? "green":"basic orange"} green button action_single_action_toogle_status">${action.open? "mark as done":"re-open"}</div>
        </div>
        <div class="item">
            ${generateCloseInfo(action.closedOn)}
        </div>
        <div class="right menu">
          <div class="item">
              <div class="ui red button action_single_action_close">close</div>
          </div>
        </div>
        </div>
      `
    },
    addComment : function () {
      return `
      <div class="ui blue labeled submit icon button action_single_action_add_comment">
        <i class="icon edit"></i> Add comment
      </div>`
    },
    comment : function (comment) {
      return `
      <div class="comment">
        <div class="content">
          <a class="author"></a>
          <div class="metadata">
            <div class="date">${moment(comment.addedOn).fromNow() }</div>
          </div>
          <div class="text " >
            ${comment.content}
          </div>
          <div class="actions">
            <a class="action_single_action_modify_comment" data-id="${comment.uuid}">edit</a>
            <a class="action_single_action_remove_comment" data-id="${comment.uuid}">delete</a>
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
    connect(".action_single_action_toogle_status","click",(e)=>{
      console.log(e.target.dataset.id);
      console.log(e.target.dataset.project);
      var isOpen = (e.target.dataset.value == "true")
      // app.store.
      // push(act.remove("actions",{uuid:e.target.dataset.id, project:e.target.dataset.project}))
      push(act.edit("actions",{uuid:e.target.dataset.id,prop:"open", value:!isOpen, project:e.target.dataset.project}))
      if (isOpen) {
        push(act.edit("actions",{uuid:e.target.dataset.id,prop:"closedOn", value:Date.now(), project:e.target.dataset.project}))
      }else {
        push(act.edit("actions",{uuid:e.target.dataset.id,prop:"closedOn", value:"", project:e.target.dataset.project}))

      }
      sourceOccElement.remove()
      update()
    })
    connect(".single_action_unified_list_edit_item","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      console.log(e.target.dataset.project);
      if (newValue) {
        push(act.edit("actions",{project:e.target.dataset.project, uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newValue}))
      }
      sourceOccElement.remove()
      update()
    })
    connect(".action_single_action_add_comment","click",(e)=>{
      console.log("Add Comment");
      let currentCommentUuid = undefined
      createInputPopup({
        originalData:"",
        onSave:async e =>{
          var allProjects = await query.items("projects")
          if (!currentCommentUuid) {
            currentCommentUuid = uuid()
            let action = getActionObjectCopyFromUuid(allProjects, currentActionUuid)
            let currentComments = (action.comments ? action.comments:[]);
            currentComments.push({uuid:currentCommentUuid, content:e, addedOn:Date.now()})
            push(act.edit("actions",{project:action.projectUuid, uuid:action.uuid, prop:"comments", value:currentComments}))
          }else {
            let action = getActionObjectCopyFromUuid(allProjects, currentActionUuid)
            let currentComments = (action.comments ? action.comments:[]);
            currentComments.find(c=>c.uuid == currentCommentUuid).content = e
            push(act.edit("actions",{project:action.projectUuid, uuid:action.uuid, prop:"comments", value:currentComments}))
          }
          sourceOccElement.remove()
          update()
        },
        onClose:e =>{
          sourceOccElement.remove()
          update()
        }
      })
    })
    connect(".action_single_action_modify_comment","click",async (e)=>{
      var allProjects = await query.items("projects")
      let currentCommentUuid = e.target.dataset.id
      let action = getActionObjectCopyFromUuid(allProjects, currentActionUuid)
      let currentComments = (action.comments ? action.comments:[]);
      let editedComment = currentComments.find(c=>c.uuid == currentCommentUuid)


      createInputPopup({
        originalData:editedComment.content,
        onSave:e =>{
          if (currentCommentUuid) {
            currentComments.find(c=>c.uuid == currentCommentUuid).content = e
            push(act.edit("actions",{project:action.projectUuid, uuid:action.uuid, prop:"comments", value:currentComments}))
          }
          sourceOccElement.remove()
          update()
        },
        onClose:e =>{
          sourceOccElement.remove()
          update()
        }
      })
    })
    connect(".action_single_action_remove_comment","click",async (e)=>{
      var allProjects = await query.items("projects")
      if (confirm("Delete this comment?")) {
        let currentCommentUuid = e.target.dataset.id
        let action = getActionObjectCopyFromUuid(allProjects, currentActionUuid)
        let currentComments = (action.comments ? action.comments:[]);
        currentComments = currentComments.filter(c=>c.uuid != currentCommentUuid)
        push(act.edit("actions",{project:action.projectUuid, uuid:action.uuid, prop:"comments", value:currentComments}))
        sourceOccElement.remove()
        update()
      }
    })

    connect(".action_single_action_close","click",(e)=>{
      sourceOccElement.remove()
    })
    connect(".action_single_action_edit_time_item","click",(e)=>{
      ephHelpers.promptSingleDatePicker(e.target.dataset.value, function (event) {
        let selected = event.selectedDates
        if (selected[0]) {
          let newDate = moment(selected[0]).add(12, 'hours').toDate()
          push(act.edit("actions",{uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newDate, project:e.target.dataset.project}))
          sourceOccElement.remove()
          update()
        }
      })

    })
    connect(".action_single_action_select_item_assigned","click",async (e)=>{
      var allProjects = await query.items("projects")
      var metalinkType = e.target.dataset.prop;
      var sourceTriggerId = e.target.dataset.id;
      var projectStore = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0];
      var metaLinks = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0].metaLinks.items;
      var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)
      showListMenu({
        sourceData:projectStore.stakeholders.items,
        parentSelectMenu:e.select ,
        multipleSelection:currentLinksUuidFromDS,
        displayProp:"name",
        searchable : true,
        display:[
          {prop:"name", displayAs:"First name", edit:false},
          {prop:"lastName", displayAs:"Last Name", edit:false},
          {prop:"role", displayAs:"Role", edit:false}
        ],
        idProp:"uuid",
        showColoredIcons: lettersFromNames,
        onCloseMenu: (ev)=>{
          sourceOccElement.remove()
          update()
        },
        // onChangeSelect: (ev)=>{
        //   console.log(ev.select.getSelected());
        //   console.log(projectStore.metaLinks.items);
        //   projectStore.metaLinks.items = projectStore.metaLinks.items.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
        //   for (newSelected of ev.select.getSelected()) {
        //     projectStore.metaLinks.items.push({type:metalinkType, source:sourceTriggerId, target:newSelected})//TODO remove this side effect
        //   }
        //   console.log(projectStore.metaLinks.items);
        //   saveDB()
        //   sourceOccElement.remove()
        //   update()
        // },
        onChangeSelect: (ev)=>{
          var changeProp = async function (sourceTriggerId) {
            var allProjects = await query.items("projects")
            //update store
            var projectStore = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0];
            var metaLinks = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0].metaLinks.items;

            await batchRemoveMetaLinks(projectStore, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), "source", sourceTriggerId, projectStore.uuid)
            await batchAddMetaLinks(projectStore, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), "source", sourceTriggerId, projectStore.uuid)

          }
          changeProp(sourceTriggerId)
          // if (batch && batch[0]) { //check if batch action is needed
          //   batch.forEach(function (sourceTriggerId) {
          //     changeProp(sourceTriggerId)
          //   })
          // }else {
          //   changeProp(sourceTriggerId)
          // }
        },
        onClick: (ev)=>{
          console.log("select");
        }
      })
    })
  }

  var render = async function (uuid) {
    var allProjects = await query.items("projects")

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
    console.log(allProjects);
    menuArea.appendChild(toNode(renderMenu(allProjects,uuid)))
    container.appendChild(toNode(renderAction(allProjects,uuid)))

    document.body.appendChild(sourceOccElement)

  }

  var renderAction =function (allProjects, uuid){

    let i = getActionObjectCopyFromUuid(allProjects, uuid)

    let html =`
    <h2 class="header">
      ${i.name}
      <i data-project="${i.projectUuid}" data-prop="name" data-value="${i.name}" data-id="${i.uuid}" class="edit icon single_action_unified_list_edit_item" style="opacity:0.2"></i>
    </h2>
    <div data-id="${i.uuid}" class="ui segment">
      <div class="content">
        <h3 class="header">Created</h3>
        <p> ${moment(i.created).fromNow() }  </p>
        <div class="ui divider"></div>

        <h3 class="header">Assigned to</h3>
        <p>
          ${generateListeFromMeta(allProjects, "assignedTo",i.uuid, allProjects.find(e=>e.uuid == i.projectUuid).stakeholders.items, i.projectUuid)}
        </p>
        <div class="ui divider"></div>

        <h3 class="header">Due by</h3>
        <p>
          ${generateTimeFromMeta("dueDate", i.uuid, i.dueDate, i.projectUuid)}
        </p>
      </div>
    </div>
    <h3 class="header">Comments</h3>
      ${renderComments(i)}
    </div>
    <div class="ui divider"></div>
    `
    return html
  }
  var renderMenu =function (allProjects, uuid){

    let i = getActionObjectCopyFromUuid(allProjects,uuid)
    return theme.menu(i)
  }

  var renderComments = function (i) {
    let html =""
    if (i.comments) {
      html = i.comments.map(c=>theme.comment(c)).join('</br>')
    }else {
      html = ''
    }
    return '<div class="ui comments">' + html +' </div>' + theme.addComment()
  }

  //UTILS
  var getActionObjectCopyFromUuid = function (allProjects, uuid) {
    console.log(allProjects);
    let allActions = []
    allProjects.forEach(function (store) {
      let formatedActions = store.actions.items.map(a=>{//TODO only check open action
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
  var generateListeFromMeta = function (allProjects, propName, sourceId, targetList, projectuuid, isEditable) {
    var meta = allProjects.filter(i=>i.uuid == projectuuid)[0].metaLinks.items;
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



  var update = function (uuid) {
    if (uuid) {
      currentActionUuid = uuid
      render(uuid)
    }else if(currentActionUuid) {
      render(currentActionUuid)
    }else {
      console.log("no action found");
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

var singleActionView = createSingleActionView()
singleActionView.init()
// createInputPopup({originalData:jsonFile})
