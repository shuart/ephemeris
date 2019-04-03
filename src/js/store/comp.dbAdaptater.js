var createDbAdaptater = function () {
  var self ={};
  var objectIsActive = false;

  var users
  var projects


  var init = function () {
    connectDB()
  }
  var connectDB =function () {
    projects = localforage.createInstance({name: "ephemerisProjects"});
    users = localforage.createInstance({name: "ephemerisUsers"});
  }

  function getUser(uuid) {
    return users.getItem(uuid)
  }

  function getUsers() {
    return new Promise(function(resolve, reject) {
      users.keys().then(function (keys) {
        console.log(keys);
        var promises  = keys.map(function(item) { return users.getItem(item); });
        resolve(Promise.all(promises))
      }).catch(function(err) {
        reject(err)
      });
    });
  }

  function setUser(data) { //name
    var newUuid = uuid()
    return users.setItem(newUuid,{uuid:newUuid,name:data.name || "new user", info:{}, projects:[]})
  }

  function removeUser(uuid) {
    return users.removeItem(uuid)
  }

  function addUserProject() {

  }

  function getUserProjectList() {

  }

  function getProjects() {

  }

  function setProject() {

  }
  function removeProject() {

  }

  self.getUser = getUser
  self.getUsers = getUsers
  self.setUser = setUser
  self.removeUser = removeUser
  self.addUserProject = addUserProject
  self.getUserProjectList = getUserProjectList
  self.getProjects = getProjects
  self.setProject = setProject
  self.removeProject = removeProject
  self.init = init

  return self
}

var persist = createDbAdaptater()
persist.init()
