var createCategoryEditorView = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;

  let currentActionUuid = undefined
  let sourceOccElement = undefined
  let catID = undefined
  let table = undefined

  let theme = {
    menu : function (action) {
      return `
      <div class="ui mini menu">

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

    connect(".action_current_user_edit_item","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      if (newValue) {
        editCurrentUserItem(e.target.dataset.prop, newValue)
      }
      sourceOccElement.remove()
      update()
    })
    connect(".action_add_extra_field","click",(e)=>{
      console.log("Edit");
      var newValue = prompt("Edit Item",e.target.dataset.value)
      if (newValue) {
        push(act.add("extraFields", {target:e.target.dataset.id, name:newValue, type:"text"}))
      }
      sourceOccElement.remove()
      update()
    })

    connect(".action_add_extra_relation","click", async (e)=>{
      console.log("Edit");
      var store = await query.currentProject()
      let selectOptions = store.categories.map(cat=>{
        return {name:cat.name, value:cat.uuid}
      })
      let currentCat = store.categories.find(c=> c.uuid == e.target.dataset.id)

      var popup=  createPromptPopup({
        title:"Create a new relation affecting "+currentCat.name,
        callback :function (res) {
          console.log(res);
          if (res.result == "") {
            // selectedFilter[event.target.dataset.prop] = undefined
            // document.querySelector('.target_list_menu_top_'+event.target.dataset.prop).style.display = "none"
          }else {
            let nameArr = res.result.targetCat.split(',')
            // let nameArr = res.result.ExistingInt.split(',')
            //add new interface
            let uuid = genuuid()
            push(act.add("interfacesTypes", {uuid:uuid,name:res.result.RelationName}))//TODO add await
            //add related extrafield
            push(act.add("extraFields", {target:currentCat.uuid, relationId:uuid, name:res.result.RelationName, type:"relation"}))



            setTimeout(function () {//add element related in terface pool
              nameArr.forEach((item, i) => {
                push(act.edit("interfacesTypes", {uuid:uuid, prop:item, value:true}))
              });


            }, 100);
            // push(act.add("extraFields", {target:e.target.dataset.id, name:newValue, type:"text"}))
            // selectedFilter[event.target.dataset.prop] = res.result.split(',')
            // document.querySelector('.target_list_menu_top_'+event.target.dataset.prop).style.display = "inline"
          }
          // refreshList()
        },
        fields:[
          { type:"input",id:"RelationName" ,label:"Relation Name", placeholder:"Set the relation name" },
          // { type:"input",id:"firstName" ,label:"First Name", placeholder:"Set your first name" },

          { type:"select",id:"targetCat",preSelected:[],selectOptions:selectOptions, label:"target categories", placeholder:"Set linkable categories" }
          // { type:"select",id:"projectNamedffd",preSelected:["test"],selectOptions:[{name:"test", value:"fff"},{name:"teffst", value:"fffa"}], label:"Project name", placeholder:"Set a name for the project" }
        ]

        // fields:{ type:"select",id:"project_filter_"+event.target.dataset.prop,preSelected:[preselected],selectOptions:selectOptions, label:rule.displayAs, optional:true, placeholder:"Search.." }
      })
      // var newValue = prompt("Edit Item",)
      // if (newValue) {
      //   push(act.add("extraFields", {target:e.target.dataset.id, name:newValue, type:"text"}))
      // }
      // sourceOccElement.remove()
      // update()
    })
    connect(".action_connect_to_relation","click", async (e)=>{
      console.log("Edit");
      var store = await query.currentProject()
      let selectOptionsRelations = store.interfacesTypes.map(i=>{
        return {name:i.name, value:i.uuid}
      })
      let selectOptions = store.categories.map(cat=>{
        return {name:cat.name, value:cat.uuid}
      })
      let currentCat = store.categories.find(c=> c.uuid == e.target.dataset.id)

      var popup=  createPromptPopup({
        title:"Add an existing relation affecting "+currentCat.name,
        callback :function (res) {
          console.log(res);
          if (res.result == "") {
          }else {
            let existingRelation = res.result.existingRelation.split(',')
            let nameArr = res.result.targetCat.split(',')
            push(act.add("extraFields", {target:currentCat.uuid, relationId:existingRelation[0], name:res.result.RelationName, type:"relation"}))
            setTimeout(function () {//add element related in terface pool
              nameArr.forEach((item, i) => {
                push(act.edit("interfacesTypes", {uuid:existingRelation[0], prop:item, value:true}))
              });
            }, 100);
          }
          // refreshList()
        },
        fields:[
          { type:"input",id:"RelationName" ,label:"Relation Name", placeholder:"Set the relation name" },
          // { type:"input",id:"firstName" ,label:"First Name", placeholder:"Set your first name" },

          { type:"select",id:"existingRelation",preSelected:[],selectOptions:selectOptionsRelations, label:"Existing Relation", placeholder:"Set existing relations" },
          { type:"select",id:"targetCat",preSelected:[],selectOptions:selectOptions, label:"target categories", placeholder:"Set linkable categories" }
          // { type:"select",id:"projectNamedffd",preSelected:["test"],selectOptions:[{name:"test", value:"fff"},{name:"teffst", value:"fffa"}], label:"Project name", placeholder:"Set a name for the project" }
        ]

        // fields:{ type:"select",id:"project_filter_"+event.target.dataset.prop,preSelected:[preselected],selectOptions:selectOptions, label:rule.displayAs, optional:true, placeholder:"Search.." }
      })
      // var newValue = prompt("Edit Item",)
      // if (newValue) {
      //   push(act.add("extraFields", {target:e.target.dataset.id, name:newValue, type:"text"}))
      // }
      // sourceOccElement.remove()
      // update()
    })

    connect(".action_current_user_close","click",(e)=>{
      sourceOccElement.remove()
    })


    //
    // connect(".action_current_user_select_item_assigned","click",(e)=>{
    //   var metalinkType = e.target.dataset.prop;
    //   var sourceTriggerId = e.target.dataset.id;
    //   var projectStore = query.items("projects").filter(i=>i.uuid == e.target.dataset.project)[0];
    //   var metaLinks = query.items("projects").filter(i=>i.uuid == e.target.dataset.project)[0].metaLinks;
    //   var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)
    //   showListMenu({
    //     sourceData:projectStore.stakeholders,
    //     parentSelectMenu:e.select ,
    //     multipleSelection:currentLinksUuidFromDS,
    //     displayProp:"name",
    //     searchable : true,
    //     display:[
    //       {prop:"name", displayAs:"Name", edit:false},
    //       {prop:"desc", displayAs:"Description", edit:false}
    //     ],
    //     idProp:"uuid",
    //     onCloseMenu: (ev)=>{
    //       sourceOccElement.remove()
    //       update()
    //     },
    //     onChangeSelect: (ev)=>{
    //       console.log(ev.select.getSelected());
    //       console.log(projectStore.metaLinks);
    //       projectStore.metaLinks = projectStore.metaLinks.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
    //       for (newSelected of ev.select.getSelected()) {
    //         projectStore.metaLinks.push({type:metalinkType, source:sourceTriggerId, target:newSelected})//TODO remove this side effect
    //       }
    //       console.log(projectStore.metaLinks);
    //       saveDB()
    //       sourceOccElement.remove()
    //       update()
    //     },
    //     onClick: (ev)=>{
    //       console.log("select");
    //     }
    //   })
    // })
  }

  var render = async function (uuid) {
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
    container.appendChild(toNode(await renderProfile(catID)))
    renderTable(catID)
    document.body.appendChild(sourceOccElement)

  }

  var renderTable = async function (uuid) {
    var store = await query.currentProject()
    var cat = store.categories.find(i=>i.uuid == uuid)
    let fieldsHtml = store.extraFields.filter(i=>i.target == cat.uuid).map(e=> `<div>Name:${e.name}, type:${e.type}</div><div class="ui divider"></div>`)
    let data = store.extraFields.filter(i=>i.target == cat.uuid).map((item) => {
      let relatedInterface = store.interfacesTypes.find(i =>i.uuid == item.relationId)
      if (relatedInterface) {
        item.hasInterfaceTypeTargeted = relatedInterface.name
      }
      return item

    })
    let columns = [
      //{formatter:'action', formatterParams:{name:"Edit"}, width:40, hozAlign:"center", cellClick:function(e, cell){categoryEditorView.update(cell.getRow().getData().uuid)}},
      {title:"Name", field:"name", editor:"modalInput"},
      {title:"Type", field:"type"},
      {title:"Interface displayed", field:"hasInterfaceTypeTargeted"},
      // {
      //   title:"Color",
      //   field:"color",
      //   formatter:"colorTag",
      //   editor:"colorPicker",
      //   editorParams:{
      //     onChange:function (target, color) {
      //       push(act.edit("categories", {uuid:target, prop:"color", value:(color.hex+"").slice(0,-2)}))
      //     }
      //   }
      // },
      // {title:"SVG", field:"svgPath", editor:"modalInput"},
      // {
      //   formatter:'remove',
      //   cellClick:function(e, cell){
      //     console.log(e.target.dataset.id);
      //     if (confirm("remove item ?")) {
      //       push(act.remove("categories",{uuid:e.target.dataset.id}))
      //     }
      //   }
      // },
    ]
    let interfaceToCatRel = {}
    store.categories.forEach((item, i) => {
      for (var i = 0; i < store.interfacesTypes.length; i++) {
        let intType = store.interfacesTypes[i]
        if (intType[item.uuid]) {
          // cell.getRow().getData().uuid
        //  interfaceToCatRel.push({uuid:genuuid(), source:intType.uuid, target:item.uuid})
          interfaceToCatRel[intType.uuid]=item.uuid
        }
      }
    });
    let fieldToCat = []
    store.extraFields.forEach((item, i) => {
      if (interfaceToCatRel[item.relationId]) {
        fieldToCat.push({uuid:genuuid(), source:item.uuid, target:interfaceToCatRel[item.relationId]})
      }
    });


    let targetCol = {
      title:"Target",
      formatter:'relation',
      cellClick:function (event, cell) {
        console.log(event);
        if (event.target.dataset.id) {
          showSingleItemService.showById(event.target.dataset.id)
        }else {
          // createEditRelationPopup(cell.getRow().getData().uuid,e.relationId,store.interfaces.filter(i=>i.typeId==e.relationId),store.currentPbs)
        }
      },
      formatterParams:{
        relationList:fieldToCat,
        relationTargets: store.categories
      },
      field:'fieldtarget',
      editor:"modalRelation"
    }
    columns.push(targetCol)
    let menutest = [
      // {type:'action', name:"Add", color:"#29b5ad", onClick:e=>{addAction()}},
      {type:'action', name:"Add", color:"grey"},
      {type:'search', name:"Add", color:"grey"}
    ]

    table = tableComp.create({onUpdate:e=>{updateList()},domElement:".categoryEditorTable", data:data, columns:columns, menu:menutest})


  }

  var renderProfile = async function (uuid){

    var store = await query.currentProject()
    var cat = store.categories.find(i=>i.uuid == uuid)
    let fieldsHtml = store.extraFields.filter(i=>i.target == cat.uuid).map(e=> `<div>Name:${e.name}, type:${e.type}</div><div class="ui divider"></div>`)

    let html =`
    <h2 class="header">
      My profile
    </h2>
    <div data-id="${cat.uuid}" class="ui segment">
      <div class="content">
        <h3 class="header">First name</h3>
        ${cat.name}
        <i data-prop="userFirstName" data-value="${cat.name}" data-id="${cat.name}" class="edit icon action_current_user_edit_item" style="opacity:0.2"></i>

        <div class="ui divider"></div>
        ADD<i data-prop="userFirstName" data-value="${cat.name}" data-id="${cat.uuid}" class="edit icon action_add_extra_field" style="opacity:0.2"></i>



        <div class="ui divider"></div>
        ADD<i data-prop="userFirstName" data-value="${cat.name}" data-id="${cat.uuid}" class="edit icon action_add_extra_relation" style="opacity:0.2"></i>



        <div class="ui divider"></div>
        ADD from existing<i data-prop="userFirstName" data-value="${cat.name}" data-id="${cat.uuid}" class="edit icon action_connect_to_relation" style="opacity:0.2"></i>



        <div class="ui divider"></div>
        ${fieldsHtml}
        <div class="categoryEditorTable"></div>
      </div>
    </div>
    <div class="ui divider"></div>
    `
    return html
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }







  var update = function (uuid) {
    if (uuid) {
      catID= uuid
    }
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

var categoryEditorView = createCategoryEditorView()
categoryEditorView.init()
// createInputPopup({originalData:jsonFile})
