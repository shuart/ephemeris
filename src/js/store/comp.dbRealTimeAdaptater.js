var createDbRealTimeAdaptater = function () {
  var self ={};
  var objectIsActive = false;

  var users
  var projects
  var localProjects
  var localDB


  var init = function () {
    connectDB()
  }
  var connectDB = async function () {

    projects = new Nedb();   // Create an in-memory only datastore

    localDB = await idb.openDB('localDB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('projects');
        db.createObjectStore('users', {keyPath:"uuid"});
        var messages = db.createObjectStore('messages', {keyPath:"timestamp"});
        messages.createIndex('projectIndex', 'project');
        // messages.createIndex('idIndex', 'uuid');
        messages.createIndex('datasetIndex', 'dataset');

      }
    });

    setTimeout(function () {
      console.log('Connection to local DB established');
      startupScreen.update()
    }, 0);
  }



  async function getUser(id) {
    let user = await localDB.get('users', id);
    return user
  }
  async function setUserInfo(id, prop, value) { //TODO move to indexedDB
    let selector = {}
    let currentUserObject= await localDB.get('users', id);
    console.log(prop);
    currentUserObject.userData.info[prop] = value
    await localDB.put('users', currentUserObject);
    console.log(await localDB.get('users', id));
    return currentUserObject
    // store.createIndex('strengthIndex', 'strength');

  }

  async function getUsers() {
    let users = await localDB.getAll('users')
    // console.log(users.map(u=>u[Object.keys[0]]));
    return users
  }

  async function setUser(data) { //name
    var newUuid = uuid()
    var newNoteUuid = uuid()
    var userObject = {
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
    }
    await localDB.add('users', userObject);
  }

  async function removeUser(uuid) {
    await localDB.delete('users', uuid);
  }

  function addUserProject() {

  }

  async function getProjects(limit) {
    let projectsArray = []
    let projectList = await crdtsDB.getTablesFromMessages(limit)
    Object.keys(projectList).forEach((key, i) => {
      projectList[key].uuid= key
      if (limit) {//populate with an empty array if nothing was found in messages
        for (var i = 0; i < limit.length; i++) {
          let field = limit[i]
          if (!projectList[key][field]) {
            projectList[key][field] = []
          }
        }
      }
      projectsArray.push(projectList[key])
    });


    console.log(projectsArray);
    return projectsArray
  }

  //=====Connect to online Bridge=====
  async function logCallback(actionItem) {
    console.log("item added to DB");
    console.log(actionItem);

    let onlineHistoryItem = actionItem
    console.log(actionItem)

    await addOnlineHistoryItem(onlineHistoryItem)
    //data has been persisted, now try to synchronise it

    onlineBridge.sendHistoryItem(app, actionItem)

  }
  async function logCallbackWithoutSync(actionItem) {
    console.log("item added to DB");
    console.log(actionItem);

    let onlineHistoryItem = actionItem

    await addOnlineHistoryItem(onlineHistoryItem)

  }

  function addOnlineHistoryItem(item) {
    // let projectUuid = item.projectUuid
    // console.log(projectUuid);
    // let selector = {}
    // // selector["onlineHistory"] = JSON.stringify(item)
    //
    // if (!item.user) {//check if a user already exist (there should be one if the action come form an online sync)
    //   let userMail = app.store.userData.info.mail
    //   let timestamp = Date.now()
    //   item.user = {mail:userMail}
    //   item.localTimestamp=timestamp
    //   item.uuid=genuuid()
    // }
    //
    //
    //
    // selector["onlineHistory"] = item
    // let actionItem = { $push: selector }
    //
    // console.log(actionItem);
    // console.log(selector);
    //
    // return new Promise(function(resolve, reject) {
    //     projects.update({ uuid: projectUuid }, actionItem, {}, function (err, numAffected, affectedDocuments, upsert) {
    //       localProjects.update({ uuid: projectUuid }, actionItem, {}, function (err, numAffected, affectedDocuments, upsert) {
    //         console.log("persisted online item");
    //       });
    //       resolve(affectedDocuments)
    //     });
    //   }).catch(function(err) {
    //     reject(err)
    //   });
  }
  //=====END Connect to online Bridge=====

  function updateDB(callBackItem, preventSync) {
    if (callBackItem.type == "update") {

      let projectUuid = callBackItem.projectUuid
      let selector = {}
      selector[callBackItem.selectorProperty] = callBackItem.item
      let actionItem = {}
      actionItem[callBackItem.subtype] = selector

      if (callBackItem.subtype == "$push") {
        crdtsDB._insert(projectUuid,callBackItem.selectorProperty, callBackItem.item )
      }
      if (callBackItem.subtype == "$set") {
        let row = {}
        row.uuid = callBackItem.row
        row[callBackItem.col] = callBackItem.item
        crdtsDB._update(projectUuid,callBackItem.table, row)
      }
      if (callBackItem.subtype == "$pull") {
        let row = {}
        row.uuid = callBackItem.row
        row[callBackItem.col] = callBackItem.item
        crdtsDB._delete(projectUuid,callBackItem.selectorProperty, callBackItem.item )
      }

      return new Promise(function(resolve, reject) {
          projects.update({ uuid: projectUuid }, actionItem, {}, function (err, numAffected, affectedDocuments, upsert) {

            if (!preventSync) {
              logCallback(callBackItem)
            }else {
              logCallbackWithoutSync(callBackItem)
            }
            resolve(affectedDocuments)
          });
        }).catch(function(err) {
          // reject(err)
          console.log(err);
          alert("error in saving to DB")
        });
    }

  }

  function addProjectItem(projectUuid, collectionName, item) {

    let selectorProperty = collectionName
    let callBackItem = {type:"update",subtype:"$push", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:item}
    return updateDB(callBackItem)

  }
  function addProjectLink(projectUuid, collectionName, link) {
    link.type = collectionName
    let selectorProperty = "links"
    let callBackItem = {type:"update",subtype:"$push", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:link}

    return updateDB(callBackItem)

  }
  function removeProjectItem(projectUuid, collectionName, item) {

    let selectorProperty = collectionName
    let callBackItem = {type:"update",subtype:"$pull", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:{uuid:item}}

    return updateDB(callBackItem)

  }
  function removeProjectLink(projectUuid, collectionName, link) {
    //TODO, Optimize
    let item = undefined
    if (typeof link === "string") {
      item = {uuid:link}
    }else if (link.source && !link.target) {
      item = {source:link.source }
    }else if (link.target && !link.source) {
      item = {target:link.target}
    }else if (link.target && link.source) {
      item = {source:link.source, target:link.target}
    }

    let selectorProperty = "links"
    let callBackItem = {type:"update",subtype:"$pull", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:item}

    return updateDB(callBackItem)

  }
  function updateProjectItem(projectUuid, collectionName, itemId, prop, value) {

    return new Promise(async function(resolve, reject) {

      await projects.find({uuid: projectUuid}, async function (err, docs) {
        let indexToChange = docs[0][collectionName].findIndex(i=>i.uuid == itemId)

        let selectorProperty = collectionName+"."+indexToChange+"."+prop
        let callBackItem = {type:"update",subtype:"$set", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:value, table:collectionName, row:itemId, col:prop}

        await updateDB(callBackItem)
        resolve()
        });
      });

  }
  function replaceProjectItem(projectUuid, collectionName, itemId, value) {
    return new Promise(async function(resolve, reject) {
      await projects.find({uuid: projectUuid}, async function (err, docs) {
        let indexToChange = docs[0][collectionName].findIndex(i=>i.uuid == itemId)
        let selectorProperty = collectionName+indexToChange
        let callBackItem = {type:"update",subtype:"$set", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:value, table:collectionName, row:itemId, col:prop}
        await updateDB(callBackItem)
        resolve()
        });
      });
  }
  function updateItemOrder(projectUuid, collectionName, value) {

    return new Promise(async function(resolve, reject) {
      await projects.find({uuid: projectUuid}, async function (err, docs) {
        let collectionOrderIndex = docs[0].itemsOrder.findIndex(o=>o.collectionName==collectionName)
        if (collectionOrderIndex<0) { //if order is not yet defined
          let selectorProperty = "itemsOrder"
          let callBackItem = {type:"update",subtype:"$push", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:{uuid:genuuid(),collectionName:collectionName, order:value }}

          await updateDB(callBackItem)
          resolve()
        }else {
          let indexToChange = collectionOrderIndex
          let selectorProperty = "itemsOrder."+indexToChange+".order"
          let callBackItem = {type:"update",subtype:"$set", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:value}

          await updateDB(callBackItem)
          resolve()
        }
      });
    });
  }
  function addProjectCollection(projectUuid, collectionName, value) {

    let selectorProperty = collectionName
    let callBackItem = {type:"update",subtype:"$set", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:value}

    return updateDB(callBackItem)

    // return new Promise(async function(resolve, reject) {
    //   let selector = {}
    //   selector[collectionName] = value
    //   await projects.update({ uuid: projectUuid }, {  $set: selector }, {}, function (err, numAffected, affectedDocuments, upsert) {
    //       logCallback(upsert)
    //       localProjects.update({ uuid: projectUuid }, {  $set: selector }, {}, function (err, numAffected, affectedDocuments, upsert) {
    //           console.log("persisted");
    //         });
    //       resolve(affectedDocuments)
    //     });
    // });
  }
  //SPECIAL CASES

  function getProject(uuid, selector) {
    if (selector) {
      return new Promise(function(resolve, reject) {
          projects.find({uuid: uuid}, selector, function (err, docs) {
            console.log(docs);
            resolve(docs[0])
          })
        }).catch(function(err) {
          reject(err)
        });
    }else {
      return new Promise(function(resolve, reject) {
          projects.find({uuid: uuid}, function (err, docs) {
            console.log(docs);
            resolve(docs[0])
          })
        }).catch(function(err) {
          reject(err)
        });
    }
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

  async function addProjectToUser(userUuid, projectUuid) {

    let currentUserObject= await localDB.get('users', userUuid);
    if (!currentUserObject.relatedProjects) {
      currentUserObject.relatedProjects = []
    }
    currentUserObject.relatedProjects.push(projectUuid)
    await localDB.put('users', currentUserObject);
    console.log(await localDB.get('users', userUuid));
    return currentUserObject
    // store.createIndex('strengthIndex', 'strength');

    // let selector = {}
    // selector["relatedProjects"] = projectUuid
    // return new Promise(function(resolve, reject) {
    //     localUsers.update({ uuid: userUuid }, { $push: selector }, {returnUpdatedDocs:true}, function (err, numAffected, affectedDocuments, upsert) {
    //       console.log(affectedDocuments);
    //       resolve(affectedDocuments[0])
    //     });
    //   }).catch(function(err) {
    //     reject(err)
    //   });
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

  //custom action to refactor
  function setProjectData(uuid, prop, newValue) {

    return new Promise(async function(resolve, reject) {
      let projects = await getProjects(["infos"]) 
        let project = projects.find(p=>p.uuid == uuid)
        console.log(projects)
        console.log(uuid)
        let itemId = project["infos"][0].uuid
        let indexToChange = 0

        let selectorProperty = "infos"+"."+indexToChange+"."+prop
        let callBackItem = {type:"update",subtype:"$set", projectUuid:uuid,  selectorProperty:selectorProperty, item:newValue, table:"infos", row:itemId, col:prop}

        await updateDB(callBackItem)
        resolve()

      });

  }


  function removeProject(uuid) {
    return new Promise(function(resolve, reject) {
        projects.remove({uuid:uuid}, function (err, docs) {
          localProjects.remove({uuid:uuid}, function (err, docs) {
          })
          console.log(docs);
          resolve(docs)
        })
      }).catch(function(err) {
        console.log(err);
        reject(err)
      });
  }

  function addProject(newProject) {
    if (app.state.currentUser) {
      addProjectToUser(app.state.currentUser, newProject.uuid)
      app.store.relatedProjects.push(newProject.uuid)
    }

    crdtsDB.recordInitialMessagesFromTemplate(newProject.uuid,newProject)
  }

  function addAllKeysToProject(project) { //when not all tables have been created beacause there are not message related, this function will generate theme
    let keys = Object.keys(store)
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (!project[key]) {
        project[key] = []
      }
    }
    return project
  }

  async function loadProjectInMemory(uuid) {
    console.log(uuid);
    let current = await getProject(uuid)
    console.log(current);
    let projectFromStorage = await crdtsDB.buildProjectFromMessages(uuid)
    projectFromStorage= addAllKeysToProject(projectFromStorage)
    console.log(projectFromStorage);
    projectFromStorage.uuid = uuid
    if (!current) { //if project was never loaded
      await projects.insert(projectFromStorage,function (err, numReplaced) {
        document.dispatchEvent(new Event('storeUpdated'))
        console.log('project '+uuid+' Loaded');
      });
    }else {
      await projects.update({ uuid: uuid }, projectFromStorage, {}, function (err, numReplaced) {
        document.dispatchEvent(new Event('storeUpdated'))
        console.log('project '+uuid+' Loaded');
      });
    }
  }

  function getDbReferences() {
    return {users:users,projects:projects,localProjects:localProjects, localDB:localDB}
  }

  self.getUser = getUser
  self.getUsers = getUsers
  self.setUser = setUser
  self.setUserInfo = setUserInfo
  self.removeUser = removeUser
  self.addUserProject = addUserProject
  self.getProjects = getProjects
  self.getProject = getProject
  self.getProjectCollection = getProjectCollection
  self.addProject = addProject
  self.addProjectItem = addProjectItem
  self.addProjectLink = addProjectLink
  self.loadProjectInMemory = loadProjectInMemory
  self.removeProjectItem = removeProjectItem
  self.removeProjectLink = removeProjectLink
  self.updateProjectItem = updateProjectItem
  self.replaceProjectItem = replaceProjectItem
  self.updateItemOrder = updateItemOrder
  self.addProjectCollection = addProjectCollection
  self.setProject = setProject
  self.setProjectData = setProjectData
  self.removeProject = removeProject
  self.getDbReferences = getDbReferences
  self.updateDB = updateDB
  self.init = init

  return self
}

var dbConnector = createDbRealTimeAdaptater()
dbConnector.init()
