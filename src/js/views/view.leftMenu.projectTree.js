var createLeftMenuProjectTree = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", function () {
      if (objectIsActive) {
        update()
      }
    })
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
      customEyeActionClass:"action_LM_project_tree_show_item"
    })
    // updateSideListeVisibility()
  }

  var udapteSideListe = function () {
    sideListe.refresh(itemsToDisplay, relations)
    // updateSideListeVisibility()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
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
