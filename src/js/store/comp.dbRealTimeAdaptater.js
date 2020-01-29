var createDbRealTimeAdaptater = function () {
  var self ={};
  var objectIsActive = false;

  var users
  var projects


  var init = function () {
    connectDB()
  }
  var connectDB =function () {
    // projects = localforage.createInstance({name: "ephemerisProjects"});
    // users = localforage.createInstance({name: "ephemerisUsers"});
    projects = new Nedb({ filename: 'ephemeris_local_projects', autoload: true });   // Create an in-memory only datastore

    projects.find({}, function (err, docs) {
      console.log(docs);
      console.log("indexedDB is loaded");
      if (!docs[0]) {
        persist.getUsers().then(function (users) {
          console.log(users);
          if (users[0]) {
            let migrateDB = confirm("DB needs to be updated. Do you want to magriate your DB")
            if (migrateDB) {
              transfertDBfromOldVersion(users)
            }

          }else {

          }
        }).catch(function(err) {
        // This code runs if there were any errors
            console.log(err);
        });
      }
    });
  }

  function transfertDBfromOldVersion(users) {
    for (var i = 0; i < users.length; i++) {
      persist.getUser(users[i].uuid).then(function (user) {
        user.projects.forEach((project, i) => {
          projects.insert(project, (err,docs)=>console.log(docs))
        });

      }).catch(function(err) {
          console.log(err);
      });
    }
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
    return new Promise(function(resolve, reject) {
        projects.find({}, function (err, docs) {
          console.log(docs);
          resolve(docs)
        })
      }).catch(function(err) {
        reject(err)
      });
  }

  function getProjects() {

  }
  function getProject(uuid) {
    return new Promise(function(resolve, reject) {
        projects.find({uuid: uuid}, function (err, docs) {
          console.log(docs);
          resolve(docs[0])
        })
      }).catch(function(err) {
        reject(err)
      });
  }
  function getProjectCollection(uuid, collectionName) {
    let projection = {}
    projection[collectionName] = 1
    return new Promise(function(resolve, reject) {
        projects.find({uuid: uuid}, projection, function (err, docs) {
          console.log("projection");
          console.log(docs);
          resolve(docs[0][collectionName])
        })
      }).catch(function(err) {
        reject(err)
      });
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
  self.getProject = getProject
  self.getProjectCollection = getProjectCollection
  self.setProject = setProject
  self.removeProject = removeProject
  self.init = init

  return self
}

var dbConnector = createDbRealTimeAdaptater()
dbConnector.init()
