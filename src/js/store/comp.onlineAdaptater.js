var createOnlineAdaptater = function () {
  var self ={};
  var objectIsActive = false;

  var isConfigured = false
  // Establish a Socket.io connection
  let socket = undefined
  let client = undefined

  var init = function () {
    connectDB()
  }
  var connectDB =function () {

  }

  function configureConnection() {
    console.log("Socket client configuration");
    socket = io(app.store.userData.info.userOnlineServer, {path: app.store.userData.info.userOnlineSocket || "socket.io"});
    client = feathers();
    client.configure(feathers.socketio(socket));
    client.configure(feathers.authentication({
      storage: window.localStorage
    }));
    isConfigured = true
  }


  async function updateData(uuid, projects, userData) {//separate user and projects
    let establishConnection = (app.store.userData.info.userOnlineConnectBool=="true")
    if (establishConnection && !app.store.userData.info.userOnlineServer) {
      console.log('Cannot connect to socketio, server path not configured');
    }
    if (establishConnection && app.store.userData.info.userOnlineServer) {
      if (!isConfigured) {
        configureConnection()
      }
      console.log('establish socket connection');
      const user = getCredentials();
      await login(user);
      let secret =app.store.userData.info.userOnlinePassphrase
      let remoteId =app.store.userData.info.userOnlineAccountId
      let data = generateNextActionListString()
      sendPayload(remoteId, data, secret)
    }
  }

  async function sendPayload(remoteId, data, secret) {
    if (secret, remoteId) {
      const input = CryptoJS.AES.encrypt(data , secret).toString();
      await client.service('projects').patch(remoteId,{$set: { actionsBeta: input } });
      // await client.service('projects').patch(remoteId,{ $addToSet: { messages: {text:input} } });
      console.log("send encrypted data to online server");
      //console.log(data, secret);
    }else {
      console.log('secret and remote id must be configured');
    }
  }

  const login = async credentials => {
    try {
      if(!credentials) {
      console.log("reAuth");
        // Try to authenticate using an existing token
        await client.reAuthenticate();
      } else {
        // Otherwise log in with the `local` strategy using the credentials we got
        await client.authenticate({
          strategy: 'local',
          ...credentials
        });
      }
      console.log('Logged');
    } catch(error) {
      console.log('unlogged');
      console.log(error);
    }
  };
  const getCredentials = () => {
    const user = {
      email: app.store.userData.info.userOnlineEmail,
      password: app.store.userData.info.userOnlinePassword
    };

    return user;
  };

  //send only action
  function generateNextActionListString() {
    var filterText = ""
    var filterClosedDaysAgo = -2
    let allActions = []
    query.items("projects").forEach(function (store) {
      let formatedActions = store.actions.items.map(a=>{
        let copy = deepCopy(a)
        copy.projectName = store.name;
        copy.urgent = lessThanInSomeDays(a.dueDate,2)
        copy.projectUuid = store.uuid
        copy.assignedToUuid = store.metaLinks.items.filter(m=>m.type == "assignedTo" && m.source == copy.uuid).map(f=>f.target)
        return copy
      })
      allActions = allActions.concat(formatedActions)
    })
    return JSON.stringify(allActions)
  }


  self.updateData = updateData
  self.init = init

  return self
}

var onlineAdaptater = createOnlineAdaptater()
onlineAdaptater.init()
