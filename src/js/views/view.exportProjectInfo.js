var createExportProjectInfoView = function () {
  var self ={};
  var objectIsActive = false;

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
      for (product of store.currentPbs.items) {
        appendHtml(container, theme.item(product.name,product.uuid, product.desc))
      }
      appendHtml(container, theme.section("functions","All project functions"))
      for (item of store.functions.items) {
        appendHtml(container, theme.item(item.name,item.uuid, item.desc))
      }
      appendHtml(container, theme.section("requirements","All project requirements"))
      for (requirement of store.requirements.items) {
        let linkedTo = store.metaLinks.items.filter(e=>e.source == requirement.uuid)
        console.log(linkedTo);
        let linkToText = linkedTo.map(e=>query.items("stakeholders", function (i) {
          return i.uuid == e.target
        })).reduce(function (acc, item) {
          return acc += item[0].name +" "+item[0].lastName+" "
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
