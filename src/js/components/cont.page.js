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
    haveSideBar=true,
    linkedComponents = []
    } = {}) {
    componentList.push({name, object, haveSideBar, linkedComponents})
  }

  var setActivePage = function (componentName, data) {
    let options = data || {}
    options.param = options.param || undefined//todo refactor

    var haveSideBar = true;
    var componentObject = componentList.find(item=> item.name == componentName)
    console.log("set "+componentName+" active");

    //main Component
    var componentToClose = componentList.filter(item=> item.name != componentName).filter(c=>!componentObject.linkedComponents.includes(c.name))
    var componentToOpen = componentList.filter(item=> item.name == componentName)
    for (component of componentToClose) {
      if (component.object.setInactive) {
        component.object.setInactive();
      }
    }
    for (component of componentToOpen) {
      if (component.object.setActive) {
        component.object.setActive(options);
        //check options of the component
        haveSideBar = component.haveSideBar;
      }
    }
    //extra component to load
    if (componentObject.linkedComponents[0]) {
      var componentToOpen = componentList.filter(c=>componentObject.linkedComponents.includes(c.name))
      for (component of componentToOpen) {
        if (component.object.setActive) {
          component.object.setActive();
        }
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
  onChange: (e) =>{
    setCurrentPage(e.componentName)
    document.dispatchEvent(new Event('pageUpdated'))
    }
  }
);
pageManager.init()
