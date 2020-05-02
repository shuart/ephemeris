// STORE REDUCER
function reducer(action, store) {
  var type = action.type;
  var pl = action.payload;
  var group = action.group;
  let projectUuid = app.state.currentProject

  var store = undefined;
  var storeGroup = undefined; //find where to apply the action
  var storeArray = undefined;

  if (pl.project) { //special case for actions in all actions view
    projectUuid = pl.project
  }

  if (typeof group == "string") {
    storeGroup = group;
  }else if (Array.isArray(group)) {
    alert ("Dbchange")//TODO DBCHANGE
    // storeGroup = store
    // for (prop of group) {
    //   console.log(store);
    //   storeGroup = storeGroup[prop]
    //   console.log(storeGroup);
    // }
  }
  //find correct array
  if (type == "addLink" || type == "removeLink") {
    storeArray = storeGroup.links
  }else if (group == "metaLinks") {
    storeArray = storeGroup
  }else {
    storeArray = storeGroup.items
  }
  //reduce
  if (type == "addItem") { //ADD ITEM
    dbConnector.addProjectItem(projectUuid, storeGroup ,pl).then(notifyChange)


  }else if (type == "removeItem") { //REMOVE ITEM
    console.log(storeGroup.items);
    // storeGroup.items = storeGroup.items.filter((item)=>item.uuid != pl.uuid)
    dbConnector.removeProjectItem(projectUuid, storeGroup ,pl.uuid).then(notifyChange)

    //clean relative links DBCHANGE
    // if (storeGroup.links) {
    //   storeGroup.links = storeGroup.links.filter((item)=>item.source != pl.uuid && item.target != pl.uuid  )
    // }
  }else if (type == "moveItem") { //REMOVE ITEM
    // var sourceItem = storeGroup.items.filter((item)=>item.uuid == pl.origin)[0]
    // var targetItem = storeGroup.items.filter((item)=>item.uuid == pl.target)[0]
    // storeGroup.items = moveElementInArray(storeGroup.items,sourceItem,targetItem)
    dbConnector.updateItemOrder(projectUuid, storeGroup, pl.value).then(notifyChange)

  }else if (type == "modifyItem") { //MODIFY ITEM
    // var itemToEdit = storeGroup.items.filter((item)=>item.uuid == pl.uuid)
    // itemToEdit[0][pl.prop] = pl.value
    dbConnector.updateProjectItem(projectUuid, storeGroup, pl.uuid, pl.prop, pl.value).then(notifyChange)


  }else if (type == "addLink") { //ADD A LINK
    dbConnector.addProjectLink(projectUuid, storeGroup ,{uuid:pl.uuid, source:pl.source, target:pl.target}).then(notifyChange)

  }else if (type == "removeLink") { //REMOVE A LINK WITH SOURCE OR TARGET OR BOTH

    if (pl.source || pl.target) {
        dbConnector.removeProjectLink(projectUuid, storeGroup ,{source:pl.source, target: pl.target}).then(notifyChange)
    }else{
        dbConnector.removeProjectLink(projectUuid, storeGroup ,pl.uuid).then(notifyChange)
    }

  }else if (type == "replaceItems") { //replace a whole collection !!miss the correct db function
    // dbConnector.addProjectCollection(projectUuid, storeGroup ,pl).then(notifyChange)
  }else if (type == "replaceLinks") { //replace a whole collection
    // dbConnector.addProjectCollection(projectUuid, storeGroup ,pl).then(notifyChange)
  }
  else if (type == "replaceCollection") { //replace a whole collection
    dbConnector.addProjectCollection(projectUuid, storeGroup ,pl).then(notifyChange)
  }

}

//notify changes every time interval
var ephemerisLastStoreUpdate = Date.now()
var ephemerisScheduleStoreUpdate = false

function notifyChange() {
  if (Date.now()-ephemerisLastStoreUpdate > 1500) { //check if laste update is not a few sec ago
    document.dispatchEvent(new Event('storeUpdated'))
    ephemerisLastStoreUpdate = Date.now()
    ephemerisScheduleStoreUpdate = false
  }else {
    if (!ephemerisScheduleStoreUpdate) {
      ephemerisScheduleStoreUpdate = true
      setTimeout(function () {
        notifyChange()
      }, 2200);
    }
  }

}

function push(generatedAction) {
  console.log("action type"+generatedAction.type+" sent in "+generatedAction.group+":");
  console.log(generatedAction);
  reducer(generatedAction, store)
  //saveDB()
  // document.dispatchEvent(new Event('storeUpdated'))
  // renderCDC()
}
