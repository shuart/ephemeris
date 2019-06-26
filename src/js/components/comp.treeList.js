var createTreeList = function ({
  container=undefined,
  searchContainer=undefined,
  items = undefined,
  links = undefined,
  identifier = "uuid",
  valueFunction = (i)=> i.name,
  contentFunction = undefined,
  onToogleVisibility=undefined,
  customEyeActionClass="",
  customEyeIconClass=undefined,
  customTextActionClass="",
  customExtraActionClass="",
  arrayOfHiddenItems = undefined//unused
  }={}) {
  var self ={};
  var domElement = undefined
  var domSearchElement = undefined
  var searchResults = undefined
  var closedCaret = []

  var objectIsActive = false;
  var theme = {}

  theme.item = function (i, visibility) {
     html =`
     <div data-id="${i[identifier]}" class="searchable_item list-item">
       <span class="relaxed ${customTextActionClass}" data-id="${i[identifier]}" >${valueFunction(i)}</span>
       ${theme.itemExtraIcon(i)}
       <i data-label="${i.labels? i.labels[0]:''}" data-id="${i[identifier]}" style="opacity:0.2" class="${customEyeIconClass? customEyeIconClass:"far fa-eye"} ${customEyeActionClass}"></i>
       <div data-id="${i[identifier]}" >${contentFunction ? contentFunction(i):"" }</div>
     </div>`

    return html
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

    //set up search if needed
    if (searchContainer) {
      searchContainer.innerHTML=""
      domSearchElement = searchContainer.appendChild(document.createElement("div"))
      domSearchElement.classList="tree_list_search_area"
      domSearchElement.innerHTML=theme.itemSearchArea()
      setUpSearch(domSearchElement.querySelector('.tree_item_search_input'), items);
    }
    console.log(domElement);
  }
  var connections =function () {

    domElement.onclick = function(event) {
        if (event.target.classList.contains("tree_caret")) {
            console.log(event.target.parentNode.parentNode.parentNode.nextElementSibling);
            let nextContainer =event.target.parentNode.parentNode.parentNode.nextElementSibling;
            if (nextContainer.style.display == "none") {
              //remove element from closed carret list
              var index = closedCaret.indexOf(event.target.parentNode.parentNode.dataset.id);
              if (index > -1) {
                closedCaret.splice(index, 1);
              }
              nextContainer.style.display="block"
              event.target.classList.remove('fa-caret-right')
              event.target.classList.add('fa-caret-down')
            }else {
              //add element to closed carret info
              closedCaret.push(event.target.parentNode.parentNode.dataset.id)
              console.log(closedCaret);
              nextContainer.style.display="none"
              event.target.classList.remove('fa-caret-down')
              event.target.classList.add('fa-caret-right')
            }

        }
    }
  }

  var render = function () {
    if (searchResults && searchResults[0]){
      let list = searchResults.map(i=>theme.item(i)).join("")
      domElement.innerHTML = list
      searchResults = undefined //reset search result if reloading
    }else if (!links) {
      let list = items.map(i=>theme.item(i)).join("")
      domElement.innerHTML = list
    }else if (links) {
      let list = renderRecursiveList(items, links)
      domElement.innerHTML = list
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
    let treeArray = recursiveTreeSort(listRoots,items, links)
    console.log(treeArray);
    return renderTreeHTML(treeArray)
  }

  function recursiveTreeSort(roots,items, links) {
    return roots.map(function (r) {
      //get all the children of this element
      let itemsChildren = items.filter((i) => {
        return links.find((l)=> {
          if (l.source[identifier]) {//check if links source is object
            return l.source[identifier] == r[identifier] && l.target[identifier] == i[identifier]
          }else { //or ID
            return l.source == r[identifier] && l.target == i[identifier]
          }
        })
      })
      //recursively trandform them in leaf and branches
      let thisitemBranches = recursiveTreeSort(itemsChildren,items, links)
      let thisItemLeaf = {leaf:r, branches:thisitemBranches}
      return thisItemLeaf
    })
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

  function setUpSearch(searchElement, sourceData) {
    searchElement.addEventListener('keyup', function(e){
      //e.stopPropagation()
      var value = searchElement.value
      console.log(value);
      console.log(sourceData);
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

      // var filteredIds = filteredData.map(x => x.uuid);
      // var searchedItems = document.querySelectorAll(".searchable_note")
      // for (item of searchedItems) {
      //   if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "block"}else{item.style.display = "none"}
      // }
    });
  }

  var update = function () {
    render()
  }
  var refresh = function (newItems, newLinks) {
    items = newItems
    links = newLinks
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
