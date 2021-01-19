var createProjectsView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }



  var render = async function () {
    document.querySelector(".center-container").innerHTML=""
    let allProjects = await query.items("projects")

    let relevantProjects = allProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))
    let sortedProject = getOrderedProjectList(relevantProjects, app.store.userData.preferences.projectDisplayOrder)
    showListMenu({
      sourceData:sortedProject,
      sourceLinks:undefined,
      metaLinks:undefined,
      targetDomContainer:".center-container",
      fullScreen:true,
      displayProp:"name",
      display:[
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"reference", displayAs:"Reference", edit:"true"}
      ],
      idProp:"uuid",
      onEditItem: async (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          // push(editRequirement({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          await dbConnector.setProjectData(ev.target.dataset.id, ev.target.dataset.prop ,newValue)
          update()
          // ev.select.updateData(app.store.projects)
        }
      },
      onEditChoiceItem: (ev)=>{
        // var metalinkType = ev.target.dataset.prop;
        // var sourceTriggerId = ev.target.dataset.id;
        // var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
        // showListMenu({
        //   sourceData:store.stakeholders,
        //   parentSelectMenu:ev.select ,
        //   multipleSelection:currentLinksUuidFromDS,
        //   displayProp:"name",
        //   searchable : true,
        //   display:[
        //     {prop:"name", displayAs:"Name", edit:false},
        //     {prop:"desc", displayAs:"Description", edit:false}
        //   ],
        //   idProp:"uuid",
        //   onCloseMenu: (ev)=>{
        //     console.log(ev.select);
        //     ev.select.getParent().update()
        //   },
        //   onChangeSelect: (ev)=>{
        //     console.log(ev.select.getSelected());
        //     console.log(store.metaLinks);
        //     store.metaLinks = store.metaLinks.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
        //     console.log(store.metaLinks);
        //     for (newSelected of ev.select.getSelected()) {
        //       store.metaLinks.push({type:metalinkType, source:sourceTriggerId, target:newSelected})
        //     }
        //     ev.select.getParent().updateMetaLinks(store.metaLinks)
        //     ev.select.getParent().update()
        //   },
        //   onClick: (ev)=>{
        //     console.log("select");
        //   }
        // })
      },
      onRemove: async (ev)=>{
        console.log("remove");
        if (confirm("remove item ?")) {
          //push(removeRequirement({uuid:ev.target.dataset.id}))
          //ev.select.updateData(store.requirements)
          // var indexToRemove = app.store.projects.findIndex(p=>p.uuid == ev.target.dataset.id)
          // app.store.projects.splice(indexToRemove, 1)//TODO do that with actions
          await dbConnector.removeProject(ev.target.dataset.id)
          update()
        }
      },
      onMove: (ev)=>{
        console.log("move");
        if (confirm("move item ?")) {
          function reorganiseOrderList(originId, targetId, list, orderedListsource) {
            let orderedList = deepCopy(orderedListsource)
            //check if all list is ordered
            list.forEach(i=>{
              if (!orderedList.includes(i.uuid)) {
                orderedList.push(i.uuid)
              }
            })

            return moveElementInArray(orderedList,originId,targetId)
          }
          // push(moveRequirement({origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
          let newOrderedList = reorganiseOrderList(ev.originTarget.dataset.id, ev.target.dataset.id, app.store.projects, app.store.userData.preferences.projectDisplayOrder)
          app.store.userData.preferences.projectDisplayOrder = newOrderedList //TODO use toures
          let newData = getOrderedProjectList(app.store.projects, app.store.userData.preferences.projectDisplayOrder)
          ev.select.updateData(newData)
        }
      },
      onAdd: (ev)=>{
        var newReq = prompt("Nouveau Projet")
        // push(addRequirement({name:newReq}))
        //TODO Brad
        app.store.projects.push(createNewProject(newReq))
        let newData = getOrderedProjectList(app.store.projects, app.store.userData.preferences.projectDisplayOrder)
        ev.select.updateData(newData)
      },
      onClick: (ev)=>{
        var projectListIndex = app.store.projects.findIndex(e=> e.uuid == ev.target.dataset.id)
        var currentProjectListIndex = app.store.projects.findIndex(e=> e.uuid == store.uuid)
        var originItem = app.store.projects.filter(e=> e.uuid == ev.target.dataset.id)
        console.log(originItem);
        console.log(projectListIndex);
        console.log(currentProjectListIndex);
        app.store.projects[currentProjectListIndex]= store;
        store = app.store.projects[projectListIndex]
        renderCDC()

      },
      extraActions:[
        {
          name:"HideProjects",
          action:(ev)=>{
            startSelectionToHide(ev)
          }
        }
      ]
    })
  }

  function startSelectionToHide(ev) {
    showListMenu({
      sourceData:app.store.projects,
      parentSelectMenu:ev.select ,
      multipleSelection: app.store.userData.preferences.hiddenProject,
      displayProp:"name",
      searchable : true,
      display:[
        {prop:"name", displayAs:"Name", edit:false}
      ],
      idProp:"uuid",
      onCloseMenu: (ev)=>{
        // console.log(ev.select);
        // ev.select.getParent().refreshList()
      },
      onChangeSelect: (ev)=>{
        app.store.userData.preferences.hiddenProject = ev.select.getSelected()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  var update = function () {
    render()
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

var projectsView = createProjectsView()
projectsView.init()
