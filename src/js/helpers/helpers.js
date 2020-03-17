//HELPERS

function queryDOM(element) {
  return document.querySelector(element)
}

function getItemsFromPropValue(array, prop, value) {
  return array.filter((item)=>item[prop] == value)
}
function removeItemsWithPropValue(array, prop, value) {
  return array.filter((item)=>item[prop] != value)
}

//deep copy an objects
function deepCopy(src) {
  return JSON.parse(JSON.stringify(src));
}

//create an high level element listener
function connect(selector, action, callback) {
  document.addEventListener(action, function (event) {
    // If the clicked element doesn't have the right selector, bail
    if (!event.target.matches(selector+","+selector+" *")) return;

    // Don't follow the link
    event.preventDefault();

    //load callblack
    callback(event);

    // Log the clicked element in the console
    console.log(event.target);

  }, false);
}
//create a low level element listener
function bind(selector, action, callback, boundary) {
  let root = document
  if (boundary) {
    if (typeof boundary === 'string' || boundary instanceof String){
      root = document.querySelector(boudary)
    }else {
      root = boundary
    }
  }
  root.addEventListener(action, function (event) {
    // If the clicked element doesn't have the right selector, bail
    if (!event.target.matches(selector+","+selector+" *")) return;

    // Don't follow the link
    event.preventDefault();

    //load callblack
    callback(event);

    // Log the clicked element in the console
    console.log(event.target);

  }, false);
}

//time
const lessThanInSomeDays = (date,days) => {
  let checkedDate = undefined
    if (typeof date === "string") {
      checkedDate = Date.parse(date)
    }else {
      checkedDate = date
    }
    const HOUR = 1000 * 60 * 60;
    const XDaysFuture = Date.now() + HOUR*24* ( days|| 1);
    console.log(XDaysFuture, checkedDate);
    console.log(XDaysFuture < checkedDate);
    return XDaysFuture > checkedDate;
}
const howLongAgo = (date) => {
  if (!date || date =="") {
    return -1
  }
    const HOUR = 1000 * 60 * 60;
    const Days = HOUR*24;
    return (Date.now() - date)/Days;
}

//search for match in text
function fuzzysearch (needle, haystack) {
  if (haystack == "") {return false}
  if (haystack && needle && needle != "" &&!Array.isArray(haystack)) {
    var hlen = haystack.length;
    var nlen = needle.length;
    if (nlen > hlen) {
      return false;
    }
    if (nlen === hlen) {
      return needle === haystack;
    }
    outer: for (var i = 0, j = 0; i < nlen; i++) {
      var nch = needle.charCodeAt(i);
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      console.log("nothing found");
      return false;
    }
    console.log("search found something");
    return true;
  }
  console.log("search was not performed");
  return true;

}

//select everyting in a container
function selectText(containerid) {
  window.getSelection().selectAllChildren( document.getElementById( containerid) );
}

//generate an UUID

function uuid() {
return 'itxxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});
}
function genuuid() {
return 'itxxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});
}

//remove item from array

function removeFromArray(array, item) {
  return array.filter( i => i != item);
}

//change element position in an Array

function moveElementInArray (array, value, target) {
  var arrayClone = array.slice();//clone array

  //get current item index
  var oldIndex = array.indexOf(value);


  if (oldIndex > -1){
    //remove value from array
    arrayClone.splice(oldIndex,1);
    var newIndex = (arrayClone.indexOf(target) +1);

    if (newIndex < 0){
      newIndex = 0
    }else if (newIndex >= arrayClone.length){
      newIndex = arrayClone.length
    }

    arrayClone.splice(newIndex,0,value);

    // console.log(oldIndex, newIndex);

    //array_move(arrayClone, oldIndex, newIndex)

    // arrayClone.splice(newIndex,0,value);

    return arrayClone
  }else {
    console.log("element not found");
    return array
  }

  function array_move(arr, old_index, new_index) {
      while (old_index < 0) {
          old_index += arr.length;
      }
      while (new_index < 0) {
          new_index += arr.length;
      }
      if (new_index >= arr.length) {
          var k = new_index - arr.length + 1;
          while (k--) {
              arr.push(undefined);
          }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing purposes
  };


}
function moveElementInArrayLegacy (array, value, target) {
  var oldIndex = array.indexOf(value);
  if (oldIndex > -1){
    var newIndex = (array.indexOf(target) + 1);

    if (newIndex < 0){
      newIndex = 0
    }else if (newIndex >= array.length){
      newIndex = array.length
    }

    console.log(oldIndex, newIndex);

    var arrayClone = array.slice();
    arrayClone.splice(oldIndex,1);
    arrayClone.splice(newIndex,0,value);

    return arrayClone
  }else {
    console.log("element not found");
  }
  return array
}

/* Extract hashtags text from string as an array */
function getHashTags(inputText) {
    var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    var matches = [];
    var match;

    while ((match = regex.exec(inputText))) {
        matches.push(match[1]);
    }

    return matches;
}

//Create a three usable by D3

function renderDTree(db) {

  var tree = {
    name:"csc",
    children:[]
  }

  function concatenate(target, parentPropName,newParent, newGparent, originList) {
    for (var i = 0; i < originList.length; i++) {
      var item = originList[i]
      var found = false
      for (cat of target) {
        if (cat.name == item[parentPropName].name) {
          found=true
          //cat.children.push(item)
          cat.children.push({name:item.name, children:item.children || []})
        }
      }
      if (!found) {
        target.push({
          name:item[parentPropName].name,
          fparent:item[newParent] || undefined,
          gparent:item[newGparent]|| undefined,
          //children:[item]
          children:[{name:item.name,children:item.children || []}]
        })
      }
    }
  }
  var topCatList = []
  var middleCatList = []
  var subCatList = []
  concatenate(subCatList, "subCat","middleCat", "topCat", db.items)
  concatenate(middleCatList, "fparent","gparent", undefined, subCatList)
  concatenate(topCatList, "fparent",undefined, undefined, middleCatList)
  tree.children = topCatList
  console.log(tree);

  console.log(subCatList);
  return tree
}

//compare position with project order list
var getOrderedProjectList= function (list, displayOrder) {

  function comparePositions(a, b) {
    let indexA = displayOrder.indexOf(a.uuid)
    let indexB = displayOrder.indexOf(b.uuid)
    if (indexA > -1 && indexB > -1) {//if a and b ordered
      return indexA - indexB
    }
    if (indexA<0 && indexB<0) {//if a and b is not ordered
      return 0
    }
    if (indexA<0) {//if a is not ordered
      return -1
    }
    if (indexB<0) {//if b is not ordered
      return 1
    }

    return a - b;
  }

  return list.slice().sort(comparePositions)
}

//get related item
function getRelatedItems(store, sourceItem, groupToSearch, paramOptions) {//todo limit metalinks type
  var paramOptions = paramOptions || {}
  let options ={
    objectIs :paramOptions.objectIs || "source",
    metalinksType :paramOptions.metalinksType || undefined
  }
  let linkTotextItemType = options.objectIs == "source"? "target" : "source"

  // var store = query.currentProject()
  let metaLinksToSearch = store.metaLinks.items
  if (options.metalinksType) {
    metaLinksToSearch =store.metaLinks.items.filter(e=>e.type == options.metalinksType)
  }

  let linkedTo = metaLinksToSearch.filter(e=>e[options.objectIs] == sourceItem.uuid)
  console.log(linkedTo);
  let linkToText = linkedTo.map(e=>store[groupToSearch].items.find(function (i) {
    return i.uuid == e[linkTotextItemType]
  }))
  console.log(linkToText);
  return linkToText
}
//get related item
function getCategoryFromItemUuid(sourceItemId, store, catStore) {//todo limit metalinks type
  // var store = query.currentProject()
  let category = undefined
  // let categoryLink = store.metaLinks.items.find(m=>(m.type=="category" && m.source == sourceItemId))
  let categoryLink = catStore[sourceItemId]
  // console.log(sourceItemId);
  // console.log(categoryLink);
  if (categoryLink) {
    category = store.categories.items.find(c=>c.uuid == categoryLink)
  }
  return category
}

//clear links with missing items
var clearUncompleteLinks = async function () {
  var collection = await query.collection("metaLinks")
  var store = collection.items
  console.log(collection);
  console.log(store);
  console.log('Warning link should be cleaned');
  // for (link of store) {
  //   //check if item is complete
  //   if (!query.items("all", i=> i.uuid == link.source)[0]) {
  //     push(act.remove("metaLinks",{uuid:link.uuid}))
  //   }else if (!query.items("all", i=> i.uuid == link.target)[0]) {
  //     push(act.remove("metaLinks",{uuid:link.uuid}))
  //   }
  // }
}

//utility to parse html
function toNode(html) {
  var tpl = document.createElement('template');
  tpl.innerHTML = html;
  return tpl.content;
}

//clean words
function slugify (str) {
    var map = {
        '-' : ' ',
        '-' : '_',
        'a' : 'á|à|ã|â|À|Á|Ã|Â',
        'e' : 'é|è|ê|É|È|Ê',
        'i' : 'í|ì|î|Í|Ì|Î',
        'o' : 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
        'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
        'c' : 'ç|Ç',
        'n' : 'ñ|Ñ'
    };

    str = str.toLowerCase();

    for (var pattern in map) {
        str = str.replace(new RegExp(map[pattern], 'g'), pattern);
    };

    return str;
};

//generate two letters from names
function lettersFromNames(e) {
  if (e.name && e.lastName) {
    return e.name[0]+e.lastName[0];
  }else if (e.name) {
    return e.name[0]+" "
  }else {
    return " "+" "
  }
}

var getObjectNameByUuid = function (uuid) {
  let foundItem = query.items("all", i=> i.uuid == uuid)[0]
  if (foundItem) {
    return foundItem.name
  }else {
    return "Missing item"
  }
}
var getObjectGroupByUuid = function (uuid, store) {
  let storeGroup = undefined
  if (store.currentPbs.items.find(i=>i.uuid == uuid)) { storeGroup = "currentPbs"; }
  else if (store.requirements.items.find(i=>i.uuid == uuid)) { storeGroup = "requirements"; }
  else if (store.functions.items.find(i=>i.uuid == uuid)) { storeGroup = "functions"; }
  else if (store.stakeholders.items.find(i=>i.uuid == uuid)) { storeGroup = "stakeholders"; }
  else if (store.physicalSpaces.items.find(i=>i.uuid == uuid)) { storeGroup = "physicalSpaces"; }
  else if (store.workPackages.items.find(i=>i.uuid == uuid)) { storeGroup = "workPackages"; }
  else if (store.interfaces.items.find(i=>i.uuid == uuid)) { storeGroup = "interfaces"; }

  if (!storeGroup) {
    console.log("no group available");
  }
  return storeGroup
}

var batchRemoveMetaLinks = function (store, type, originalSet, targetSet, initiatorType, initId, projectUuid) {
  let idsToRemove = originalSet.filter(os=>!targetSet.includes(os))
  console.log(idsToRemove);
  let relatedMetaLinks =[]
  if (initiatorType == "source") {
    relatedMetaLinks= store.metaLinks.items.filter(l => l.type==type && l.source== initId && idsToRemove.includes(l.target))
  }else {
    relatedMetaLinks= store.metaLinks.items.filter(l => l.type==type && l.target== initId && idsToRemove.includes(l.source))
  }
  relatedMetaLinks.forEach(d=>{
    push(act.remove("metaLinks",{uuid:d.uuid,project:projectUuid }))
  })
}
var batchAddMetaLinks = function (store, type, originalSet, targetSet, initiatorType, initId, projectUuid) {
  console.log(originalSet);
  console.log(targetSet);

  let alreadyConnected =[]
  if (initiatorType == "source") {
    alreadyConnected= store.metaLinks.items.filter(l => l.type==type && l.source== initId && targetSet.includes(l.target)).map(l=>l.target)
  }else {
    alreadyConnected= store.metaLinks.items.filter(l => l.type==type && l.target== initId && targetSet.includes(l.source)).map(l=>l.source)
  }
  let idsToAdd= targetSet.filter(os=>!alreadyConnected.includes(os))
    console.log(idsToAdd);
  idsToAdd.forEach(id=>{
    if (initiatorType == "source") {
      push(act.add("metaLinks",{type:type, source:initId, target:id,project:projectUuid }))
    }else {
      push(act.add("metaLinks",{type:type, source:id, target:initId,project:projectUuid }))
    }
  })
}

var ephHelpers = {}
ephHelpers.drag = function(ev) {
        ev.dataTransfer.setData('text', ev.target.dataset.id);
    }

ephHelpers.startSelectionToShowFields = async function (ev,sourceList, settingsType, settingsName, callback) {
  // setup option if not exist
  let store = await query.currentProject()
  let settingsUuid = undefined
  if (!store.settings.items.find(s=>s.type == settingsType)) {
    settingsUuid = uuid()
    push(act.add("settings",{uuid:settingsUuid, type:settingsType, name:settingsName, value:[]}))
  }else {
    settingsUuid = store.settings.items.find(s=>s.type == settingsType).uuid
  }
  showListMenu({
    sourceData:sourceList,
    multipleSelection: store.settings.items.find(s=>s.type == settingsType).value,
    displayProp:"prop",
    searchable : true,
    display:[
      {prop:"displayAs", displayAs:"Available fields", edit:false}
    ],
    idProp:"uuid",
    onCloseMenu: (ev)=>{
      setTimeout(function () {
        callback()
      }, 200);
    },
    onChangeSelect: (ev)=>{

      push(act.edit("settings",{uuid:settingsUuid, prop:"value", value:ev.select.getSelected()}))
      console.log(store.settings.items.find(s=>s.type == settingsType));
      //app.store.userData.preferences.hiddenProject = ev.select.getSelected()
    },
    onClick: (ev)=>{
      console.log("select");
    },
    extraActions:[
      {
        name:"Reset",
        action:(ev)=>{
            push(act.remove("settings",{uuid:settingsUuid}))
            push(act.add("settings",{uuid:uuid(), type:settingsType, name:settingsName, value:[]}))
            update()
            ev.select.remove()
          }
        }
    ]
  })
}


ephHelpers.promptSingleDatePicker = function (currentSelectedDate, callback) {
  var datepicker = new Datepickk();
  /*Set highlight*/
  datepicker.highlight = [{
  start: new Date(currentSelectedDate),
  end: new Date(currentSelectedDate),
  backgroundColor: '#3faa56',
  color: '#ffffff'
  //legend: 'Current'//this is optional
  }];
  datepicker.closeOnSelect = true;
  datepicker.onClose = function (event) {
    callback(datepicker)
  }
  datepicker.show()
}

ephHelpers.updateListElements = function(list, data) {
  console.log(data);
  if (data.items) {list.updateData(data.items)}
  if (data.links) {list.updateLinks(data.links)}
  if (data.metaLinks) {list.updateMetaLinks(data.metaLinks)}
  if (data.displayRules) {list.updateDisplayRules(data.displayRules)}
  if (data.rulesToDisplaySingleElement) {list.updateRulesToDisplaySingleElement(data.rulesToDisplaySingleElement)}
  if (data.singleElement) {list.updateSingleElement(data.singleElement)}
  list.refreshList()
  console.log("view refreshed");
}

ephHelpers.setDisplayOrder = function(store, collectionName) {
  let currentOrder = store.itemsOrder.items.find(o=>o.collectionName==collectionName)
  if (!currentOrder) {
    return []
  }else {
    return currentOrder.order
  }

}

ephHelpers.addModalDOM = function () {
  sourceOccElement = document.createElement('div');
  sourceOccElement.style.height = "100%"
  sourceOccElement.style.width = "100%"
  sourceOccElement.style.zIndex = "11"
  sourceOccElement.style.position = "fixed"

  var dimmer = document.createElement('div');
  dimmer.classList="dimmer occurence-dimmer"
  var mainEl = document.createElement('div');

  mainEl.style.position = "fixed"
  mainEl.style.top = "0px"
  mainEl.style.display = "flex"
  mainEl.style.flexDirection = "column"
  mainEl.style.zIndex = "9999999999"
  mainEl.style.backgroundColor = "white"

  mainEl.classList ="ui raised padded container segment"
  // mainEl.style.width = "50%"
  mainEl.style.width = "60%"
  mainEl.style.maxHeight = "90%"
  mainEl.style.left= "25%";
  mainEl.style.padding = "50px";
  mainEl.style.overflow = "auto";
  // mainEl.style.left= "25%";
  var container = document.createElement('div');

  container.style.position = "relative"
  container.style.height = "90%"
  container.style.overflow = "auto"
  container.classList ="modal_container"

  var menuArea = document.createElement("div");

  // menuArea.appendChild(saveButton)

  sourceOccElement.appendChild(dimmer)
  sourceOccElement.appendChild(mainEl)
  mainEl.appendChild(menuArea)
  mainEl.appendChild(container)

  // menuArea.appendChild(toNode(renderMenu()))
  // container.appendChild(toNode(renderProfile(uuid)))

  document.body.appendChild(sourceOccElement)

  return sourceOccElement
}

ephHelpers.colorFromLetters = function (letters, uniform) {
  // const alphaVal = (s) => s.toLowerCase().charCodeAt(0) - 97 + 1
  const alphaVal = function (s) {
    if (s) {
      return s.toLowerCase().charCodeAt(0) - 97 + 1
    }else {
      let alt = "x"
      return alt.toLowerCase().charCodeAt(0) - 97 + 1
    }
  }
  let color='#ffffff'
  if (uniform) {
    let colorNbr = Math.round(( alphaVal(letters[0])+alphaVal(letters[1]) )/78*360)
    color = "hsl("+colorNbr+", 34%, 50%)"
  }else {
    let colorNbrA = Math.round( alphaVal(letters[0]) /26*360)
    let colorNbrB = Math.round( alphaVal(letters[1]) /26*360)
    color = "linear-gradient(127deg, hsl("+colorNbrA+", 34%, 50%), hsl("+colorNbrB+", 34%, 50%))"
  }
  return color
}


//Workarounds

var workarounds = {}
//due to a poor implementation of the meeting/participant/assigned to relation. TODO, move to separate data
workarounds.replaceStakeholderIdInMeetings = async function (store, oldId, newId) {

  store.meetings.items.forEach(async meeting=>{
    //replace participants area
    var index = meeting.participants.absent.indexOf(oldId);
    if (index !== -1) {meeting.participants.absent[index] = newId;}
    var index = meeting.participants.cc.indexOf(oldId);
    if (index !== -1) {meeting.participants.cc[index] = newId;}
    var index = meeting.participants.present.indexOf(oldId);
    if (index !== -1) {meeting.participants.present[index] = newId;}

    //replace in topics
    meeting.chapters.forEach(c=>{
      c.topics.forEach(t=>{
        t.items.forEach(i=>{
          if (i.assignedTo) {
            var index = i.assignedTo.indexOf(oldId);
            if (index !== -1) {i.assignedTo[index] = newId;}
          }
        })
      })
    })

    if (meeting) {
      await dbConnector.replaceProjectItem(store.uuid,"meetings",meeting.uuid, meeting)
    }else {
      alert("Meeting could not be saved")
    }

  })

}
//create a fake metalink to display interfaces in pbs single view
workarounds.generateLinksToInterfaceTargets = function (interfaces) {
  let newLinks = interfaces.map(i=>{
    return {uuid:i.uuid,type:"fakeInterfaces", source:i.source, target:i.target}
  })

  let invertedNewLinks = interfaces.map(i=>{
    return {uuid:i.uuid,type:"fakeInterfaces", source:i.target, target:i.source}
  })
  return newLinks.concat(invertedNewLinks)
}
