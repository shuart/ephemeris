var createLeftMenuActions = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {
    //connect to DB
    document.addEventListener("storeUpdated", function () {
      if (objectIsActive) {
        update()
      }
    })
    //component connection
    //None
  }

  var update = function () {
    render()
  }

  var render = function () {
    // document.querySelector(".left-menu-area").innerHTML=`
    //   <div class="title">Next actions</div>
    //   <div class="left-list">
    //   </div>
    // `
    if (true) {
      document.querySelector(".current-area-title").innerHTML = ""
      document.querySelector(".current-area").innerHTML = ""
      document.querySelector(".pbsFlatView-area").innerHTML = ""
      document.querySelector(".left-menu-area .title").innerHTML = "Next actions"
      document.querySelector(".left-menu-area .left-list").innerHTML = generateNextActionList()
    }
  }

  var setActive =function () {
    objectIsActive = true;
    update();
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  //general functions

  function generateNextActionList() {
    var html = query.items("projects").reduce((acc,project)=>{
      var filterText = ""
      var filterClosedDaysAgo = -2
      var items = project.actions.items.filter( e => fuzzysearch(filterText, e.name))
      items = items.filter( e => e.open)
      items = items.filter( e => lessThanInSomeDays(e.dueDate,7))
      //acc += generateTasksHTML(items.reverse() , i.uuid)
      var actionListHtml = items.reduce((out,i)=>{
        return out + `
          <div class="list-item">
            <i class="far fa-calendar-times"></i>
            ${i.dueDate? new Date(i.dueDate).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 5):""} - ${i.name}

          </div>`
      },'')
      return acc + actionListHtml
    },'')
    if (!html[0]) { //si pas d'action
      html = `
      <div class="list-item action_toogle_unified">
      <div class="ui container">
        <h3 class='ui center aligned small icon disabled header'>
          <i class="inbox icon"></i>
          <div class="ui content">
          No action planned for the next days.
          <div class="sub header">You can add more actions from the tasks view</div>

          </div>
        </h3>
      </div>
      </div>
      `
    }
    return html

  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var leftMenuActions = createLeftMenuActions()
leftMenuActions.init()
