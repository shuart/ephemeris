var createExportProjectInfoView = function () {
  var self ={};
  var objectIsActive = false;

  var productStyle="tree"

  var theme={
    containerClass:"ui center aligned segment",
    title:(projectName)=>`
      <h1 class="ui header">${projectName}</h1>
      <div class="sub header">Products, functions and interfaces</div>
      `,
    section:(sectionName,subtitle)=>`
      <h2 class="ui header">${sectionName}</h2>
      <div class="sub header">${subtitle}</div>
      `,
    item:(itemName,id,description, links)=>`
      <h3 class="ui header">${itemName}</h3>
      <div class="sub header">ID:${id}</div>
      ${ (links && links !="") ? "<h4 class='ui header'>Linked To</h4><p><strong>"+links+"</strong></p> ": ""}
      <h4 class="ui header">Description</h4>
      <p>${description || "No Description"}</p>
      `,
    itemRelationsSection:()=>`
      <h4 class="ui header">Relations</h4>
      `,
    itemRelation:(itemName,id,description)=>`
      <h5 class="ui header">${itemName}</h5>
      <div class="sub header">ID:${id}</div>
      <h4 class="ui header">Description</h4>
      <p>${description || "No Description"}</p>
      `,
  }
  theme.itemLeaf = function (i, branchesHTML, level, links) {
    let identifier="uuid"
     html =`
     <div class="tree_leaf">
       <h${level} class="ui header">${i.name}</h${level}>
       <div class="sub header"><strong>ID: </strong>${i.uuid}</div>
       <div><strong>Relations: </strong>${links ? links : "None" }</div>
       <div data-id="${i[identifier]}" ><strong>Description: </strong>${i.desc ? i.desc : "None" }</div>
     </div>
     ${branchesHTML}
     `
    return html
  }

  function appendHtml(elem,html) {
    elem.insertAdjacentHTML('beforeend', html)
    return elem
  }

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    if (store) {
      //setUpFragment
      var fragment = document.createDocumentFragment()
      var container = fragment.appendChild(document.createElement('div'))
      container.classList =theme.containerClass;
      container.id="interfacesExport"
      //populate
      appendHtml(container, theme.title(store.name))
      //List All Items
      appendHtml(container, theme.section("Stakeholders","All project stakeholders"))
      for (stakeholder of store.stakeholders.items) {
        let name = stakeholder.name +" "+ stakeholder.lastName
        let uuid = stakeholder.uuid
        let desc = stakeholder.role +"  "+ stakeholder.org + "  " + stakeholder.mail
        appendHtml(container, theme.item(name,uuid, desc))
      }
      appendHtml(container, theme.section("Products","All project products"))

      if (productStyle == "tree") {
        //generate a tree of the products
        let productTree = renderRecursiveList(store.currentPbs.items,store.currentPbs.links)
        let treeHTML = renderTreeHTML(productTree, 3)
        appendHtml(container, treeHTML)
      }else {
        for (product of store.currentPbs.items) {
          let linkToText = getRelatedItems(product, "functions").reduce(function (acc, item) {
            console.log(item);
            if (item[0]) {//why is it needed? because not all elements are from same type TODO
              return acc += item[0].name +", "
            }else { return acc }
          },"") + getRelatedItems(product, "requirements").reduce(function (acc, item) {
            if (item[0]) {//why is it needed? because not all elements are from same type TODO
              return acc += item[0].name +", "
            }else { return acc  }
          },"")
          appendHtml(container, theme.item(product.name,product.uuid, product.desc, linkToText))
        }
      }
      appendHtml(container, theme.section("functions","All project functions"))
      for (item of store.functions.items) {
        let linkToText = getRelatedItems(item, "requirements").reduce(function (acc, item) {
          if (item[0]) {
            return acc += item[0].name +","
          }
        },"")
        appendHtml(container, theme.item(item.name,item.uuid, item.desc, linkToText))
      }
      appendHtml(container, theme.section("requirements","All project requirements"))
      for (requirement of store.requirements.items) {
        let linkToText = getRelatedItems(requirement, "stakeholders").reduce(function (acc, item) {
          if (item[0]) {
            return acc += item[0].name +" "+item[0].lastName+" "
          }
        },"")
        appendHtml(container, theme.item(requirement.name,requirement.uuid, requirement.desc, linkToText))
      }
      //inject in DOM
      queryDOM(".center-container").appendChild(fragment)
      selectText("interfacesExport")
    }else {
      alert("focus on a project first")
    }
  }

  function getRelatedItems(sourceItem, groupToSearch) {
    var store = query.currentProject()
    let linkedTo = store.metaLinks.items.filter(e=>e.source == sourceItem.uuid)
    console.log(linkedTo);
    let linkToText = linkedTo.map(e=>query.items(groupToSearch, function (i) {
      return i.uuid == e.target
    }))
    console.log(linkToText);
    return linkToText
  }

  var renderRecursiveList = function (items, links) {
    let identifier = "uuid"
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
    return treeArray
  }

  function recursiveTreeSort(roots,items, links) {
    let identifier = "uuid"
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
  function renderTreeHTML(treeArray, level) {
    let currentLevel = level || 1
    let identifier = "uuid"
    return treeArray.map(function (t) {
      let branchesHTML = renderTreeHTML(t.branches, currentLevel+1)
      // let caret = (branchesHTML != "") ? true :false;
      let linkToTextFunc = getRelatedItems(t.leaf, "functions").map(l=>l[0] ? l[0].name :"").join(", ")
      let linkToTextReq = getRelatedItems(t.leaf, "requirements").map(l=>l[0] ? l[0].name :"").join(", ")

      let leafHTML = theme.itemLeaf(t.leaf, branchesHTML, currentLevel, linkToTextFunc + linkToTextReq)
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

  return self
}

var exportProjectInfoView = createExportProjectInfoView()
exportProjectInfoView.init()
