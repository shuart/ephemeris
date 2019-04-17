var createTreeList = function ({
  container=undefined,
  items = undefined,
  links = undefined,
  identifier = "uuid",
  valueFunction = (i)=> i.name,
  contentFunction = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var theme = {}

  theme.item = function (i) {
     html =`
     <div data-id="${i[identifier]}" class="searchable_item list-item action_note_manager_load_note">
       <strong data-id="${i[identifier]}" >${valueFunction(i)}</strong>
       <i class="fas fa-sticky-note"></i>
       <div data-id="${i[identifier]}" >${contentFunction ? contentFunction(i):"" }</div>
     </div>`

    return html
  }
  theme.itemLeaf = function (i, branchesHTML) {
     html =`
     <div data-id="${i[identifier]}" class="searchable_item list-item action_note_manager_load_note">
       <strong data-id="${i[identifier]}" >${valueFunction(i)}</strong>
       <i class="fas fa-sticky-note"></i>
       <div data-id="${i[identifier]}" >${contentFunction ? contentFunction(i):"" }</div>
       <div style ='margin-left=5px;'>${branchesHTML}</div>
     </div>`

    return html
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
    connections()
    update()

  }
  var connections =function () {

  }

  var render = function () {
    if (!links) {
      let list = items.map(i=>theme.item(i)).join("")
      container.innerHTML = list
    }else if (links) {
      let list = renderRecursiveList(items, links)
      container.innerHTML = list
    }

  }

  var renderRecursiveList = function (items, links) {
    let listRoots = items.filter((i) => {
      return !links.find((l)=> {
        return l.target[identifier] == i[identifier]
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
          return l.source[identifier] == r[identifier] && l.target[identifier] == i[identifier]
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
      let leafHTML = theme.itemLeaf(t.leaf, branchesHTML)
      return leafHTML
    }).join("")
  }

  var update = function () {
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
  self.init = init

  init()

  return self
}
