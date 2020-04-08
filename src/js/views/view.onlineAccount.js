var createOnlineAccountView = function ({
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
              <div class="ui red button action_online_account_close">close</div>
          </div>
        </div>
        </div>
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
    },
    localProjectList: function (projects) {
      return `
      <div class="ui middle aligned divided list">
         ${projects.map(p=>theme.localProjectElement(p)).join('')}
     </div>
     <div class="ui divider"></div>
      `
    },
    localProjectElement: function (project) {
      return `
      <div class="item">
       <div class="right floated content">
         <div data-id="${project.uuid}" class="ui mini button action_online_account_share_project">Add</div>
       </div>
       <i class="building outline middle aligned icon"></i>
       <div class="content">
         ${project.name}
       </div>
     </div>
      `
    },
    sharedProjectList: function (projects) {
      return `
      <div class="ui middle aligned divided list">
         ${projects.map(p=>theme.sharedProjectElement(p)).join('')}
     </div>
     <div class="ui divider"></div>
      `
    },
    sharedProjectElement: function (project) {
      return `
      <div class="item">
       <div class="right floated content">
         <div data-id="${project.uuid}" class="ui mini button ${project.isSyncing?"action_online_account_unsync_project":'action_online_account_sync_project'}">${project.isSyncing?"Stop Syncing":'Sync'}</div>
       </div>
       <i class="building outline middle aligned icon"></i>
       <div class="content">
         ${project.name}
         ${project.isSyncing?"<div class='ui mini horizontal teal label'>Synced</div>":"<div class='ui mini horizontal red label'>Not Synced</div>"}

       </div>
     </div>
      `
    }

  }



  var init = function () {
    connections()
  }
  var connections =function () {

    connect(".action_online_account_edit_item","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      if (newValue) {
        //TODO move to reducer
        app.store.userData.info[e.target.dataset.prop] = newValue
        dbConnector.setUserInfo(app.state.currentUser , e.target.dataset.prop, newValue)
        // push(act.edit("actions",{project:e.target.dataset.project, uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newValue}))
      }
      sourceOccElement.remove()
      update()
    })

    connect(".action_online_account_close","click",(e)=>{
      sourceOccElement.remove()
      pageManager.setActivePage("projectSelection")
    })
    connect(".action_online_account_login","click",async (e)=>{
      let dataSourceStore = app.store.userData.info
      let i = deepCopy(dataSourceStore)
      console.log('connecting');
      let user = {email:i.mail, password:i.onlineAccountPassword}
      await onlineBridge.connect(app.store.userData.info.bridgeServer)
      await onlineBridge.connectToOnlineAccount(user)

      sourceOccElement.remove()
      update()
    })
    connect(".action_online_account_logout","click",async (e)=>{
      await onlineBridge.logOutFromOnlineAccount()

      sourceOccElement.remove()
      update()
    })
    connect(".action_online_account_share_project","click",async (e)=>{

      var allProjects = await query.items("projects")
      var projectToShare = allProjects.find(p=>p.uuid== e.target.dataset.id)
      await onlineBridge.createOnlineProject(projectToShare)

      setProjectAsSyncing(e.target.dataset.id)

      sourceOccElement.remove()
      update()
    })
    connect(".action_online_account_unsync_project","click",async (e)=>{
      setProjectAsNotSyncing(e.target.dataset.id)

      sourceOccElement.remove()
      update()
    })
    connect(".action_online_account_sync_project","click",async (e)=>{
      setProjectAsSyncing(e.target.dataset.id)
        onlineBridge.getOnlineProjectAndResync(e.target.dataset.id)

      sourceOccElement.remove()
      update()
    })
    connect(".action_online_account_set_project_as_local","click",async (e)=>{
      let loadedProject = await onlineBridge.getSharedProject(e.target.dataset.id)
      console.log(loadedProject);
      if (loadedProject.data[0]) {
        console.log(loadedProject.data[0]);
        await dbConnector.addProject(loadedProject.data[0])
      }
      setProjectAsSyncing(loadedProject.data[0].uuid)


      sourceOccElement.remove()
      update()
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

    renderSharingInfo()

  }

  var renderProfile =function (uuid){

    let dataSourceStore = app.store.userData.info
    let i = deepCopy(dataSourceStore)
    if (!i.userUuid || !i.mail  || !i.onlineAccountPassword) {
      i.mail =i.mail || 'Set your mail'
      i.bridgeServer =i.bridgeServer || 'Set your server adress'
      i.onlineAccountPassword =i.onlineAccountPassword || 'Set your password'
    }

    let html =`
    <h2 class="header">
      My profile
    </h2>
    <div data-id="${i.uuid}" class="ui segment">
      <div class="content">
        <h3 class="header">Server</h3>
        ${i.bridgeServer}
        <i data-prop="bridgeServer" data-value="${i.bridgeServer}" data-id="${i.userUuid}" class="edit icon action_online_account_edit_item" style="opacity:0.2"></i>
        <div class="ui divider"></div>

        <h3 class="header">Mail</h3>
        ${i.mail}
        <i data-prop="mail" data-value="${i.mail}" data-id="${i.userUuid}" class="edit icon action_online_account_edit_item" style="opacity:0.2"></i>
        <div class="ui divider"></div>

        <h3 class="header">Last name</h3>
        ${i.onlineAccountPassword}
        <i data-prop="onlineAccountPassword" data-value="${i.onlineAccountPassword}" data-id="${i.userUuid}" class="edit icon action_online_account_edit_item" style="opacity:0.2"></i>
        <div class="ui divider"></div>

        <button class="ui primary button action_online_account_login">
          log-in
        </button>
        <button class="ui button action_online_account_logout">
          log-out
        </button>
      </div>
    </div>
    <div class="ui divider"></div>
    <div class="online_account_connection_status_area"></div>
    <div data-id="${i.uuid}" class="ui segment">
      <div class="online_account_sharing_info_area" ></div>
    </div>
    <div class="ui divider"></div>
    `
    return html
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }

  var renderSharingInfo = async function() {
    let isConnected = await onlineBridge.isAuthenticated()
    let renderArea = sourceOccElement.querySelector('.online_account_sharing_info_area')
    let connectionArea = sourceOccElement.querySelector('.online_account_connection_status_area')
    console.log(isConnected);
    if (!isConnected) {
      connectionArea.innerHTML=`
      <button class="ui disabled mini button">
        <i class="ellipsis horizontal icon"></i>
        Disconnected
      </button>
      `
    }else {
      connectionArea.innerHTML=`
      <button class="ui teal disabled mini button">
        <i class="wifi icon"></i>
        Connected
      </button>
      `

      //local projects
      let allLocalProjects = await query.items("projects")
      let relevantProjects = []
      if (app.store.relatedProjects && app.store.relatedProjects[0]) {
        relevantProjects = allLocalProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))
      }

      //online projects
      let onlineProjects = await onlineBridge.getSharedProjects()
      let onlineProjectsIds= onlineProjects.data.map(p=>p.uuid)

      // let activeOnlineProject =
      let localOnlyProjects = relevantProjects.filter(p=>!onlineProjectsIds.includes(p.uuid))
      let sharedLocalProjects = relevantProjects.filter(p=>onlineProjectsIds.includes(p.uuid))
      let sharedLocalProjectsIds= sharedLocalProjects.map(p=>p.uuid)
      onlineProjects.data = onlineProjects.data.filter(p=>!sharedLocalProjectsIds.includes(p.uuid))

      //check if the project is Syncing
      if (app.store.userData.info.syncingProjects) {//is there some project that sync? check if the prop is already used
        sharedLocalProjects.forEach((item, i) => {
          let isSyncing = app.store.userData.info.syncingProjects.includes(item.uuid)
          if (isSyncing) {
            item.isSyncing = true
          }
        });
      }

      //render

      renderArea.innerHTML+="Local only Projects"
      let localListHtml = theme.localProjectList(localOnlyProjects.reverse())
      renderArea.innerHTML+=localListHtml

      renderArea.innerHTML+="Shared local Projects"
      let sharedLocalListHtml = theme.sharedProjectList(sharedLocalProjects.reverse())
      renderArea.innerHTML+=sharedLocalListHtml

      renderArea.innerHTML+="Other Shared Projects"
      let listHtml = theme.projectList(onlineProjects.data.reverse())
      renderArea.innerHTML+=listHtml
    }
  }

  var setProjectAsSyncing = function (projectUuid) {
    if (!app.store.userData.info.syncingProjects) {//if properrty is used for the first time
      app.store.userData.info.syncingProjects = []
    }
    app.store.userData.info.syncingProjects.push(projectUuid)
    console.log(app.store.userData.info.syncingProjects);
    dbConnector.setUserInfo(app.state.currentUser , 'syncingProjects', app.store.userData.info.syncingProjects)
  }
  var setProjectAsNotSyncing = function (projectUuid) {

    app.store.userData.info.syncingProjects= app.store.userData.info.syncingProjects.filter(p => p != projectUuid)
    console.log(app.store.userData.info.syncingProjects);
    dbConnector.setUserInfo(app.state.currentUser , 'syncingProjects', app.store.userData.info.syncingProjects)
  }


  //UTILS

  var generateCloseInfo = function (value) {
    let mainText =''
    if (value && value != "") {
      mainText = `<div class="ui mini green label">Closed ${moment(value).fromNow() }</div>`
    }
    return mainText
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

var onlineAccountView = createOnlineAccountView()
onlineAccountView.init()
// createInputPopup({originalData:jsonFile})
