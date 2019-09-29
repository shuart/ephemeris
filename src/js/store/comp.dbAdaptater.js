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
    var newNoteUuid = uuid()
    return users.setItem(newUuid,{
      uuid:newUuid,
      name:data.name || "new user",
      userData:{
        info:{
          userUuid:genuuid()
        },
        preferences:{
          projectDisplayOrder:[],
          hiddenProject:[]
        },
        notes:{
          items:[{
            uuid:newNoteUuid,
            title:"How to add notes",
            content:"Use Markdown"
          }]
        },
        tags:{
          items:[
            {
              uuid:genuuid(),
              name:"How To",
              targets:[newNoteUuid]
            },
            {
              uuid:genuuid(),
              name:"Another Tag",
              targets:[newNoteUuid]
            }
          ]
        }
      },
      projects:data.projects||[]
    })
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

  function setProject(uuid, projects, userData) {//separate user and projects
    return new Promise(function(resolve, reject) {
      users.getItem(uuid).then(function (user) {
        user.projects = projects
        user.userData = userData
        resolve(users.setItem(uuid, user))
      }).catch(function(err) {
        reject(err)
      });
    });
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
