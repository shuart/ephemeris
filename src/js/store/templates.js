var store = {}

var createNewProject = function (name, optionsData) {
  var options = optionsData || {}
  var secondProject = JSON.parse(ephemeris_presets.se)
  store = secondProject
  // var secondProject = JSON.parse(projectTemplate)
  var projectUuid = genuuid()
  secondProject.infos[0].projectUuid = projectUuid
  secondProject.infos[0].name = name
  secondProject.uuid = projectUuid
  console.log(secondProject);
  if (options.placeholder) {
    // createPBS(secondProject)
  }
  createUserStakeholder(secondProject)
  console.log(secondProject);
  return secondProject
}

function createUserStakeholder(store) {
  if (app.store) {
    let i = app.store.userData.info
    store.stakeholders[0] = {uuid:genuuid(),actorsId:i.userUuid, name:i.userFirstName, lastName:i.userLastName, org:"na", role:"", mail:""}
    store.actors[0] = {uuid:i.userUuid, name:i.userFirstName, lastName:i.userLastName}

  }
  // return store
}
