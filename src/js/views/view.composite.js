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
        <div class="compositeModuleSettings">dzqdqdzq
        </div>
        <div style='height:${d.modulesRatio}%' class='composite-${d.uuid}'></div>
        <div class="compositeModuleAdd">
         <h2 class="subtitle is-inline">Add</h2>

          <button class="button is-info is-light is-small">Text</button>
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
      on:[],
    }, '')
  }

  function generatePageData(store){
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
        {
          modulesRatio:20,
          moduleType:"textArea",
          uuid:"textArea",
          settings:{},
         },
         {
          modulesRatio:20,
          moduleType:"textArea",
          uuid:"textArea2",
          settings:{},
         },
      ]
      
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
          container : ".composite-"+element.uuid
        })
        currentModules.push(textAreaPartial)
        textAreaPartial.init()
        textAreaPartial.setActive(element.settings)

      }
      
    }

  }

  async function setUpView(data) {
    var store = await query.currentProject()
    generatePageData(store)// fill the localState module data
    if (localState.modulesData) {
      compositeModule.render()
      appendModules(localState.modulesData)
    }
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
