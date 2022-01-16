var createOverview = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var overviewModule = undefined


  var init = function () {
    // update()
    setUpView()

  }

  function setUpView(){
    overviewModule = createAdler({
      container:document.querySelector(".center-container"),
    })
    overviewModule.createLens("overviewModule",(d)=>`
      <div class="container has-text-centered">
        <figure class="image is-inline-block is-128x128">
          <img class="is-rounded" src="https://bulma.io/images/placeholders/128x128.png">
        </figure>
        <h1 class="title">Title</h1>
        <div class="block"></div>
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-8">
            <div class="tile">
              <div class="tile is-parent is-vertical">
                <article class="tile is-child notification is-primary">
                  <p class="title">Vertical...</p>
                  <p class="subtitle">Top tile</p>
                </article>
                <article class="tile is-child notification is-warning">
                  <p class="title">...tiles</p>
                  <p class="subtitle">Bottom tile</p>
                </article>
              </div>
              <div class="tile is-parent">
                <article class="tile is-child notification is-info">
                  <p class="title">Middle tile</p>
                  <p class="subtitle">With an image</p>
                  <figure class="image is-4by3">
                    <img src="https://bulma.io/images/placeholders/640x480.png">
                  </figure>
                </article>
              </div>
            </div>
            <div class="tile is-parent">
              <article class="tile is-child notification is-danger">
                <p class="title">Wide tile</p>
                <p class="subtitle">Aligned with the right tile</p>
                <div class="content">
                  <!-- Content -->
                </div>
              </article>
            </div>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child notification is-success">
              <div class="content">
                <p class="title">Tall tile</p>
                <p class="subtitle">With even more content</p>
                <div class="content">
                  <!-- Content -->
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>`
    )

    let mainArea = overviewModule.addLens("overviewModule",{}, '')
    // mainArea.addLens("projectSelectionMenu",{
    //   on:[
    //     [".action_project_selection_add_project", "click", async (e, p)=>{
    //       var popup= await createPromptPopup({
    //         title:"Add a new project",
    //         imageHeader:"./img/obs.png",
    //         fields:{ type:"input",id:"projectName" ,label:"Project name", placeholder:"Set a name for the project" }
    //       })
    //       if (popup && popup.result) {
    //         dbConnector.addProject(createNewProject(popup.result, {placeholder:true}))
    //         setTimeout(function () {update()}, 1000);
    //       }
    //   } ],
    //     [".action_project_selection_search_project", "keyup", (e,p)=>{
    //         //e.stopPropagation()
    //         var value = container.querySelector(".action_project_selection_search_project").value
    //         var tag = getHashTags(value)
    //         filterProject = undefined
    //         if (tag) {
    //           filterProject = tag[0]
    //           console.log(filterProject);
    //           value = value.replace('#'+tag[0]+" ",'');
    //           value = value.replace('#'+tag[0],'');
    //         }
    //         filterText = value;
    //         getCurrentProjects(true)
            
    //     } ]
    //   ],
    // }, '.mountSite-menu')
    // selectionArea = mainArea.addLens("projectSelectionCards",{
    //   for:function(){
    //     return localState.projectsData
    //   },
    //   on:[
    //     [".action_project_selection_load_project", "click", async (e, p)=>{
    //       await setCurrentProject(p.uuid)
    //       urlHandlerService.setProjectUuid(p.uuid)
    //       pageManager.setActivePage("overview")
    //   } ],
    //     [".action_project_selection_change_info", "click", (e,p)=>{
    //       setProjectData(p)
    //     } ],
    //     [".action_project_selection_change_image", "click", (e,p)=>{
    //       setProjectImage(p.uuid, function () {
    //         update()
    //       })
    //     } ]
    //   ],
    // }, '.mountSite-card')
    
  }


  var render = async function () {
    var store = await query.currentProject()
    if (store) {
      var projectInfos = getCriticalInfos(store)
      // alert("uncoment here")
      await clearUncompleteLinks()//clean all uncomplete metalink of the project
      updateFileForRetroCompatibility(store) //check file for retrocompatbiity
      // //create a PBS and current user stakholder if first opening of project
      // if (!store.currentPbs[0]) {
      //   createPBS()
      //   createUserStakeholder()
      // }


      overviewModule.update()
      createActivityFeed({
        container:'.overviewActivity',
        maxElements:30,
        searchForAllItemsNames :true,
        onClick:function (e) {
          showSingleItemService.showById(e.target.dataset.id)
        }
      })
    }
  }


  function updateFileForRetroCompatibility(store) {
    function alertAboutUpdate(extraInfos) {
      alert("This project was created with an earlier version and was updated. " +extraInfos)
    }
    //Tags from 1.7.2
    if (!store.tags[0]) {
      store.tags = [
          {uuid: uuid(), name: "Approved", color: "#ffffff"},
          {uuid: uuid(), name: "Closed", color: "#ffffff"},
          {uuid: uuid(), name: "Rejected", color: "#ffffff"}
        ]
      dbConnector.addProjectCollection(store.uuid, "tags", store.tags)
      alertAboutUpdate("Tags feature has been added.")
    }
    if (!store.meetings[0]) {
      store.meetings = [{uuid:uuid(),relations:[],  createdOn:new Date(),title:"Meeting exemple",content:"Use Markdown",
          participants:{
            present:["f896546e"],
            absent:["fefiose"],
            cc:["fefiose"]
          },
          chapters:[{
            uuid:uuid(),
            name:"Chapitre",
            topics:[
            ]
          }]
        }]
      dbConnector.addProjectCollection(store.uuid, "meetings", store.meetings)
      alertAboutUpdate("Meetings feature has been added.")
    }
    if (!store.categories[0]) {
      store.categories=[
          {uuid: uuid(), name: "Space", svgPath: "M504 352H136.4c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0 96H136.1c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0-192H136.6c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm106.5-139L338.4 3.7a48.15 48.15 0 0 0-36.9 0L29.5 117C11.7 124.5 0 141.9 0 161.3V504c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V256c0-17.6 14.6-32 32.6-32h382.8c18 0 32.6 14.4 32.6 32v248c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V161.3c0-19.4-11.7-36.8-29.5-44.3z"},
          {uuid: uuid(), name: "Electrical", svgPath: "M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"},
          {uuid: uuid(), name: "Network", svgPath: "M640 264v-16c0-8.84-7.16-16-16-16H344v-40h72c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H224c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h72v40H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h104v40H64c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h304v40h-56c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h104c8.84 0 16-7.16 16-16zM256 128V64h128v64H256zm-64 320H96v-64h96v64zm352 0h-96v-64h96v64z"},
          {uuid: uuid(), name: "Mechanical", svgPath: "M288 64c17.7 0 32-14.3 32-32S305.7 0 288 0s-32 14.3-32 32 14.3 32 32 32zm223.5-12.1c-2.3-8.6-11-13.6-19.6-11.3l-480 128c-8.5 2.3-13.6 11-11.3 19.6C2.5 195.3 8.9 200 16 200c1.4 0 2.8-.2 4.1-.5L240 140.8V224H64c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H272v-91.7l228.1-60.8c8.6-2.3 13.6-11.1 11.4-19.6zM176 384H80v-96h96v96zm160-96h96v96h-96v-96zm-32 0v96h-96v-96h96zM192 96c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"},
          {uuid: uuid(), name: "Architecture", svgPath: "M560 448h-16V96H32v352H16.02c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16H176c8.84 0 16-7.16 16-16V320c0-53.02 42.98-96 96-96s96 42.98 96 96l.02 160v16c0 8.84 7.16 16 16 16H560c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm0-448H16C7.16 0 0 7.16 0 16v32c0 8.84 7.16 16 16 16h544c8.84 0 16-7.16 16-16V16c0-8.84-7.16-16-16-16z"}
        ]
      dbConnector.addProjectCollection(store.uuid, "categories", store.categories)
      alertAboutUpdate("Categories feature has been added.")
    }
    if (!store.interfacesTypes[0]) {
      store.interfacesTypes=[
          {uuid: uuid(), name: "Interface", color: "#ffffff"},
          {uuid: uuid(), name: "Physical connection", color: "#ffffff"},
          {uuid: uuid(), name: "Data connection", color: "#ffffff"},
          {uuid: uuid(), name: "Command connection", color: "#ffffff"},
          {uuid: uuid(), name: "Power connection", color: "#ffffff"},
          {uuid: uuid(), name: "Electrical connection", color: "#ffffff"},
          {uuid: uuid(), name: "Mechanical connection", color: "#ffffff"}
        ],
      dbConnector.addProjectCollection(store.uuid, "interfacesTypes", store.interfacesTypes)
      alertAboutUpdate("Interfaces types have been added.")
    }
  }



  var update = function () {
    if (objectIsActive) {
      render()
    }
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
    container.innerHTML = "";
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var overview = createOverview(".center-container");
overview.init();
overview.setActive();
