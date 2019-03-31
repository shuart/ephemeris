var createTopMenu = function (containerSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(containerSelector)
  var upd = 0

  var init = function () {
    connections()
    update()

  }
  var connections =function () {
    document.addEventListener('storeUpdated', function (e) {
      update()
    }, false)
  }

  var render = function () {
    console.log(app.state.currentProject);
    if (app.state.currentProject) {
      container.innerHTML=`
        <a class="item action_toogle_overview"><i class="columns icon"></i>Overview</a>
        <a class="item action_toogle_stakeholders"><i class="address book icon"></i>Stakeholders</a>
        <a class="item action_toogle_diag_relations"><i class="sitemap icon"></i>Relations</a>
        <a class="item action_toogle_diag_interfaces"><i class="sync icon"></i>Interfaces</a>
        <a class="item action_toogle_requirements_view"><i class="comment icon"></i>Besoins</a>
        <a class="item action_toogle_functions_view"><i class="cogs icon"></i>Functions</a>
        <a class="item action_toogle_tree_pbs"><i class="dolly icon"></i>PBS</a>
      `
      // Removed:
      // <a class="item action_toogle_planning_view"><i class="calendar alternate outline icon"></i>Planning</a>
      // <a class="item action_toogle_csc"><i class="clipboard outline icon"></i>CSC</a>
      // <a class="item action_toogle_requirements_view"><i class="calculator icon"></i>Borderau</a>
    }else{
      container.innerHTML=""
    }
    //render project
    if (app.state.currentProject) {
      var projectInfo = query.currentProject()
      document.querySelector(".project_title_area").innerHTML=`
      <i class="building outline icon"></i>
      ${projectInfo.reference}, ${projectInfo.name}
      `
    }else{
      document.querySelector(".project_title_area").innerHTML=`
      <i class="building outline icon"></i>
      Kraken
      `
    }
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var topMenu = createTopMenu(".topMenuItems")
topMenu.init()
