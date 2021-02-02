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



    localProjects = new Nedb({ filename: 'ephemeris_local_projects_testground', autoload: true });   // Create an indedDB  datastore


    projects = new Nedb();   // Create an in-memory only datastore
    localUsers = new Nedb({ filename: 'ephemeris_local_users_testground', autoload: true });   // Create an in-memory only datastore

    localProjects.find({}, function (err, docs) {
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
      }else {
        // startupScreen.showLoader()
        localProjects.find({}, function (err, docs) {
          projects.insert(docs, function (err, newDocs) {
            console.log(docs);
            setTimeout(function () {
              startupScreen.update()
            }, 0);
          });
        });
        // // index the DB
        // db.ensureIndex({ fieldName: 'somefield', unique: true }, function (err) {
        //   console.log(err);
        // });
      }
    });

    localDB = await idb.openDB('localDB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('projects');
        db.createObjectStore('users', {keyPath:"uuid"});
        db.createObjectStore('messages');
        //store.createIndex('date', 'date');

      }
    });

    // await localDB.add('users', {
    //   uuid: 'Article 1',
    //   date: new Date('2019-01-01'),
    //   body: '…',
    // });
    // await localDB.add('users', {
    //   uuid: 'Article 1',
    //   date: new Date('2019-01-01'),
    //   body: '…',
    // }, 'test');
  }



  async function getUser(id) {
    let user = await localDB.get('users', id);
    return user
  }
  function setUserInfo(id, prop, value) { //TODO move to indexedDB
    let selector = {}
    selector["userData.info."+prop] = value
    return new Promise(function(resolve, reject) {
        localUsers.update({ uuid: id }, { $set: selector }, {returnUpdatedDocs:true}, function (err, numAffected, affectedDocuments, upsert) {
          console.log('user data changed');
          console.log(affectedDocuments[0]);
          resolve(affectedDocuments[0])
        });
      }).catch(function(err) {
        reject(err)
      });
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

  function getUserProjectList(limit) {
    if (limit) {
      return new Promise(function(resolve, reject) {
          projects.find({}, limit, function (err, docs) {
            console.log(docs);
            resolve(docs)
          })
        }).catch(function(err) {
          reject(err)
        });
    }else {
      return new Promise(function(resolve, reject) {
          projects.find({}, function (err, docs) {
            console.log(docs);
            resolve(docs)
          })
        }).catch(function(err) {
          reject(err)
        });
    }

  }

  function getProjects() {

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
    let projectUuid = item.projectUuid
    console.log(projectUuid);
    let selector = {}
    // selector["onlineHistory"] = JSON.stringify(item)

    if (!item.user) {//check if a user already exist (there should be one if the action come form an online sync)
      let userMail = app.store.userData.info.mail
      let timestamp = Date.now()
      item.user = {mail:userMail}
      item.localTimestamp=timestamp
      item.uuid=genuuid()
    }



    selector["onlineHistory"] = item
    let actionItem = { $push: selector }

    console.log(actionItem);
    console.log(selector);

    return new Promise(function(resolve, reject) {
        projects.update({ uuid: projectUuid }, actionItem, {}, function (err, numAffected, affectedDocuments, upsert) {
          localProjects.update({ uuid: projectUuid }, actionItem, {}, function (err, numAffected, affectedDocuments, upsert) {
            console.log("persisted online item");
          });
          resolve(affectedDocuments)
        });
      }).catch(function(err) {
        reject(err)
      });
  }
  //=====END Connect to online Bridge=====


  function addProject(newProject) {
    if (app.state.currentUser) {
      addProjectToUser(app.state.currentUser, newProject.uuid)
      app.store.relatedProjects.push(newProject.uuid)
    }

    return new Promise(function(resolve, reject) {

        projects.insert(newProject, function (err, docs) {
          console.log(docs);
          localProjects.insert(newProject, function (err, docs) {})
          resolve(docs)
        })
      }).catch(function(err) {
        console.log(err);
        reject(err)
      });
  }

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

            localProjects.update({ uuid: projectUuid }, actionItem, {}, function (err, numAffected, affectedDocuments, upsert) {
              console.log("persisted");
            });
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

  function addProjectToUser(userUuid, projectUuid) {
    let selector = {}
    selector["relatedProjects"] = projectUuid
    return new Promise(function(resolve, reject) {
        localUsers.update({ uuid: userUuid }, { $push: selector }, {returnUpdatedDocs:true}, function (err, numAffected, affectedDocuments, upsert) {
          console.log(affectedDocuments);
          resolve(affectedDocuments[0])
        });
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

  //custom action to refactor
  function setProjectData(uuid, prop, newValue) {
    return new Promise(async function(resolve, reject) {
      await projects.find({uuid: uuid}, async function (err, docs) {
        let selector = {}
        selector[prop] = newValue
        await projects.update({ uuid: uuid }, {  $set: selector }, {}, function (err, numAffected, affectedDocuments, upsert) {
            localProjects.update({ uuid: uuid }, {  $set: selector }, {}, function (err, numAffected, affectedDocuments, upsert) {
                console.log("persisted");
              });
            resolve(affectedDocuments)
          });
        });
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

  function getDbReferences() {
    return {users:users,projects:projects,localProjects:localProjects}
  }

  self.getUser = getUser
  self.getUsers = getUsers
  self.setUser = setUser
  self.setUserInfo = setUserInfo
  self.removeUser = removeUser
  self.addUserProject = addUserProject
  self.getUserProjectList = getUserProjectList
  self.getProjects = getProjects
  self.getProject = getProject
  self.getProjectCollection = getProjectCollection
  self.addProject = addProject
  self.addProjectItem = addProjectItem
  self.addProjectLink = addProjectLink
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
