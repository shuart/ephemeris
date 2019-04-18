var createPageManager = function ({
  onChange=undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var componentList = [];

  var init = function () {
    connections()
    render()
  }
  var connections =function () {
  }

  var render = function () {
  }

  var update = function () {
  }
  var addComponent = function ({
    name=undefined,
    object = undefined,
    haveSideBar=true
    } = {}) {
    componentList.push({name, object, haveSideBar})
  }

  var setActivePage = function (componentName) {
    var haveSideBar = true;
    console.log("set "+componentName+" active");
    var componentToClose = componentList.filter(item=> item.name != componentName)
    var componentToOpen = componentList.filter(item=> item.name == componentName)
    for (component of componentToClose) {
      if (component.object.setInactive) {
        component.object.setInactive();
      }
    }
    for (component of componentToOpen) {
      if (component.object.setActive) {
        component.object.setActive();
        //check options of the component
        haveSideBar = component.haveSideBar;
      }
    }
    if (!haveSideBar) {
      document.querySelector(".side-menu").style.width = "0px"
    }else {
      document.querySelector(".side-menu").style.width = "256px"
    }

    if (onChange) {
      onChange({componentName:componentName})
    }
  }

  self.setActivePage = setActivePage
  self.addComponent = addComponent
  self.init = init

  return self
}

var pageManager = createPageManager({
  onChange: (e) =>{ setCurrentPage(e.componentName)}
  }
);
pageManager.init()
