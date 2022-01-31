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
    tag:function (name,id, color) {
      let colorStyle = "background-color:#ffffff;border-style:dashed;border-width: 2px;border-color:grey "
      if (color) {
        colorStyle = "background-color:"+color+ ";"
      }
      return `
      <div style="${colorStyle} margin-bottom: 2px;cursor:pointer;" data-inverted="" data-id="${id}" data-tooltip="${name}   " class="ui mini teal label action_list_click_label">
      ${name}
      </div>`
    },
    form: function (data) {
      return `
      ${theme.iconHeader(data)}
      ${theme.imageHeader(data)}

      <h2 class="subtitle">${data.title}</h2>
      ${theme.message(data)}
      ${theme.warning(data)}
      <div class="form">
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
        <div style="width:100%; padding-top: 15px;" class="field ">
          <label class="label" ${data.secondary?"style='opacity:0.5;'":""} >${data.label}${!data.optional?"<span style='opacity:0.5;'>*<span>":""}</label>
          <input type="${data.isPassword?"password":"text"}" class="input ${data.secondary?"transparent":""} form_input_${data.id}" placeholder="${data.placeholder}">
        </div>
        `
      }
      if (data.type == "button") {
        template= `
        <div style="width:100%; padding-top: 1px;padding-bottom: 1px;" class="field ">
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
      if (data.type == "selection") {
        template= `
        <div style="cursor:pointer;" class="form_select_${data.id}">
          <input class="form_input_${data.id}" type="hidden" name="filters" value="${data.preSelected.join(',')}">
          <div style="" class="form_selection_list_${data.id}"></div>
        </div>
        `
      }
      if (data.type == "textArea") {
        template= `
        <div style="width:100%; padding-top: 15px;" class="field">
          <label class="label" ${data.secondary?"style='opacity:0.5;'":""} >${data.label}${!data.optional?"<span style='opacity:0.5;'>*<span>":""}</label>
          <textarea rows="6" class="textarea ${data.secondary?"transparent":""} form_input_${data.id}" placeholder="${data.placeholder}">${data.value}</textarea>
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
      <div class="block"></div>
       <div class="buttons is-centered">
        <button class="button is-fullwidth is-success action_prompt_ok">Ok</button>
        <button class="button is-fullwidth is-outlined action_prompt_cancel">Cancel</button>
      </div>`
    },
    cancelButtons: function () {
      return `
        <button class="ui basic fluid button button action_prompt_cancel">Cancel</button>`
    },
    iconHeader: function (data) {
      if (data.iconHeader) {
        return `
        <div class="has-text-centered" ><span class="icon-text">
          <span class="icon is-large">
            <i class="fa-2x ${data.iconHeader} "></i>
          </span>
        </span></div>
        `
      }else {
        return ""
      }
    },
    imageHeader: function (data) {
      if (data.imageHeader) {
        return `
        <div class="has-text-centered" ><figure class="image is-128x128 is-inline-block">
          <img src="${data.imageHeader}">
        </figure></div>
        `
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
    sourceOccElement.style.top = "0px"

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer occurence-dimmer"
    var mainEl = document.createElement('div');

    mainEl.style.top = "20%"
    mainEl.style.zIndex = "9999999999"

    mainEl.classList ="box container"
    mainEl.style.maxWidth = "500px"
    container = document.createElement('div');

    container.style.position = "relative"
    container.style.height = "100%"
    // container.style.overflow = "auto"
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
    setupSelection(inputData.fields)

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

  var setupSelection = function (fields) {
    fields.forEach((item, i) => {
      if (item.type=="selection") {
        // $('.form_select_'+item.id)
        //   .dropdown({//use Fomatic dd script
        //     clearable: true,
        //     placeholder: 'any'
        //   })
        let container=document.querySelector('.form_selection_list_'+item.id)
        let template = `
          <div style="font-weight:bold;border-bottom-style: dashed;border-bottom-width: 2px;border-bottom-color: #cbcbcb;" class="form_selection_list_tags_${item.id}"></div>
          <div style="height:300px;" class="form_selection_list_table_${item.id}">Select</div>
        `
        container.innerHTML=template
        let columns = [
          {title:"Name", field:"name"},
        ]

        let menutest = [
          {type:'search', name:"Add", color:"grey"}
        ]
        let data = item.selectOptions
        if (data[0].svgPath) {
          columns.push({title:"Icon", field:"svgPath", formatter:"svgPath"})
        }
        let tableComp = createTableComp()
        let tableObject = tableComp.create(
        {
          onUpdate:e=>{updateList()},
          domElement:'.form_selection_list_table_'+item.id,
          data:data,
          headerVisible:false,
          columns:columns,
          menu:menutest,
          selectable: item.maxSelectable || true,
          rowSelectionChanged:function(data, rows){
          	document.querySelector(`.form_input_${item.id}`).value = data.map(d=>d.value).join(',');
            let html = `${item.label}:` + data.map(d=>theme.tag(d.name+'  X', d.value, "#00b5ad")).join("");
          	document.querySelector(`.form_selection_list_tags_${item.id}`).innerHTML = html
            if (!data[0]) {document.querySelector(`.form_input_${item.id}`).value =""}
          },
        })
        // let table = tableObject.getTable()
        // table.getTable().selectRow(item.preSelected);
        tableObject.selectByValue(item.preSelected)

        document.querySelector('.form_selection_list_'+item.id).addEventListener("mouseleave", function (event) {
          document.querySelector('.form_selection_list_table_'+item.id).style.display= 'none'
        })
        document.querySelector('.form_selection_list_table_'+item.id).style.display= 'none'//hide the menu

        document.querySelector('.form_selection_list_tags_'+item.id).addEventListener("click", function (event) {
          if (event.target.dataset && event.target.dataset.id) {
            tableObject.deselectByValue([event.target.dataset.id])
          }else {
            if (document.querySelector('.form_selection_list_table_'+item.id).style.display!='block') {
              document.querySelector('.form_selection_list_table_'+item.id).style.display= 'block'
            }
          }
        })
        // table.selectRow(table.getRows().filter(row => item.preSelected.includes(row.getData().value)));
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
