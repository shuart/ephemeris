var createTopMenu = function (containerSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(containerSelector)
  var upd = 0

  let file, url, reader = new FileReader;


  var init = function () {
    connections()
    update()

  }
  var connections =function () {
    function readJSON(e) {
      reader.readAsText(document.querySelector("#file-project-input").files[0]);
    }

    document.addEventListener('storeUpdated', function (e) {
      update()
    }, false)
    document.addEventListener('pageUpdated', function (e) {
      update()
      let currentPage =  app.state.currentView;
      let selectedButtonColor = "#057f75"
      //set selectedView active
      let currentActiveButton = container.querySelector('.top_button_'+currentPage)
      if (currentActiveButton) {
        // currentActiveButton.classList.add('active')
        currentActiveButton.style.backgroundColor=selectedButtonColor
      }
    }, false)

    document.querySelector("#file-project-input").addEventListener("change", readJSON);
    reader.addEventListener("load", function() {
      loadSavedData(reader.result, function() {
        renderCDC()
      })
    });

    connect(".topmenu_action_reload_all","click", function (e) {
      startupScreen.init()
    })
  }

  var render = function () {
    if (app.state.currentProject) {
      container.innerHTML=`
      <a class="button top_button_unified action_toogle_unified"><i class="tasks icon"></i><div class="content">Tasks</div></a>
      <!-- <a class="button top_button_notesManager action_toogle_notes_manager"><i class="sticky note outline icon"></i><div class="content">Notes</div></a> -->
        <a class="button top_button_overview action_toogle_overview">
          <i class="columns icon"></i>
          <div class="content">overview</div>
        </a>

        <a class="button top_button_stakeholders action_toogle_stakeholders"><i class="address book icon"></i><div class="content">Stakeholders</div></a>

        <a class="button top_button_requirements action_toogle_requirements_view"><i class="comment icon"></i><div class="content">Requirements</div></a>
        <a class="button top_button_functions action_toogle_functions_view"><i class="cogs icon"></i><div class="content">Functions</div></a>
        <a class="button top_button_pbs action_toogle_tree_pbs"><i class="dolly icon"></i><div class="content">Products</div></a>
        <a class="button top_button_physicalSpaces action_toogle_physical_spaces"><i class="building icon"></i><div class="content">Physical Spaces</div></a>

        <a class="button top_button_relations action_toogle_diag_relations_quickstart"><i class="sitemap icon"></i><div class="content">Relations</div></a>

        <a class="button top_button_pbs action_toogle_vv_manager_view"><i class="clipboard list icon"></i><div class="content">V&V</div></a>
        <a class="button top_button_pbs action_toogle_planning_view"><i class="calendar outline icon"></i><div class="content">Planning</div></a>
        <a class="button top_button_notesManager action_toogle_meetings_manager"><i class="file alternate outline icon"></i><div class="content">Meetings</div></a>
      `
      // Removed:
      // <a class="item action_toogle_planning_view"><i class="calendar alternate outline icon"></i>Planning</a>
      // <a class="item action_toogle_csc"><i class="clipboard outline icon"></i>CSC</a>
      // <a class="item action_toogle_requirements_view"><i class="calculator icon"></i>Borderau</a>
      document.querySelector('.target_context_settings').innerHTML=`
      <a class="item action_toogle_table_view"><i class="book icon"></i>table</a>
      <a class="item action_toogle_documents"><i class="book icon"></i>Documents</a>
      <a class="item action_toogle_work_packages"><i class="briefcase icon"></i>Work packages</a>
      <a class="item action_toogle_change_manager_view"><i class="random icon"></i>Changes</a>
      <a class="item action_toogle_categories_view"><i class="hashtag icon"></i>Categories</a>
      <a class="item action_toogle_tags_view"><i class="tags icon"></i>Tags</a>
      <a class="item action_toogle_extraFields_view"><i class="table icon"></i>Extra Fields</a>
      <a class="item action_toogle_extra_graphs"><i class="sitemap icon"></i>Extra Graphs</a>
      <a class="item action_toogle_metalinks_view"><i class="exchange icon"></i>Project links</a>
      <a class="item action_toogle_interfaces_list_view"><i class="cubes icon"></i>Project interfaces</a>
      <a class="item action_toogle_template_view"><i class="paste icon"></i>Templates</a>
      <a class="item action_toogle_import_users_from_projects"><i class="users icon"></i>Import users</a>
      <a class="item action_toogle_history_view"><i class="users icon"></i>History</a>
      <a class="item action_toogle_project_settings_view"><i class="cogs icon"></i>Project Settings</a>
      `
    }else{
      container.innerHTML=`
        <a class="button top_button_unified action_toogle_unified"><i class="tasks icon"></i><div class="content">Tasks</div></a>
        <!-- <a class="button top_button_notesManager action_toogle_notes_manager"><i class="sticky note outline icon"></i><div class="content">Notes</div></a> -->
      `
      document.querySelector('.target_context_settings').innerHTML=`
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
