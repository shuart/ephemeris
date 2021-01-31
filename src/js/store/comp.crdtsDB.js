var createCrdtsDB = function () {
var self ={};
var objectIsActive = true;

var persist = {}

var localDB = undefined



var init = function () {
  localDB = connectToPersistence()
}

var connectToPersistence = function () {
  return persist
}

var debug = function () {
  console.log(persist)
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

var _insert = function(project, table, row){
  let id = genuuid();
  let fields = Object.keys(row).filter(k => k !== 'uuid');//TODO is this filter necessayr?
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
  let fields = Object.keys(row).filter(k => k !== 'uuid');;
  //transpose row of type {uuid:XXXX, fieldA:xxx, fieldB:xxx}
  appendToDB(
    project,
    fields.map(k => {
      return {
        dataset: table,
        row: row.uuid,
        column:'tombstone',
        value: 1,
        // timestamp: Timestamp.send(getClock()).toString()
        timestamp: Date.now()
      };
    })
  );
  debug()
}

self.init = init
self._insert = _insert
self._update = _update
self._delete = _delete

return self
}

var crdtsDB = createCrdtsDB()
crdtsDB.init()
