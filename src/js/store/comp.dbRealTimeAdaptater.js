var createDbRealTimeAdaptater = function () {
  var self ={};
  var objectIsActive = false;

  var users
  var projects
  var localProjects


  var init = function () {
    connectDB()
  }
  var connectDB =function () {
    // projects = localforage.createInstance({name: "ephemerisProjects"});
    // users = localforage.createInstance({name: "ephemerisUsers"});
    // projects = new Nedb({ filename: 'ephemeris_local_projects', autoload: true });   // Create an in-memory only datastore
    localProjects = new Nedb({ filename: 'ephemeris_local_projects_testground', autoload: true });   // Create an indedDB  datastore
    //erase deb for // DEBUG:
    // localProjects.remove({ }, { multi: true }, function (err, numRemoved) {
    //   localProjects.loadDatabase(function (err) {
    //     // done
    //   });
    // });

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
  }

  function transfertDBfromOldVersion(users) {
    startupScreen.showLoader()
    for (var i = 0; i < users.length; i++) {
      persist.getUser(users[i].uuid).then(function (user) {
        user.relatedProjects = []
        console.log(user.projects);
        user.projects.forEach((project, i) => {
          user.relatedProjects.push(project.uuid)

          projects.insert(project, (err,docs)=>console.log(docs))
          localProjects.insert(project, (err,docs)=>console.log(docs))
        });
        localUsers.insert(user, (err,docs)=>console.log(docs))
      }).catch(function(err) {
          console.log(err);
      });
    }
    setTimeout(function () {
      startupScreen.update()
    }, 4000);
  }

  function getUser(id) {
    return new Promise(function(resolve, reject) {
        localUsers.find({uuid:id}, function (err, docs) {
          console.log(docs);
          resolve(docs[0])
        })
      }).catch(function(err) {
        reject(err)
      });
  }
  function setUserInfo(id, prop, value) {
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

  function getUsers() {
    return new Promise(function(resolve, reject) {
        localUsers.find({}, function (err, docs) {
          console.log(docs);
          resolve(docs)
        })
      }).catch(function(err) {
        reject(err)
      });
  }

  function setUser(data) { //name
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
    return new Promise(function(resolve, reject) {
        localUsers.insert(userObject, function (err, docs) {
          console.log(docs);
          resolve(docs)
        })
      }).catch(function(err) {
        console.log(err);
        reject(err)
      });
  }

  function removeUser(uuid) {
    return new Promise(function(resolve, reject) {
        localUsers.remove({uuid:uuid}, function (err, docs) {
          console.log(docs);
          resolve(docs)
        })
      }).catch(function(err) {
        console.log(err);
        reject(err)
      });
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

    await addOnlineHistoryItem(onlineHistoryItem)
    //data has been persisted, now try to synchronise it

    onlineBridge.sendCopy(app, actionItem)

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
    // selector["onlineHistory.items"] = JSON.stringify(item)

    if (!item.user) {//check if a user already exist (there should be one if the action come form an online sync)
      let userMail = app.store.userData.info.mail
      let timestamp = Date.now()
      item.user = {mail:userMail}
      item.localTimestamp=timestamp
      item.uuid=genuuid()
    }



    selector["onlineHistory.items"] = item
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

    let selectorProperty = collectionName+".items"
    let callBackItem = {type:"update",subtype:"$push", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:item}

    return updateDB(callBackItem)

  }
  function addProjectLink(projectUuid, collectionName, link) {

    let selectorProperty = collectionName+".links"
    let callBackItem = {type:"update",subtype:"$push", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:link}

    return updateDB(callBackItem)

  }
  function removeProjectItem(projectUuid, collectionName, item) {

    let selectorProperty = collectionName+".items"
    let callBackItem = {type:"update",subtype:"$pull", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:{uuid:item}}

    return updateDB(callBackItem)

  }
  function removeProjectLink(projectUuid, collectionName, link) {

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

    let selectorProperty = collectionName+".links"
    let callBackItem = {type:"update",subtype:"$pull", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:item}

    return updateDB(callBackItem)

  }
  function updateProjectItem(projectUuid, collectionName, itemId, prop, value) {

    return new Promise(async function(resolve, reject) {

      await projects.find({uuid: projectUuid}, async function (err, docs) {
        let indexToChange = docs[0][collectionName].items.findIndex(i=>i.uuid == itemId)

        let selectorProperty = collectionName+".items."+indexToChange+"."+prop
        let callBackItem = {type:"update",subtype:"$set", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:value}

        await updateDB(callBackItem)
        resolve()
        });
      });

  }
  function replaceProjectItem(projectUuid, collectionName, itemId, value) {
    return new Promise(async function(resolve, reject) {
      await projects.find({uuid: projectUuid}, async function (err, docs) {
        let indexToChange = docs[0][collectionName].items.findIndex(i=>i.uuid == itemId)
        let selectorProperty = collectionName+".items."+indexToChange
        let callBackItem = {type:"update",subtype:"$set", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:value}
        await updateDB(callBackItem)
        resolve()
        });
      });
  }
  function updateItemOrder(projectUuid, collectionName, value) {

    return new Promise(async function(resolve, reject) {
      await projects.find({uuid: projectUuid}, async function (err, docs) {
        let collectionOrderIndex = docs[0].itemsOrder.items.findIndex(o=>o.collectionName==collectionName)
        if (collectionOrderIndex<0) { //if order is not yet defined
          let selectorProperty = "itemsOrder.items"
          let callBackItem = {type:"update",subtype:"$push", projectUuid:projectUuid,  selectorProperty:selectorProperty, item:{uuid:genuuid(),collectionName:collectionName, order:value }}

          await updateDB(callBackItem)
          resolve()
        }else {
          let indexToChange = collectionOrderIndex
          let selectorProperty = "itemsOrder.items."+indexToChange+".order"
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
