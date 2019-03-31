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
    const HOUR = 1000 * 60 * 60;
    const XDaysFuture = Date.now() + HOUR*24* ( days|| 1);
    console.log(XDaysFuture, date);
    console.log(XDaysFuture < date);
    return XDaysFuture > date;
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
