var createCrdtsDB = function () {
var self ={};
var objectIsActive = true;

var persist = {}
var memoryDataset = {}

var localDB = undefined



var init = function () {
  setClock(makeClock(new Timestamp(0, 0, makeClientId())));
  localDB = connectToPersistence()
  //generateMessagesFromProject(JSON.stringify(store))
}

var connectToPersistence = function () {
  return persist
}

var getSendTimestamp = function () {
  return Timestamp.send(getClock()).toString()
}

var debug = function (target) {
  var debugTaret = {}
  if (!target) {
    debugTaret = store
  }else {
    debugTaret = JSON.parse(JSON.stringify(target))
    debugTaret.uuid=[];
    debugTaret.name=[];
    debugTaret.reference=[];
    debugTaret.description=[];
  }
  console.log(persist)

  if (!target && app.state.currentProject) {
    memoryDataset = {}
    persist[app.state.currentProject].forEach((item, i) => {
      applyToInMemoryData(item, memoryDataset)
    });
    console.log(memoryDataset);
  }

  console.time("transcribe");
  let transcribed = generateMessagesFromProject(debugTaret)
  console.timeEnd("transcribe");
  console.log(transcribed);
  let retranscribed = {}
  let retranscribed2 = {}
  console.time("rtrans");
  transcribed.forEach((item, i) => {
    applyToInMemoryData(item, retranscribed)
  });
  console.timeEnd("rtrans");

  console.time("rtrans2");
  for (var i = 0; i < transcribed.length; i++) {

    applyToInMemoryData(transcribed[i], retranscribed2)
  }
  console.timeEnd("rtrans2");

  console.log(retranscribed);
  console.log(retranscribed2);
}

var appendToDB = function(project, messages){
  if (!localDB[project]) {//create a project in db if not exist
    localDB[project] = []
  }
  //persistence layer
  for (var i = 0; i < messages.length; i++) {// add all messages to the persistence layer
    messages[i].project = project //add project id to message
    messages[i].uuid = genuuid()
    localDB[project].push(messages[i]);//TODO for test remove
    dbConnector.getDbReferences().localDB.add("messages", messages[i])
  }
}

var generateMessagesFromProject = function (projectTree) {
  console.log(projectTree);
  projectTree = JSON.parse(JSON.stringify(projectTree))//TODO see if needed
  projectTree.uuid=[];
  projectTree.name=[];
  projectTree.reference=[];
  projectTree.description=[];
  let fields = Object.keys(projectTree)

  let messages = []
  fields.forEach((field, i) => {
    projectTree[field].forEach((item, i) => {
      let currentItemUuid = item.uuid;
      let itemProps = Object.keys(item)
      itemProps.forEach((prop, i) => {
        let newMessage= {
          dataset: field,
          row: currentItemUuid,
          column: prop,
          value: item[prop],
          // timestamp: Timestamp.send(getClock()).toString()
          timestamp: getSendTimestamp()
        };
        messages.push(newMessage)
      });
    });
  });
  return messages
}

var applyToInMemoryData = function(msg, data) {
  memoryDataset = data
  if (!memoryDataset[msg.dataset]) {
    memoryDataset[msg.dataset] = []
  }
  let table = memoryDataset[msg.dataset];
  if (!table) {
    throw new Error('Unknown dataset: ' + msg.dataset);
  }

  let row = table.find(row => row.uuid === msg.row);
  if (!row) {
    table.push({ uuid: msg.row, [msg.column]: msg.value });
  } else {
    row[msg.column] = msg.value;
  }

  return data
}

var _insert = function(project, table, row){
  let id = genuuid();
  let fields = Object.keys(row);
  // let fields = Object.keys(row).filter(k => k !== 'uuid');//TODO is this filter necessayr?
  //transpose row of type {uuid:XXXX, fieldA:xxx, fieldB:xxx}
  appendToDB(
    project,
    fields.map(k => {
      return {
        dataset: table,
        row: row.uuid || id,
        column: k,
        value: row[k],
        // timestamp: Timestamp.send(getClock()).toString()
        timestamp: getSendTimestamp()
      };
    })
  );
  debug()
  return row.uuid || id;
}

var _update = function(project, table, row){
  let fields = Object.keys(row).filter(k => k !== 'uuid');
  //transpose row of type {uuid:XXXX, fieldA:xxx, fieldB:xxx}
  appendToDB(
    project,
    fields.map(k => {
      return {
        dataset: table,
        row: row.uuid,
        column: k,
        value: row[k],
        // timestamp: Timestamp.send(getClock()).toString()
        timestamp: getSendTimestamp()
      };
    })
  );
  debug()
}

var _delete = function(project, table, row){
  appendToDB(
    project,
      [{
        dataset: table,
        row: row.uuid,
        column:'tombstone',
        value: 1,
        // timestamp: Timestamp.send(getClock()).toString()
        timestamp: getSendTimestamp()
      }]
  );
  debug()
}

var _import = function (template) {
  recordInitialMessagesFromTemplate(template.uuid, template)
}

var recordInitialMessagesFromTemplate = function (projectId, template) {
  let transcribed = generateMessagesFromProject(template)
  appendToDB(projectId,transcribed);
}
var buildProjectFromMessages = async function (projectId) {
  let relevantMessages = await dbConnector.getDbReferences().localDB.getAllFromIndex('messages', 'projectIndex', projectId);
  let messages = {}
  relevantMessages.forEach((item, i) => {
    applyToInMemoryData(item, messages)
  });
  console.log(messages);
  return messages
}

var getTablesFromMessages = async function(tables) {
  let db = await dbConnector.getDbReferences().localDB
  let bruteforce = false
  if (bruteforce) {//optimize but with bigger memroy footprint
    // const tx = db.transaction("messages");
    // const range = IDBKeyRange.only(tables[0]);
    // let cursor = await tx.store.index('datasetIndex').openCursor(range);
    //
    // let relevant={}
    // while (cursor) {
    //   let relevantProject = cursor.value.project
    //   if (!relevant[relevantProject]) {
    //     relevant[relevantProject] = {}
    //   }
    //   if (tables) {
    //     if (tables.includes(cursor.value.dataset)) {
    //       applyToInMemoryData(cursor.value, relevant[relevantProject])
    //     }
    //   }else {
    //     applyToInMemoryData(cursor.value, relevant[relevantProject])
    //   }
    //   //console.log(cursor.key, cursor.value);
    //   cursor = await cursor.continue();
    // }
    //
    // return relevant

    let relevantMessages = await dbConnector.getDbReferences().localDB.getAll('messages');
    let relevant={}
    for (var i = 0; i < relevantMessages.length; i++) {
      let item = relevantMessages[i]

      let relevantProject = item.project
      if (!relevant[relevantProject]) {
        relevant[relevantProject] = {}
      }
      if (tables) {
        if (tables.includes(item.dataset)) {
          applyToInMemoryData(item, relevant[relevantProject])
        }
      }else {
        applyToInMemoryData(item, relevant[relevantProject])
      }
    }
    return relevant
  }else {
    // let relevant={}
    // const unwrapped = idb.unwrap(db);
    // const transaction = db.transaction(["messages"], 'readonly');
    // console.log(transaction);
    // var objectStore = transaction.objectStore("messages");
    // objectStore.openCursor().onsuccess = function(event) {
    //   var cursor = event.target.result;
    //   console.log(cursor.value);
    //   if(cursor) {
    //     let relevantProject = cursor.value.project
    //     if (!relevant[relevantProject]) {
    //       relevant[relevantProject] = {}
    //     }
    //     if (tables) {
    //       if (tables.includes(cursor.value.dataset)) {
    //         applyToInMemoryData(cursor.value, relevant[relevantProject])
    //       }
    //     }else {
    //       applyToInMemoryData(cursor.value, relevant[relevantProject])
    //     }
    //     cursor.continue();
    //   } else {
    //     console.log('Entries all displayed.');
    //   }
    // }

    // db.transaction("messages").store.openCursor().then(function handleCursor(cursor) {
    //   // console.log(cursor.key, cursor.value);
    //   return cursor.continue().then(handleCursor);
    // }).then(() => {
    //   console.log('done!');
    // });

    const tx = db.transaction("messages", 'readonly');
    let cursor = await tx.store.openCursor();
    console.log(cursor);
    let relevant={}
    while (cursor) {
      let relevantProject = cursor.value.project
      if (!relevant[relevantProject]) {
        relevant[relevantProject] = {}
      }
      if (tables) {
        if (tables.includes(cursor.value.dataset)) {
          applyToInMemoryData(cursor.value, relevant[relevantProject])
        }
      }else {
        applyToInMemoryData(cursor.value, relevant[relevantProject])
      }
      cursor = await cursor.continue();
    }
    return relevant
  }

}

self.init = init
self.recordInitialMessagesFromTemplate = recordInitialMessagesFromTemplate
self.buildProjectFromMessages = buildProjectFromMessages
self.getTablesFromMessages = getTablesFromMessages
self._insert = _insert
self._update = _update
self._delete = _delete
self._import= _import

return self
}

var crdtsDB = createCrdtsDB()
crdtsDB.init()
