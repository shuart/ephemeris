var createOnlineBridge = function () {
var self ={};
var objectIsActive = true;
// Set up socket.io
// const socket = io('http://localhost:3030');
  // Initialize a Feathers client
const client = createOnlineClient();
var clientIsConfigured = false;



var init = function () {

}

var connect = function (serverAdress, socketPath) {
  if (!clientIsConfigured && serverAdress && serverAdress != "") {
    // Register socket.io to talk to our server
    // var socket = io('http://localhost:3030');
    if (!serverAdress) {
      alert("bridgeServer not found. Fallback on local server if available")
    }
    serverAdress = serverAdress ||'http://localhost:3030'
    // var socket = undefined;
    // if (socketPath) {
    //   socket = io(serverAdress, {path: socketPath});
    // }else {
    //   socket = io(serverAdress);
    // }

    client.configure(serverAdress,socketPath);

    console.log("client initialized")
    clientIsConfigured = true;


    // function addMessage (message) {
    //   //document.getElementById('main').innerHTML += `<p>${message.text}</p>`;
    //   console.log(message);
    //   let receivedProject = message
    //   if (app.store.userData.info.syncingProjects && app.store.userData.info.syncingProjects.includes(receivedProject.uuid )) {//check if project is supposed to sync
    //     resyncFromOnlineProject(message)
    //   }else {
    //     console.log("Not Syncying update as project is not supposed to sync");
    //   }
    // }
    //
    // function updateOnStatus (message) {
    //   console.log(message);
    //   let receivedProject = message
    //   if (app.store.userData.info.syncingProjects && app.store.userData.info.syncingProjects.includes(receivedProject.uuid )) {//check if project is supposed to sync
    //     insertInDbFromOnlineProject(message)
    //   }else {
    //     console.log("Not Syncying update as project is not supposed to sync");
    //   }
    // }
    //
    // client.service('projects').on('status', updateOnStatus );
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

  // try {
  //   console.log("sending message");
  //   await client.service('messages').create({
  //      text: 'connected'
  //    });
  // } catch (e) {
  //   console.log(e);
  // }



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

var checkProjectToLoad = async function () {//TODO deprecated
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

 var sendCopy = async function(localApp, actionItem) {//TODO deprecated

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
           sendLastChange(onlineProjectId.data[0]._id,docs[0])
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
 var sendHistoryItem = async function(localApp, actionItem) {

   console.log("sending data");

  let dbs = dbConnector.getDbReferences()
  // let projectUuid = localApp.state.currentProject
  let projectUuid = actionItem.projectUuid

  if (localApp.store.userData.info.syncingProjects && localApp.store.userData.info.syncingProjects.includes(projectUuid)) {//check if project is supposed to sync

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
           sendChangeToServer(onlineProjectId.data[0]._id,actionItem)
           console.log("partial data sent");
         }else {
           console.log("could not find project");
         }

       } catch (e) {
         console.log("data could not be saved online");
         console.log(e);
       }

  }else {
    console.log("Not Syncying update as project is not supposed to sync");
  }
}

var sendAllProject = async function ( onlineId, projectData) {
  await client.service('projects').update(onlineId,projectData);
}
var sendLastChange = async function (onlineId,projectData) {
  //get the lastChange
  let change = projectData.onlineHistory.items[projectData.onlineHistory.items.length-1]
  sendChangeToServer(onlineId,change)
}

var sendChangeToServer = async function (onlineId,change) {
  console.log(change);

  if (!change.localTimestamp) {//ensure that when now who has modified the element
    let timestamp = Date.now()
    change.localTimestamp=timestamp
  }
  if (!change.user) {//ensure that when now who has modified the element
    let userMail = app.store.userData.info.mail
    change.user ={mail:userMail}
  }else if(!change.user.mail) {
    let userMail = app.store.userData.info.mail
    change.user.mail = app.store.userData.info.mail
  }



  let modifyOnlineData = false
  let modifyOnlineHistory = true
  if (change && modifyOnlineData) {
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
        console.log(e);
        alert("error while replacating")
      }
      // alert('changé')
    }
  }
  if (change && modifyOnlineHistory) {
    if (change.type == "update") {
      //TODO this should update also the history
      //update the online DB
      let selector = {}
      // selector["onlineHistory.items"] = JSON.stringify(item)
      selector["onlineHistory.items"] = change
      let actionItem = { $push: selector }
      console.log(actionItem);
      try {
        console.log("starting")
        await client.service('projects').update(onlineId,actionItem);
      } catch (e) {
        console.log(e);
        alert("error while replacating")
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
  //get the
  if (onlineProject.data[0]) {
    await resyncFromOnlineProject(onlineProject.data[0])
  }
}

var resyncFromOnlineProject = async function (onlineProject) {
  let dbs = dbConnector.getDbReferences()
  let difffromOnline = await getDiffFromOnlineProject(onlineProject)
  await dbs.projects.update({ uuid: onlineProject.uuid }, onlineProject, {}, function (err, numReplaced) {

    //syn diff online and local
    console.log(difffromOnline);
    difffromOnline.forEach((item, i) => {
      console.log("change to sync")
      sendChangeToServer(onlineProject._id,item)
      //TODO be sure it's the local project matching
      dbConnector.updateDB(item, true)
    });


    document.dispatchEvent(new Event('storeUpdated'))
    console.log('updated from online project');
    // $('body')
    //   .toast({
    //     message: 'Project updated online'
    //   });
  });

}

var getDiffFromOnlineProject =async function (onlineProject) {
  let dbs = dbConnector.getDbReferences()
  let unsyncLocalHistory =[]
  let localProject = await getLocalProject(onlineProject.uuid)
  let localHistory = localProject.onlineHistory.items
  console.log(localHistory);
  //getOnly the usable element
  let cleanedLocalHistory = localHistory.filter(i=>i.uuid != undefined)//TODO mix with filter lower
  let onlineHistoryItemsUuid = onlineProject.onlineHistory.items.map(i=>i.uuid)
  //the online history contains already the change from the other user and is in the full data downloaded.
  //What is important is to find what is localy not synced to preserve it.
  //So we remove all the items that are already in the online container
  unsyncLocalHistory = cleanedLocalHistory.filter(i=>!onlineHistoryItemsUuid.includes(i.uuid))
  // console.log(cleanedLocalHistory.map(i=>i.uuid));
  // console.log(onlineHistoryItemsUuid.filter(i=>i !=undefined));
  console.log(unsyncLocalHistory);
  //alert("the history")
  return unsyncLocalHistory
}



var insertInDbFromOnlineProject = async function (changes) {
  let change = changes.data.items[changes.data.items.length-1]

  console.log(change);
  if (change.user) {
    if (change.user.mail == app.store.userData.info.mail) {
      return undefined //cancel update as it's a self one
    }
  }
  await dbConnector.updateDB(change, true)
  document.dispatchEvent(new Event('storeUpdated'))
  console.log(change);
}

var getLocalProject= function (uuid) {
  let dbs = dbConnector.getDbReferences()
  return new Promise(function(resolve, reject) {
      dbs.projects.find({uuid: uuid}, function (err, docs) {
        console.log(docs);
        resolve(docs[0])
      })
    }).catch(function(err) {
      reject(err)
    });
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
self.sendHistoryItem = sendHistoryItem
self.init = init

return self
}

var onlineBridge = createOnlineBridge()
onlineBridge.init()
