var createTextAreaPartial = function ({
  onSave= undefined,
  onClose= undefined,
  container=undefined,
  originalData = "",
  uuid=''
  }={}) {
  var self ={};
  var catId = undefined;
  var initialData = undefined;
  var saveAvailable = true;
  var saveInterval = 5000;
  var editor = undefined;


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
    const { ops } = editor.getContents();
    push(act.edit("pageModules",{uuid:uuid,prop:"content", value:JSON.stringify(ops)}))
    console.log("savved");
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
    setUpTextArea(data)
  }

  var setUpTextArea = function (data) {
    editor = new Quill(document.querySelector(container).querySelector(".textEditor"),{
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
    // editor.setContents([
    //   { insert: 'Hello ' },
    //   { insert: 'World!', attributes: { bold: true } },
    //   { insert: '\n' }
    // ]);
    editor.setContents(data.initialData);
    
    editor.on('text-change', () => {
      if(saveAvailable){
        
        saveAvailable = false;
        setTimeout(function(){
          saveContent()
          saveAvailable = true;
        },saveInterval)

      }else{
        //TODO let the user know that saving is not in progress
      }

    });
  }

  var renderDomMarkup =function (container) {
    container.innerHTML = `
      <div class="textEditorSettings">Setting</div>
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

