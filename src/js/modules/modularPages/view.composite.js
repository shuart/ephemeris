var createCompositeView = function ({
  originalData = "",
  container=".center-container",
  }={}) {
  var self ={};
  var objectIsActive = false;
  var currentModules = []
  var localState={
    modulesData:[],
  }
  var compositeModule = undefined

  var pageSettings = [
    {
      moduleType:"timeline",

    }
  ]


  var init = function () {
    connections()
    setUpTheme()
    // render()
  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentData) {
        var store = await query.currentProject()
        for (var i = 0; i < currentModules.length; i++) {
          currentModules[i].updateModule(store)
        }
      }
    })
  }

  function setUpTheme(){
    
    compositeModule = createAdler({
      container:document.querySelector(".center-container"),
    })
    compositeModule.addCSS(`
      .compositeModule:hover .compositeModuleSettings{
        opacity:1;
      }
      .compositeModule .compositeModuleSettings{
        opacity:0;
      }
      .compositeModuleAdd:hover{
        opacity:1;
      }
      .compositeModuleAdd{
        opacity:0;
      }
      .ql-tooltip {
        z-index:50
      }
    `)
    compositeModule.createLens("compositeContainer",(d)=>`
        <div class="pageRootView">
        </div>`
    )
    compositeModule.createLens("compositeContainerf",(d)=>`
        <div class="fsefesfs">
        </div>`
    )
    compositeModule.createLens("modules",(d)=>`
      <div class="compositeModule">
        <div class="compositeModuleSettings">
          <button class="button is-info is-light is-small action_composite_remove_module">X</button>
        </div>
        <div style='height:${d.modulesRatio}%' class='composite-${d.uuid}'></div>
        <div class="compositeModuleAdd">
          <button class="button is-info is-light is-small action_composite_add_module">+</button>
        </div>
      </div>
      `
    )

    var root = compositeModule.addLens("compositeContainer",{},'')
    root.addLens("modules",{
      for:function(){
        // return localState.projectsData
        return localState.modulesData
        // return [
        //   {modulesRatio:'50' ,moduleName:"timeline" },
        // ]
      },
      on:[
        [".action_composite_add_module", "click", async (e, p)=>{
          // await setCurrentProject(p.uuid)
          // urlHandlerService.setProjectUuid(p.uuid)
          // pageManager.setActivePage("overview")
          addNewModule()
          // _modules.add({source:currentData.pageUuid})
        } ],
        [".action_composite_remove_module", "click", async (e, p)=>{
          console.log(e,p)
          removeModule(p.uuid)
        } ],
      ],
    }, '')
  }

  async function generatePageData(store){
    let currentPage = store.compositePages.find(p=>p.uuid== currentData.pageUuid)
    if (currentPage) { //Is a page
      let catId = store.categories.find(c=>c.uuid == currentPage.parentCat).uuid
      console.log(currentPage);
      console.log(catId);
      let modulesRatio ={
        explorer:80,
        timeline:20,
        kanban:20,
      }
      // if (!currentPage.showTimeline) {
      //   modulesRatio.explorer +=modulesRatio.timeline
      //   modulesRatio.timeline-=modulesRatio.timeline
      // }
  
      // if (!currentPage.showKanban) { //TODO always undifined add a prop to connect
      //   modulesRatio.explorer +=modulesRatio.timeline
      //   modulesRatio.kanban-=modulesRatio.kanban
      // }
  
      localState.modulesData=[
        {
          modulesRatio:modulesRatio.timeline,
          moduleType:"timeline",
          uuid:"timeline",
          settings:{catId:catId,startField:currentPage.options_timelineStart, endField:currentPage.options_timelineEnd},
         },
        // {
        //   modulesRatio:modulesRatio.kanban,
        //   moduleType:"kanban",
        //   uuid:"kanban",
        //   settings:{catId:catId},
        //  },
        {
          modulesRatio:modulesRatio.explorer,
          moduleType:"explorer",
          uuid:"explorer",
          settings:{typeId:catId},
         },
      ]
      let currentPageModules = await _modules.getAllModulesAttachedToSourceId({source:currentData.pageUuid})
      localState.modulesData = localState.modulesData.concat(currentPageModules)
      console.log(localState.modulesData)
    }else{//is another element
      let currentElement = store.currentPbs.find(p=>p.uuid== currentData.pageUuid)
      if (currentElement) {
        alert('is element')
      }
    }
  }

  function appendModules(modulesData){
    for (let index = 0; index < modulesData.length; index++) {
      const element = modulesData[index];
      if (element.moduleType == "explorer") {
        var explorerView = createExplorerView({
          container : ".composite-"+element.uuid
        });
        currentModules.push(explorerView)
        explorerView.init();
        explorerView.setActive(element.settings)
      }else if(element.moduleType == "timeline"){
        var timelinePartial = createTimelinePartial({
          container : ".composite-"+element.uuid
        })
        currentModules.push(timelinePartial)
        timelinePartial.init()
        timelinePartial.setActive(element.settings)
      }else if(element.moduleType == "kanban"){
        var kanbanPartial = createKanbanPartial({
          container : ".composite-"+element.uuid
        })
        currentModules.push(kanbanPartial)
        kanbanPartial.init()
        kanbanPartial.setActive(element.settings)
      }else if(element.moduleType == "textArea"){
        var textAreaPartial = createTextAreaPartial({
          container : ".composite-"+element.uuid,
          uuid:element.uuid,
        })
        currentModules.push(textAreaPartial)
        textAreaPartial.init()
        textAreaPartial.setActive(element.settings)

      }else if(element.moduleType == "propsArea"){
        var propsAreaPartial = createPropsAreaPartial({
          container : ".composite-"+element.uuid,
          uuid:element.uuid,
        })
        currentModules.push(propsAreaPartial)
        propsAreaPartial.init()
        propsAreaPartial.setActive(element.settings)

      }
      
    }

  }

  async function setUpView(data) {
    var store = await query.currentProject()
    await generatePageData(store)// fill the localState module data
    if (localState.modulesData) {
      console.log(localState.modulesData)
      compositeModule.render()
      appendModules(localState.modulesData)
    }
  }

  async function addNewModule(){
    let moduleTypes = [
      {name:"explorer", moduleType:"explorer"},
      {name:"timeline", moduleType:"timeline"},
      {name:"kanban", moduleType:"kanban"},
      {name:"textArea", moduleType:"textArea"},
      {name:"propsArea", moduleType:"propsArea"},
    ]
  
    let options = moduleTypes.map(c => {
      return { type:"button",id:uuid(), label:c.name, onClick:async(v)=>{
  
          _modules.add({source:currentData.pageUuid, moduleType:c.moduleType})
          alert("efsesf")
        }
      }
    })
  
    var popup= await createPromptPopup({
      title:"Add a new Module",
      iconHeader:"sitemap",
      fields:options,
      confirmationType:"cancel"
    })
  }
  async function removeModule(uuid){
    _modules.remove(uuid)
  }

  async function render() {
    var store = await query.currentProject()
  }

  var update = function (data) {
    render(data)
  }

  var setActive =function (data) {
    currentData = data||{}
    objectIsActive = true;
    currentModules = []
    setUpView(data)
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}
var compositeView = createCompositeView();
compositeView.init();
