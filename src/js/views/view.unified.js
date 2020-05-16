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
  var currentKanban = undefined;
  var kanbanSmallCards = false;

  var showBacklog = true;
  var showTags = false;
  var sortBy ="projects";
  var groupByActor = true;


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
      // update()
    })
    connect(".action_unified_list_edit_item","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      console.log(e.target.dataset.project);
      if (newValue) {
        push(act.edit("actions",{project:e.target.dataset.project, uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newValue}))
      }
      // update()
    })
    connect(".action_unified_toogle_ownership_sort","click",(e)=>{
      // showTaskOwnership = !showTaskOwnership
      // currentKanban = undefined// clear kanban
      // update()
      sortBy = "ownership"
      currentKanban = undefined// clear kanban
      update()
    })
    connect(".action_unified_toogle_ownershipName_sort","click",(e)=>{
      sortBy = "ownershipName"
      currentKanban = undefined// clear kanban
      update()
    })
    connect(".action_unified_toogle_projects_sort","click",(e)=>{
      sortBy = "projects"
      currentKanban = undefined// clear kanban
      update()
    })
    connect(".action_unified_toogle_tags_sort","click",(e)=>{
      sortBy = "tags"
      currentKanban = undefined// clear kanban
      update()
    })
    connect(".action_unified_toogle_small_cards","click",(e)=>{
      kanbanSmallCards = !kanbanSmallCards
      currentKanban = undefined// clear kanban
      update()
    })
    connect(".action_unified_toogle_Kanban","click",(e)=>{
      showKanban = !showKanban
      if (!showKanban) {
        currentKanban = undefined// clear kanban
      }
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
    connect(".action_unified_toogle_all_old_items","click",(e)=>{
      // displayAllClosedItems = !displayAllClosedItems
      if (filterClosedDaysAgo != 0) {
        filterClosedDaysAgo = 0
      }else {
        if (displayRecentlyClosedItems) {
          filterClosedDaysAgo = 10000000000
        }else {
          filterClosedDaysAgo = 1
        }
      }
      currentKanban = undefined//clean kanban
      update()
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
    connect(".action_unified_toogle_show_tags","change", (e)=>{
      showTags = !showTags
      setTimeout(async function () {
        await renderList(container);
      }, 100);
    })
    connect(".action_unified_toogle_group_by_actor","change", (e)=>{
      groupByActor = !groupByActor
      setTimeout(async function () {
        currentKanban = undefined// clear kanban
        update()
      }, 100);
    })
    connect(".action_unified_toogle_show_backlog","change", (e)=>{
      showBacklog = !showBacklog
      setTimeout(async function () {
        currentKanban = undefined//clean kanban
        update()
      }, 100);
    })
    connect(".action_unified_list_edit_time_item","click",(e)=>{
      ephHelpers.promptSingleDatePicker(e.target.dataset.value, function (event) {
        let selected = event.selectedDates
        if (selected[0]) {
          let newDate = moment(selected[0]).add(12, 'hours').toDate()
          push(act.edit("actions",{uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newDate, project:e.target.dataset.project}))
          // update()
        }
      })
    })
    connect(".action_unified_list_select_item_assigned","click",async (e)=>{
      var allProjects = await query.allRelatedProjects({uuid:1, name:1, reference:1, actions:1, metaLinks:1, stakeholders:1, description:1, tags:1})


      var metalinkType = e.target.dataset.prop;
      var sourceTriggerId = e.target.dataset.id;
      var projectStore = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0];
      var metaLinks = allProjects.filter(i=>i.uuid == e.target.dataset.project)[0].metaLinks.items;
      var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)

      let data = undefined
      let display = undefined
      let showColoredIcons = false

      if (metalinkType == 'assignedTo') {
        data = projectStore.stakeholders.items
        display = [
          {prop:"name", displayAs:"First name", edit:false},
          {prop:"lastName", displayAs:"Last Name", edit:false},
          {prop:"role", displayAs:"Role", edit:false}
        ]
        showColoredIcons = lettersFromNames
      }else {
        data = projectStore[e.target.dataset.prop].items
        display = [
          {prop:"name", displayAs:"Name", edit:false}
        ]
        showColoredIcons = undefined
      }

      // showUpdateLinksService.show(ev,"requirements")
      showListMenu({
        sourceData:data,
        parentSelectMenu:e.select ,
        multipleSelection:currentLinksUuidFromDS,
        displayProp:"name",
        searchable : true,
        display:display,
        idProp:"uuid",
        showColoredIcons: showColoredIcons,
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
            var allProjects = await query.allRelatedProjects({uuid:1, name:1, reference:1, actions:1, metaLinks:1, stakeholders:1, description:1, tags:1})
            
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

        // update()
      }
    })
  }

  var render = async function () {
    var store = await query.currentProject()
    let currentList = document.querySelector(".ulist")
    if (!currentList) {
      container.innerHTML ='<div style="height:85%; margin-left=2%; margin-right=2%;" class=""><div style="padding: 1em 4em;" class="umenu"></div><div class="ui divider"></div><div style="height:100%; overflow:auto;" class="ulist"></div></div>'
    }
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
    sortBy='projects'
    currentKanban = undefined;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  var renderList = async function (container) {
    let allProjects = await query.allRelatedProjects({uuid:1, name:1, reference:1, actions:1, metaLinks:1, stakeholders:1, description:1, tags:1})


    if (sortBy=="projects") {
      if (showKanban) {
        await renderKanbanOverview(container, allProjects)
      }else{
        await renderOverview(container, allProjects)
      }
    }else if (sortBy=="ownership") {
      await renderActionRepartitionGeneric(container, allProjects, "stakeholders", "assignedTo", "uuid")
    }else if (sortBy=="ownershipName") {
      await renderActionRepartitionGeneric(container, allProjects, "stakeholders", "assignedTo", "name")
    } else if (sortBy=="tags") {
      await renderActionRepartitionGeneric(container, allProjects,"tags", "tags", "name")
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

    if (currentKanban) {
      currentKanban.updateData(sortedProjectsAndActions)
    }else {
      container.querySelector('.ulist').innerHTML = ""
      currentKanban = createKanban({
        container:container.querySelector('.ulist'),
        data:sortedProjectsAndActions,
        onPanelHeaderClick:function (e) {
          setCurrentProject(e.data.target.dataset.id)
          pageManager.setActivePage("overview")
        },
        onAddCard:function (e) {
          console.log(e.data.target);
          var newAction ={project:e.data.target.dataset.id, open:true, name:e.value, des:undefined, dueDate:undefined, created:Date.now(), assignedTo:undefined}
          push(act.add("actions",newAction))
        },
        customCardHtml:true
      })
      if (kanbanSmallCards) {
        function resizeCard(card) {
          card.style.height='47px'
          card.style.overflow='hidden'
          let header = card.querySelector(".header")
          header.style.position= "relative";
          header.style.top= "-26px";
          header.style.left= "42px";
          header.style.width= "217px";
        }
        function zoomCard(card) {
          card.style.height='auto'
          card.style.overflow='hidden'
        }
        let cards= document.querySelectorAll('.kanban_inside_list li')
        cards.forEach( card => {
          resizeCard(card)

          card.addEventListener("mouseenter", function (e) {
            zoomCard(e.target)
          })
          card.addEventListener("mouseleave", function (e) {
            resizeCard(e.target)
          })

        });
      }
    }
  }
  //
  // var renderActionRepartition = function (container, allProjects) {
  //
  //   let sortedVisibleSearchedProject = getProjectListForActionExtraction(allProjects)
  //
  //   var allActions = sortedVisibleSearchedProject.reduce((acc,i)=>{
  //     var items = i.actions.items.filter( e => fuzzysearch(filterText, e.name))
  //     items = items.filter( e => howLongAgo(e.closedOn)<filterClosedDaysAgo)
  //     for (action of items.reverse()) {
  //       //find if
  //       let taskStakeholders = getIdsOfTargets(allProjects,i.uuid,"assignedTo", action.uuid)
  //       acc.tasks.push({action, project:i.uuid, assignedTo:taskStakeholders})
  //       for (target of taskStakeholders) {
  //         console.log(acc.stakeholders.includes(target));
  //         if (!acc.stakeholders.includes(target) ) {
  //           acc.stakeholders.push(target)
  //         }
  //       }
  //     }
  //     return acc
  //   },{tasks:[], stakeholders:[]})
  //   console.log(allActions);
  //   if (showKanban) {
  //     generateTaskOwnershipKanban(allProjects, allActions.tasks, allActions.stakeholders)
  //   }else {
  //     var html = generateTaskOwnershipHTML(allProjects, allActions.tasks, allActions.stakeholders)
  //     container.querySelector('.ulist').innerHTML = html
  //     //container.querySelector('.ulist').innerHTML = html
  //
  //   }
  // }
  var renderActionRepartitionGeneric = function (container, allProjects, storeGroup, metalinkType, sortingProp) {
    let sortedVisibleSearchedProject = getProjectListForActionExtraction(allProjects)

    var allActions = sortedVisibleSearchedProject.reduce((acc,i)=>{
      var items = i.actions.items.filter( e => fuzzysearch(filterText, e.name))
      items = items.filter( e => howLongAgo(e.closedOn)<filterClosedDaysAgo)
      for (action of items.reverse()) {
        //find if
        let sorterItems = getIdsOfTargets(allProjects,i.uuid,metalinkType, action.uuid)

        let newTask = {action, project:i.uuid}
        newTask[metalinkType]=sorterItems
        acc.tasks.push(newTask)
        for (target of sorterItems) {
          console.log(acc.sortingValues.includes(target));
          if (!acc.sortingValues.includes(target) ) {
            acc.sortingValues.push(target)
          }
        }
      }
      return acc
    },{tasks:[], sortingValues:[]})
    console.log(allActions);
    if (showKanban) {
      generateTaskOwnershipKanban(allProjects, allActions.tasks, allActions.sortingValues, storeGroup, metalinkType, sortingProp)
    }else {
      var html = generateTaskOwnershipHTML(allProjects, allActions.tasks, allActions.sortingValues, storeGroup, metalinkType,)
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

  var generateTaskOwnershipHTML = function (allProjects,actions, owners, storeGroup, metaLinksType) {
    var html =""
    console.log(owners);
    console.log(allProjects);
    //get owners relevant infos
    var ownerTable = allProjects
        .map(e => e[storeGroup].items)
        .reduce((a, b) => {return a.concat(b)},[])
        .map((e) => {
          let currentName = e.name
          if (e.lastName) {
            currentName+= " " + e.lastName
          }
          return {uuid:e.uuid, name:currentName, actorsId:actorsId}
        });
    console.log(ownerTable);
    for (owner of owners) {
      html += `<h2 class="">${ownerTable.find(e=> e.uuid==owner ).name}</h2>`
      html += `<div class="ui very relaxed list">`
      var ownedActions = actions.filter( e=> e[metaLinksType].includes(owner))
      html += ownedActions.map((e) => {
          e.action.projectUuid = e.project
          return e.action
        }).reduce((acc,i) => {

        return acc +=  generateTaskHTML(i, i.projectUuid, allProjects)
        // return acc +=`
        //   <div data-id="${i.uuid}" class="item">
        //     <i  data-value ='${i.open}' data-project="${i.projectuuid}" data-id="${i.uuid}" class="action-mark-action-done big ${i.open ? '':'check'} circle outline icon"></i>
        //     <div class="content">
        //       <h5 class="header">
        //         ${i.name}
        //         <i data-project="${i.projectuuid}" data-prop="name" data-value="${i.name}" data-id="${i.uuid}" class="edit icon action_unified_list_edit_item" style="opacity:0.2"></i>
        //       </h5>
        //       <div class="description">
        //         Created ${moment(i.created).fromNow() }, ${generateCloseInfo(i.closedOn)}  assigned to
        //         ${generateListeFromMeta(allProjects, "assignedTo",i.uuid, allProjects.find(e=>e.uuid == i.projectuuid).stakeholders.items, i.projectuuid)}
        //         ${generateTimeFromMeta("dueDate", i.uuid, i.dueDate, i.projectuuid)}
        //       </div>
        //     </div>
        //   </div>`
      },'')
      html +=" </div>"
    }
    if (showBacklog) {
      html += `<h2 class="">Backlog</h2>`
      html += `<div class="ui very relaxed list">`
      var ownedActions = actions.filter( e=> !e[metaLinksType][0])
      html += ownedActions.map((e) => {
          e.action.projectUuid = e.project
          return e.action
        }).reduce((acc,i) => {
        return acc +=  generateTaskHTML(i, i.projectUuid, allProjects)
      },'')
      html +=" </div>"
    }
    return html
  }
  var generateTaskOwnershipKanban = function (allProjects,actions, owners, storeGroup, metaLinksType, sortingProp) {
    var html =""
    console.log(owners);
    console.log(allProjects);
    //get owners relevant infos
    var ownerTable = allProjects
        .map(e => e[storeGroup].items)
        .reduce((a, b) => {return a.concat(b)},[])
        .map((e) => {
          let currentName = e.name
          if (e.lastName) {
            currentName+= " " + e.lastName
          }
          return {uuid:e.uuid, title:currentName, name:currentName, actorsId:e.actorsId, content:[]}
        });

    ownerTable.push({uuid:"backlog", title:"Backlog", name:"Backlog", content:[]})

    for (owner of owners) {
      let ownerArrayElement = ownerTable.find(e=> e.uuid==owner )
      var ownedActions = actions.filter( e=> e[metaLinksType].includes(owner))
      var currentContent = ownedActions.map((e) => {
          e.action.projectUuid = e.project
          return e.action
        }).map(i => {
        return { html: generateTaskHTML(i, i.projectUuid, allProjects)}
      })
      console.log(currentContent);
      ownerArrayElement.content = currentContent

    }

    if (groupByActor) {
      var actorsTable = allProjects.map(e =>{
            if (e.actors) {
              return e.actors.items.map(i => Object.assign({projectid:e.uuid, projectName:e.name, appearIn:[{projectid:e.uuid, projectName:e.name}]}, i)) //add project prop to all items
            }else {
              return []
            }
          } )
          .reduce((a, b) => {return a.concat(b)},[])
      let addedActors = []
      let alreadyAddedActors = {}

      for (var i = 0; i < actorsTable.length; i++) {
        let item = actorsTable[i]
        let currentName = item.name
        if (item.lastName) {
          currentName+= " " + item.lastName
        }
        if (!alreadyAddedActors[item.uuid]) {
          alreadyAddedActors[item.uuid]= true
          addedActors.push({uuid:item.uuid, isActor:true, title:currentName, name:currentName, content:[]})
        }

      }

      for (var i = 0; i < addedActors.length; i++) {
        let actor = addedActors[i]

        let relatedOwners = ownerTable.filter(o=>o.actorsId == actor.uuid)

        let relatedOwnersContent = relatedOwners.map(r=>r.content).reduce((a, b) => {return a.concat(b)},[])
        actor.content = relatedOwnersContent

        // for (var i = 0; i < relatedOwners.length; i++) {//erase content in original elements
        //   relatedOwners[i].hasActor = true
        // }


        // var ownedActions = actions.filter( e=> e.actorsId == actor.uuid)
        // var currentContent = ownedActions.map((e) => {
        //     e.action.projectUuid = e.project
        //     return e.action
        //   }).map(i => {
        //   return { html: generateTaskHTML(i, i.projectUuid, allProjects)}
        // })
        // console.log(currentContent);
        // ownerArrayElement.content = currentContent
      }
      ownerTable = ownerTable.concat(addedActors).filter(o=>!o.actorsId)




    }
    //fill backlog
    if (showBacklog) {
      let ownerArrayElement = ownerTable.find(e=> e.uuid=='backlog' )
      var ownedActions = actions.filter( e=> !e[metaLinksType][0])
      var currentContent = ownedActions.map((e) => {
          e.action.projectUuid = e.project
          return e.action
        }).map(i => {
        return { html: generateTaskHTML(i, i.projectUuid, allProjects)}
      })
      console.log(currentContent);
      ownerArrayElement.content = currentContent
    }

    if (sortingProp && sortingProp!= "uuid") {
      let newOwnerTable =[]
      ownerTable.forEach((item, i) => {
        let findInNewTable = newOwnerTable.find(o=>o[sortingProp] == item[sortingProp])
        if (findInNewTable) { //an equivalence has been found
          findInNewTable.content = findInNewTable.content.concat(item.content)
        }else{ //create a new record
          newOwnerTable.push(deepCopy(item))
        }
      });

      ownerTable = newOwnerTable //replace the table
    }

    if (currentKanban) {
      currentKanban.updateData(ownerTable)
    }else {
      container.querySelector('.ulist').innerHTML = ""
      currentKanban = createKanban({container:container.querySelector('.ulist'), data:ownerTable, customCardHtml:true})
      if (kanbanSmallCards) {
        function resizeCard(card) {
          card.style.height='47px'
          card.style.overflow='hidden'
          let header = card.querySelector(".header")
          header.style.position= "relative";
          header.style.top= "-26px";
          header.style.left= "42px";
          header.style.width= "217px";
        }
        function zoomCard(card) {
          card.style.height='auto'
          card.style.overflow='hidden'
        }
        let cards= document.querySelectorAll('.kanban_inside_list li')
        cards.forEach( card => {
          resizeCard(card)

          card.addEventListener("mouseenter", function (e) {
            zoomCard(e.target)
          })
          card.addEventListener("mouseleave", function (e) {
            resizeCard(e.target)
          })

        });
      }
    }
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
    var tagsHtml = ''
    if (showTags) {
      tagsHtml = generateListeFromMeta(allProjects, "tags",i.uuid, allProjects.filter(e=>e.uuid == projectUuid)[0].tags.items, projectUuid)
    }
    var html =`
        <div style="${i.open?'':'opacity:0.6;'}" data-id="${i.uuid}" class="item">
          <i  data-value ='${i.open}' data-project="${projectUuid}" data-id="${i.uuid}" class="action-mark-action-done big ${i.open ? '':'check'} circle outline icon"></i>
          <div class="content">
            <h5  class="header ">
              <span data-id="${i.uuid}" class="action_toogle_single_action_view">${i.name}</span>
              <i data-project="${projectUuid}" data-prop="name" data-value="${i.name}" data-id="${i.uuid}" class="edit icon action_unified_list_edit_item" style="opacity:0.2"></i>
            </h5>
            <div class="description">
              Created ${moment(i.created).fromNow() }, ${generateCloseInfo(i.closedOn)}  assigned to
              ${generateListeFromMeta(allProjects, "assignedTo",i.uuid, allProjects.filter(e=>e.uuid == projectUuid)[0].stakeholders.items, projectUuid)}
              ${tagsHtml}
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
      <div class="item">
        <div class="ui ${showKanban? "active":""}  icon button action_unified_toogle_Kanban"><i class="map icon"></i></div>
      </div>
      ${showKanban? '<div class="item"><div class="ui icon basic  button action_unified_toogle_small_cards"><i class="expand arrows alternate icon"></i></div></div>':""}


      <div style="padding-top: 0px;padding-bottom: 0px;" class="item">
        <div  class="ui mini basic icon buttons">
          <div class="ui mini ${sortBy=='projects'? "active":""} icon button action_unified_toogle_projects_sort"><i class="building outline icon"></i></div>
          <div class="ui mini ${sortBy=='ownershipName'? "active":""} icon button action_unified_toogle_ownershipName_sort"><i class="user icon"></i></div>
          <div class="ui mini ${sortBy=='ownership'? "active":""} icon button action_unified_toogle_ownership_sort"><i class="users icon"></i></div>
          <div class="ui mini ${sortBy=='tags'? "active":""} icon button action_unified_toogle_tags_sort"><i class="tag icon"></i></div>
        </div>
      </div>


      <div class="right menu">
        ${renderSwitchBetweenProjects(store)}
        <div class="ui simple dropdown item">
          Visibility
          <i class="eye icon"></i>
          <div class="menu">
            <div class="item">
              <div class="ui toggle checked checkbox">
                <input ${showTags ? 'checked':''} class="action_unified_toogle_show_tags" type="checkbox" name="public">
                <label>Display tags</label>
              </div>
            </div>
            <div class="item">
              <div class="ui toggle checked checkbox">
                <input ${showBacklog ? 'checked':''} class="action_unified_toogle_show_backlog" type="checkbox" name="public">
                <label>Display backlog items</label>
              </div>
            </div>
            <div class="item">
              <div class="ui toggle checked checkbox">
                <input ${groupByActor ? 'checked':''} class="action_unified_toogle_group_by_actor" type="checkbox" name="public">
                <label>Group Items by Actors</label>
              </div>
            </div>
            <div class="item">
              <div class="ui toggle checked checkbox">
                <input ${displayRecentlyClosedItems ? 'checked':''} class="action_unified_toogle_old_items" type="checkbox" name="public">
                <label>Display closed items older than one day</label>
              </div>
            </div>
            <div class="item action_unified_toogle_all_old_items">Hide All closed items</div>
          </div>
        </div>
      </div>

      <div class="ui divider"></div>
      `
    container.querySelector(".umenu").innerHTML=""
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
      var itemStyle = 'cursor:pointer;'
      var nestedHtml = ''
      var foudItem = targetList.find(i=>i.uuid == e)
      var newItem = foudItem.name + " "+ (foudItem.lastName || " ")+" "
      var formatedNewItem = newItem
      if(formatedNewItem.length > 25) {
          formatedNewItem = newItem.substring(0,10)+".. ";
      }
      if (foudItem.color) {
        itemStyle += 'background-color:'+foudItem.color+';'
      }
      if (foudItem.lastName) {
        // itemStyle += 'background:'+ephHelpers.colorFromLetters(foudItem.name.substring(0,1)+foudItem.lastName.substring(0,1))+';'
        if (true) {
          let letters = foudItem.name.substring(0,1)+foudItem.lastName.substring(0,1)
          let colStyle = 'style ="flex-grow: 0;flex-basis: 50px;"'
          let style = 'style="background: '+ephHelpers.colorFromLetters(letters)+';width: 23px;height: 23px;border-style: solid;border-width: 1px;border-radius: 100%;padding: 6px;font-size: 10px;color: white;text-align: center;position: absolute;left: -5px;top: -1px;"'
          nestedHtml +=`
            <div ${style} class="content">
              ${letters}
            </div>
            <div style="width:11px;display: inline-block;">  </div>
          `
        }
      }
      var htmlNewItem = `
      <div data-inverted="" style="${itemStyle}" data-tooltip="${newItem}" class="ui mini teal label">
      ${nestedHtml}
      ${formatedNewItem}
      </div>`
      return acc += htmlNewItem
    }
    var emptyNameDic={
      assignedTo:'Nobody',
      tags:'No Tag'
    }
    var emptyNameDic = emptyNameDic[propName] || propName
    var mainText = `<div class="ui mini label">${emptyNameDic}</div>`
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
