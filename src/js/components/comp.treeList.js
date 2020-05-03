var createTreeList = function ({
  container=undefined,
  searchContainer=undefined,
  items = undefined,
  links = undefined,
  identifier = "uuid",
  valueFunction = (i)=> i.name,
  contentFunction = undefined,
  onUpdate= undefined,
  onToogleVisibility=undefined,
  customEyeActionClass="",
  customEyeIconClass=undefined,
  customTextActionClass="",
  customExtraActionClass="",
  optimizeRefresh = true,
  isDraggable=true,
  arrayOfHiddenItems = undefined//unused
  }={}) {
  var self ={};
  var domElement = undefined
  var domSearchElement = undefined
  var searchResults = undefined
  var closedCaret = []
  var previouslyRenderedHtml = ''
  var flatMode = true

  var objectIsActive = false;
  var lastRecursiveList = undefined
  var theme = {}

  theme.item = function (i, visibility) {
    if (i.parentInList) {//item is part of hierarchy
      html =`
      <div style="height:auto" ${isDraggable? ' draggable="true" ondragstart="ephHelpers.drag(event)" ':""} data-id="${i[identifier]}" class="searchable_item list-item">
        <div class="type-marker" style="${i.customColor? "":"display:none;"}position: relative;height: inherit;width: 2px;background:${i.customColor? i.customColor:"#01ffff"};right: 9px;opacity: 0.7;"></div>
        <span style="width:${i.levelInList*5}px;"></span>
        <span>${getCartStyle(i.caret, i.caretStatusClosed)}</span>
        <span class="relaxed ${customTextActionClass}" data-id="${i[identifier]}" >${valueFunction(i)}</span>
        ${theme.itemExtraIcon(i)}
        <i data-label="${i.labels? i.labels[0]:''}" data-id="${i[identifier]}" style="opacity:0.2" class="${customEyeIconClass? customEyeIconClass:"far fa-eye"} ${customEyeActionClass}"></i>
        <div data-id="${i[identifier]}" >${contentFunction ? contentFunction(i):"" }</div>
      </div>`

     return html
    }else {
      html =`
      <div style="height:auto" ${isDraggable? ' draggable="true" ondragstart="ephHelpers.drag(event)" ':""} data-id="${i[identifier]}" class="searchable_item list-item">
        <div class="type-marker" style="${i.customColor? "":"display:none;"}position: relative;height: inherit;width: 2px;background:${i.customColor? i.customColor:"#01ffff"};right: 9px;opacity: 0.7;"></div>
        <span class="relaxed ${customTextActionClass}" data-id="${i[identifier]}" >${valueFunction(i)}</span>
        ${theme.itemExtraIcon(i)}
        <i data-label="${i.labels? i.labels[0]:''}" data-id="${i[identifier]}" style="opacity:0.2" class="${customEyeIconClass? customEyeIconClass:"far fa-eye"} ${customEyeActionClass}"></i>
        <div data-id="${i[identifier]}" >${contentFunction ? contentFunction(i):"" }</div>
      </div>`

     return html
    }

  }

  theme.itemSearchArea= function () {
     html =`
        <input class="tree_item_search_input search_input" type="text" placeholder="Search..">
        <span class=""> <i class="fas fa-search"></i></span>
    `
    return html
  }

  theme.itemExtraIcon = function (i) {
    if (customExtraActionClass != "") {
      html =`
      <i data-label="${i.labels? i.labels[0]:''}" data-id="${i[identifier]}" style="opacity:0.2" class="${customExtraActionClass}"></i>
        `
      return html
    }
    return ""
  }
  theme.itemLeaf = function (i, branchesHTML, caret,childrenAreClosed) {
     html =`
     <div class="tree_leaf">
       <div data-id="${i[identifier]}" class="searchable_item list-item">
         <span>${getCartStyle(caret, childrenAreClosed)}</span>
         <span class="relaxed ${customTextActionClass}" data-id="${i[identifier]}" >${valueFunction(i)}</span>
         ${theme.itemExtraIcon(i)}
         <i data-label="${i.labels? i.labels[0]:''}" data-id="${i[identifier]}" style="opacity:0.2" class="${customEyeIconClass? customEyeIconClass:"far fa-eye"} ${customEyeActionClass}"></i>
         <div data-id="${i[identifier]}" >${contentFunction ? contentFunction(i):"" }</div>
       </div>
     </div>
     <div class="tree_children_container" style ='${childrenAreClosed? 'display:none; ':''} margin-left:9px;'>${branchesHTML}</div>
     `
    return html
  }
  theme.flatModeToggle = function () {
     html ="<div style='cursor:pointer;width: 10px;height: 10px;position: absolute;top: 111px;left: 232px;opacity:0.2;'><i class='fas fa-sitemap'></i></div>"
    return html
  }
  function getCartStyle(caret, childrenAreClosed) {
    if (caret && childrenAreClosed) {
      return '<i style="float:left;" class="tree_caret fas fa-caret-right"></i>'
    }else if (caret && !childrenAreClosed) {
      return '<i style="float:left;" class="tree_caret fas fa-caret-down"></i>'
    }else {
      return ''
    }
  }
  // theme.item = function (i) {
  //    html =`
  //    <div data-id="${i.uuid}" class="searchable_item list-item action_note_manager_load_note">
  //      <strong data-id="${i.uuid}" >${i.title}</strong>
  //      <i class="fas fa-sticky-note"></i>
  //      <div data-id="${i.uuid}" >${i.content.substring(0,135)+".. "}</div>
  //    </div>`
  //
  //   return html
  // }

  var init = function () {
    setContainerArea()
    connections()
    update()

  }
  var setContainerArea =function () {
    //clear container and append main element
    container.innerHTML=""

    domElement = container.appendChild(document.createElement("div"))
    domElement.classList="tree_list_area"
    domElement.style.height="100%"
    domElement.style.overflow="auto"
    domModeElement = container.appendChild(document.createElement("div"))
    domModeElement.classList="tree_list_change_mode_area"
    if (links) {
      domModeElement.innerHTML=theme.flatModeToggle()
    }
    console.log(domElement);
    setUpScrollEvent(domElement)

    //set up search if needed
    if (searchContainer) {
      searchContainer.innerHTML=""
      domSearchElement = searchContainer.appendChild(document.createElement("div"))
      domSearchElement.classList="tree_list_search_area"
      domSearchElement.innerHTML=theme.itemSearchArea()
      setUpSearch(domSearchElement.querySelector('.tree_item_search_input'));
    }
    console.log(domElement);
  }
  var connections =function () {

    domElement.onclick = function(event) {
        if (event.target.classList.contains("tree_caret")) {
            console.log(event.target.parentNode.parentNode.dataset.id);
            //let nextContainer =event.target.parentNode.parentNode.parentNode.nextElementSibling;
            if (closedCaret.includes(event.target.parentNode.parentNode.dataset.id)) {
              //remove element from closed carret list
              var index = closedCaret.indexOf(event.target.parentNode.parentNode.dataset.id);
              if (index > -1) {
                closedCaret.splice(index, 1);
              }
              console.log(closedCaret);
              // nextContainer.style.display="block"
              // event.target.classList.remove('fa-caret-right')
              // event.target.classList.add('fa-caret-down')
            }else {
              //add element to closed carret info
              closedCaret.push(event.target.parentNode.parentNode.dataset.id)
              //console.log(closedCaret);
              // nextContainer.style.display="none"
              // event.target.classList.remove('fa-caret-down')
              // event.target.classList.add('fa-caret-right')
            }
            update()
        }
    }
    domModeElement.onclick = function(event) {
      flatMode = !flatMode
      update()
    }
  }

  var render = function () {
    //check if a new search is Needed
    if (domSearchElement.querySelector('.tree_item_search_input').value == "") {
      searchResults = undefined //reset search result if reloading
    }
    if (searchResults && searchResults[0]){
      let list = searchResults.map(i=>theme.item(i)).join("")
      domElement.innerHTML = list
      //searchResults = undefined //reset search result if reloading
    }else if (!links || flatMode) {
      console.log(items);
      // let list = items.map(i=>theme.item(i)).join("")
      console.log(items);
      let list = renderCurrentCluster(items, domElement.scrollTop)
      domElement.innerHTML = list
    }else if (links) {
      // let linkCopy = deepCopy(links)//deep copy the links to allow removing them
      // let itemsCopy = deepCopy(items)//deep copy the links to allow removing them
      let linkCopy = links
      let itemsCopy = items
      // let list = renderRecursiveList(itemsCopy, linkCopy)
      if (!lastRecursiveList) { //chek if a recursive list is not already in memory
        lastRecursiveList =  renderRecursiveList(itemsCopy, linkCopy)
      }
      // let list = renderRecursiveList(itemsCopy, linkCopy)
      let list = renderCurrentCluster(lastRecursiveList, domElement.scrollTop)
      domElement.innerHTML = list
    }
    //onUpdate callBack
    if (onUpdate) {
      onUpdate()
    }
  }

  function renderCurrentCluster(items, scrollPosition) {
    var clusteredElementHeight = 32

    let currentElementHeight = domElement.clientHeight;
    if (currentElementHeight> 3000) { //prevent issue when client height cannot be found. No need to be bigger than 4k TODO: investigate case where that happens
      currentElementHeight = 3000
    }
    //console.log( scrollPosition )
    //console.log(currentElementHeight )

    //clean element
    // domElement.innerHTML = ""

    //calculation
    let nbrOfElementToAdd = Math.floor(currentElementHeight/clusteredElementHeight)+5
    let nbrOfHiddenTopElement = Math.floor(scrollPosition/clusteredElementHeight)
    let startElementListPosition = nbrOfHiddenTopElement
    let endElementListPosition = nbrOfHiddenTopElement+nbrOfElementToAdd
    console.log(endElementListPosition);
    let clusteredHTML = ""
    //add padding element
    let startPadderSize = nbrOfHiddenTopElement*clusteredElementHeight
    clusteredHTML += generateFakeElement(startPadderSize)
    //add current cluster
    clusteredHTML += insertElementsB(items, startElementListPosition, endElementListPosition)
    //add end padding element
    let endPadderSize = (items.length-endElementListPosition)*clusteredElementHeight
    clusteredHTML += generateFakeElement(endPadderSize)

    return clusteredHTML

    function insertElementsB (items, startElement, endElement) {
      let clusterHTML=""
      for (let i = startElement; i < endElement; i++) {
        //console.log("add" + list[i])
        if (items[i]) {
          clusterHTML +=theme.item(items[i]) ||""
        }

        //domTarget.insertAdjacentHTML("beforeend", list[i])
      }
       return clusterHTML
    }
    function generateFakeElement(height) {
      if (height>0) {
        return `<div style="height:${height}px; background-color:none">${height}</div>`
      }else {
         return ``
       }
    }
  }

  var renderRecursiveList = function (items, links) {
    let listRoots = items.filter((i) => {
      return !links.find((l)=> {
        if (l.target[identifier]) {//check if links source is object
          return l.target[identifier] == i[identifier]
        }else{
          return l.target == i[identifier]
        }
      })
    })
    console.log(listRoots);
    //optimize links format for faster search
    let sourceMaps = {}
    for (var i = 0; i < links.length; i++) {
      let l=links[i]
      let currentTarget = l.target[identifier] || l.target
      let currentSource = l.source[identifier] || l.source
      if (!sourceMaps[currentTarget]) {
        sourceMaps[currentTarget] = currentSource
      }else {
        console.log("multiple source")
      }


    }


    console.log(sourceMaps);
    let treeArray = recursiveTreeSortInList(listRoots,items, sourceMaps)
    console.log(treeArray);
    return treeArray
    // return renderTreeHTML(treeArray)
  }


  function recursiveTreeSortInList(roots,items, links, level) {

    function arraySwapDelete (array, index) {
          array[index] = array[array.length - 1];
          array.pop();
      }

    function isLinked(source, target, links) {

      if (links[ target[identifier] ]) {
        if (links[ target[identifier] ] == source[identifier]) {
          return true
        }else {
          return false
        }
      }
      return false
    }


    function getChildren(currentLeaf, items, links) {
      let childrenArray = []
      let childrenIDArray = []
      let parentCaret = false
      let parentCaretStatusClosed = false
      for (var i = 0; i < items.length; i++) {
        let currentItem = items[i]
        if (isLinked(currentLeaf, currentItem, links)) {
          currentItem.parentInList = currentLeaf.uuid //set parent of item
          parentCaret = true //set caret style
          // currentLeaf.caret = true //set caret style
          parentCaretStatusClosed = closedCaret.includes(currentLeaf[identifier])
          // currentLeaf.caretStatusClosed = closedCaret.includes(currentLeaf[identifier])
          childrenIDArray.push(currentItem.uuid)
          if (!parentCaretStatusClosed) {
              childrenArray.push(currentItem)// add element in list to render if carret is not closed
          }
        }
      }
      return {
        childrenArray:childrenArray,
        childrenIDArray:childrenIDArray,
        parentCaret:parentCaret,
        parentCaretStatusClosed:parentCaretStatusClosed
      }
    }

    function returnBranches(r, items, links, level) {
      //get all the children of this element
      let partialArray = [r]
      let childrenLists = getChildren(r, items, links)
      let itemsChildren = childrenLists.childrenArray
      r.childrendIds = childrenLists.childrenIDArray
      r.caret = childrenLists.parentCaret
      r.caretStatusClosed = childrenLists.parentCaretStatusClosed
      r.levelInList = level
      //recursively trandform them in leaf and branches
      let thisitemBranches = recursiveTreeSortInList(itemsChildren,items, links, level+1)
      partialArray =partialArray.concat(thisitemBranches)
      return partialArray
    }

    let rootArray=[]
    for (var i = 0; i < roots.length; i++) {
      let r = roots[i]
      let currentLevel = level || 0
      //rootArray.push(r)
      rootArray = rootArray.concat(returnBranches(r, items, links, currentLevel))
      // rootArray.push(returnLeaf(r, items, links))
    }
    return rootArray

  }

  function renderTreeHTML(treeArray) {
    console.log(treeArray);
    return treeArray.map(function (t) {
      let branchesHTML = renderTreeHTML(t.branches)
      let caret = (branchesHTML != "") ? true :false;
      let caretStatus = closedCaret.includes(t.leaf[identifier])
      console.log(t.leaf[identifier], caretStatus)
      let leafHTML = theme.itemLeaf(t.leaf, branchesHTML, caret, caretStatus)
      return leafHTML
    }).join("")
  }

  function searchList(sourceData, value) {
    var filteredData = sourceData.filter((item) => {
      if (fuzzysearch(value, item.name) || fuzzysearch (value, item.name.toLowerCase()) ) {
        return true
      }
      return false
    })
    console.log(filteredData);
    if (filteredData[0] && filteredData.length != items.length) {
      searchResults = filteredData
    }else {
      searchResults = undefined
    }
    update()
  }

  function setUpSearch(searchElement) {

    searchElement.addEventListener('keyup', function(e){
      //e.stopPropagation()
      let sourceData = items//get local global items
      var value = searchElement.value
      searchList(sourceData, value)

      // var filteredIds = filteredData.map(x => x.uuid);
      // var searchedItems = document.querySelectorAll(".searchable_note")
      // for (item of searchedItems) {
      //   if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "block"}else{item.style.display = "none"}
      // }
    });
  }

  function setUpScrollEvent(domElement) {
    domElement.addEventListener('scroll', function (event) {
            console.log(event)
            render()
    })
  }

  var update = function () {
    render()
  }
  var refresh = function (newItems, newLinks) {
    items = newItems
    links = newLinks
    lastRecursiveList = undefined
    if (document.querySelector(".tree_list_area") == null) {
      console.log("container has disapeard");
      setContainerArea()
      connections()
    }

    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.refresh = refresh
  self.init = init

  init()

  return self
}
