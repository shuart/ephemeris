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

  var render = async function () {
    var popup= await createPromptPopup({
      title:"Edit an item",
      fields:{ type:"textArea",value:originalData, id:"editField" ,label:"Modifiy this property", placeholder:"Set a value for this property" }
    })
    var newReq = popup.result
    if (newReq) {
      onSave(newReq)
    }
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
