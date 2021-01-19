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
      ${ (links && links !="") ? "<h4 class='ui header'>Linked To</h4><p><strong>"+links+"</strong></p> ": ""}
      <h4 class="ui header">Description</h4>
      <p>${description || "No Description"}</p>
      `,
    itemRelationsSection:()=>`
      <h4 class="ui header">Relations</h4>
      `,
    itemRelation:(itemName,id,description)=>`
      <h5 class="ui header">${itemName}</h5>
      <h4 class="ui header">Description</h4>
      <p>${description || "No Description"}</p>
      `,
  }
  theme.itemLeaf = function (i, branchesHTML, level, links) {
    let identifier="uuid"
     html =`
     <div class="tree_leaf">
       <h${level} class="ui header">${i.name}</h${level}>
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

  var render = async function () {
    var store = await query.currentProject()
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
      for (stakeholder of store.stakeholders) {
        let name = stakeholder.name +" "+ stakeholder.lastName
        let uuid = stakeholder.uuid
        let desc = stakeholder.role||"" +"  "+ stakeholder.org||"" + "  " + stakeholder.mail||""
        appendHtml(container, theme.item(name,uuid, desc))
      }
      appendHtml(container, theme.section("Products","All project products"))

      if (productStyle == "tree") {
        //generate a tree of the products
        let productTree = renderRecursiveList(store.currentPbs,store.currentPbs.links)
        let treeHTML = renderTreeHTML(productTree, 3, store)
        appendHtml(container, treeHTML)
      }else {
        for (product of store.currentPbs) {
          let linkToText = getRelatedItems(store, i, patate, {metalinksType:"originFunction"}).map(s=> s[0]? s[0].name : "").join(",")
          + "," +getRelatedItems(store, i, "requirements", {metalinksType:"originNeed"}).map(s=> s[0]? s[0].name : "").join(",")
          appendHtml(container, theme.item(product.name,product.uuid, product.desc, linkToText))
        }
      }
      appendHtml(container, theme.section("functions","All project functions"))
      for (item of store.functions) {
        let linkToText = getRelatedItems(store, item, "requirements").reduce(function (acc, item) {
          if (item[0]) {
            return acc += item[0].name +","
          }
        },"")
        appendHtml(container, theme.item(item.name,item.uuid, item.desc, linkToText))
      }
      appendHtml(container, theme.section("requirements","All project requirements"))
      for (requirement of store.requirements) {
        let linkToText = getRelatedItems(store, requirement, "stakeholders").reduce(function (acc, item) {
          if (item && item[0]) {
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
  function renderTreeHTML(treeArray, level, store) {
    let currentLevel = level || 1
    let identifier = "uuid"
    return treeArray.map(function (t) {
      let branchesHTML = renderTreeHTML(t.branches, currentLevel+1, store)
      // let caret = (branchesHTML != "") ? true :false;
      let linkToTextFunc = getRelatedItems(store, t.leaf, "functions", {metalinksType:"originFunction"}).map(l=>l.name ? l.name :"").join(", ")
      let linkToTextReq = getRelatedItems(store, t.leaf, "requirements", {metalinksType:"originNeed"}).map(l=>l.name  ? l.name :"").join(", ")
      console.log(linkToTextFunc);
      console.log(linkToTextReq);
      console.log( linkToTextFunc + ", "+ linkToTextReq);
      let leafHTML = theme.itemLeaf(t.leaf, branchesHTML, currentLevel, linkToTextFunc + ", "+ linkToTextReq)
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
