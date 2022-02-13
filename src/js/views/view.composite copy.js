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
        <div style='height:${d.modulesRatio}%' class='composite-${d.moduleName}'></div>
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

  async function setUpView(data) {
    var store = await query.currentProject()
    let currentPage = store.compositePages.find(p=>p.uuid== currentData.pageUuid)
    let catId = store.categories.find(c=>c.uuid == currentPage.parentCat).uuid
    console.log(currentPage);
    console.log(catId);
    let modulesRatio ={
      explorer:80,
      timeline:20,
      kanban:20,
    }
    if (!currentPage.showTimeline) {
      modulesRatio.explorer +=modulesRatio.timeline
      modulesRatio.timeline-=modulesRatio.timeline
    }

    if (!currentPage.showKanban) { //TODO always undifined add a prop to connect
      modulesRatio.explorer +=modulesRatio.timeline
      modulesRatio.kanban-=modulesRatio.kanban
    }

    localState.modulesData=[
      {modulesRatio:modulesRatio.timeline ,moduleName:"timeline" },
      {modulesRatio:modulesRatio.kanban ,moduleName:"kanban" },
      {modulesRatio:modulesRatio.explorer ,moduleName:"explorer" },
      {modulesRatio:20 ,moduleName:"textArea" },
    ]

    if (currentPage) {
      compositeModule.render()
      // document.querySelector(container).innerHTML=`
      //   <div style='height:${modulesRatio.timeline}%' class='partialTimeline'></div>
      //   <div style='height:${modulesRatio.kanban}%' class='partialKanban'></div>
      //   <div style='height:${modulesRatio.explorer}%'class='compositeExplorer'></div>
      // `
      var explorerView = createExplorerView({
        container : ".composite-explorer"
      });
      currentModules.push(explorerView)
      explorerView.init();
      explorerView.setActive({typeId:catId})

      if (currentPage.showTimeline) {
        var timelinePartial = createTimelinePartial({
          container : ".composite-timeline"
        })

        currentModules.push(timelinePartial)
        timelinePartial.init()
        timelinePartial.setActive({catId:catId,startField:currentPage.options_timelineStart, endField:currentPage.options_timelineEnd})
      }
      if (false) {//TODO reconnect the kanban to a prop currently will never show
        var kanbanPartial = createKanbanPartial({
          container : ".composite-kanban"
        })

        currentModules.push(kanbanPartial)
        kanbanPartial.init()
        kanbanPartial.setActive({catId:catId})
      }
      if(true){
        var textAreaPartial = createTextAreaPartial({
          container : ".composite-textArea"
        })

        currentModules.push(textAreaPartial)
        textAreaPartial.init()
        textAreaPartial.setActive({catId:catId,startField:currentPage.options_timelineStart, endField:currentPage.options_timelineEnd})
      }

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
