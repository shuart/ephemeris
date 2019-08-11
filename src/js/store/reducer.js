// STORE REDUCER

function reducer(action, store) {
  var type = action.type;
  var pl = action.payload;
  var group = action.group;
  var store = undefined;
  var storeGroup = undefined; //find where to apply the action
  var storeArray = undefined;

  //Set correct Project Store
  if (group == "projects") { //TODO redo everything here
    store = app.store.projects
  }else if (group == "actions") {//handle actions
    if (pl.project) {
      store = app.store.projects.filter(p => p.uuid == pl.project)[0]
    }else{
      store = app.store.projects.filter(e => e.actions.items.find(e => pl.uuid == e.uuid))[0].actions
    }
  }else if (group == "metaLinks") { //handle metaLinks
    store = query.currentProject()
  }else if (group == "interfaces") { //handle metaLinks
    store = query.currentProject()
  }else {
    store = query.currentProject() //All other cases
  }
  //Set correct group
  if (typeof group == "string") {
    storeGroup = store[group];
  }else if (Array.isArray(group)) {
    for (prop of group) {
      console.log(storeGroup);
      storeGroup = storeGroup[prop]
    }
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
    if (!isItemAlreadyThere(pl, storeGroup.items)) {
      storeGroup.items.push(pl)
      recordChangeInStore(type, store, group, pl)
    }else {
      alert("Item already exist")
    }
  }else if (type == "removeItem") { //REMOVE ITEM
    console.log(storeGroup.items);
    storeGroup.items = storeGroup.items.filter((item)=>item.uuid != pl.uuid)
    console.log(storeGroup.items);
    recordChangeInStore(type, store, group, pl)
    //clean relative links
    if (storeGroup.links) {
      storeGroup.links = storeGroup.links.filter((item)=>item.source != pl.uuid && item.target != pl.uuid  )
    }
  }else if (type == "moveItem") { //REMOVE ITEM
    var sourceItem = storeGroup.items.filter((item)=>item.uuid == pl.origin)[0]
    var targetItem = storeGroup.items.filter((item)=>item.uuid == pl.target)[0]
    storeGroup.items = moveElementInArray(storeGroup.items,sourceItem,targetItem)
  }else if (type == "modifyItem") { //MODIFY ITEM
    var itemToEdit = storeGroup.items.filter((item)=>item.uuid == pl.uuid)
    itemToEdit[0][pl.prop] = pl.value
    recordChangeInStore(type, store, group, pl)
  }else if (type == "addLink") { //ADD A LINK
    storeGroup.links.push({uuid:pl.uuid, source:pl.source, target:pl.target})
    recordChangeInStore(type, store, group, pl)
  }else if (type == "removeLink") { //REMOVE A LINK WITH SOURCE OR TARGET OR BOTH
    recordChangeInStore(type, store, group, pl)//record it before to working on modified arrays array
    if (pl.source && !pl.target) {
      storeGroup.links =storeGroup.links.filter(i=> i.source != pl.source)
    }else if (pl.target && !pl.source) {
      storeGroup.links =storeGroup.links.filter(i=> i.target != pl.target)
    }else if (pl.target && pl.source) {
      storeGroup.links =storeGroup.links.filter(i=> !(i.target == pl.target && i.source == pl.source))
    }
  }

  //helper functions
  function isItemAlreadyThere(pl, array) {
    if (pl.type && !pl.prop) {
      if (array.find(e => e.type == pl.type && e.source == pl.source && e.target == pl.target)) {
        console.log(pl);
        console.log(array.find(e => e.type == pl.type && e.source == pl.source && e.target == pl.target));
        return true
      }
    }
    return false
  }

}

function push(generatedAction) {
  console.log("action type"+generatedAction.type+" sent in "+generatedAction.group+":");
  console.log(generatedAction);
  reducer(generatedAction, store)
  saveDB()
  document.dispatchEvent(new Event('storeUpdated'))
  renderCDC()
}
