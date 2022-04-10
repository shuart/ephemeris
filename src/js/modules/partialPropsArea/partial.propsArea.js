var createPropsAreaPartial = function ({
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
    setUpPropsArea(domElement, data)
  }

  var renderDomMarkup =function (container) {
    container.innerHTML = `
      <div class="propsEditorSettings">Setting</div>
      <div class="propsEditor"></div>
    `
  }
  var setUpPropsArea =function (domElement, data) {
    let target = domElement.querySelector(".propsEditor")
    target.innerHTML =`
    <table class="table">
      <thead>
        <tr>
          <th><abbr title="Position">Pos</abbr></th>
          <th>Team</th>
          <th><abbr title="Played">Pld</abbr></th>
          <th><abbr title="Won">W</abbr></th>
          <th><abbr title="Drawn">D</abbr></th>
          <th><abbr title="Lost">L</abbr></th>
          <th><abbr title="Goals for">GF</abbr></th>
          <th><abbr title="Goals against">GA</abbr></th>
          <th><abbr title="Goal difference">GD</abbr></th>
          <th><abbr title="Points">Pts</abbr></th>
          <th>Qualification or relegation</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th><abbr title="Position">Pos</abbr></th>
          <th>Team</th>
          <th><abbr title="Played">Pld</abbr></th>
          <th><abbr title="Won">W</abbr></th>
          <th><abbr title="Drawn">D</abbr></th>
          <th><abbr title="Lost">L</abbr></th>
          <th><abbr title="Goals for">GF</abbr></th>
          <th><abbr title="Goals against">GA</abbr></th>
          <th><abbr title="Goal difference">GD</abbr></th>
          <th><abbr title="Points">Pts</abbr></th>
          <th>Qualification or relegation</th>
        </tr>
      </tfoot>
      <tbody>
        <tr>
          <th>1</th>
          <td><a href="https://en.wikipedia.org/wiki/Leicester_City_F.C." title="Leicester City F.C.">Leicester City</a> <strong>(C)</strong>
          </td>
          <td>38</td>
          <td>23</td>
          <td>12</td>
          <td>3</td>
          <td>68</td>
          <td>36</td>
          <td>+32</td>
          <td>81</td>
          <td>Qualification for the <a href="https://en.wikipedia.org/wiki/2016%E2%80%9317_UEFA_Champions_League#Group_stage" title="2016–17 UEFA Champions League">Champions League group stage</a></td>
        </tr>

      </tbody>
    </table>
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

