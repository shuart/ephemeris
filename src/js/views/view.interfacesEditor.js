var createInterfacesEditorView = function () {
  var self ={};
  var objectIsActive = false;
  var currentVisibleList= undefined;
  let table=undefined

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var updateList =  function () {
    setTimeout(async function () {
      var store = await query.currentProject()
      let data = prepareData(store)
      table.updateData(data)
    }, 1200);
  }

  var render = async function () {
    var store = await query.currentProject()
    renderTable(store)
  }

  var prepareData = function (store) {
    let data = store.interfacesTypes
    let catData = createCatData(store)
    for (var i = 0; i < data.length; i++) {
      data[i]._targets = catData.interfaces[data[i].uuid].targets
      data[i]._sources = catData.interfaces[data[i].uuid].sources
      data[i]._mainTargets = catData.interfaces[data[i].uuid].mainTargets
      data[i]._mainSources = catData.interfaces[data[i].uuid].mainSources

    }

    return data
  }

  var renderTable = function (store) {

    let data = prepareData(store)
    let editInterfaces =function (isSource) {
      return function (event, cell) {
        if (event.target.dataset.id) {
          showSingleItemService.showById(event.target.dataset.id)
        }else {
              let preSelected = cell.getValue().map(v=>v.uuid)
              let selectOptions = store.categories.map(c=> ({name:c.name, value:c.uuid}))
              var popup=  createPromptPopup({
                title:"Select a category",
                callback :function (res) {
                  let nameArr = res.result.split(',')
                  let originalSelected = preSelected
                  let added = nameArr.filter(r=>!originalSelected.includes(r))
                  let removedItems = originalSelected.filter(r=>!nameArr.includes(r))
                  added.forEach((item, i) => {
                    if (isSource) {
                      push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasSource_"+item, value:true})) //add as source
                    }else {
                      push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasTarget_"+item, value:true})) //add as source
                    }
                  });
                  removedItems.forEach((item, i) => {
                    if (isSource) {
                      push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasSource_"+item, value:false}))
                    }else {
                      push(act.edit("interfacesTypes", {uuid:cell.getRow().getData().uuid, prop:"hasTarget_"+item, value:false}))
                    }
                  });
                  updateList()
                },
                fields:[
                  { type:"selection",id:"targetIcon",preSelected:preSelected,selectOptions:selectOptions, label:"Select an Parent", placeholder:"Set linkable categories" }
                ]
              })
        }
      }
    }

    let columns = [
      {title:"Interface displayed", field:"name"},

      {
        title:"Color",
        field:"color",
        formatter:"colorTag",
        editor:"colorPicker",
        editorParams:{
          onChange:function (target, color) {
            push(act.edit("interfacesTypes", {uuid:target, prop:"color", value:(color.hex+"").slice(0,-2)}))
          }
        }
      },
      {title:"Sources", field:"_mainSources", formatter:"tags",cellClick:editInterfaces(true),},
      {title:"Inherited sources", field:"_sources", formatter:"tags",cellClick:undefined,},
      {title:"Targets", field:"_mainTargets", formatter:"tags",cellClick:editInterfaces(false),},
      {title:"Inherited targets", field:"_targets", formatter:"tags",cellClick:undefined,},

    ]

    let menutest = [
      // {type:'action', name:"Add", color:"#29b5ad", onClick:e=>{addAction()}},
      // {type:'action', name:"Add text prop", color:"grey",onClick:e=>{action_add_extra_field(cat.name,cat.uuid)}    },
      // {type:'action', name:"Connect to relation as Source", color:"grey",onClick:e=>{action_connect_to_relation(cat.uuid, true)}    },
      // {type:'action', name:"Connect to relation", color:"grey",onClick:e=>{action_connect_to_relation(cat.uuid, false)}    },
      // {type:'action', name:"Add new relation", color:"grey",onClick:e=>{action_add_extra_relation(cat,cat.uuid, true)}    },
      // {type:'search', name:"Add", color:"grey"}
    ]
    let tableComp = createTableComp()
    table = tableComp.create(
      {
        onUpdate:e=>{updateList()},
        domElement:"modal",
        data:data,
        columns:columns,
        menu:menutest
      })
  }

  var createCatData = function (store) {
    let dic = {}
    let dicInterfaces = {}
    let data = []
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      if (!cat._parents) {cat._parents =[]}
      if (!cat._children) {cat._children =[]}
      dic[cat.uuid] = cat

    }
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      if (cat.parentCat) {
        cat.parentCatName = dic[cat.parentCat].name
        dic[cat.parentCat]._children.push(cat)
      }else {
        data.push(cat)
      }
    }
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      let currentCat = cat
      while (currentCat.parentCat) {
        console.log(currentCat.parentCat);
        cat._parents.push(dic[currentCat.parentCat])
        currentCat = dic[currentCat.parentCat]
      }
    }
    //assign extra fields
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      let linkedExtraFieldsTargets = cat._parents.map(p=>p.uuid)
      cat._relatedInterfacesTypes = []
      cat._assignedExtraFields = store.extraFields.filter(i=>linkedExtraFieldsTargets.includes(i.target) || i.target == cat.uuid)
      for (var j = 0; j < cat._assignedExtraFields.length; j++) {
        let ef = cat._assignedExtraFields[j]
        let relatedInterfaceType = store.interfacesTypes.find(e=>e.uuid == ef.relationId)
        if (relatedInterfaceType) {
          ef._relatedInterfaceType = relatedInterfaceType
          cat._relatedInterfacesTypes.push( relatedInterfaceType)
        }
      }
    }

    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      cat._isTargetIn = []
      cat._isSourceIn = []
      for (var j = 0; j < store.interfacesTypes.length; j++) {
        let currentInterface = store.interfacesTypes[j]
        console.log(cat);
        console.log(cat._relatedInterfacesTypes);
        if (!dicInterfaces[currentInterface.uuid]) {
          dicInterfaces[currentInterface.uuid] ={targets:[], sources:[],mainTargets:[], mainSources:[]}
        }
        let isSource = currentInterface["hasSource_"+cat.uuid]
        let isTarget = currentInterface["hasTarget_"+cat.uuid]
        if (isSource) {
          cat._isSourceIn.push(currentInterface.uuid)
          dicInterfaces[currentInterface.uuid].mainSources.push(cat)
        }
        if (isTarget) {
          cat._isTargetIn.push(currentInterface.uuid)
          dicInterfaces[currentInterface.uuid].mainTargets.push(cat)
        }
        for (var k = 0; k < cat._parents.length; k++) {
          let catParent = cat._parents[k]
          let isSource = currentInterface["hasSource_"+catParent.uuid]
          let isTarget = currentInterface["hasTarget_"+catParent.uuid]
          if (isSource) {
            cat._isSourceIn.push(currentInterface.uuid)
            dicInterfaces[currentInterface.uuid].sources.push(cat)
          }
          if (isTarget) {
            cat._isTargetIn.push(currentInterface.uuid)
            dicInterfaces[currentInterface.uuid].targets.push(cat)
          }
        }
      }
    }
    console.log(data);
    return {data:data, dic:dic, interfaces:dicInterfaces}
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    currentVisibleList = undefined
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var interfacesEditorView = createInterfacesEditorView()
interfacesEditorView.init()
