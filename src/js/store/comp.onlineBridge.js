var createOnlineBridge = function () {
var self ={};
var objectIsActive = true;
// Set up socket.io
const socket = io('http://localhost:3030');
  // Initialize a Feathers app
const app = feathers();



var init = function () {
  // Register socket.io to talk to our server
  app.configure(feathers.socketio(socket));
  // Set up the Feathers authentication client
  app.configure(feathers.authentication());

  alert("socket initialized")


  function addMessage (message) {
    //document.getElementById('main').innerHTML += `<p>${message.text}</p>`;
    console.log(message);
    let receivedProject = message
    let dbs = dbConnector.getDbReferences()
    dbs.projects.update({ uuid: receivedProject.uuid }, message, {}, function (err, numReplaced) {
      document.dispatchEvent(new Event('storeUpdated'))
    });
    $('body')
      .toast({
        message: 'Project updated online'
      });
  }

  app.service('projects').on('updated', addMessage);


}

var isAuthenticated = async function () {
  try {
    await app.reAuthenticate()
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
      await app.reAuthenticate();
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      await app.authenticate({
        strategy: 'local',
        ...credentials
      });
    }

    // If successful, show the chat page
    alert("logged")
  } catch(error) {
    // If we got an error, show the login page
    alert("login refused")
    console.log(error);
  }
};

var connectToOnlineAccount = async function (user) {

  const credentials = user;
  console.log("trying to log");
  console.log(credentials);
  // First create the user
  //await app.service('users').create(credentials);
  // If successful log them in

  await login(credentials);

  try {
    console.log("sending message");
    await app.service('messages').create({
       text: 'connected'
     });
  } catch (e) {
    console.log(e);
  }



}
var logOutFromOnlineAccount = async function () {
  try {
    await app.service('messages').create({
       text: 'leaving'
     });
    await app.logout();
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

  const messages = await app.service('messages').find();

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

 var sendCopy = async function(localApp) {

   console.log("sending data");

  let dbs = dbConnector.getDbReferences()
  let projectUuid = localApp.state.currentProject
   await dbs.projects.find({uuid: projectUuid}, async function (err, docs) {//TODO should use local projects after
      //let indexToChange = docs[0][collectionName].items.findIndex(i=>i.uuid == itemId)
      try {
        let onlineProjectId = await app.service('projects').find({
          query: {
            uuid: projectUuid,
            $select: [ '_id', 'uuid' ]
          }

        });
        console.log(onlineProjectId);
        if (onlineProjectId.data[0]) {
          await app.service('projects').update(onlineProjectId.data[0]._id,docs[0]);
        }else {
          console.log("could not find project");
        }

      } catch (e) {
        console.log("data could not be saved online");
        console.log(e);
      }

  });
}

var getSharedProjects = async function () {
  const messages = await app.service('projects').find({
    // query: {
    //   $sort: { createdAt: -1 },
    //   $limit: 25
    // }
  });

  return messages
}
var getSharedProject = async function (uuid) {
  const messages = await app.service('projects').find({
    query: {
      uuid: uuid
    }
  });

  return messages
}
var createOnlineProject = async function (project) {
  const messages = await app.service('projects').create(project);

  return messages
}

self.getSharedProject = getSharedProject
self.createOnlineProject = createOnlineProject
self.getSharedProjects = getSharedProjects
self.isAuthenticated = isAuthenticated
self.connectToOnlineAccount = connectToOnlineAccount
self.logOutFromOnlineAccount = logOutFromOnlineAccount
self.checkSyncStatus = checkSyncStatus
self.sendCopy = sendCopy
self.init = init

return self
}

var onlineBridge = createOnlineBridge()
onlineBridge.init()
