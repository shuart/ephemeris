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
        <a class="button action_toogle_overview"><i class="columns icon"></i></a>
        <a class="button action_toogle_stakeholders"><i class="address book icon"></i></a>
        <a class="button action_toogle_diag_relations"><i class="sitemap icon"></i></a>
        <a class="button action_toogle_diag_interfaces"><i class="sync icon"></i></a>
        <a class="button action_toogle_requirements_view"><i class="comment icon"></i></a>
        <a class="button action_toogle_functions_view"><i class="cogs icon"></i></a>
        <a class="button action_toogle_tree_pbs"><i class="dolly icon"></i></a>
      `
      // Removed:
      // <a class="item action_toogle_planning_view"><i class="calendar alternate outline icon"></i>Planning</a>
      // <a class="item action_toogle_csc"><i class="clipboard outline icon"></i>CSC</a>
      // <a class="item action_toogle_requirements_view"><i class="calculator icon"></i>Borderau</a>
    }else{
      container.innerHTML=""
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
