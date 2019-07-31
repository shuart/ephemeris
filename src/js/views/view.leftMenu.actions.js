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

    connect(".action_left_menu_action_list_close_action","click",function (e) {
      if (confirm("Close this action?")) {
        push(act.edit("actions",{uuid:e.target.dataset.id,prop:"open", value:false, project:e.target.dataset.project}))
        push(act.edit("actions",{uuid:e.target.dataset.id,prop:"closedOn", value:Date.now(), project:e.target.dataset.project}))

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

    var filterText = ""
    var filterClosedDaysAgo = -2
    let allActions = []
    query.items("projects").forEach(function (store) {
      let formatedActions = store.actions.items.map(a=>{
        a.projectName = store.name;
        return a
      })
      allActions = allActions.concat(store.actions.items)
    })


    let filteredActions = allActions.filter( e => fuzzysearch(filterText, e.name))
    filteredActions = filteredActions.filter( e => e.open)
    filteredActions = filteredActions.filter( e => lessThanInSomeDays(e.dueDate,7))

    let sortedActions = filteredActions.sort(function(a, b) {
      if (a.dueDate && b.dueDate) {
        if (a.dueDate < b.dueDate) {return -1;}
        if (a.dueDate > b.dueDate) {return 1;}
      }
    return 0;})

    let html= sortedActions.map(i=>{
      return `
        <div  class="list-item ">
          <i data-project="${i.project}" data-id="${i.uuid}" class="far fa-calendar-times action_left_menu_action_list_close_action"></i>
          <p>${i.dueDate? new Date(i.dueDate).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 5):""} - ${i.name}
          <span style ="background-color: #e6e6e6;padding: 5px;height: 20px;border-radius: 5px;display: inline-block;font-size: 9px;padding-top: 0px;">
            ${i.projectName}
          </span></p>
        </div>`
    }).join('')

    // var html = query.items("projects").reduce((acc,project)=>{
    //   var filterText = ""
    //   var filterClosedDaysAgo = -2
    //   var items = project.actions.items.filter( e => fuzzysearch(filterText, e.name))
    //   items = items.filter( e => e.open)
    //   items = items.filter( e => lessThanInSomeDays(e.dueDate,7))
    //   //acc += generateTasksHTML(items.reverse() , i.uuid)
    //   var actionListHtml = items
    //     .sort(function(a, b) {
    //     if (a.dueDate && b.dueDate) {
    //       if (a.dueDate < b.dueDate) {return -1;}
    //       if (a.dueDate > b.dueDate) {return 1;}
    //     }
    //     return 0;})
    //     .reduce((out,i)=>{
    //     return out + `
    //       <div  class="list-item ">
    //         <i data-project="${i.project}" data-id="${i.uuid}" class="far fa-calendar-times action_left_menu_action_list_close_action"></i>
    //         ${i.dueDate? new Date(i.dueDate).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 5):""} - ${i.name}
    //
    //       </div>`
    //   },'')
    //   return acc + actionListHtml
    // },'')
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
