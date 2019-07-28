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
function getRelatedItems(sourceItem, groupToSearch, paramOptions) {//todo limit metalinks type
  var paramOptions = paramOptions || {}
  let options ={
    objectIs :paramOptions.objectIs || "source",
    metalinksType :paramOptions.metalinksType || undefined
  }
  let linkTotextItemType = options.objectIs == "source"? "target" : "source"

  var store = query.currentProject()
  let metaLinksToSearch = store.metaLinks.items
  if (options.metalinksType) {
    metaLinksToSearch =store.metaLinks.items.filter(e=>e.type == options.metalinksType)
  }
  let linkedTo = metaLinksToSearch.filter(e=>e[options.objectIs] == sourceItem.uuid)
  let linkToText = linkedTo.map(e=>query.items(groupToSearch, function (i) {
    return i.uuid == e[linkTotextItemType]
  }))
  return linkToText
}
//get related item
function getCategoryFromItemUuid(sourceItemId) {//todo limit metalinks type
  var store = query.currentProject()
  let category = undefined
  let categoryLink = store.metaLinks.items.find(m=>m.source == sourceItemId)
  if (categoryLink) {
    category = store.categories.items.find(c=>c.uuid == categoryLink.target)
  }
  console.log(category);
  return category
}

//clear links with missing items
var clearUncompleteLinks = function () {
  var store = query.currentProject().metaLinks.items
  for (link of store) {
    //check if item is complete
    if (!query.items("all", i=> i.uuid == link.source)[0]) {
      push(act.remove("metaLinks",{uuid:link.uuid}))
    }else if (!query.items("all", i=> i.uuid == link.target)[0]) {
      push(act.remove("metaLinks",{uuid:link.uuid}))
    }
  }
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
