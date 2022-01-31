var _entities = {}

_entities.drag = function(ev) {

}

_entities.add = async function ({
  name= undefined,
  categoryId= undefined,
  uuid = genuuid(),
  }={}) {
  
  if (!name) {
    var popup= await createPromptPopup({
      title:"Add a new item",
      iconHeader:"plus",
      fields:{ type:"input",id:"requirementName" ,label:"Item name", placeholder:"Set a name for the new item" }
    })
    var newReq = popup.result
    name = newReq
  }
  
  let id = uuid
  push(act.add("currentPbs",{uuid:id,name:name}))
  if (categoryId) {
    push(act.add("metaLinks",{source:id,target:categoryId,type:"category"}))
  }
  return {uuid:id,name:name}
}

_entities.getCategoryFromUuid = async function(sourceItemId, store) {//todo limit metalinks type
  
  var store = store || await query.currentProject()
  var catStore = {}
  for (var i = 0; i < store.metaLinks.length; i++) {
    let metaType = store.metaLinks[i].type
    if (metaType == "category") {
      catStore[store.metaLinks[i].source] = store.metaLinks[i].target
    }
  }
  if (Array.isArray(sourceItemId) ) {
    let returnObject = {}
    for (let index = 0; index < sourceItemId.length; index++) {
      const element = sourceItemId[index];
      let category = undefined
      let categoryLink = catStore[element]
      if (categoryLink) {
        category = store.categories.find(c=>c.uuid == categoryLink)
      }
      returnObject[element] = category
      
    }
    return returnObject
  }else{
    let category = undefined
    let categoryLink = catStore[sourceItemId]
    if (categoryLink) {
      category = store.categories.find(c=>c.uuid == categoryLink)
    }
    return category
  }
  
}

_entities.getCategoriesAvailableRelations = async function (catSource,catTarget, store) {

  var dic = await _entities.getCategoriesParentsList(store)
  console.log(dic);
  var store = store || await query.currentProject()
  var dicInterfaces = {}
  var availableInterfaces = []
  for (var j = 0; j < store.interfacesTypes.length; j++) {
    let currentInterface = store.interfacesTypes[j]
    // console.log(cat);
    // console.log(cat._relatedInterfacesTypes);
    if (!dicInterfaces[currentInterface.uuid]) {
      dicInterfaces[currentInterface.uuid] ={targets:[], sources:[],mainTargets:[], mainSources:[]}
    }
    let isSource = currentInterface["hasSource_"+catSource]
    let isTarget = currentInterface["hasTarget_"+catTarget]
    //also check parents
    if (dic[catSource]._parents[0]) {//if has parents
      for (let index = 0; index < dic[catSource]._parents.length; index++) {
        const element = dic[catSource]._parents[index];
        if (!isSource) {
          isSource = currentInterface["hasSource_"+element.uuid]
        }
      }
    }
    if (dic[catTarget]._parents[0]) {//if has parents
      for (let index = 0; index < dic[catTarget]._parents.length; index++) {
        const element = dic[catTarget]._parents[index];
        if (!isTarget) {
          isTarget = currentInterface["hasTarget_"+element.uuid]
        }
      }
    }
    console.log(currentInterface);
    console.log(isSource,isTarget);
    console.log(catSource,catTarget);
    if (isSource && isTarget) {
      availableInterfaces.push(currentInterface) 
    }
    
    // if (isSource) {
    //   cat._isSourceIn.push(currentInterface.uuid)
    //   dicInterfaces[currentInterface.uuid].mainSources.push(cat)
    // }
    // if (isTarget) {
    //   cat._isTargetIn.push(currentInterface.uuid)
    //   dicInterfaces[currentInterface.uuid].mainTargets.push(cat)
    // }
    // for (var k = 0; k < cat._parents.length; k++) {
    //   let catParent = cat._parents[k]
    //   let isSource = currentInterface["hasSource_"+catParent.uuid]
    //   let isTarget = currentInterface["hasTarget_"+catParent.uuid]
    //   if (isSource) {
    //     cat._isSourceIn.push(currentInterface.uuid)
    //     dicInterfaces[currentInterface.uuid].sources.push(cat)
    //   }
    //   if (isTarget) {
    //     cat._isTargetIn.push(currentInterface.uuid)
    //     dicInterfaces[currentInterface.uuid].targets.push(cat)
    //   }
    // }
  }
  return availableInterfaces
}

_entities.getCategoriesParentsList = async function(store){
  var store = store || await query.currentProject()
  let dic = {}
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
  return dic
}