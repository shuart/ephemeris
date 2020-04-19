var createPromptPopupView = function (inputData) {
  var self ={};
  var objectIsActive = false;

  var container = undefined
  var containerBottom = undefined


  let theme = {
    menu : function (name) {
      return `
      <div class="ui mini secondary menu">
        <div class="item">
          <h2>V&V plan, ${name?name:""}</h2>
        </div>
        <div class="item">

        </div>
        <div class="right menu">
          <div class="item">
              <div class="ui red button action_vv_set_close">close</div>
          </div>
        </div>
        </div>
      `
    },
    form: function (data) {
      return `
      <h2 class="ui header">${data.title}</h2>
      <div class="ui form">
        <div class="fields">
        ${data.fields.map(f=> theme.input(f)).join('')}
        </div>
      ${theme.buttons(data.buttonsType)}
      </div>
      `
    },
    input:function (data) {
      let template ={}
      if (data.type = "input") {
        template= `
        <div style="width:100%;" class="field input ">
          <label>${data.label}</label>
          <input type="text" class="form_input_${data.id}" placeholder="${data.placeholder}">
        </div>
        `
      }
      return template
    },
    buttons:function (type) {
      if ("cancelOk") {
        return theme.cancelOkButtons()
      }
    },
    cancelOkButtons: function () {
      return `
       <div class="two ui buttons">
        <button class="ui basic  button action_prompt_cancel">Cancel</button>
        <button class="ui teal button action_prompt_ok">Ok</button>
      </div>`
    }
  }





  var init = function () {
    connections()

    render()
  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      console.log(objectIsActive,currentSetList);
      if (objectIsActive && currentSetList) {

      }
    })
    connect(".action_prompt_cancel","click",(e)=>{
      closePopup()
      inputData.resolvePromise({result:undefined})

    })
    connect(".action_prompt_ok","click",(e)=>{
      if (inputData.fields[1]) {
        let results = {}
        for (var i = 0; i < inputData.fields.length; i++) {
          let element = container.querySelector(".form_input_"+inputData.fields[i].id)
          if (element) {
            results[inputData.fields[i].id] = element.value
          }else {
            results[inputData.fields[i].id] = undefined
          }
        }
        inputData.resolvePromise( {result:results})
      }else {
        let element = container.querySelector(".form_input_"+inputData.fields[0].id)

        if (element) {
          inputData.resolvePromise( {result:element.value})
        }
      }
      // inputData.resolvePromise({result:undefined})
      closePopup()
    })
  }

  var render = async function (uuid) {
    objectIsActive = true;
    var store = await query.currentProject()
    sourceOccElement = document.createElement('div');
    sourceOccElement.style.height = "100%"
    sourceOccElement.style.width = "100%"
    sourceOccElement.style.zIndex = "11"
    sourceOccElement.style.position = "fixed"

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer occurence-dimmer"
    var mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "20%"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "9999999999"
    mainEl.style.backgroundColor = "white"

    mainEl.classList ="ui raised padded container segment"
    // mainEl.style.width = "50%"
    mainEl.style.width = "28%"
    mainEl.style.maxHeight = "60%"
    // mainEl.style.height = "50%"
    mainEl.style.left= "36%";
    mainEl.style.padding = "50px";
    mainEl.style.overflow = "auto";
    // mainEl.style.left= "25%";
    container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "100%"
    container.style.overflow = "hidden"
    container.classList = "timeLineArea"

    containerBottom = document.createElement('div');

    containerBottom.style.position = "relative"
    containerBottom.style.height = "50%"
    containerBottom.style.overflow = "hidden"
    containerBottom.classList = "bottomArea"

    var menuArea = document.createElement("div");

    // menuArea.appendChild(saveButton)

    sourceOccElement.appendChild(dimmer)
    sourceOccElement.appendChild(mainEl)
    mainEl.appendChild(menuArea)
    mainEl.appendChild(container)
    mainEl.appendChild(containerBottom)

    // menuArea.appendChild(toNode(renderMenu(uuid, store)))
    // container.appendChild(toNode(renderSet(uuid)))
    document.body.appendChild(sourceOccElement)
    // renderSet()
    renderForm()
  }

  var renderForm = function () {
    // for (var i = 0; i < fields.length; i++) {
    //   let field = fields[i]
    // }
    container.innerHTML=theme.form({fields:inputData.fields, title:inputData.title, buttonsType:inputData.confirmationType})
    container.querySelector(".form_input_"+inputData.fields[0].id).focus()
  }

  var renderSet = async function (){
    await loadGantt()

  }
  var renderMenu =function (uuid, store){
    // let currentSet = store.vvSets.items.find(s=>s.uuid == currentSetUuid)
    return theme.menu("timeline")
  }

  //UTILS
  var closePopup = function () {
    sourceOccElement.remove()
  }












  var update = function (uuid) {
    if (uuid) {
      currentSetUuid = uuid
      render()
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

  init()

  return self
}

var createPromptPopup = function ({
  title= "Complete the form",
  confirmationType= "cancelOk",
  fields=[{ type:"input",id:"v5sd4fse5f465s" ,label:"", placeholder:"Write here" }],
  resolvePromise = undefined
  }={}) {
  return new Promise(function(resolve, reject) {
      let fieldsArray = []
      if (!Array.isArray(fields)) {
        fieldsArray.push(fields)
      }else {
        fieldsArray = fields
      }
      let data = {title:title, confirmationType:confirmationType, fields:fieldsArray,resolvePromise: resolve}
      let view = createPromptPopupView(data)

    }).catch(function(err) {

      console.log(err)

    });
}

// var promptPopup = createPromptPopup()
// createInputPopup({originalData:jsonFile})
