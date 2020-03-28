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

  alert("socket initialized")


  function addMessage (message) {
    //document.getElementById('main').innerHTML += `<p>${message.text}</p>`;
    let receivedProject = message.text
    let dbs = dbConnector.getDbReferences()
    dbs.projects.update({ uuid: receivedProject.uuid }, message.text, {}, function (err, numReplaced) {
      document.dispatchEvent(new Event('storeUpdated'))
    });
    $('body')
      .toast({
        message: 'I am a toast, nice to meet you !'
      });
  }

  app.service('messages').on('created', addMessage);


}

var checkSyncStatus = async function(user) {
  console.log(user)
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

       await app.service('messages').create({
          text: docs[0]
        });

      });

}

self.checkSyncStatus = checkSyncStatus
self.sendCopy = sendCopy
self.init = init

return self
}

var onlineBridge = createOnlineBridge()
onlineBridge.init()
