var createCompositeView = function ({
  originalData = "",
  container=".center-container",
  onClick = undefined,
  searchForAllItemsNames = false,
  maxElements = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var currentModules = []

  var theme={
    table:function () {
      return `
      <div class="example-table">
      </div>`
    },
    feed:function (events) {
      return `
      <div class="ui small feed">
        ${events}
      </div>`
    },
    event:function(event) {
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${(event.name && event.name!= "Missing item")? ("Item \'"+event.name + "\'" ): ("An item")} ${event.prop? (", property \'"+event.prop + "\', " ): ""} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${event.user?"by "+event.user+",":""} ${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>`
    }
  }

  var init = function () {
    connections()
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

  async function setUpView(data) {
    var store = await query.currentProject()
    let catId = store.categories[0].uuid
    // let currentBlueprint = store.blueprints.find(b=> b.uuid == data.blueprintId)
    let currentBlueprint =true
    if (currentBlueprint) {

      document.querySelector(container).innerHTML="<div class='partialTimeline'>efses</div><div class='compositeExplorer'></div>"
      var explorerView = createExplorerView({
        container : ".compositeExplorer"
      });
      currentModules.push(explorerView)
      explorerView.init();
      explorerView.setActive({typeId:catId})

      var timelinePartial = createTimelinePartial({
        container : ".partialTimeline"
      })

      currentModules.push(timelinePartial)
      timelinePartial.init()
      timelinePartial.setActive({catId:catId})
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
