var createProjectSelectionView = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var filterText = undefined;
  var filterProject = undefined;
  var displayClosedItems = false;
  var displayRecentlyClosedItems = false;
  var filterClosedDaysAgo = 1;

  var localState ={}
  localState.projectsData=[]

  var projectSelectionModule = undefined

  var theme = {}

  // theme.generateProjectCardHTML = function (projectId, title, reference, description, infos, image) {
  //   return `
  //     <div class="card">
  //       ${image ?
  //         `<div class="image">
  //           <img src="${image}">
  //         </div>`
  //         :
  //         `<div class="ui content">
  //           <h2 class='ui center small aligned icon header'>
  //             <i class="building outline icon"></i>
  //           </h2>
  //         </div>
  //         `
  //       }

  //       <div class="content">
  //         <div class="header">${title}</div>
  //         <div class="meta">
  //           <a>${reference}</a>
  //         </div>
  //         <div class="description">
  //           ${description}
  //         </div>
  //       </div>
  //       <div class="extra content">
  //         <span class="right floated">
  //           <i class="sitemap icon"></i>
  //           ${infos.currentPbsNbr } Sub-Systems
  //         </span>
  //         <span>
  //           <i class="users icon"></i>
  //           ${infos.stakeholdersNbr } stakeholders
  //         </span>
  //       </div>
  //       <div class="extra content">
  //         <span class="right floated">

  //         </span>
  //         <span>
  //           <i class="comment icon"></i>
  //           ${infos.requirementsNbr } requirements
  //         </span>
  //       </div>
  //       <div class="extra content">
  //         <span>
  //           <div class="ui mini basic icon buttons">
  //             <button data-id="${projectId}" class="ui button action_project_selection_change_info"><i  data-id="${projectId}"  class="edit icon action_project_selection_change_info"></i></button>
  //             <button data-id="${projectId}" class="ui button action_project_selection_change_image"><i  data-id="${projectId}"  class="image icon action_project_selection_change_image"></i></button>
  //             <button data-id="${projectId}" class="ui button action_project_selection_remove_image"><i  data-id="${projectId}"  class="x icon icon action_project_selection_remove_image"></i></button>
  //           </div>
  //           <button data-id="${projectId}" class="ui mini teal button action_project_selection_load_project">
  //             Focus
  //             <i data-id="${projectId}" class="icon right arrow"></i>
  //           </button>
  //         </span>
  //       </div>
  //     </div>
  //   `
  // }



  var init = function () {
    // connections()
    //update()
    setUpView()
  }

  function setUpView(){
    projectSelectionModule = createAdler({
      container:document.querySelector(".center-container"),
    })
    projectSelectionModule.createLens("projectSelectionContainer",(d)=>`
        <div class="projectSelectionView">
          <div class="mountSite-menu"></div>
          <div class="mountSite-card columns is-multiline is-mobile"></div>
        </div>`
    )
    projectSelectionModule.createLens("projectSelectionMenu",(d)=>`
      <nav class="navbar" role="navigation" aria-label="main navigation">    
        <div id="navbarBasicExample" class="navbar-menu">
          <div class="navbar-start">

            <div class="buttons">
              <a class=" action_project_selection_add_project button is-primary is-light">
              <span class="icon is-small">
                <i class="fas fa-plus"></i>
              </span>
              <span>Add a project</span>
              </a>
            </div>
      
          </div>
      
          <div class="navbar-end">
            <div class="navbar-item">
              <p class="control has-icons-left">
                <input class="input is-rounded" type="text" placeholder="Search">
                <span class="icon is-left">
                  <i class="fas fa-search" aria-hidden="true"></i>
                </span>
              </p>
            </div>
          </div>
        </div>
      </nav>`
    )
    projectSelectionModule.createLens("projectSelectionCards",(d)=>`
      <div class="column is-one-quarter">
        <div class="card">
          <div class="card-image">
            <figure class="image is-4by3">
              <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${d.name}</p>
                <p class="subtitle is-6">${d.reference}</p>
              </div>
            </div>

            <div class="content">
              ${d.description}
            </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item">Save</a>
            <a href="#" class="action_project_selection_change_info card-footer-item">Edit</a>
            <a href="#" class="action_project_selection_load_project card-footer-item">Load</a>
          </footer>
        </div>
      </div>`
    )
    let mainArea = projectSelectionModule.addLens("projectSelectionContainer",{}, '')
    mainArea.addLens("projectSelectionMenu",{
      on:[
        [".action_project_selection_add_project", "click", async (e, p)=>{
          var popup= await createPromptPopup({
            title:"Add a new project",
            imageHeader:"./img/obs.png",
            fields:{ type:"input",id:"projectName" ,label:"Project name", placeholder:"Set a name for the project" }
          })
          if (popup && popup.result) {
            dbConnector.addProject(createNewProject(popup.result, {placeholder:true}))
            setTimeout(function () {update()}, 1000);
          }
      } ],
        [".action_startup_remove_user", "click", (e,p)=>{
            if (confirm("This will remove "+ p.name +" and all it's projects")) {
              dbConnector.removeUser(p.uuid).then(function () {
                getUsersData()
              })
            }
        } ]
      ],
    }, '.mountSite-menu')
    mainArea.addLens("projectSelectionCards",{
      for:function(){
        return localState.projectsData
      },
      on:[
        [".action_project_selection_load_project", "click", async (e, p)=>{
          await setCurrentProject(p.uuid)
          pageManager.setActivePage("overview")
      } ],
        [".action_project_selection_change_info", "click", (e,p)=>{
          setProjectData(p)
        } ]
      ],
      // for:function(){
      //   return [{test:"test"},{test:"test"},{test:"test"},{test:"test"},{test:"test"},{test:"test"},{test:"test"},{test:"test"},{test:"test"}]
      // },
    }, '.mountSite-card')
    
  }

  var connections =function () {

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

  }

  var render = function () {
    // container.innerHTML ='<div class="ui container"><div class="umenu"></div><div class="ui link cards cardSelectionlist"></div></div>'
    // renderSearchArea(container);
    // renderList(container);
    getCurrentProjects()
    // projectSelectionModule.render()

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

  var getCurrentProjects = async function () {
    let projectArray =[]
    //let relevantProjects = await query.allRelatedProjects({uuid:1, name:1, infos:1, reference:1,coverImage:1, currentPbs:1, functions:1, requirements:1, stakeholders:1, description:1})
    let relevantProjects = await query.allRelatedProjects(["infos","currentPbs","requirements","stakeholders"])

      let sortedProject = getOrderedProjectList(relevantProjects, app.store.userData.preferences.projectDisplayOrder)
      let sortedVisibleProject = sortedProject.filter(p=>!app.store.userData.preferences.hiddenProject.includes(p.uuid))
      var html = sortedVisibleProject.filter(e=> fuzzysearch(filterText,e.name) || fuzzysearch(filterText,e.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""))).forEach((i)=>{
        if (!i.currentPbs || !i.requirements || !i.stakeholders) { //in case an issue preveted to get the correct count
          i.currentPbs = [];
          i.requirements = [];
          i.stakeholders = [];
        }
        let projectInfos = {
          currentPbsNbr  : (i.currentPbs.length - 1),
          requirementsNbr  : (i.requirements.length),
          stakeholdersNbr  : (i.stakeholders.length)
        }
        let projectCriticalInfo = getCriticalInfos(i)
        let projectImage = i.coverImage || undefined
        console.log(i);

        projectArray.push({
          uuid : i.uuid,
          name: projectCriticalInfo.name, 
          reference:projectCriticalInfo.reference, 
          description: projectCriticalInfo.description || 'A new project', 
          infos:projectInfos, 
          image:projectImage,
        })
      })
      localState.projectsData = projectArray
      projectSelectionModule.render()
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

  var setProjectData = async function (p) {

      let newName = prompt("Change Project Name?", p.name)
      let newRef = prompt("Change Project Reference?", p.reference)
      let newDesc = prompt("Change Project Description?", p.description)

      if (newName) { dbConnector.setProjectData(uuid, 'name',newName) }
      if (newRef) { dbConnector.setProjectData(uuid, 'reference',newRef) }
      if (newDesc) { dbConnector.setProjectData(uuid, 'description',newDesc) }

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
