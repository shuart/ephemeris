var createProjectSelectionView = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var filterText = undefined;
  var filterProject = undefined;
  var displayClosedItems = false;
  var displayRecentlyClosedItems = false;
  var filterClosedDaysAgo = 1;

  var theme = {}
  theme.noProject = function () {
    return `
    <div style="width: 80%;left: 10%;margin-top: 5%;" class="ui placeholder segment">
      <div class="ui icon header">
        <i class="city icon"></i>
        No project yet
      </div>
      <div class="ui primary button action_project_selection_add_project">Add Project</div>
    </div>`
  }
  theme.generateProjectTitleHTML = function (projectId, title, reference) {
    return `
    <h2 data-id="${projectId}" class="ui header action-load-project">
       <i class="building outline icon"></i>
      <div class="content">
        ${title}
        <div class="sub header">
          ${reference}
          <button data-id="${projectId}" class="ui mini basic button action_project_selection_load_project">
            Focus
            <i data-id="${projectId}" class="icon right arrow"></i>
          </button>
        </div>
      </div>
    </h2>`
  }
  theme.generateProjectCardHTML = function (projectId, title, reference, description, infos, image) {
    return `
      <div class="card">
        ${image ?
          `<div class="image">
            <img src="${image}">
          </div>`
          :
          `<div class="ui content">
            <h2 class='ui center small aligned icon header'>
              <i class="building outline icon"></i>
            </h2>
          </div>
          `
        }

        <div class="content">
          <div class="header">${title}</div>
          <div class="meta">
            <a>${reference}</a>
          </div>
          <div class="description">
            ${description}
          </div>
        </div>
        <div class="extra content">
          <span class="right floated">
            <i class="sitemap icon"></i>
            ${infos.currentPbsNbr } Sub-Systems
          </span>
          <span>
            <i class="users icon"></i>
            ${infos.stakeholdersNbr } stakeholders
          </span>
        </div>
        <div class="extra content">
          <span class="right floated">

          </span>
          <span>
            <i class="comment icon"></i>
            ${infos.requirementsNbr } requirements
          </span>
        </div>
        <div class="extra content">
          <span>
            <div class="ui mini basic icon buttons">
              <button data-id="${projectId}" class="ui button action_project_selection_change_info"><i  data-id="${projectId}"  class="edit icon action_project_selection_change_info"></i></button>
              <button data-id="${projectId}" class="ui button action_project_selection_change_image"><i  data-id="${projectId}"  class="image icon action_project_selection_change_image"></i></button>
              <button data-id="${projectId}" class="ui button action_project_selection_remove_image"><i  data-id="${projectId}"  class="x icon icon action_project_selection_remove_image"></i></button>
            </div>
            <button data-id="${projectId}" class="ui mini teal button action_project_selection_load_project">
              Focus
              <i data-id="${projectId}" class="icon right arrow"></i>
            </button>
          </span>
        </div>
      </div>
    `
  }
  theme.searchArea = function () {
    return `
      <div class="ui icon input">
          <input class="list-search-input" type="text" placeholder="Search list...">
          <i class="search icon"></i>
      </div>
      <button class="ui mini basic green  button action_project_selection_add_project">
        Add a new project
        <i class="icon plus"></i>
      </button>
      <div class="ui divider"></div>
      `
  }


  var init = function () {
    connections()
    //update()

  }

  var connections =function () {
    connect(".action_project_selection_load_project","click",(e)=>{
      setCurrentProject(e.target.dataset.id)
      pageManager.setActivePage("overview")
    })
    connect(".action_project_selection_add_project","click", async (e)=>{
      // var newReq = prompt("Add a new Project")
      var popup= await createPromptPopup({
        title:"Add a new project",
        imageHeader:"./img/obs.png",
        fields:{ type:"input",id:"projectName" ,label:"Project name", placeholder:"Set a name for the project" }
      })
      if (popup && popup.result) {
        dbConnector.addProject(createNewProject(popup.result, {placeholder:true}))
        setTimeout(function () {update()}, 1000);
      }
    })
    connect(".action_project_selection_change_info","click",(e)=>{
      setProjectData(e.target.dataset.id)
    })
    connect(".action_project_selection_change_image","click",(e)=>{
      setProjectImage(e.target.dataset.id, function () {
        update()
      })
    })
    connect(".action_project_selection_remove_image","click",(e)=>{
      let confirmRemove = confirm("Do you want to reset the current cover image")
      if (confirmRemove) {
        removeProjectImage(e.target.dataset.id)
        setTimeout(function () {update()}, 2000);
      }

    })
    connect(".project-selection-new-project-input","keyup",(e)=>{
      if (e.keyCode == 13) {
        var newAction ={project:e.target.dataset.project, open:true, name:e.target.value, des:undefined, dueDate:undefined, created:Date.now(), assignedTo:undefined}
        push(act.add("actions",newAction))

        update()
      }
    })
  }

  var render = function () {
    container.innerHTML ='<div class="ui container"><div class="umenu"></div><div class="ui link cards cardSelectionlist"></div></div>'
    renderSearchArea(container);
    renderList(container);

  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    setCurrentProject(undefined)
    renderCDC()//TODO Ugly
    if(onlineBridge){
      onlineBridge.connect(app.store.userData.info.bridgeServer, app.store.userData.info.socketPath)
      // setTimeout(function () {update()}, 2000);
    }
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  var renderList = async function (container) {
    let relevantProjects = await query.allRelatedProjects({uuid:1, name:1, reference:1,coverImage:1, currentPbs:1, functions:1, requirements:1, stakeholders:1, description:1})

    if (app.store.relatedProjects && app.store.relatedProjects[0]) {
      let sortedProject = getOrderedProjectList(relevantProjects, app.store.userData.preferences.projectDisplayOrder)
      let sortedVisibleProject = sortedProject.filter(p=>!app.store.userData.preferences.hiddenProject.includes(p.uuid))
      var html = sortedVisibleProject.filter(e=> fuzzysearch(filterText,e.name) || fuzzysearch(filterText,e.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""))).reduce((acc,i)=>{
        let projectInfos = {
          currentPbsNbr  : (i.currentPbs.length - 1),
          requirementsNbr  : (i.requirements.length),
          stakeholdersNbr  : (i.stakeholders.length)
        }
        let projectImage = i.coverImage || undefined
        acc += theme.generateProjectCardHTML(i.uuid, i.name, i.reference, i.description.short || 'A new project', projectInfos, projectImage)
        return acc
      },'')
      container.querySelector('.cardSelectionlist').innerHTML = html
    }else {
      app.store.relatedProjects= []
      container.querySelector('.cardSelectionlist').innerHTML = theme.noProject()
    }
  }


  var renderSearchArea =function (container) {
    var addSearch = document.createElement('div');
    addSearch.classList="ui item"
    addSearch.innerHTML = theme.searchArea()
    container.querySelector(".umenu").appendChild(addSearch)

    addSearch.addEventListener('keyup', function(e){
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
      renderList(container)
    });
  }

  var setProjectData = async function (uuid) {
    let allProjects = await query.items("projects")
    let currentProject = allProjects.filter(e=> e.uuid == uuid)[0]//TODO USe reducer
    if (currentProject) {
      let newName = prompt("Change Project Name?", currentProject.name)
      let newRef = prompt("Change Project Reference?", currentProject.reference)
      let newDesc = prompt("Change Project Description?", currentProject.description.short)

      if (newName) { dbConnector.setProjectData(uuid, 'name',newName) }
      if (newRef) { dbConnector.setProjectData(uuid, 'reference',newRef) }
      if (newDesc) { dbConnector.setProjectData(uuid, 'description',{short:newDesc}) }
    }
    setTimeout(function () {
      update()
    }, 1000);
  }

  var setProjectImage = function (uuid, callback) {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
       var file = e.target.files[0];
    }
    input.click();
    var canvas=document.createElement("canvas");
    var ctx=canvas.getContext("2d");
    var cw=canvas.width;
    var ch=canvas.height;
    var maxW=290;
    var maxH=1290;

    input.addEventListener('change', handleFiles);

    function handleFiles(e) {
      var img = new Image;
      img.onload = function() {
        var iw=img.width;
        var ih=img.height;
        var scale=Math.min((maxW/iw),(maxH/ih));
        var iwScaled=iw*scale;
        var ihScaled=ih*scale;
        canvas.width=iwScaled;
        canvas.height=ihScaled;
        canvas.width=290;
        canvas.height=150;
        ctx.drawImage(img,0,0,iwScaled,ihScaled);
        let dataUrl = canvas.toDataURL("image/jpeg",0.5);
        dbConnector.setProjectData(uuid, 'coverImage',dataUrl)
        if (callback) {
          callback()
        }
      }
      img.src = URL.createObjectURL(e.target.files[0]);
    }
  }
  var removeProjectImage = function (uuid) {
    dbConnector.setProjectData(uuid, 'coverImage',undefined)
  }


  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}
var projectSelectionView = createProjectSelectionView(".center-container")
projectSelectionView.init()
