var createInputPopup = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;
  var easyMDE = undefined;


  var init = function () {
    connections()
    render()
  }
  var connections =function () {

  }

  var render = function () {
    sourceEl = document.createElement('div');
    sourceEl.style.height = "100%"
    sourceEl.style.width = "100%"

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer"
    var mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "9999999999"
    mainEl.style.backgroundColor = "white"

    mainEl.classList ="ui raised padded container segment"
    mainEl.style.width = "50%"
    mainEl.style.maxHeight = "90%"
    mainEl.style.left= "25%";

    var menuArea = document.createElement("div");
    menuArea.style.padding = "3px";
    var saveButton = document.createElement("button")
    saveButton.classList ="ui mini basic primary button";
    saveButton.innerHTML ="Save"
    saveButton.addEventListener('click', event => {
      if (onSave) {
        onSave(easyMDE.value())
      };
    });
    var closeButton = document.createElement("button")
    closeButton.classList ="ui mini red basic button";
    closeButton.innerHTML ="Close"
    closeButton.addEventListener('click', event => {
      if (onClose) {
        onClose(easyMDE.value())
      }
      sourceEl.remove()
    });
    menuArea.appendChild(saveButton)
    menuArea.appendChild(closeButton)

    var textarea = document.createElement("textarea");
    textarea.classList="inputTextAreaEditor"
    console.log(sourceEl);
    sourceEl.appendChild(dimmer)
    sourceEl.appendChild(mainEl)
    mainEl.appendChild(menuArea)
    mainEl.appendChild(textarea)

    document.body.appendChild(sourceEl)

    easyMDE = new EasyMDE({
      element: document.querySelector('.inputTextAreaEditor'),
      autoDownloadFontAwesome:false,
      initialValue : originalData
    });
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}
