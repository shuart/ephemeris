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
