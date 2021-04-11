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
      action_add_extra_field(e.target.dataset.value,e.target.dataset.id)
    })



    connect(".action_add_extra_relation","click", async (e)=>{
      action_add_extra_relation(cat,e.target.dataset.id)
    })

    connect(".action_connect_to_relation","click", async (e)=>{
      action_connect_to_relation(e.target.dataset.id)
    })

    connect(".action_current_user_close","click",(e)=>{
      sourceOccElement.remove()
    })

  }

  var render = async function (uuid) {
    sourceOccElement = document.createElement('div');
    sourceOccElement.style.height = "100%"
    sourceOccElement.style.width = "100%"
    sourceOccElement.style.zIndex = "9999999999999999999999999999"
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
    console.log(JSON.stringify(store, undefined, 4));
    var cat = store.categories.find(i=>i.uuid == uuid)
    let catData = ephHelpers.createCatData(store)
    let dataInterfaces = store.interfacesTypes
    for (var i = 0; i < dataInterfaces.length; i++) {
      dataInterfaces[i]._targets = catData.interfaces[dataInterfaces[i].uuid].targets
      dataInterfaces[i]._sources = catData.interfaces[dataInterfaces[i].uuid].sources
      dataInterfaces[i]._mainTargets = catData.interfaces[dataInterfaces[i].uuid].mainTargets
      dataInterfaces[i]._mainSources = catData.interfaces[dataInterfaces[i].uuid].mainSources
    }

    let data = store.extraFields.filter(i=>i.target == cat.uuid).map((item) => {
      let relatedInterface = dataInterfaces.find(i =>i.uuid == item.relationId)
      if (relatedInterface) {
        item.hasInterfaceTypeTargeted = relatedInterface.name
        item.hasInterfaceTypeTargetedObject = relatedInterface
        item._mainSources = relatedInterface._mainSources
        item._mainTargets = relatedInterface._mainTargets
        item._sources = relatedInterface._sources
        item._targets = relatedInterface._targets
      }
      return item
    })

    let editInterfaces =function (isSource) {
      return function (event, cell) {
        //TODO improve
        if (event.target.dataset.id) {
          showSingleItemService.showById(event.target.dataset.id)
        }else {
            // let preSelected = cell.getValue().map(v=>v.uuid)
            // let selectOptions = store.categories.map(c=> ({name:c.name, value:c.uuid}))
            // var popup=  createPromptPopup({
            //   title:"Select a category",
            //   callback :function (res) {
            //     let nameArr = res.result.split(',')
            //     let originalSelected = preSelected
            //     let added = nameArr.filter(r=>!originalSelected.includes(r))
            //     let removedItems = originalSelected.filter(r=>!nameArr.includes(r))
            //     added.forEach((item, i) => {
            //       if (isSource) {
            //         push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasSource_"+item, value:true})) //add as source
            //       }else {
            //         push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasTarget_"+item, value:true})) //add as source
            //       }
            //     });
            //     removedItems.forEach((item, i) => {
            //       if (isSource) {
            //         push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasSource_"+item, value:false}))
            //       }else {
            //         push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasTarget_"+item, value:false}))
            //       }
            //     });
            //     // updateList()
            //   },
            //   fields:[
            //     { type:"selection",id:"targetIcon",preSelected:preSelected,selectOptions:selectOptions, label:"Select an Parent", placeholder:"Set linkable categories" }
            //   ]
            // })
        }
      }
    }

    let columns = [
      //{formatter:'action', formatterParams:{name:"Edit"}, width:40, hozAlign:"center", cellClick:function(e, cell){categoryEditorView.update(cell.getRow().getData().uuid)}},
      {title:"Name", field:"name", editor:"modalInput"},
      {title:"Type", field:"type"},
      {title:"Interface displayed", field:"hasInterfaceTypeTargeted"},
      {title:"Sources", field:"_mainSources", formatter:"tags",cellClick:editInterfaces(true),},
      // {title:"Inherited sources", field:"_sources", formatter:"tags",cellClick:undefined,},
      {title:"Targets", field:"_mainTargets", formatter:"tags",cellClick:editInterfaces(false),},
      // {title:"Inherited targets", field:"_targets", formatter:"tags",cellClick:undefined,},
      {
        formatter:'remove',
        cellClick:function(e, cell){
          console.log(e.target.dataset.id);
          if (confirm("remove item ?")) {
            push(act.remove("extraFields",{uuid:e.target.dataset.id}))
            sourceOccElement.remove()
            update()
          }
        }
      },
    ]
    //TODO add an extrafield to open relation
    //          pageManager.setActivePage("relations", {param:{context:"extract", uuid:orev.dataset.id}})//TODO should not call page ma,ager directly
    let menutest = [
      // {type:'action', name:"Add", color:"#29b5ad", onClick:e=>{addAction()}},
      {type:'action', name:"Add text prop", color:"grey",onClick:e=>{action_add_extra_field(cat.name,cat.uuid)}    },
      {type:'action', name:"Add time prop", color:"grey",onClick:e=>{action_add_extra_field_time(cat.name,cat.uuid)}    },
      {type:'action', name:"Connect to relation as Source", color:"grey",onClick:e=>{action_connect_to_relation(cat.uuid, true)}    },
      {type:'action', name:"Connect to relation", color:"grey",onClick:e=>{action_connect_to_relation(cat.uuid, false)}    },
      {type:'action', name:"Add new relation", color:"grey",onClick:e=>{action_add_extra_relation(cat,cat.uuid, true)}    },
    ]
    let tableComp = createTableComp()
    table = tableComp.create(
      {
        onUpdate:e=>{updateList()},
        domElement:".categoryEditorTable",
        data:data,
        columns:columns,
        menu:menutest
      })
  }

  var renderProfile = async function (uuid){
    var store = await query.currentProject()
    var cat = store.categories.find(i=>i.uuid == uuid)
    let html =`
    <h2 class="header">
      Edit Category
    </h2>
    <div data-id="${cat.uuid}" class="ui segment">
      <div class="content">
        <h3 class="header">First name</h3>
        ${cat.name}
        <i data-prop="userFirstName" data-value="${cat.name}" data-id="${cat.name}" class="edit icon action_current_user_edit_item" style="opacity:0.2"></i>
        <div class="ui divider"></div>
        <div style="min-height:500px" class="categoryEditorTable"></div>
      </div>
    </div>
    <div class="ui divider"></div>
    `
    return html
  }
  var renderMenu =function (uuid){
    return theme.menu()
  }

  function action_add_extra_field(value,id) {
    var newValue = prompt("Edit Item",value)
    if (newValue) {
      push(act.add("extraFields", {target:id, name:newValue, type:"text"}))
    }
    sourceOccElement.remove()
    update()
  }
  function action_add_extra_field_time(value,id) {
    var newValue = prompt("Edit Item",value)
    if (newValue) {
      push(act.add("extraFields", {target:id, name:newValue, type:"time"}))
    }
    sourceOccElement.remove()
    update()
  }

  async function action_add_extra_relation(cat,id, isSource) {
    var store = await query.currentProject()
    let selectOptions = store.categories.map(cat=>{
      return {name:cat.name, value:cat.uuid}
    })
    let currentCat = store.categories.find(c=> c.uuid == id)
    var popup=  createPromptPopup({
      title:"Create a new relation affecting "+currentCat.name,
      callback :function (res) {
        console.log(res);
        if (res.result == "") {
        }else {
          let nameArr = res.result.targetCat.split(',')
          // let nameArr = res.result.ExistingInt.split(',')
          //add new interface
          let uuid = genuuid()
          push(act.add("interfacesTypes", {uuid:uuid,name:res.result.RelationName}))//TODO add await
          //add related extrafield
          push(act.add("extraFields", {target:currentCat.uuid, relationId:uuid, name:res.result.RelationName, type:"relation"}))
          setTimeout(function () {//add element related in terface pool
            if (isSource) {
              push(act.edit("interfacesTypes", {uuid:uuid, prop:"hasSource_"+currentCat.uuid, value:true})) //add as source
            }
            nameArr.forEach((item, i) => {
              push(act.edit("interfacesTypes", {uuid:uuid, prop:"hasTarget_"+item, value:true}))
            });
            sourceOccElement.remove()
            update()
          }, 100);
        }
        // refreshList()
      },
      fields:[
        { type:"input",id:"RelationName" ,label:"Relation Name", placeholder:"Set the relation name" },
        { type:"select",id:"targetCat",preSelected:[],selectOptions:selectOptions, label:"target categories", placeholder:"Set linkable categories" }
      ]
    })
  }

  async function action_connect_to_relation(id, isSource) {
    var store = await query.currentProject()
    let selectOptionsRelations = store.interfacesTypes.map(i=>{
      return {name:i.name, value:i.uuid}
    })
    let selectOptions = store.categories.map(cat=>{
      return {name:cat.name, value:cat.uuid}
    })
    let currentCat = store.categories.find(c=> c.uuid == id)
    var popup=  createPromptPopup({
      title:"Add an existing relation affecting "+currentCat.name,
      callback :function (res) {
        console.log(res);
        if (res.result == "") {
        }else {
          let existingRelation = res.result.existingRelation.split(',')
          // let nameArr = res.result.targetCat.split(',')
          push(act.add("extraFields", {target:currentCat.uuid, relationId:existingRelation[0], name:res.result.RelationName, type:"relation"}))
          setTimeout(function () {//add element related in terface pool
            // nameArr.forEach((item, i) => {
            //   push(act.edit("interfacesTypes", {uuid:existingRelation[0], prop:item, value:true}))
            // });
            let uuid = genuuid()
            push(act.edit("interfacesTypes", {uuid:existingRelation[0], prop:"hasTarget_"+currentCat.uuid, value:true}))
            if (isSource) {
              push(act.edit("interfacesTypes", {uuid:existingRelation[0], prop:"hasSource_"+currentCat.uuid, value:true})) //add as source
            }
            sourceOccElement.remove()
            update()
          }, 100);
        }
        // refreshList()
      },
      fields:[
        { type:"input",id:"RelationName" ,label:"Relation Name", placeholder:"Set the relation name" },
        { type:"select",id:"existingRelation",preSelected:[],selectOptions:selectOptionsRelations, label:"Existing Relation", placeholder:"Set existing relations" },
        // { type:"select",id:"targetCat",preSelected:[],selectOptions:selectOptions, label:"target categories", placeholder:"Set linkable categories" }
      ]
    })
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
