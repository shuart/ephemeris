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

    return data
  }

  var renderTable = function (store) {

    let data = prepareData(store)
    let catData = createCatData(store)
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
    ]
    let interfaceToCatRel = {}
    let interfaceToCatRelSource = {}
    store.categories.forEach((item, i) => {
      for (var i = 0; i < store.interfacesTypes.length; i++) {
        let intType = store.interfacesTypes[i]
        if (intType["hasTarget_"+item.uuid]) {
          // cell.getRow().getData().uuid
        //  interfaceToCatRel.push({uuid:genuuid(), source:intType.uuid, target:item.uuid})
          if (!interfaceToCatRel[intType.uuid]) {
            interfaceToCatRel[intType.uuid] =[]
          }
          interfaceToCatRel[intType.uuid].push(item.uuid)
        }
        if (intType["hasSource_"+item.uuid]) {
          // cell.getRow().getData().uuid
        //  interfaceToCatRel.push({uuid:genuuid(), source:intType.uuid, target:item.uuid})
          if (!interfaceToCatRelSource[intType.uuid]) {
            interfaceToCatRelSource[intType.uuid] =[]
          }
          interfaceToCatRelSource[intType.uuid].push(item.uuid)
        }
      }
    });
    let fieldToCat = []
    let fieldToCatSource = []
    store.interfacesTypes.forEach((item, i) => {
      if (interfaceToCatRel[item.uuid]) {
        let relatedCategories = interfaceToCatRel[item.uuid]
        for (var i = 0; i < relatedCategories.length; i++) {
          fieldToCat.push({uuid:genuuid(), source:item.uuid, target:relatedCategories[i]})
        }
      }
    });
    store.interfacesTypes.forEach((item, i) => {
      if (interfaceToCatRelSource[item.uuid]) {
        let relatedCategories = interfaceToCatRelSource[item.uuid]
        for (var i = 0; i < relatedCategories.length; i++) {
          fieldToCatSource.push({uuid:genuuid(), source:item.uuid, target:relatedCategories[i]})
        }
      }
    });



    let targetCol = {
      title:"Target",
      formatter:'relation',
      cellClick:function (event, cell) {
        console.log(event);
        console.log(catData.interfaces[cell.getRow().getData().uuid].targets);
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
    let sourceCol = {
      title:"Sources",
      formatter:'relation',
      cellClick:function (event, cell) {
        console.log(catData.interfaces[cell.getRow().getData().uuid].sources);
        console.log(event);
        if (event.target.dataset.id) {
          showSingleItemService.showById(event.target.dataset.id)
        }else {
          // createEditRelationPopup(cell.getRow().getData().uuid,e.relationId,store.interfaces.filter(i=>i.typeId==e.relationId),store.currentPbs)
        }
      },
      formatterParams:{
        relationList:fieldToCatSource,
        relationTargets: store.categories
      },
      field:'fieldtarget',
      editor:"modalRelation"
    }
    columns.push(sourceCol)

    let menutest = [
      // {type:'action', name:"Add", color:"#29b5ad", onClick:e=>{addAction()}},
      {type:'action', name:"Add text prop", color:"grey",onClick:e=>{action_add_extra_field(cat.name,cat.uuid)}    },
      {type:'action', name:"Connect to relation as Source", color:"grey",onClick:e=>{action_connect_to_relation(cat.uuid, true)}    },
      {type:'action', name:"Connect to relation", color:"grey",onClick:e=>{action_connect_to_relation(cat.uuid, false)}    },
      {type:'action', name:"Add new relation", color:"grey",onClick:e=>{action_add_extra_relation(cat,cat.uuid, true)}    },
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
          dicInterfaces[currentInterface.uuid] ={targets:[], sources:[]}
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
