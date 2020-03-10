var createUnifiedView = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var filterText = undefined;
  var filterProject = undefined;
  var displayClosedItems = false;
  var displayRecentlyClosedItems = false;
  var filterClosedDaysAgo = 1;

  var focusOnProject = undefined
  var showTaskOwnership = false
  var showKanban = true


  var init = function () {
    connections()
    //update()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", function () {
      if (objectIsActive) {
        update()
      }
    })

    connect(".action-mark-action-done","click",(e)=>{
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
      update()
    })
    connect(".action_unified_list_edit_item","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      console.log(e.target.dataset.project);
      if (newValue) {
        push(act.edit("actions",{project:e.target.dataset.project, uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newValue}))
      }
      update()
    })
    connect(".action_unified_toogle_ownership","click",(e)=>{
      showTaskOwnership = !showTaskOwnership
      update()
    })
    connect(".action_unified_toogle_all_projects","click",(e)=>{
      if (focusOnProject) {
        focusOnProject = undefined
      }else {
        focusOnProject = app.state.currentProject
      }
      update()
    })
    connect(".action_unified_load_project","click",(e)=>{
      setCurrentProject(e.target.dataset.id)
      pageManager.setActivePage("overview")
    })
    connect(".action_unified_toogle_old_items","change", (e)=>{
      console.log(e.target.value);
      displayRecentlyClosedItems = !displayRecentlyClosedItems
      if (displayRecentlyClosedItems) {
        filterClosedDaysAgo = 10000000000
      }else {
        filterClosedDaysAgo = 1
      }
      console.log(filterClosedDaysAgo);
      setTimeout(async function () {
        await renderList(container);
      }, 100);
    })
    connect(".action_unified_list_edit_time_item","click",(e)=>{
      ephHelpers.promptSingleDatePicker(e.target.dataset.value, function (event) {
        let selected = event.selectedDates
        if (selected[0]) {
          let newDate = moment(selected[0]).add(12, 'hours').toDate()
          push(act.edit("actions",{uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newDate, project:e.target.dataset.project}))
          update()
        }
      })
    })
    connect(".action_unified_list_select_item_assigned","click",async (e)=>{
      var allProjects = await query.items("projects")

      var metalinkType = e.target.dataset.prop;
      var sourceTriggerId = e.target.dataset.id;
      var projectStore = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0];
      var metaLinks = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0].metaLinks.items;
      var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)

      // showUpdateLinksService.show(ev,"requirements")
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
          update()
        },
        // onChangeSelect: (ev)=>{
        //   console.log(ev.select.getSelected());
        //   console.log(projectStore.metaLinks.items);
        //   projectStore.metaLinks.items = projectStore.metaLinks.items.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
        //   for (newSelected of ev.select.getSelected()) {
        //     projectStore.metaLinks.items.push({type:metalinkType, source:sourceTriggerId, target:newSelected})//TODO remove this side effect
        //   }
        //   // console.log(projectStore.metaLinks.items);
        //   // saveDB()
        //   // update()
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
    connect(".unified-new-project-input","keyup",(e)=>{
      if (e.keyCode == 13) {
        var newAction ={project:e.target.dataset.project, open:true, name:e.target.value, des:undefined, dueDate:undefined, created:Date.now(), assignedTo:undefined}
        push(act.add("actions",newAction))

        update()
      }
    })
  }

  var render = async function () {
    var store = await query.currentProject()
    container.innerHTML ='<div style="height:85%" class="ui container"><div class="umenu"></div><div class="ui divider"></div><div style="height:100%" class="ulist"></div></div>'
    renderSearchArea(container, store);
    await renderList(container);

  }

  var update = function () {
    render()
  }

  var setActive = async function () {
    objectIsActive = true;
    // setCurrentProject(undefined)
    var store = await query.currentProject()
    if (store) {
      focusOnProject = store.uuid
    }else {
      focusOnProject=undefined
    }
    showTaskOwnership = false;//reset view
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  var renderList = async function (container) {
    let allProjects = await query.items("projects")
    if (app.store.relatedProjects && app.store.relatedProjects[0]) {
      allProjects = allProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))
    }
    if (!showTaskOwnership) {
      if (showKanban) {
        await renderKanbanOverview(container, allProjects)
      }else{
        await renderOverview(container, allProjects)
      }
    }else {
      await renderActionRepartition(container, allProjects)
    }
  }
  var renderOverview = function (container, allProjects) {
    let sortedVisibleSearchedProject = getProjectListForActionExtraction(allProjects)

    var html = sortedVisibleSearchedProject.reduce((acc,i)=>{

      acc += generateProjectTitleHTML(i.uuid, i.name, i.reference)
      acc += generateAddTaskArea(i.uuid)
      var items = i.actions.items.filter( e => fuzzysearch(filterText, e.name))
      items = items.filter( e => howLongAgo(e.closedOn)<filterClosedDaysAgo)
      acc += generateTasksHTML(items.reverse() , i.uuid, allProjects)
      return acc
    },'')
    container.querySelector('.ulist').innerHTML = html
  }
  var renderKanbanOverview = function (container, allProjects) {
    let sortedVisibleSearchedProject = getProjectListForActionExtraction(allProjects)
    console.log(sortedVisibleSearchedProject);

    let sortedProjectsAndActions = sortedVisibleSearchedProject.map(p=>{
      let currentProjectActions = p.actions.items.filter( e => fuzzysearch(filterText, e.name))
      currentProjectActions = currentProjectActions.filter( e => howLongAgo(e.closedOn)<filterClosedDaysAgo)
      return {
        title:p.name,
        uuid:p.uuid,
        content:currentProjectActions.reverse().map(cpa=>{
          return {  html:generateTaskHTML(cpa, p.uuid, allProjects) }
        })
      }
    })
    console.log(sortedProjectsAndActions);

    // var html = sortedVisibleSearchedProject.reduce((acc,i)=>{
    //
    //   acc += generateProjectTitleHTML(i.uuid, i.name, i.reference)
    //   acc += generateAddTaskArea(i.uuid)
    //   var items = i.actions.items.filter( e => fuzzysearch(filterText, e.name))
    //   items = items.filter( e => howLongAgo(e.closedOn)<filterClosedDaysAgo)
    //   acc += generateTasksHTML(items.reverse() , i.uuid, allProjects)
    //   return acc
    // },'')
    // container.querySelector('.ulist').innerHTML = html
    container.querySelector('.ulist').innerHTML = ""
    var kanban = createKanban({container:container.querySelector('.ulist'), data:sortedProjectsAndActions, customCardHtml:true})

  }

  var renderActionRepartition = function (container, allProjects) {

    let sortedVisibleSearchedProject = getProjectListForActionExtraction(allProjects)

    var allActions = sortedVisibleSearchedProject.reduce((acc,i)=>{
      var items = i.actions.items.filter( e => fuzzysearch(filterText, e.name))
      items = items.filter( e => howLongAgo(e.closedOn)<filterClosedDaysAgo)
      for (action of items.reverse()) {
        //find if
        let taskStakeholders = getIdsOfTargets(allProjects,i.uuid,"assignedTo", action.uuid)
        acc.tasks.push({action, project:i.uuid, assignedTo:taskStakeholders})
        for (target of taskStakeholders) {
          console.log(acc.stakeholders.includes(target));
          if (!acc.stakeholders.includes(target) ) {
            acc.stakeholders.push(target)
          }
        }
      }
      return acc
    },{tasks:[], stakeholders:[]})
    console.log(allActions);
    if (showKanban) {
      generateTaskOwnershipKanban(allProjects, allActions.tasks, allActions.stakeholders)
    }else {
      var html = generateTaskOwnershipHTML(allProjects, allActions.tasks, allActions.stakeholders)
      container.querySelector('.ulist').innerHTML = html
      //container.querySelector('.ulist').innerHTML = html

    }
  }

  var getProjectListForActionExtraction = function (allProjects) {
    let sortedProject = undefined
    let sortedVisibleProject = undefined
    let sortedVisibleSearchedProject = undefined

    if (focusOnProject) {
      sortedVisibleProject = allProjects.find(p=>p.uuid == focusOnProject)
      sortedVisibleSearchedProject= [sortedVisibleProject]

    }else {
      sortedProject = getOrderedProjectList(allProjects, app.store.userData.preferences.projectDisplayOrder)
      sortedVisibleProject = sortedProject.filter(p=>!app.store.userData.preferences.hiddenProject.includes(p.uuid))
      sortedVisibleSearchedProject= sortedVisibleProject.filter(e=> fuzzysearch(filterProject,e.name))
    }
    return sortedVisibleSearchedProject
  }

  var generateProjectTitleHTML = function (projectId, title, reference) {
    return `
    <h2 data-id="${projectId}" class="ui header action-load-project">
       <i class="building outline icon"></i>
      <div class="content">
        ${title}
        <div class="sub header">
          ${reference}
          <button data-id="${projectId}" class="ui mini basic button action_unified_load_project">
            Focus
            <i data-id="${projectId}" class="icon right arrow"></i>
          </button>
        </div>
      </div>
    </h2>`
  }

  var generateTaskOwnershipHTML = function (allProjects,actions, owners) {
    var html =""
    console.log(owners);
    console.log(allProjects);
    //get owners relevant infos
    var ownerTable = allProjects
        .map(e => e.stakeholders.items)
        .reduce((a, b) => {return a.concat(b)},[])
        .map((e) => {return {uuid:e.uuid, name:e.name}});
    console.log(ownerTable);
    for (owner of owners) {
      html += `<h2 class="">${ownerTable.find(e=> e.uuid==owner ).name}</h2>`
      html += `<div class="ui very relaxed list">`
      var ownedActions = actions.filter( e=> e.assignedTo.includes(owner))
      html += ownedActions.map((e) => {
          e.action.projectuuid = e.project
          return e.action
        }).reduce((acc,i) => {
        return acc +=`
          <div data-id="${i.uuid}" class="item">
            <i  data-value ='${i.open}' data-project="${i.projectuuid}" data-id="${i.uuid}" class="action-mark-action-done big ${i.open ? '':'check'} circle outline icon"></i>
            <div class="content">
              <h5 class="header">
                ${i.name}
                <i data-project="${i.projectuuid}" data-prop="name" data-value="${i.name}" data-id="${i.uuid}" class="edit icon action_unified_list_edit_item" style="opacity:0.2"></i>
              </h5>
              <div class="description">
                Created ${moment(i.created).fromNow() }, ${generateCloseInfo(i.closedOn)}  assigned to
                ${generateListeFromMeta(allProjects, "assignedTo",i.uuid, allProjects.find(e=>e.uuid == i.projectuuid).stakeholders.items, i.projectuuid)}
                ${generateTimeFromMeta("dueDate", i.uuid, i.dueDate, i.projectuuid)}
              </div>
            </div>
          </div>`
      },'')
      html +=" </div>"
    }
    return html
  }
  var generateTaskOwnershipKanban = function (allProjects,actions, owners) {
    var html =""
    console.log(owners);
    console.log(allProjects);
    //get owners relevant infos
    var ownerTable = allProjects
        .map(e => e.stakeholders.items)
        .reduce((a, b) => {return a.concat(b)},[])
        .map((e) => {return {uuid:e.uuid, title:e.name, name:e.name, content:[]}});

    for (owner of owners) {
      let ownerArrayElement = ownerTable.find(e=> e.uuid==owner )

      var ownedActions = actions.filter( e=> e.assignedTo.includes(owner))
      var currentContent = ownedActions.map((e) => {
          e.action.projectuuid = e.project
          return e.action
        }).map(i => {
        return { html: `
          <div data-id="${i.uuid}" class="item">
            <i  data-value ='${i.open}' data-project="${i.projectuuid}" data-id="${i.uuid}" class="action-mark-action-done big ${i.open ? '':'check'} circle outline icon"></i>
            <div class="content">
              <h5 class="header">
                ${i.name}
                <i data-project="${i.projectuuid}" data-prop="name" data-value="${i.name}" data-id="${i.uuid}" class="edit icon action_unified_list_edit_item" style="opacity:0.2"></i>
              </h5>
              <div class="description">
                Created ${moment(i.created).fromNow() }, ${generateCloseInfo(i.closedOn)}  assigned to
                ${generateListeFromMeta(allProjects, "assignedTo",i.uuid, allProjects.find(e=>e.uuid == i.projectuuid).stakeholders.items, i.projectuuid)}
                ${generateTimeFromMeta("dueDate", i.uuid, i.dueDate, i.projectuuid)}
              </div>
            </div>
          </div>`}
      })
      console.log(currentContent);
      ownerArrayElement.content = currentContent

    }
    console.log(ownerTable);
    container.querySelector('.ulist').innerHTML = ""
    var kanban = createKanban({container:container.querySelector('.ulist'), data:ownerTable, customCardHtml:true})
  }

  var generateTasksHTML = function (actions, projectUuid, allProjects) {
    var html = `<div class="ui very relaxed list">`
    html += actions.reduce((acc,i) => {
      return acc +=generateTaskHTML(i, projectUuid, allProjects)
    },'')
    html +=" </div>"
    return html
  }
  var generateTaskHTML = function (action, projectUuid, allProjects) {
    var i = action
    var html =`
        <div data-id="${i.uuid}" class="item">
          <i  data-value ='${i.open}' data-project="${projectUuid}" data-id="${i.uuid}" class="action-mark-action-done big ${i.open ? '':'check'} circle outline icon"></i>
          <div class="content">
            <h5  class="header ">
              <span data-id="${i.uuid}" class="action_toogle_single_action_view">${i.name}</span>
              <i data-project="${projectUuid}" data-prop="name" data-value="${i.name}" data-id="${i.uuid}" class="edit icon action_unified_list_edit_item" style="opacity:0.2"></i>
            </h5>
            <div class="description">
              Created ${moment(i.created).fromNow() }, ${generateCloseInfo(i.closedOn)}  assigned to
              ${generateListeFromMeta(allProjects, "assignedTo",i.uuid, allProjects.filter(e=>e.uuid == projectUuid)[0].stakeholders.items, projectUuid)}
              ${generateTimeFromMeta("dueDate", i.uuid, i.dueDate, projectUuid)}
            </div>
          </div>
        </div>`
    return html
  }

  var renderSearchArea = async function (container, store) {
    var addSearch = document.createElement('div');
    addSearch.classList="ui mini menu"
    addSearch.innerHTML =`
      <div class="item">
        <div class="ui icon input">
            <input class="list-search-input" type="text" placeholder="Search list...">
            <i class="search icon"></i>
        </div>
      </div>
      ${renderSwitchBetweenProjects(store)}
      <div class="item">
        <div class="ui button action_unified_toogle_ownership">${!showTaskOwnership? "Actions ownership":"Actions overview"}</div>
      </div>

      <div class="ui simple dropdown item">
        Visibility
        <i class="eye icon"></i>
        <div class="menu">
          <div class="item">
            <div class="ui toggle checked checkbox">
              <input ${displayRecentlyClosedItems ? 'checked':''} class="action_unified_toogle_old_items" type="checkbox" name="public">
              <label>Display closed items older than one day</label>
            </div>
          </div>
          <div class="item">Hide All closed items</div>
        </div>
      </div>

      <div class="ui divider"></div>
      `
    container.querySelector(".umenu").appendChild(addSearch)

    addSearch.addEventListener('keyup', async function(e){
      //e.stopPropagation()
      var value = container.querySelector(".list-search-input").value
      var tag = getHashTags(value)
      filterProject = undefined
      if (tag) {
        filterProject = tag[0]
        console.log(filterProject);
        value = value.replace('#'+tag[0]+" ",'');
        value = value.replace('#'+tag[0],'');
      }
      filterText = value;
      await renderList(container)
    });
  }
  var renderSwitchBetweenProjects = function (store) {
    let html =""
    if (store) {
      html =`
      <div class="item">
        <div class="ui basic button action_unified_toogle_all_projects">${focusOnProject? "Show all Projects":"Show current Project"}</div>
      </div>
      `
    }
    return html
  }
  var generateAddTaskArea =function (projectId) {
    var html=`
      <div style="position: relative;left: -2px;" class="item">
        <i class="big grey circle outline icon"></i>
        <div style="display: inline-block;" class="content">
          <a class="header">
            <span class="ui icon transparent input">
                <input  data-project="${projectId}" class="unified-new-project-input" type="text" placeholder="Add Task...">
                <i class="plus icon"></i>
            </span>
          </a>
        </div>
      </div>`
    return html;
  }

  var getIdsOfTargets = function (allProjects, projectuuid,propName, sourceId) {
    var meta = allProjects.filter(i=>i.uuid == projectuuid)[0].metaLinks.items;
    return meta.filter(e => (e.type == propName && e.source == sourceId )).map(e => e.target)
  }

  var generateListeFromMeta = function (allProjects, propName, sourceId, targetList, projectuuid, isEditable) {
    var meta = allProjects.filter(i=>i.uuid == projectuuid)[0].metaLinks.items;
    var metalist = meta.filter(e => (e.type == propName && e.source == sourceId )).map(e => e.target)
    var editHtml = `<i data-prop="${propName}" data-value='${JSON.stringify(metalist)}' data-id="${sourceId}" data-project="${projectuuid}" class="edit icon action_unified_list_select_item_assigned" style="opacity:0.2"></i>`
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
    <i data-project="${projectuuid}" data-prop="${propName}" data-value='${JSON.stringify(value)}' data-id="${sourceId}" class="edit icon action_unified_list_edit_time_item" style="opacity:0.2">
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

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}
var unifiedView = createUnifiedView(".center-container")
unifiedView.init()
