var createFactory = function () {
  var self ={};
  var objectIsActive = false;

  let mainFragment = document.createDocumentFragment()

  const theme={
    dimmer:() => {
      let html =`
      <div style='height=100%'></div>
      `
      return html
    }
  }

  var init = function () {
    connections()
    update()

  }
  var connections =function () {

  }

  var render = function () {

  }

  var update = function () {
    render()
  }

  function buildHtmlContainer(){
    sourceEl = document.createElement('div');
    sourceEl.style.height = "100%"

    mainFragment.appendChild(sourceEl);

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer"
    mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "99999"
    mainEl.style.backgroundColor = "white"

    if (!fullScreen) { //windowedCase
      mainEl.classList = theme.windowedContainerClass;
      mainEl.style.width = "50%"
      mainEl.style.maxHeight = "90%"
      mainEl.style.left= "25%";
    }else if(targetDomContainer){ //embeded case
      mainEl.classList =theme.embededContainerClass;
      mainEl.style.position = "relative"
      mainEl.style.zIndex = "1"
        mainEl.style.padding = "5em"
        mainEl.style.width = "100%"
        mainEl.style.height = "100%"
        mainEl.style.left= "0px";
    }else {//fullScreen case
      mainEl.classList = theme.fullscreenContainerClass;
        mainEl.style.padding = "5em"
        mainEl.style.width = "100%"
        mainEl.style.height = "100%"
        mainEl.style.left= "0px";
    }
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
