var createTableAreaPartial = function ({
  onSave= undefined,
  onClose= undefined,
  container=undefined,
  originalData = "",
  uuid=''
  }={}) {
  var self ={};
  var catId = undefined;
  var initialData = undefined;
  var table = undefined;


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

  var saveContent = function(){
    // push(act.edit("pageModules",{uuid:uuid,prop:"content", value:JSON.stringify(content), project:e.target.dataset.project}))
    // const { ops } = editor.getContents();
    // push(act.edit("pageModules",{uuid:uuid,prop:"content", value:JSON.stringify(ops)}))
    // console.log("savved");
  }

  var prepareData = function (store) {
    let moduleInfo = store.pageModules.find(p=>p.uuid==uuid)
    if(moduleInfo && moduleInfo.content){
      return {initialData:JSON.parse(moduleInfo.content)}
    }else{
      return {}
    }
   }

   var render = async function () {
    var store = await query.currentProject()
    let data = prepareData(store)
    initialData = data.initialData// not needed
    let domElement = document.querySelector(container)
    renderDomMarkup(domElement)
    setUpArea(domElement, data)
  }

  var renderDomMarkup =function (container) {
    container.innerHTML = `
      <div class="propsEditorSettings">Setting</div>
      <div class="propsEditor"></div>
    `
  }
  var setUpArea =function (domElement, data) {
    let target = domElement.querySelector(".propsEditor")
    target.innerHTML =``
    target.style.border ="none"
    table = createTableAreaFacade()
    table.init({target:target})

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

