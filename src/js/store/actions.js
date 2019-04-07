
function saveDB() {
  //var currentProjectListIndex = app.store.projects.findIndex(e=> e.uuid == store.uuid)
  //app.store.projects[currentProjectListIndex]= store;
  //console.log(app.store.projects);
  // return localforage.setItem("sessionProjects", app.store.projects)
  if (app.state.currentUser && app.store.projects) {
    persist.setProject(app.state.currentUser, app.store.projects, app.store.userData)
  }else {
    alert("cannot save DB")
  }
}

function setCurrentProject(project) {
  app.state.currentProject = project
  document.dispatchEvent(new Event('storeUpdated'))
  //TODO ugly remove!!!!
  if (project) {
    // var projectListIndex = app.store.projects.findIndex(e=> e.uuid == project)
    // var currentProjectListIndex = app.store.projects.findIndex(e=> e.uuid == store.uuid)
    // app.store.projects[currentProjectListIndex]= store;
    // store = app.store.projects[projectListIndex]
    saveDB()
    renderCDC()
  }
}

//MAIN ACTIONS

function createAddItem(group) {
  return function (item) { // item need to containe project ID
    return {type:"addItem", group, payload:{uuid:genuuid(), addedDate:Date.now(), ...item}}
  }
}
function createRemoveItem(group, callback) {
  return function ({
    uuid = undefined,
    project = undefined
  }={}) {
    var action = {type:"removeItem", group, payload:{uuid, project}}
    if (callback) {callback()}
    return action
  }
}
function createEditItem(group, callback) {
  return function ({
    uuid = undefined,
    prop = undefined,
    value= undefined,
    project = undefined
  }={}) {
    var action = {type:"modifyItem", group, payload:{uuid,prop,value, project}}
    if (callback) {callback()}
    return action
  }
}
function createMoveItem(group, callback) {
  return function ({
    origin = undefined,
    target = undefined,
    project = undefined
  }={}) {
    var action = {type:"moveItem", group, payload:{origin,target, project}}
    if (callback) {callback()}
    return action
  }
}
function createAddLink(group, callback) {
  return function ({
    uuid = genuuid(),
    source = undefined,
    target = undefined,
    project = undefined
  }={}) {
    var action = {type:"addLink", group, payload:{uuid, source, target, project}}
    if (callback) {callback()}
    return action
  }
}
function createRemoveLink(group, callback) {
  return function ({
    source = undefined,
    target = undefined,
    project = undefined
  }={}) {
    var action = {type:"removeLink", group, payload:{source, target, project}}
    if (callback) {callback()}
    return action
  }
}

//ACTION
//generic
var act={}
act.add = (group, payload, callback) => createAddItem(group, callback)(payload)
act.remove = (group, payload, callback) => createRemoveItem(group, callback)(payload)
act.edit = (group, payload, callback) => createEditItem(group, callback)(payload)
act.move = (group, payload, callback) => createMoveItem(group, callback)(payload)
act.addLink = (group, payload, callback) => createAddLink(group, callback)(payload)
act.removeLink = (group, payload, callback) => createRemoveLink(group, callback)(payload)



var addRequirement = createAddItem("requirements")
var removeRequirement = createRemoveItem("requirements")//shloud also remove links
var editRequirement = createEditItem("requirements")//shloud also remove links
var moveRequirement = createMoveItem("requirements")//shloud also remove links
var addRequirementLink = createAddLink("requirements")//shloud also remove links
var removeRequirementLink = createRemoveLink("requirements")//shloud also remove links

var addPlanningItem = createAddItem(["plannings","items",0])
var removePlanningItem = createRemoveItem(["plannings","items",0])
var editPlanning = createEditItem(["plannings","items",0])//shloud also remove links
var movePlanning = createMoveItem(["plannings","items",0])//shloud also remove links
var addPlanningLink = createAddLink(["plannings","items",0])//shloud also remove links
var removePlanningLink = createRemoveLink(["plannings","items",0])//shloud also remove links

var addPbs = createAddItem("currentPbs")//shloud also remove links
var editPbs = createEditItem("currentPbs")//shloud also remove links
var addPbsLink = createAddLink("currentPbs")//shloud also remove links
var removePbs = createRemoveItem("currentPbs")//shloud also remove links
var movePbs = createMoveItem("currentPbs")//shloud also remove links
var removePbsLink = createRemoveLink("currentPbs")//shloud also remove links
