var createOnlineBridge = function () {
var self ={};
var objectIsActive = true;
// Set up socket.io
// const socket = io('http://localhost:3030');
  // Initialize a Feathers client
const client = feathers();
var clientIsConfigured = false;



var init = function () {

}
var connect = function (serverAdress) {
  if (!clientIsConfigured && serverAdress ) {
    // Register socket.io to talk to our server
    // var socket = io('http://localhost:3030');
    if (!serverAdress) {
      alert("bridgeServer not found. Fallback on local server if available")
    }
    serverAdress = serverAdress ||'http://localhost:3030'
    var socket = io(serverAdress);
    client.configure(feathers.socketio(socket));
    // Set up the Feathers authentication client
    client.configure(feathers.authentication());

    console.log("socket initialized")
    clientIsConfigured = true


    function addMessage (message) {
      //document.getElementById('main').innerHTML += `<p>${message.text}</p>`;
      console.log(message);
      let receivedProject = message
      if (app.store.userData.info.syncingProjects && app.store.userData.info.syncingProjects.includes(receivedProject.uuid )) {//check if project is supposed to sync
        resyncFromOnlineProject(message)
      }else {
        console.log("Not Syncying update as project is not supposed to sync");
      }
    }

    function updateOnStatus (message) {
      console.log(message);
      let receivedProject = message
      if (app.store.userData.info.syncingProjects && app.store.userData.info.syncingProjects.includes(receivedProject.uuid )) {//check if project is supposed to sync
        insertInDbFromOnlineProject(message)
      }else {
        console.log("Not Syncying update as project is not supposed to sync");
      }
    }

    client.service('projects').on('updated', addMessage);
    client.service('projects').on('status', updateOnStatus );
  }
  login()
}

var isAuthenticated = async function () {
  try {
    await client.reAuthenticate()
    return true
  } catch (e) {
    console.log(e);
    return false
  }
}

const login = async function (credentials) {
  try {
    if(!credentials) {
      // Try to authenticate using an existing token
      await client.reAuthenticate();
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      await client.authenticate({
        strategy: 'local',
        ...credentials
      });
    }

    // If successful, show the chat page
    console.log("logged")
  } catch(error) {
    // If we got an error, show the login page
    console.log("login refused")
    console.log(error);
  }
};

var connectToOnlineAccount = async function (user) {

  const credentials = user;
  console.log("trying to log");
  console.log(credentials);
  // First create the user
  //await client.service('users').create(credentials);
  // If successful log them in

  await login(credentials);

  try {
    console.log("sending message");
    await client.service('messages').create({
       text: 'connected'
     });
  } catch (e) {
    console.log(e);
  }



}
var logOutFromOnlineAccount = async function () {
  try {
    await client.service('messages').create({
       text: 'leaving'
     });
    await client.logout();
    alert("unlogged")

  } catch (e) {
    console.log(e);
  }
}


var checkSyncStatus = async function(user) {
  console.log(user)


  // checkProjectToLoad()



}

var checkProjectToLoad = async function () {
  let dbs = dbConnector.getDbReferences()

  const messages = await client.service('messages').find();

  console.log(messages);
  let projectToSync = messages[messages.length-1].text
  console.log(projectToSync);
  alert('synced project found: '+projectToSync.name)
  //let currentProjectLoaded = await dbs.localProjects.find()
  let allProjects = await query.items("projects")
  console.log(allProjects);
  let localMatch = allProjects.find(p=>p.uuid == projectToSync.uuid)
  console.log(localMatch);
  if (!localMatch) {
    let sync =confirm("a project could be sycned");
    if (sync) {
      dbConnector.addProject(projectToSync)
    }
  }else {
     console.log("No project To Sync");
   }
}

 var sendCopy = async function(localApp, actionItem) {

   console.log("sending data");

  let dbs = dbConnector.getDbReferences()
  // let projectUuid = localApp.state.currentProject
  let projectUuid = actionItem.projectUuid

  if (localApp.store.userData.info.syncingProjects && localApp.store.userData.info.syncingProjects.includes(projectUuid)) {//check if project is supposed to sync
    await dbs.projects.find({uuid: projectUuid}, async function (err, docs) {//TODO should use local projects after
       //let indexToChange = docs[0][collectionName].items.findIndex(i=>i.uuid == itemId)
       try { //get the online id of the project
         let onlineProjectId = await client.service('projects').find({
           query: {
             uuid: projectUuid,
             $select: [ '_id', 'uuid' ]
           }

         });
         console.log(onlineProjectId);
         if (onlineProjectId.data[0]) { //update the online project
           // sendAllProject(onlineProjectId.data[0]._id,docs[0])
           // console.log("data sent");
           sendNotSyncedChanges(onlineProjectId.data[0]._id,docs[0])
           console.log("partial data sent");
         }else {
           console.log("could not find project");
         }

       } catch (e) {
         console.log("data could not be saved online");
         console.log(e);
       }

   });
  }else {
    console.log("Not Syncying update as project is not supposed to sync");
  }
}

var sendAllProject = async function ( onlineId, projectData) {
  await client.service('projects').update(onlineId,projectData);
}
var sendNotSyncedChanges = async function (onlineId,projectData) {
  //get the lastChange
  let change = projectData.onlineHistory.items[projectData.onlineHistory.items.length-1]
  console.log(change);
  console.log( projectData.onlineHistory);
  if (change) {
    if (change.type == "update") {
      //TODO this should update also the history
      //update the online DB
      let selector = {}
      selector[change.selectorProperty] = change.item
      let actionItem = {}
      actionItem[change.subtype] = selector
      console.log(actionItem);
      try {
        await client.service('projects').update(onlineId,actionItem);
      } catch (e) {
        console.log("+++++++++++++++++++++");
        console.log("+++++++++++++++++++++");
        console.log("+++++++++++++++++++++");
        console.log(e);
        console.log("+++++++++++++++++++++");
        console.log("+++++++++++++++++++++");
        console.log("+++++++++++++++++++++");
        alert("errore while replacating")
      }
      // alert('changé')
    }
  }

}

var getSharedProjects = async function () {
  const messages = await client.service('projects').find({
    // query: {
    //   $sort: { createdAt: -1 },
    //   $limit: 25
    // }
  });

  return messages
}
var getSharedProject = async function (uuid) {
  const messages = await client.service('projects').find({
    query: {
      uuid: uuid
    }
  });

  return messages
}
var createOnlineProject = async function (project) {
  const messages = await client.service('projects').create(project);

  return messages
}

var getOnlineProjectAndResync = async function (uuid) {
  let onlineProject = await getSharedProject(uuid)
  console.log(onlineProject);
  if (onlineProject.data[0]) {
    resyncFromOnlineProject(onlineProject.data[0])
  }

}

var resyncFromOnlineProject = function (onlineProject) {
  let dbs = dbConnector.getDbReferences()
  dbs.projects.update({ uuid: onlineProject.uuid }, onlineProject, {}, function (err, numReplaced) {
    document.dispatchEvent(new Event('storeUpdated'))
    console.log('updated from online project');
    // $('body')
    //   .toast({
    //     message: 'Project updated online'
    //   });
  });

}
var insertInDbFromOnlineProject = function (changes) {
  let change = changes.data.items[changes.data.items.length-1]
  console.log(change);
}

self.getOnlineProjectAndResync = getOnlineProjectAndResync
self.getSharedProject = getSharedProject
self.createOnlineProject = createOnlineProject
self.getSharedProjects = getSharedProjects
self.isAuthenticated = isAuthenticated
self.connectToOnlineAccount = connectToOnlineAccount
self.logOutFromOnlineAccount = logOutFromOnlineAccount
self.checkSyncStatus = checkSyncStatus
self.connect = connect
self.sendCopy = sendCopy
self.init = init

return self
}

var onlineBridge = createOnlineBridge()
onlineBridge.init()
