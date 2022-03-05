var createTextAreaPartial = function ({
  onSave= undefined,
  onClose= undefined,
  container=undefined,
  originalData = ""
  }={}) {
  var self ={};
  var catId = undefined


  var init = function () {
    connections()
  }
  var connections =function () {
    // document.addEventListener("storeUpdated", async function () {
    //   console.log(objectIsActive,currentSetList);
    //   if (objectIsActive && currentSetList) {
    //
    //   }
    // })
    // connect(".action_vv_set_close","click",(e)=>{
    //   $('.target_timeline_elements_list').dropdown('destroy')
    //   objectIsActive = false;
    //   currentPlanning = undefined;
    //   capacityDataset = undefined;
    //   container.innerHTML=""
    //   ganttObject.destroy()
    //   ganttObject = undefined
    //   sourceOccElement.remove()
    // })
  }

  var prepareData = function (store) {
    return []
   }

   var render = async function () {
    var store = await query.currentProject()
    let data = prepareData(store)
    let domElement = document.querySelector(container)
    renderDomMarkup(domElement)
    setUpTextArea(data)
  }

  var setUpTextArea = function (data) {
    var editor = new Quill(document.querySelector(container).querySelector(".textEditor"),{
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block']
        ]
      },
      placeholder: 'Compose an epic...',
      theme: 'bubble'
    });
  }

  var renderDomMarkup =function (container) {
    container.innerHTML = `
      <div class="textEditor"></div>
    `
  }





  var updateModule = function (store) {
    let data = prepareData(store)
    // timeline.setItems(data)
  }
  var update = function () {
      render()
  }
  // var update = function (uuid) {
  //   if (uuid) {
  //     currentSetUuid = uuid
  //     render(uuid)
  //   }else if(currentSetUuid) {
  //     render(currentSetUuid)
  //   }else {
  //     render()
  //     console.log("no set found");
  //     return
  //   }
  //
  // }

  var setActive =function (data) {
    if (data) {
      catId = data.catId
    }
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.updateModule = updateModule
  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

