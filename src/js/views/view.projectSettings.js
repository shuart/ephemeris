var createProjectSettingsView = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentActionUuid = undefined
  let sourceOccElement = undefined

  let theme = {
    menu : function (action) {
      return `
      <div class="ui mini secondary menu">

        <div class="right menu">
          <div class="item">
              <div class="ui red button action_current_user_close">close</div>
          </div>
        </div>
        </div>
      `
    }

  }



  var init = function () {
    connections()
  }
  var connections =function () {

    // connect(".action_current_user_edit_item","click",(e)=>{
    //   console.log("Edit");
    //   var newValue = prompt("Edit Item",e.target.dataset.value)
    //   if (newValue) {
    //     //TODO move to reducer
    //     app.store.userData.info[e.target.dataset.prop] = newValue
    //     // push(act.edit("actions",{project:e.target.dataset.project, uuid:e.target.dataset.id, prop:e.target.dataset.prop, value:newValue}))
    //   }
    //   sourceOccElement.remove()
    //   update()
    // })

    connect(".action_current_user_close","click",(e)=>{
      sourceOccElement.remove()
    })
    connect(".action_project_settings_change_image","click",(e)=>{
      setProjectLogo(function (dataUrl) {
        push(act.edit("settings", {uuid:e.target.dataset.id, prop:"value", value:dataUrl}))
        sourceOccElement.remove()
        update()
      })
    })
    connect(".action_project_settings_remove_logo_image","click",(e)=>{
      push(act.edit("settings", {uuid:e.target.dataset.id, prop:"value", value:""}))
      sourceOccElement.remove()
      update()
    })
  }

  var render = function (uuid) {
    sourceOccElement = document.createElement('div');
    sourceOccElement.style.height = "100%"
    sourceOccElement.style.width = "100%"
    sourceOccElement.style.zIndex = "11"
    sourceOccElement.style.position = "fixed"

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer occurence-dimmer"
    var mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "9999999999"
    mainEl.style.backgroundColor = "white"

    mainEl.classList ="ui raised padded container segment"
    // mainEl.style.width = "50%"
    mainEl.style.width = "50%"
    mainEl.style.maxHeight = "90%"
    mainEl.style.left= "25%";
    mainEl.style.padding = "50px";
    mainEl.style.overflow = "auto";
    // mainEl.style.left= "25%";
    var container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "90%"
    container.style.overflow = "auto"

    var menuArea = document.createElement("div");

    // menuArea.appendChild(saveButton)

    sourceOccElement.appendChild(dimmer)
    sourceOccElement.appendChild(mainEl)
    mainEl.appendChild(menuArea)
    mainEl.appendChild(container)

    menuArea.appendChild(toNode(renderMenu()))
    container.appendChild(toNode(renderProject(uuid)))

    document.body.appendChild(sourceOccElement)

  }

  var renderProject =function (uuid){

    let dataSourceStore = query.currentProject()

    let i = deepCopy(dataSourceStore)
    // if (!i.userUuid || !i.userLastName  || !i.userUuid) {
    //   i.userFirstName =i.userFirstName || 'Set your First Name'
    //   i.userLastName =i.userLastName || 'Set your First Name'
    //   i.userUuid =i.userUuid|| 'Set your uuid - You can find it in the "manage stakehoder" view'
    // }

    //check if default are there
    let projectImageSetting = i.settings.items.find(s=>s.type = "projectLogo")
    if (!projectImageSetting) {
      push(act.add("settings",{name:"Project Logo",type:"projectLogo", value:""}))
      sourceOccElement.remove()
      update()
    }
    // projectImageSetting = i.settings.items.find(s=>s.type = "projectLogo")

    let html =`
    <h2 class="header">
      Project Settings
    </h2>
    <div data-id="${projectImageSetting.uuid}" class="ui segment">
      <div class="content">
        <h3 class="header">Project Logo</h3>
        <div class="ui card">
          <div class=" ui small image">
            <img src=${projectImageSetting.value}>
          </div>
          <div class="extra content">
            <div class="ui two mini buttons">
              <div data-id="${projectImageSetting.uuid}" class="ui basic tiny green button action_project_settings_change_image">Change</div>
              <div data-id="${projectImageSetting.uuid}" class="ui basic tiny red button action_project_settings_remove_logo_image">Remove</div>
            </div>
          </div>
        </div>

        <div class="ui divider"></div>

      </div>
    </div>
    <div class="ui divider"></div>
    `
    return html
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }

  var setProjectLogo = function (action,callback) {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
       var file = e.target.files[0];
    }
    input.click();
    var canvas=document.createElement("canvas");
    var ctx=canvas.getContext("2d");
    var cw=canvas.width;
    var ch=canvas.height;
    var maxW=290;
    var maxH=1290;

    input.addEventListener('change', handleFiles);

    function handleFiles(e) {
      var img = new Image;
      img.onload = function() {
        var iw=img.width;
        var ih=img.height;
        var scale=Math.min((maxW/iw),(maxH/ih));
        var iwScaled=iw*scale;
        var ihScaled=ih*scale;
        canvas.width=iwScaled;
        canvas.height=ihScaled;
        canvas.width=290;
        canvas.height=150;
        ctx.drawImage(img,0,0,iwScaled,ihScaled);
        let dataUrl = canvas.toDataURL("image/png",0.5);
        action(dataUrl)
        if (callback) {
          callback()
        }
      }
      img.src = URL.createObjectURL(e.target.files[0]);
    }
  }



  //UTILS
  var getActionObjectCopyFromUuid = function (uuid) {
    let allActions = []
    query.items("projects").forEach(function (store) {
      let formatedActions = store.actions.items.map(a=>{//TODO only check open action
        let copy = deepCopy(a)
        copy.projectName = store.name;
        copy.urgent = lessThanInSomeDays(a.dueDate,2)
        copy.projectUuid = store.uuid
        return copy
      })
      allActions = allActions.concat(formatedActions)
    })
    return allActions.find(a=>a.uuid == uuid)
  }




  var update = function (uuid) {
      render()
  }

  var setActive =function () {
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

var projectSettingsView = createProjectSettingsView()
projectSettingsView.init()
// createInputPopup({originalData:jsonFile})
