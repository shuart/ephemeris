var query = {}
query.currentProject = function () {
  return app.store.projects.find(e=>e.uuid==app.state.currentProject);
}
query.items = (group, condition) => {
  //var store = store;
  var store = query.currentProject() || app.store.projects[0] //TODO remove super ugly
  var storeGroup = undefined
  //#corner cases
  if (group == "projects") {
    console.log(app.store.projects);
    storeGroup = app.store.projects
  }
  //#general cases

  if (!storeGroup && typeof group == "string") {
    storeGroup = store[group];
  }else if (Array.isArray(group)) {
    for (prop of group) {
      console.log(storeGroup);
      storeGroup = storeGroup[prop]
    }
  }

  //#filtering
  if (storeGroup && condition) {
    console.log('condition applied');
    return storeGroup.filter(condition)
  }else {
    console.log(group + " has been queried, return ", storeGroup);
    return storeGroup
  }
}
