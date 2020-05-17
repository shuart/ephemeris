var createPromptPopupView = function (inputData) {
  var self ={};
  var objectIsActive = false;

  var container = undefined
  var containerBottom = undefined
  var sourceOccElement = undefined


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
      ${theme.iconHeader(data)}
      ${theme.imageHeader(data)}

      <h2 class="ui header">${data.title}</h2>
      ${theme.message(data)}
      ${theme.warning(data)}
      <div class="ui form">
        <div style="width:100%; flex-direction:column;" class="fields">
        ${data.fields.map(f=> theme.input(f)).join('')}
        </div>
      ${theme.buttons(data.confirmationType)}
      </div>
      `
    },
    input:function (data) {
      let template ={}
      if (data.type == "input") {
        template= `
        <div style="width:100%; padding-top: 15px;" class="field input ">
          <label ${data.secondary?"style='opacity:0.5;'":""} >${data.label}${!data.optional?"<span style='opacity:0.5;'>*<span>":""}</label>
          <input type="${data.isPassword?"password":"text"}" class="${data.secondary?"transparent":""} form_input_${data.id}" placeholder="${data.placeholder}">
        </div>
        `
      }
      if (data.type == "button") {
        template= `
        <div style="width:100%; padding-top: 15px;" class="field input ">
          <button style="${data.customColor?"background-color:"+data.customColor+";":""}" class="ui fluid teal button button_input_${data.id}">
            ${data.label}
          </button>
        </div>
        `
      }
      if (data.type == "select") {
        template= `
        <div class="ui multiple dropdown form_select_${data.id}">
          <input class="form_input_${data.id}" type="hidden" name="filters" value="${data.preSelected.join(',')}">
          <i class="filter icon"></i>
          <span class="text">${data.label}</span>
          <div class="menu">
            <div class="ui icon search input">
              <i class="search icon"></i>
              <input type="text" placeholder="${data.placeholder}">
            </div>
            <div class="divider"></div>
            <div class="header">
              <i class="tags icon"></i>
              ${data.label}
            </div>
            <div class="scrolling menu">
              ${data.selectOptions.map(o=>theme.selectElement(o)).join("")}
            </div>
          </div>
        </div>
        `
      }
      if (data.type == "textArea") {
        template= `
        <div style="width:100%; padding-top: 15px;" class="field">
          <label ${data.secondary?"style='opacity:0.5;'":""} >${data.label}${!data.optional?"<span style='opacity:0.5;'>*<span>":""}</label>
          <textarea rows="6" class="${data.secondary?"transparent":""} form_input_${data.id}" placeholder="${data.placeholder}">${data.value}</textarea>
        </div>
        `
      }
      return template
    },
    selectElement: function (option) {
        return `
        <div class="item" data-value="${option.value}">
          <div class="ui teal empty circular label"></div>
          ${option.name}
        </div>`
    },
    buttons:function (type) {
      if (type == "cancelOk") {
        return theme.cancelOkButtons()
      }
      if (type == "cancel") {
        return theme.cancelButtons()
      }
    },
    cancelOkButtons: function () {
      return `
       <div class="two ui buttons">
        <button class="ui basic  button action_prompt_cancel">Cancel</button>
        <button class="ui teal button action_prompt_ok">Ok</button>
      </div>`
    },
    cancelButtons: function () {
      return `
        <button class="ui basic fluid button button action_prompt_cancel">Cancel</button>`
    },
    iconHeader: function (data) {
      if (data.iconHeader) {
        return `
        <div class="ui center aligned icon header">
          <i class="${data.iconHeader} icon"></i>
        </div>`
      }else {
        return ""
      }
    },
    imageHeader: function (data) {
      if (data.imageHeader) {
        return `
        <div class="ui center aligned icon header">
          <img style="max-width:300px; width:40%;" class="ui centered medium image" src="${data.imageHeader}">
        </div>`
      }else {
        return ""
      }
    },
    message: function (data) {
      if (data.message) {
        return `
        <div class="ui message">
          <p>${data.message} </p>
        </div>`
      }else {
        return ""
      }
    },
    warning: function (data) {
      if (data.warning) {
        return `
        <div class="ui warning message">
          <i class="warning icon"></i>
          ${data.warning}
        </div>`
      }else {
        return ""
      }
    }
  }





  var init = function () {
    // connections()

    render()
  }
  var connections =function () {
    // document.addEventListener("storeUpdated", async function () {
    //   console.log(objectIsActive,currentSetList);
    //   if (objectIsActive && currentSetList) {
    //
    //   }
    // })
    bind(".action_prompt_cancel","click",(e)=>{
      closePopup()
      inputData.resolvePromise({result:undefined})

    }, sourceOccElement)
    bind(".action_prompt_ok","click",(e)=>{
      let isFormValid = checkIfFieldsAreCompleted()
      if (isFormValid) {
        resolveTheForm();
      }else {
        return undefined
      }
    },sourceOccElement)
  }

  var render = async function (uuid) {
    objectIsActive = true;
    var store = await query.currentProject()
    sourceOccElement = document.createElement('div');
    sourceOccElement.style.height = "100%"
    sourceOccElement.style.width = "100%"
    sourceOccElement.style.zIndex = "999999999999"
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
    mainEl.style.overflow = "visible";
    // mainEl.style.left= "25%";
    container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "100%"
    container.style.overflow = "auto"
    container.classList = "fieldsArea"

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

    connections()

    renderForm()
  }

  var renderForm = function () {
    // for (var i = 0; i < fields.length; i++) {
    //   let field = fields[i]
    // }
    container.innerHTML=theme.form(inputData)//render the fields

    //focus on input and textarea
    if (inputData.fields[0].type=="input") {
      container.querySelector(".form_input_"+inputData.fields[0].id).focus()
    }else if (inputData.fields[0].type=="textArea") {
      container.querySelector(".form_input_"+inputData.fields[0].id).focus()
    }

    if (!inputData.fields[1] && inputData.fields[0].type=="input") {
      container.querySelector(".form_input_"+inputData.fields[0].id).addEventListener( 'keyup', function (e) {
        if ( e.keyCode == 13 ) {
          // Simulate clicking on the submit button.
          resolveTheForm();
        }
      });
    }


    setupDropdowns(inputData.fields)
    setupButtons(inputData.fields)
  }

  var setupDropdowns = function (fields) {
    fields.forEach((item, i) => {
      if (item.type=="select") {
        $('.form_select_'+item.id)
          .dropdown({//use Fomatic dd script
            clearable: true,
            placeholder: 'any'
          })
      }
    });
  }
  var removeDropdowns = function (fields) {
    fields.forEach((item, i) => {
      if (item.type=="select") {
        $('.form_select_'+item.id)
          .dropdown('destroy')
      }
    });
  }

  var setupButtons = function (fields) {
    fields.forEach((item, i) => {
      if (item.type=="button") {
        let button= document.querySelector(".button_input_"+item.id)
        if (item.onClick) {
          button.addEventListener("click", function () {
            item.onClick(item.value)
            closePopup()
          })
        }else if (item.value) {
          button.addEventListener("click", function () {
            inputData.resolvePromise( {result:element.value})
            closePopup()
          })
        }
      }
    });
  }

  var resolveTheForm = function () {
    let output = undefined
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
        output = {result:results}
      }else {
        let element = container.querySelector(".form_input_"+inputData.fields[0].id)

        if (element) {
          inputData.resolvePromise( {result:element.value})
          output =  {result:element.value}
        }
      }

      if (inputData.callback) {//Callback for sue when promise is not available
        inputData.callback(output)
      }
      // inputData.resolvePromise({result:undefined})
      closePopup()
  }

  var checkIfFieldsAreCompleted = function () {
    let formComplete = true// set up as complete before check

    for (var i = 0; i < inputData.fields.length; i++) {
      let element = container.querySelector(".form_input_"+inputData.fields[i].id)
      if (element) {
        if (element.value == "" && !inputData.fields[i].optional){
          element.style.backgroundColor = "cornsilk"
          formComplete =  false
        }
      }else {
        // results[inputData.fields[i].id] = undefined
      }
    }
    console.log(formComplete);
    return formComplete
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
    removeDropdowns(inputData.fields)
    sourceOccElement.innerHTML=""
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
  iconHeader= undefined,
  imageHeader= undefined,
  message= undefined,
  warning= undefined,
  fields=[{ type:"input",id:"v5sd4fse5f465s" ,label:"", placeholder:"Write here" }],
  callback = undefined,
  resolvePromise = undefined
  }={}) {
  return new Promise(function(resolve, reject) {
      let fieldsArray = []
      if (!Array.isArray(fields)) {
        fieldsArray.push(fields)
      }else {
        fieldsArray = fields
      }
      let data = {title:title, confirmationType:confirmationType, imageHeader:imageHeader,iconHeader:iconHeader,message:message,warning:warning, fields:fieldsArray,callback:callback, resolvePromise: resolve}
      let view = createPromptPopupView(data)

    }).catch(function(err) {

      console.log(err)

    });
}

// var promptPopup = createPromptPopup()
// createInputPopup({originalData:jsonFile})
