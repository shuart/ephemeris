var createLeftMenu = function () {
  var self ={};
  var objectIsActive = false;

  //needed for the html generator. TODO find a beter place
  var lastTopCat
  var lastMiddleCat
  var lastSubCat

  var init = function () {
    connections()
    render()

  }
  var connections =function () {
    //connect to DB
    document.addEventListener("storeUpdated", function () {
      if (objectIsActive) {
        update()
      }
    })
    //component connection
    connect(".action_link_pbs_req","click",(e)=>{
      var store = query.currentProject()
      ShowSelectMenu({
        sourceData:store.requirements.items,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"name", edit: false},
          {prop:"desc", displayAs:"Description", edit:false}
        ],
        idProp:"uuid",
        onClick: (ev)=>{
          //mutations
          store.metaLinks.items = store.metaLinks.items.filter((i)=>i.target != e.target.dataset.id)
          console.log(ev.target);
          store.metaLinks.items.push({source:ev.target.dataset.id , target:e.target.dataset.id})
          console.log(store.metaLinks.items);
          ev.selectDiv.remove()
          renderCDC()
        },
        onClear: (ev)=>{
          //mutations
          ev.selectDiv.remove()
          renderCDC()
        }
      })
    })
    connect(".action_toogle_selectmenu","click",(e)=>{
      //e.target.dataset.id
      var store = query.currentProject()
      ShowSelectMenu({
        sourceData:store.currentPbs.items,
        sourceLinks:store.currentPbs.links,
        display:[
          {prop:"name", displayAs:"name", edit:false},
        ],
        displayProp:"name",
        idProp:"uuid",
        onClick: (ev)=>{
          //mutations
          store.metaLinks.items = store.metaLinks.items.filter((i)=>i.target != e.target.dataset.id)
          console.log(ev.target);
          store.metaLinks.items.push({source:ev.target.dataset.id , target:e.target.dataset.id})
          ev.selectDiv.remove()
          renderCDC()
        },
        onClear: (ev)=>{
          //mutations
          store.metaLinks.items = store.metaLinks.items.filter((i)=>i.target != e.target.dataset.id)
          ev.selectDiv.remove()
          renderCDC()
        }
      })
    })
    connect(".action_toogle_tree_pbsD","click",(e)=>{
      var store = query.currentProject()
      if (true) {
        var tree = renderDTree(app.cscDB.db)
        console.log(tree);
        var data =undefined
        if (store.currentPbs.items[0]) {
          data = hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0]
          console.log(data);
        }
        displayThree({
          data:data,
          edit:true,
          onClose:(e)=>{
            renderCDC()
          },
          onAdd:(ev)=>{
            var uuid = genuuid()
            var newName = prompt("Name?")
            push(addPbs({uuid:uuid, name:newName}))
            push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
            ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
            //ev.sourceTree.updateFromRoot(ev.element)
          },
          onMove:(ev)=>{
            push(removePbsLink({source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))
            push(addPbsLink({source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
            ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
          },
          onRemove:(ev)=>{
            if (confirm("Keep Childs?")) {
              var originalLinks = store.currentPbs.links.filter(e=>e.source == ev.element.data.uuid)
              for (link of originalLinks) {
                push(addPbsLink({source:ev.element.parent.data.uuid, target:link.target}))
              }
            }
            //remove all links
            push(removePbsLink({source:ev.element.data.uuid}))
            //addNewLinks
            push(removePbs({uuid:ev.element.data.uuid}))
            //push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
            ev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
          },
          onNodeClicked:(originev)=>{
            var originItem = store.currentPbs.items.filter(e=> e.uuid == originev.element.data.uuid)
            ShowSelectMenu({
              sourceData:store.currentPbs.items,
              sourceLinks:store.currentPbs.links,
              displayProp:"name",
              searchable : false,
              singleElement:originItem[0],
              rulesToDisplaySingleElement:[
                {prop:"name", displayAs:"Name", edit:"true"}
              ],
              display:[
                {prop:"name", displayAs:"Name", edit:false}
              ],
              idProp:"uuid",
              onCloseMenu: (ev)=>{
                //console.log("fefsefse");
                console.log(originev.sourceTree);
                // ev.select.getParent().update()
                originev.sourceTree.setData(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0])
                originev.sourceTree.hardUpdate()//TODO find better way
              },
              onEditItem: (ev)=>{
                console.log("Edit");
                var newValue = prompt("Edit Item",ev.target.dataset.value)
                if (newValue) {
                  push(editPbs({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
                }
                ev.select.update()
              }
            })
          }
        })
      }else {
      }
    })

  }

  var render = function () {
    update()

  }

  var update = function () {
    var store = query.currentProject()
    let currentView = app.state.currentView;
    if (store) {

      lastTopCat ={ name:undefined};
      lastMiddleCat = { name:undefined};
      lastSubCat= { name:undefined};
      if (store.currentCDC.items[0]) {
        console.log(store.currentCDC.items);
        var tocCurrentHTML = app.cscDB.db.items.filter(createListIDFilter(store.currentCDC.items)).reduce(renderCurrentTocHTML,"")
        var downloadHTML = `
          <div class="item">
          <button class="action_toogle_download ui labeled icon tiny green button">
            <i class="archive icon"></i>
            Save
          </button>
          </div>`
        document.querySelector(".current-area").innerHTML = downloadHTML + tocCurrentHTML
      }else {
        document.querySelector(".current-area").innerHTML = ""
      }

      //add pbs area
      var showTreeHtml = "";
      // var showTreeHtml = `
      // <div class="item">
      //   <button class="action_toogle_tree_pbs ui labeled icon mini basic button">
      //     <i class="dolly icon"></i>
      //     Show PBS tree
      //   </button>
      // </div>`

      if (store.currentPbs.items[0]) {
        console.log(store.currentPbs.items);
        var pbsHTML =``
        //constructTreeView(hierarchiesList(store.currentPbs.items, store.currentPbs.store.links), pbsHTML, 0)
        var treeHtmlEl = buildTree(hierarchiesList(store.currentPbs.items, store.currentPbs.links)[0],0)
        // for (item of store.currentPbs.items) {
        //   pbsHTML += `
        //     <div class="item">
        //       ${item.name}
        //     </div>`
        // }
        document.querySelector(".left-menu-area").innerHTML = '<div class="title">Project PBS</div><div class="left-list"></div>' + pbsHTML + showTreeHtml
        document.querySelector(".left-menu-area .left-list").appendChild(treeHtmlEl)
      }else {
        document.querySelector(".left-menu-area").innerHTML = showTreeHtml
      }


    }else {
      document.querySelector(".current-area-title").innerHTML = ""
      document.querySelector(".current-area").innerHTML = ""
      document.querySelector(".pbsFlatView-area").innerHTML = ""
      document.querySelector(".left-menu-area").innerHTML = ""
      document.querySelector(".left-menu-area").innerHTML += generateNextActionList()
      document.querySelector(".project_title_area").innerHTML = `
      <h3 class="ui header">
          Ephemeris
      </h3>`
    }
  }

  var setActive =function () {
    objectIsActive = true;
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  //general functions

  function generateNextActionList() {
    var html = query.items("projects").reduce((acc,project)=>{
      var filterText = ""
      var filterClosedDaysAgo = -2
      var items = project.actions.items.filter( e => fuzzysearch(filterText, e.name))
      items = items.filter( e => e.open)
      items = items.filter( e => lessThanInSomeDays(e.dueDate,7))
      //acc += generateTasksHTML(items.reverse() , i.uuid)
      var actionListHtml = items.reduce((out,i)=>{
        return out + `
          <div class="list-item">
            ${i.name}
            <i class="far fa-calendar-times"></i>
          </div>`
      },'')
      return acc + actionListHtml
    },'')
    return `<div class="title">Next actions</div><div class="left-list">${html}</div>`

  }
  function buildTree(tree,level) {
    var store = query.currentProject()
    let node = tree;
    var el = document.createElement('div');

    //el.innerHTML = node.name + level;
    var reqHtml = ""
    console.log(store.metaLinks.items);
    console.log(node.uuid);
    var link = store.metaLinks.items.filter((i)=>i.target == node.uuid)
    console.log(store.metaLinks.items);
    if (!link[0]) {
      reqHtml += `<a data-id="${node.uuid}" class="item action_link_pbs_req">Lier à un besoin</a>`
    }else {
      var linkedItem = getItemsFromPropValue(store.requirements.items, "uuid", link[0].source)
      if (!linkedItem[0]) {
        //removeFromLinks
        store.metaLinks = removeItemsWithPropValue(store.metaLinks.items,"target",node.uuid)//TODO remove horrible side effect
      }else {
        reqHtml += `<a data-id="${node.uuid}" class="item action_link_pbs_req">${linkedItem[0].name}</a>`
      }
    }
    if (level) {

    }
    el.innerHTML = `
      <div style="margin-left:${level*6}px" class="list-item pbs_flat_item">
        ${node.name}
        ${reqHtml}
      </div>`

    if (node.children) {
      node.children.forEach(function(n) {
        el.appendChild(buildTree(n, (level + 1)) );
      });
    }

    return el;
  }
  function createListIDFilter(filterArray) {
    var filterFunc = function (item) {
      if (filterArray && filterArray[0]) {
        return filterArray.includes(item.uuid)
      }else {
        return true
      }
    }
    return filterFunc
  }
  function renderCurrentTocHTML(accu, item) {
    var store = query.currentProject()
    var executionIsDisplayed = false
    var html = ""
    //add title and subtitle
    if (lastTopCat.name != item.topCat.name) {
      lastTopCat = item.topCat
      html += `<a class="active teal item">
        ${item.topCat.name}
      </a>`
    }
    if (lastMiddleCat.name != item.middleCat.name) {
      lastMiddleCat = item.middleCat
      html += `<a class="active teal item">
        ${item.middleCat.name}
      </a>`
    }
    if (lastSubCat.name != item.subCat.name) {
      lastSubCat = item.subCat
      html += `<a class="active teal item">
        ${item.subCat.name}
      </a>`
    }
    //add item
    var actionToogleCurrentHTML = `<i data-id="${item.uuid}"  class="action_toogle_add copy outline icon"></i>`
    if (store.currentCDC.items.includes(item.uuid)) {
      actionToogleCurrentHTML = `<i data-id="${item.uuid}"  class="action_toogle_add minus circle icon"></i>`
    }
    //actionTooglelink = `<i data-id="${item.uuid}"  class="action_toogle_selectmenu minus circle icon"></i>`
    var metalink = store.metaLinks.items.filter((i)=>i.target == item.uuid)
    if (!metalink[0]) {
      actionTooglelink = `<a data-id="${item.uuid}"  class="action_toogle_selectmenu item">Lier à un élément</a>`
    }else {
      console.log(store.currentPbs.items, metalink[0].source);
      var linkedItem = getItemsFromPropValue(store.currentPbs.items, "uuid", metalink[0].source)
      console.log(linkedItem);
      if (!linkedItem[0]) {
        //removeFromLinks
        store.metaLinks.items = removeItemsWithPropValue(store.metaLinks.items,"target",item.uuid)
      }else {
        actionTooglelink = `<a data-id="${item.uuid}"  class="action_toogle_selectmenu item">Lier à ${linkedItem[0].name}</a>`
      }
    }

    html += `<a href="#${item.uuid}" class="item">
      ${item.name}  ${actionToogleCurrentHTML}
    </a>${actionTooglelink}`
    return accu + html
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var leftMenu = createLeftMenu()
// leftMenu.init()
