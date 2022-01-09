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
  var selectionArea = undefined
  localState.projectsData=[]

  var projectSelectionModule = undefined


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


  var init = function () {
    setUpView()
  }

  function setUpView(){
    projectSelectionModule = createAdler({
      container:document.querySelector(".center-container"),
    })
    projectSelectionModule.createLens("projectSelectionContainer",(d)=>`
        <div class="projectSelectionView">
          <div class="mountSite-menu"></div>
          <div class="mountSite-card columns is-multiline is-centered is-tablet"></div>
        </div>`
    )
    projectSelectionModule.createLens("projectSelectionMenu",(d)=>`
      <nav class="navbar" role="navigation" aria-label="main navigation">    
        <div id="navbarBasicExample" class="navbar-menu is-active">
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
                <input class="action_project_selection_search_project input is-rounded" type="text" placeholder="Search">
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
      <div class="column is-narrow">
        <div class="card">
          <div class="card-image">
            <figure class="image is-2by1">
              <img style="height:auto; width:100%;" src="${d.image || "./img/placeholderCover.png"}" alt="Placeholder image">
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
            <a href="#" class="action_project_selection_change_image card-footer-item">Cover</a>
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
        [".action_project_selection_search_project", "keyup", (e,p)=>{
            //e.stopPropagation()
            var value = container.querySelector(".action_project_selection_search_project").value
            var tag = getHashTags(value)
            filterProject = undefined
            if (tag) {
              filterProject = tag[0]
              console.log(filterProject);
              value = value.replace('#'+tag[0]+" ",'');
              value = value.replace('#'+tag[0],'');
            }
            filterText = value;
            getCurrentProjects(true)
            
        } ]
      ],
    }, '.mountSite-menu')
    selectionArea = mainArea.addLens("projectSelectionCards",{
      for:function(){
        return localState.projectsData
      },
      on:[
        [".action_project_selection_load_project", "click", async (e, p)=>{
          await setCurrentProject(p.uuid)
          urlHandlerService.setProjectUuid(p.uuid)
          pageManager.setActivePage("overview")
      } ],
        [".action_project_selection_change_info", "click", (e,p)=>{
          setProjectData(p)
        } ],
        [".action_project_selection_change_image", "click", (e,p)=>{
          setProjectImage(p.uuid, function () {
            update()
          })
        } ]
      ],
    }, '.mountSite-card')
    
  }

  var connections =function () {

    connect(".action_project_selection_remove_image","click",(e)=>{
      let confirmRemove = confirm("Do you want to reset the current cover image")
      if (confirmRemove) {
        removeProjectImage(e.target.dataset.id)
        setTimeout(function () {update()}, 2000);
      }

    })

  }

  var render = function () {
    getCurrentProjects()

  }

  var update = function () {
    render()
  }

  var setActive =function (data) {
    objectIsActive = true;
    setCurrentProject(undefined)
    if(onlineBridge){
      onlineBridge.connect(app.store.userData.info.bridgeServer, app.store.userData.info.socketPath)
      // setTimeout(function () {update()}, 2000);
    }
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  var getCurrentProjects = async function (updatePartial) {
    let projectArray =[]
    //let relevantProjects = await query.allRelatedProjects({uuid:1, name:1, infos:1, reference:1,coverImage:1, currentPbs:1, functions:1, requirements:1, stakeholders:1, description:1})
    let relevantProjects = await query.allRelatedProjects(["infos","currentPbs","requirements","stakeholders"])

      let sortedProject = getOrderedProjectList(relevantProjects, app.store.userData.preferences.projectDisplayOrder)
      let sortedVisibleProject = sortedProject.filter(p=>!app.store.userData.preferences.hiddenProject.includes(p.uuid))
      // alert(sortedVisibleProject[0].name)
      var html = sortedVisibleProject.forEach((i)=>{
        
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
        let projectImage = projectCriticalInfo.coverImage || undefined
        console.log(i);
        projectArray.push({
          uuid : i.uuid,
          infoRowId : projectCriticalInfo.uuid, 
          name: projectCriticalInfo.name, 
          reference:projectCriticalInfo.reference, 
          description: projectCriticalInfo.description || 'A new project', 
          infos:projectInfos, 
          image:projectImage,
        })
      })
      localState.projectsData = projectArray.filter(e=> fuzzysearch(filterText,e.name) || fuzzysearch(filterText,e.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")))
      if (updatePartial){
        selectionArea.update()
      }else{
        projectSelectionModule.update()
      }
      
  }

  var setProjectData = async function (p) {

      let newName = prompt("Change Project Name?", p.name)
      let newRef = prompt("Change Project Reference?", p.reference)
      let newDesc = prompt("Change Project Description?", p.description)

      if (newName) { dbConnector.setProjectData(p.uuid, 'name',newName) }
      if (newRef) { dbConnector.setProjectData(p.uuid, 'reference',newRef) }
      if (newDesc) { dbConnector.setProjectData(p.uuid, 'description',newDesc) }

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
