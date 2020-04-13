var createActorsManagerView = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentActionUuid = undefined
  let sourceOccElement = undefined
  let container = undefined

  let theme = {
    menu : function (action) {
      return `
      <div class="ui secondary mini menu">
        <div class="item">
            <div class="ui teal button actors_manager_add_Actor">Add</div>
        </div>
        <div class="right menu">
          <div class="item">
              <div class="ui red button actors_manager_close">close</div>
          </div>
        </div>
        </div>
        <div class="ui divider"></div>
      `
    },
    placeholder: function (actors) {
      return `
      <h2 class="ui header">Project Actors</h2>
      <div class="ui placeholder segment">
        <div class="ui icon header">
          <i class="pdf file outline icon"></i>
          No Actors are listed yet.
          Assign a role to someone in multiple projects
        </div>
        <div class="ui primary button actors_manager_add_Actor">Add an Actor</div>
      </div>
      `
    },
    actorsList: function (actors) {
      return `
      <h2 class="ui header">Project Actors</h2>
      <h2 class="ui sub header">
        Assign a role to someone in multiple projects.
      </h2>
      <div class="ui items">
        ${actors.map(a=>theme.actorsElement(a)).join('')}
      </div>
      `
    },
    actorsElement: function (actor) {
      return `
      <div class="item">
        <div class="ui tiny image">
          <i class="user huge outline icon"></i>
        </div>
        <div class="content">
          <a class="header">${actor.name +" "+ (actor.lastName||"") }</a>
          <div class="meta">
            <span>Represent a stakeholder in these projects:</span>
            ${actor.projectName}
          </div>
          <div class="description">
            <div class="item">
                ${actor.stakeholders? actor.stakeholders.map(s=>theme.stakehoderElement(s)).join(''):""}
                <div data-id="${actor.uuid}"  class="ui mini basic teal button actors_manager_add_actor_stakeholder">Add a stakeholder</div>
            </div>
          </div>
          <div class="extra">
            <h5 class="header">ID</h5>
            ${actor.uuid}
            <i data-prop="uuid" data-value="${actor.uuid}" data-id="${actor.uuid}" class="edit icon actors_manager_edit_item" style="opacity:0.2"></i>

            <h5 class="header">Ephemeris User ID</h5>
            ${actor.ephemerisUuid|| "Set an another Ephemeris User ID to connect it to this project"}
            <i data-projectid="${actor.projectid}" data-prop="ephemerisUuid" data-value="${actor.ephemerisUuid}" data-id="${actor.uuid}" class="edit icon actors_manager_edit_item" style="opacity:0.2"></i>

            <div class="item">
                <div data-projectid="${actor.projectid}" data-id="${actor.uuid}"  class="ui mini basic  red button actors_manager_remove_Actor">Remove</div>
            </div>
          </div>
        </div>
      </div>
      `
    },
    stakehoderElement: function (stakehoder) {
      return `
      <div class="ui item">
         ${stakehoder.name +" "+ stakehoder.lastName +" in "+stakehoder.projectName}
         <div data-projectid="${stakehoder.projectid}" data-id="${stakehoder.uuid}"  class="ui mini basic red button actors_manager_remove_stakeholder_from_actor">Remove</div>
     </div>
     <div class="ui divider"></div>
      `
    },
    projectList: function (projects) {
      return `
      <div class="ui middle aligned divided list">
         ${projects.map(p=>theme.projectElement(p)).join('')}
     </div>
     <div class="ui divider"></div>
      `
    },
    projectElement: function (project) {
      return `
      <div class="item">
       <div class="right floated content">
         <div data-id="${project.uuid}" class="ui mini button action_online_account_set_project_as_local">Add to my projects</div>
       </div>
       <i class="building outline middle aligned icon"></i>
       <div class="content">
         ${project.name}
       </div>
     </div>
      `
    }

  }



  var init = function () {
    connections()
  }
  var connections =function () {

    connect(".actors_manager_edit_item","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      if (newValue) {
        push(act.edit("actors",{uuid:e.target.dataset.id,prop:e.target.dataset.prop, value:newValue, project:e.target.dataset.projectid}))
      }
      refresh()
    })

    connect(".actors_manager_close","click",(e)=>{
      sourceOccElement.remove()
      // pageManager.setActivePage("projectSelection")
    })
    connect(".actors_manager_add_Actor","click",async (e)=>{
      let owners = await getAllUsers()
      // push(act.add("actors",{uuid:genuuid(), actorUuid:genuuid(), name:firstName, lastName:lastName}))
      let fullActorsCollection = await getAllActors()
      owners = addActorNameToStaholders(owners,fullActorsCollection)
      generateUsersFusionList(owners, undefined)//add actor in relevant projects
      refresh()
    })
    connect(".actors_manager_remove_Actor","click",(e)=>{
      if (confirm("Remove this actor?")) {
        push(act.remove("actors",{project:e.target.dataset.projectid, uuid:e.target.dataset.id}))
        refresh()
      }
    })
    connect(".actors_manager_add_actor_stakeholder","click",async (e)=>{
      let owners = await getAllUsers()
      let fullActorsCollection = await getAllActors()
      owners = addActorNameToStaholders(owners,fullActorsCollection)
      generateUsersFusionList(owners, e.target.dataset.id)
    })
    connect(".actors_manager_remove_stakeholder_from_actor","click",async (e)=>{
      push(act.edit("stakeholders",{uuid:e.target.dataset.id,prop:"actorsId", value:undefined, project:e.target.dataset.projectid}))
      refresh()
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
    container = document.createElement('div');

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
    // container.appendChild(toNode(renderProfile(uuid)))

    document.body.appendChild(sourceOccElement)

    renderContainer()
    // renderSharingInfo()

  }


  var renderMenu =function (uuid){
    return theme.menu()
  }

  var renderContainer = async function() {
    // var store = await query.currentProject()
    // var actorsCollection=store.actors.items
    let fullActorsCollection = await getAllActors()
    let actorsCollection = removeDoubleActors(fullActorsCollection)
    let stakeholdersCollection = await getAllUsers()

    for (var i = 0; i < actorsCollection.length; i++) {
      let actor = actorsCollection[i]
      actor.stakeholders = []

      for (var j = 0; j < stakeholdersCollection.length; j++) {
        let stakeholder =stakeholdersCollection[j]
        if (stakeholder.actorsId == actor.uuid) {
          actor.stakeholders.push(stakeholder)
        }
      }
    }

    console.log(actorsCollection);
    if (!actorsCollection[0]) {
      container.innerHTML = theme.placeholder()
    }else {
      container.innerHTML = theme.actorsList(actorsCollection)
    }

  }
  var getAllUsers = async function () {
    var allProjects = await query.items("projects")
    var relatedProjects = allProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))
    var ownerTable = relatedProjects.map(e =>{
          return e.stakeholders.items.map(i => Object.assign({projectid:e.uuid, projectName:e.name}, i)) //add project prop to all items
        } )
        .reduce((a, b) => {return a.concat(b)},[])
        // .map((e) => {return {uuid:e.uuid, name:e.name}});
    console.log(ownerTable);
    return ownerTable
  }
  var getAllActors = async function () {
    var allProjects = await query.items("projects")
    var relatedProjects = allProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))
    var actorsTable = relatedProjects.map(e =>{
          if (e.actors) {
            return e.actors.items.map(i => Object.assign({projectid:e.uuid, projectName:e.name, appearIn:[{projectid:e.uuid, projectName:e.name}]}, i)) //add project prop to all items
          }else {
            return []
          }
        } )
        .reduce((a, b) => {return a.concat(b)},[])
        // .map((e) => {return {uuid:e.uuid, name:e.name}});
    console.log(actorsTable);
    //remove doubles

    return actorsTable
  }

  var addActorNameToStaholders = function (stakehoders, actors) {
    return stakehoders.map(e =>{
          if (e.actorsId) {

            let actor = actors.find(a=>a.uuid == e.actorsId)
            let actorName = "missing"
            if (actor) {
              actorName = actor.name+" "+actor.lastName
            }
            return  Object.assign({actorsName:actorName}, e) //add project prop to all items
          }else {
            return e
          }
        } )
  }

  var removeDoubleActors = function (actorList) {
    let cleanedList = []
    let cleanedId = {}
    for (var i = 0; i < actorList.length; i++) {
      let currentActor = actorList[i]
      //search in cleanedId
      if (!cleanedId[currentActor.uuid]) {
        cleanedList.push(currentActor)
        cleanedId[currentActor.uuid] = currentActor
      }else {
        cleanedId[currentActor.uuid].appearIn.push(currentActor.appearIn[0])
      }
    }
    return cleanedList
  }


  var generateUsersFusionList = function (owners, idToFuse) {
    showListMenu({
      sourceData:owners,
      displayProp:"name",
      display:[
        {prop:"projectName", displayAs:"Project", edit:false},
        {prop:"name", displayAs:"Prénom", edit:false},
        {prop:"lastName", displayAs:"Nom", edit:false},
        {prop:"org", displayAs:"Entreprise", edit:false},
        {prop:"role", displayAs:"Fonction", edit:false},
        {prop:"mail", displayAs:"E-mail", edit:false},
        {prop:"actorsName", displayAs:"Rep. by", edit:false}
      ],
      idProp:"uuid",
      extraButtons : [
        {name:"Add", class:"fuse", prop:"projectid", action: async (orev)=>{
          // pageManager.setActivePage("relations", {param:{context:"extract", uuid:orev.dataset.id}})//TODO should not call page ma,ager directly
          console.log(orev);

          //get the relevant actor or create a new one
          let actor = {uuid:genuuid(), actorUuid:genuuid(), project:orev.dataset.extra}
          if (idToFuse) {
            let actors = await getAllActors()
            let exisitingActor = actors.find(a=> a.uuid = idToFuse)
            if (exisitingActor) {
              actor = exisitingActor
              actor.project = orev.dataset.extra
              push(act.add("actors",actor))
            }
          }else {
            var firstName = prompt("New actor first name")
            var lastName = prompt("New actor last name")
            actor.name=firstName
            actor.lastName = lastName
            push(act.add("actors",actor))
          }

          push(act.edit("stakeholders",{uuid:orev.dataset.id,prop:"actorsId", value:actor.uuid, project:orev.dataset.extra}))

          refresh()
          }
        }
      ],
      onClick: async (ev)=>{
        // console.log(IdToFuse, ProjectWhereFusedIs);
        console.log(ev);
        // if (confirm("Fuse the users? The original id of the user will be replace with this one.")) {
        //   var allProjects = await query.items("projects")
        //   var relatedProjects = allProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))
        //
        //   var projectScope = relatedProjects.find(p=> p.uuid==ProjectWhereFusedIs)
        //   console.log(projectScope);
        //
        //   push(act.edit("stakeholders", {project:ProjectWhereFusedIs, uuid:IdToFuse, prop:"uuid", value:ev.target.dataset.id}))
        //
        //   var metalinksOriginToChange = projectScope.metaLinks.items.filter(m=>m.source==IdToFuse)
        //   var metalinksTargetToChange = projectScope.metaLinks.items.filter(m=>m.target==IdToFuse)
        //   for (link of metalinksOriginToChange) {
        //     // link.source = ev.target.dataset.id
        //     push(act.edit("metaLinks", {project:ProjectWhereFusedIs, uuid:link.uuid, prop:"source", value:ev.target.dataset.id}))
        //   }
        //   for (link of metalinksTargetToChange) {
        //     // link.target = ev.target.dataset.id
        //     push(act.edit("metaLinks", {project:ProjectWhereFusedIs, uuid:link.uuid, prop:"target", value:ev.target.dataset.id}))
        //   }
        //
        //   await workarounds.replaceStakeholderIdInMeetings(projectScope, IdToFuse, ev.target.dataset.id)
        //
        // }
        // setTimeout(function () {
        //   render()
        // }, 1000);

        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      }
    })
  }




  //UTILS

  var generateCloseInfo = function (value) {
    let mainText =''
    if (value && value != "") {
      mainText = `<div class="ui mini green label">Closed ${moment(value).fromNow() }</div>`
    }
    return mainText
  }



  var refresh = function (uuid) {
      renderContainer()
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
  self.update = update
  self.init = init

  return self
}

var actorsManagerView = createActorsManagerView()
actorsManagerView.init()
// createInputPopup({originalData:jsonFile})
