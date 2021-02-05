var createCrdtsDB = function () {
var self ={};
var objectIsActive = true;

var persist = {}
var memoryDataset = {}

var localDB = undefined



var init = function () {
  localDB = connectToPersistence()
  //generateMessagesFromProject(JSON.stringify(store))
}

var connectToPersistence = function () {
  return persist
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
    localDB[project].push(messages[i]);
  }
}

var generateMessagesFromProject = function (projectTree) {
  console.log(projectTree);
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
          timestamp: Date.now()
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
        timestamp: Date.now()
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
        timestamp: Date.now()
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
        timestamp: Date.now()
      }]
  );
  debug()
}

self.init = init
self._insert = _insert
self._update = _update
self._delete = _delete
self._import= debug//POC

return self
}

var crdtsDB = createCrdtsDB()
crdtsDB.init()
