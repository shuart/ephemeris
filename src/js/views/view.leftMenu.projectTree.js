var createLeftMenuProjectTree = function () {
  var self ={};
  var objectIsActive = false;
  var sideListe=undefined

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", function () {
      if (objectIsActive) {
        udapteSideListe()
      }
    })

    document.querySelector(".left-list").onclick = function(event) {
        if (event.target.classList.contains("action_LM_project_tree_show_item_popup")) {
          // showEditMenu(event.target.dataset.id)
          showSingleItemService.showById(event.target.dataset.id)
        }
    }
  }

  var render = function () {
    document.querySelector(".left-menu-area .title").innerHTML = "Overview"
    renderSideListe()
  }

  var update = function () {
    render()
  }

  var renderSideListe = function () {
    var store = JSON.stringify(query.currentProject())
    store = JSON.parse(store)
    var itemsToDisplay =store.currentPbs.items.map((e) => {e.customColor="#6dce9e";e.labels = ["Pbs"]; return e})
    var relations = store.currentPbs.links.map((e) => {e.customColor="#6dce9e";e.type = "Composed by"; return e})


    sideListe = createTreeList({
      container:document.querySelector(".left-list"),
      items: itemsToDisplay,
      links:relations,
      customEyeActionClass:"action_toogle_diag_relations_options",
      customTextActionClass:"action_LM_project_tree_show_item_popup"
    })
    // updateSideListeVisibility()
  }

  var udapteSideListe = function () {
    var store = JSON.stringify(query.currentProject())
    store = JSON.parse(store)
    var itemsToDisplay =store.currentPbs.items.map((e) => {e.customColor="#6dce9e";e.labels = ["Pbs"]; return e})
    var relations = store.currentPbs.links.map((e) => {e.customColor="#6dce9e";e.type = "Composed by"; return e})

    sideListe.refresh(itemsToDisplay, relations)
    // updateSideListeVisibility()
  }

  var setActive =function () {
    objectIsActive = true;
    if (sideListe) {//if is already in use
      udapteSideListe()
    }else {
      update()
    }

  }

  var setInactive = function () {
    //clear
    document.querySelector(".left-list").innerHTML=""

    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var leftMenuProjectTree = createLeftMenuProjectTree()
leftMenuProjectTree.init()
