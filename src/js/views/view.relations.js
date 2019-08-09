var createRelationsView = function () {
  var self ={};
  var objectIsActive = false;
  var activeMode = 'relations'


  var displayType = "network";
  var activeGraph = undefined;
  var fixedValues = undefined;
  var fadeOtherNodesOnHoover =false;
  var lastSelectedNode = undefined;
  var previousSelectedNode = undefined;
  var addLinkMode = false;
  var itemsToFixAtNextUpdate = []

  var currentGraphTransformation=[0,0,1]
  var addMode = "compose";
  var addItemMode ="currentPbs"
  //What to show
  var hiddenItemsFromSideView = [];
  var showVisibilityMenu = false;
  var showVisibilityMenuSnapshot = true;

  var showExtraLabels = true;
  var showLinksText = true;

  var elementVisibility = {
    functions : true,
    requirements : true,
    stakeholders : true,
    physicalSpaces : false,
    metaLinks : true,
    interfaces : false,
    compose : false
  }

  var groupElements={
    functions: false,
    requirements: false,
    stakeholders: false,
    pbs:  false
  }
  var defaultElementVisibility = { //todo: why default and not default? An object freeze is used somwhere. not default coud start blank?
    functions : true,
    requirements : true,
    stakeholders : true,
    physicalSpaces : false,
    metaLinks : true,
    interfaces : false,
    compose : false
  }

  var defaultGroupElements={
    functions: false,
    requirements: false,
    stakeholders: false,
    pbs:  false,
    physicalSpaces : false,
  }

  var currentSnapshot=undefined
  var recentSnapshot=undefined

  var itemsToDisplay = []
  var relations = []

  var sideListe = undefined

  var container = undefined

  var theme={
    viewListItem:(item) => {
      if (item) {
        let cardHtml = `
        <img style="width: 170px;" class="ui tiny image" src="${item.preview? item.preview:""}">
         `
       let html = `
        <div style="margin: 1px;" class="ui mini basic icon buttons">
          <button style="width:95px;" data-id="${item.uuid}" class="ui mini basic button action_relations_load_view"  data-tooltip="${item.name? item.name: ""}" data-position="bottom center" data-inverted="">
            <i data-id="${item.uuid}" class="icon camera"></i>
            ${item.name? item.name.substring(0, 8)+"..": item.name}
          </button>
          <button data-id="${item.uuid}" class="ui button action_relations_update_snapshot"><i data-id="${item.uuid}" class="save icon "></i></button>
          <button data-id="${item.uuid}" class="ui button action_relations_remove_snapshot"><i data-id="${item.uuid}" class="times circle outline icon "></i></button>
        </div>
        `

      return cardHtml+html
    }else {
      return ''
    }

    },
    viewListOptions:() => {
     let html = `
      <div class="ui mini basic buttons">
        <button data-id="" class="ui mini basic button action_relations_add_snap_view">
          <i class="icon plus"></i>
          Add
        </button>
        <button data-id="" class="ui mini basic button action_relations_reset_view">
          <i class="icon sync"></i>
          reset
        </button>
      </div>
      <div class="ui divider"></div>
      `
    return html
  },
      quickstartView:(cards) => {
       let html = `
        <div class="ui center aligned basic segment">
          <h3>Create a graph of the project or show an existing one</h3>
          <div style="width: 80%;margin-left: 10%;" class="ui cards">
           ${theme.quickStartLastViewItem("redo","Reload","Go to last WIP graph","action_relations_qs_show_last_view")}
           ${theme.quickStartLastViewItem("sitemap","Whole Project","Create a graph of the whole project","action_relations_qs_show_whole_project")}
           ${theme.quickStartLastViewItem("search","Focus","Create a graph focused on a product","action_relations_qs_start_from_element")}
           ${theme.quickStartLastViewItem("file outline","New","Start from an empty graph","action_relations_qs_create_new_empty")}
           ${cards}
           </div>
        <div>
        `
      return html
    },
    quickStartItem:(item) => {

      let html = `
      <div class="card">
        <div class="content">
          <img style="width: 170px;" class="ui tiny image" src="${item.preview? item.preview:""}">
          <div class="header">
            ${item.name}
          </div>
          <div class="meta">
            ${"Last modified "+ moment(item.addedDate).format("MMMM Do YY")}
          </div>
          <div class="description">
            ${item.nodesPositions? "Showing "+item.nodesPositions.length+" items":""}
          </div>
        </div>
        <div class="extra content">
          <div class="ui two mini buttons">
          <div data-id="${item.uuid}" class="ui basic grey button action_relations_qs_show_snapshot">
            Load
          </div>
            <div data-id="${item.uuid}" class="ui basic grey red button action_relations_qs_remove_snapshot">remove</div>
          </div>
        </div>
      </div>`


    return html
  },
    quickStartLastViewItem:(icon, button, desc, action) => {
      let html = `
      <div class="ui raised link card ${action}">

        <div class="content">
          <img style="width: 170px;" class="ui tiny image" src="">
          <div class="header">
          <i class="large ${icon} icon"></i>
          </div>
          <div class="meta">

          </div>
          <div class="description">
            ${desc}
          </div>
        </div>
        <div class="ui teal bottom attached button ${action}">
          ${button}
        </div>
      </div>`
    return html
    }
  }



  var init = function (options) {
    // there is multiple mode in this view. default one
    //is relation. This is modified by the init param when non-default view is triggered
    if (options && options.context && options.context == "interfaces") {
      delfaultElementVisibility = {functions : false,requirements : false,  stakeholders : false, metaLinks : true, interfaces : true, compose : true }
      elementVisibility = {functions : false,requirements : false,  stakeholders : false, metaLinks : true, interfaces : true, compose : true }
      activeMode = 'interfaces'
      addItemMode = "currentPbs"
    }




  }
  var connections =function (container) {//TODO rename everyting with _Relations_
    bind(".action_interface_toogle_state","click",(e)=>{
      displayType = "state"
      update()
    }, container)
    bind(".action_interface_toogle_network","click",(e)=>{
      displayType = "network"
      update()
    }, container)
    bind(".action_relations_toogle_group_functions","click",(e)=>{ groupElements.functions = !groupElements.functions; update(); }, container)
    bind(".action_relations_toogle_group_requirements","click",(e)=>{ groupElements.requirements = !groupElements.requirements; update(); }, container)
    bind(".action_relations_toogle_group_stakeholders","click",(e)=>{ groupElements.stakeholders = !groupElements.stakeholders; update(); }, container)
    bind(".action_relations_toogle_group_pbs","click",(e)=>{ groupElements.pbs = !groupElements.pbs; update(); }, container)
    bind(".action_relations_toogle_group_physicalSpaces","click",(e)=>{ groupElements.physicalSpaces = !groupElements.physicalSpaces; update(); }, container)

    bind(".action_relations_toogle_show_functions","click",(e)=>{ elementVisibility.functions = !elementVisibility.functions; update(); }, container)
    bind(".action_relations_toogle_show_requirements","click",(e)=>{ elementVisibility.requirements = !elementVisibility.requirements; update(); }, container)
    bind(".action_relations_toogle_show_stakeholders","click",(e)=>{ elementVisibility.stakeholders = !elementVisibility.stakeholders; update(); }, container)
    bind(".action_relations_toogle_show_physicalSpaces","click",(e)=>{ elementVisibility.physicalSpaces = !elementVisibility.physicalSpaces; update(); }, container)
    bind(".action_relations_toogle_show_metalinks","click",(e)=>{ elementVisibility.metaLinks = !elementVisibility.metaLinks; update(); }, container)
    bind(".action_relations_toogle_show_interfaces","click",(e)=>{ elementVisibility.interfaces = !elementVisibility.interfaces; update(); }, container)
    bind(".action_relations_toogle_show_compose","click",(e)=>{ elementVisibility.compose = !elementVisibility.compose; update(); }, container)

    bind(".action_interface_add_stakeholder","click",(e)=>{
      addItemMode = 'stakeholders'
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_stakeholder").classList.add('active')
    }, container)
    bind(".action_relations_export_png","click",(e)=>{
      saveSvgAsPng(container.querySelector('.stellae-graph'), "tree.png", {scale: 2})
    }, container)
    bind(".action_tree_list_relations_toogle_visibility","click",(e)=>{
      let controlChildrenVisibility = true;
      let current = e.target
      let linkedNodeId = current.dataset.id
      let linkedNodeLabel = current.dataset.label
      let isVisible = !hiddenItemsFromSideView.includes(linkedNodeId)
      if (isVisible) {
        //Then HIDE
        hiddenItemsFromSideView.push(linkedNodeId)
        //propagate
        if (controlChildrenVisibility == true) {
          let children = current.parentNode.parentNode.nextElementSibling.querySelectorAll('.action_tree_list_relations_toogle_visibility')
          for (var i = 0; i < children.length; i++) {
            let child = children[i];let linkedChildId = child.dataset.id;let isVisible = !hiddenItemsFromSideView.includes(linkedChildId)
            if (isVisible && child.dataset.label == linkedNodeLabel) {hiddenItemsFromSideView.push(linkedChildId)}
          }
        }
      }else {
        //Then SHOW
        hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, linkedNodeId)
        //propagate
        if (controlChildrenVisibility == true) {
          let children = current.parentNode.parentNode.nextElementSibling.querySelectorAll('.action_tree_list_relations_toogle_visibility')
          for (var i = 0; i < children.length; i++) {
            let child = children[i];let linkedChildId = child.dataset.id;let isVisible = !hiddenItemsFromSideView.includes(linkedChildId)
            if (!isVisible && child.dataset.label == linkedNodeLabel) {  hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, linkedChildId)  }
          }
        }
        // current.classList.remove('fa-eye')
        // current.classList.add('fa-eye-slash')
      }

      update()
    }, listContainer)
    bind(".action_relations_show_all_nodes_in_view","click",(e)=>{

      // let children = document.querySelector('.left-list').querySelectorAll('.action_tree_list_relations_toogle_visibility')
      // for (var i = 0; i < children.length; i++) {
      //   let child = children[i];let linkedChildId = child.dataset.id;
      //
      //   let isVisible = !hiddenItemsFromSideView.includes(linkedChildId)
      //   if (!isVisible) {  hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, linkedChildId)  }
      // }
      updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
      hiddenItemsFromSideView = []
      update()
    }, container)
    bind(".action_relations_hide_all_nodes_in_view","click",(e)=>{

      // let children = document.querySelector('.left-list').querySelectorAll('.action_tree_list_relations_toogle_visibility')
      // for (var i = 0; i < children.length; i++) {
      //   let child = children[i];let linkedChildId = child.dataset.id;let isVisible = !hiddenItemsFromSideView.includes(linkedChildId)
      //   if (isVisible && child.dataset.label) {hiddenItemsFromSideView.push(linkedChildId)}
      // }

      updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
      hiddenItemsFromSideView = itemsToDisplay.map(i=>i.uuid)
      update()
    }, container)
    bind(".action_relations_toogle_show_graph_menu","click",(e)=>{
      var elem = queryDOM('.menuGraph')
      if (elem.classList.contains('hidden')) {
        elem.classList.remove('hidden')
        showVisibilityMenu = true
      }else{
        elem.classList.add('hidden')
        showVisibilityMenu = false
      }
    }, container)

    bind(".action_relations_toogle_show_graph_snapshot_menu","click",(e)=>{
      var elem = queryDOM('.menuSnapshotGraph')
      console.log(elem);
      if (elem.classList.contains('hidden')) {
        elem.classList.remove('hidden')
        queryDOM('.action_relations_toogle_show_graph_snapshot_menu').classList.add('active')
        showVisibilityMenuSnapshot = true
      }else{
        elem.classList.add('hidden')
        queryDOM('.action_relations_toogle_show_graph_snapshot_menu').classList.remove('active')
        showVisibilityMenuSnapshot = false
      }
    }, container)
    bind(".action_interface_add_requirement","click",(e)=>{
      addItemMode = 'requirements'
      console.log(document.querySelectorAll(".add_relations_nodes"));
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_requirement").classList.add('active')
    }, container)
    bind(".action_interface_add_functions","click",(e)=>{
      addItemMode = 'functions'
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_functions").classList.add('active')
    }, container)
    bind(".action_interface_set_new_metalink_mode","click",(e)=>{
      lastSelectedNode = undefined;
      previousSelectedNode = undefined;
      addLinkMode = !addLinkMode
      renderMenu()
    }, container)
    bind(".action_interface_add_new_metalink","click",(e)=>{
      addLinkMode = !addLinkMode
      linkNodes(lastSelectedNode,previousSelectedNode)
      update()
    }, container)
    bind(".action_interface_add_pbs","click",(e)=>{
      addItemMode = 'currentPbs'
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_pbs").classList.add('active')
    }, container)

    bind(".action_relations_add_nodes_from_templates","click",(e)=>{
      let store = query.currentProject()
      showListMenu({
        sourceData:store.templates.items,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"Name", edit:"true"}
        ],
        onEditItem: (ev)=>{
          console.log("Edit");
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            push(act.edit("templates", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          }
        },
        onRemove: (ev)=>{
          if (confirm("remove item ?")) {
            push(act.remove("templates",{uuid:ev.target.dataset.id}))
            ev.select.updateData(store.templates.items)
          }
        },
        idProp:"uuid",
        extraButtons : [
          {name:"Select", class:"select", prop:"uuid", action: (orev)=>{

            loadFromTemplate(orev.dataset.id)
          }}
        ],
      })

      function loadFromTemplate(id) {
        let store = query.currentProject()
        let template = store.templates.items.find(t=>t.uuid == id).template
        let selectedNodes = template.nodes
        let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
        let selectedNodesUuidConversion = selectedNodes.map(n=>[n.uuid, genuuid()])
        let convertUuid = function (convTable) {
          return function (id) {
            return convTable.find(i=>i[0] == id)[1]
          }
        }(selectedNodesUuidConversion)//convert uuid to predictable new ones to avoid issues with relations links
        //duplicate and add
        let extraText = ""
        if (confirm("Modify object names to mark them as copies?")) {
          extraText = "-copy"
        }
        selectedNodes.forEach(function (node) {
          if (node.uuid) {
            let storeGroup = node.storeGroup
            let elementToDuplicate = node
            if (elementToDuplicate) {
              var id = convertUuid(node.uuid)
              let newElement = deepCopy(elementToDuplicate)        //first get a clean node copy
              newElement.uuid = id
              newElement.name = newElement.name +extraText
              push(act.add(storeGroup,newElement))
              if (storeGroup == "currentPbs") {
                //check if parent is copied too
                let hasParent = template.relatedLocalLinks.find(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

                if (!hasParent) {
                  push(act.addLink(storeGroup,{source:query.currentProject().currentPbs.items[0].uuid, target:id}))
                }
              }

              //find and duplicate links
              let metaLinksToSearch =template.relatedLinks
              let relatedLinks = metaLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

              let catLinksToSearch =template.relatedCatLinks
              let relatedCatLinks = catLinksToSearch.filter(l=>l.type=="category"&&l.source == node.uuid)

              let interfacesToSearch =template.relatedInterfaceLinks
              let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
              // let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid)||(selectedNodesUuid.includes(l.target)&&l.source == node.uuid))

              let localLinksToSearch =template.relatedLocalLinks
              let relatedLocalLinks = localLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
              // let relatedLocalLinks = localLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid)||(selectedNodesUuid.includes(l.target)&&l.source == node.uuid))


              relatedLinks.forEach(function (l) {
                push(act.add("metaLinks",{type:l.type, source:convertUuid(l.source), target:convertUuid(l.target)}))
              })
              deepCopy(relatedCatLinks).forEach(function (l) {
                push(act.add("metaLinks",{type:l.type, source:convertUuid(l.source), target:l.target}))
              })

              deepCopy(relatedInterfaceLinks).forEach(function (il) {
                push(act.add("interfaces",{type:il.type, name:il.name,description:il.description, source:convertUuid(il.source), target:id}))
              })
              deepCopy(relatedLocalLinks).forEach(function (il) {
                push(act.addLink("currentPbs",{source:convertUuid(il.source), target:id}))
              })

            }
          }
        })
        update()
      }



      // isolateSelectedNodes(selectedNodes, false)
    }, container)
    bind(".action_relations_duplicate_nodes","click",(e)=>{
      let store = query.currentProject()

      let selectedNodes = activeGraph.getSelectedNodes()
      let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
      let selectedNodesUuidConversion = selectedNodes.map(n=>[n.uuid, genuuid()])
      let convertUuid = function (convTable) {
        return function (id) {
          return convTable.find(i=>i[0] == id)[1]
        }
      }(selectedNodesUuidConversion)//convert uuid to predictable new ones to avoid issues with relations links

      //duplicate and add
      let extraText = ""
      if (confirm("Modify object names to mark them as copies?")) {
        extraText = "-copy"
      }
      selectedNodes.forEach(function (node) {
        if (node.uuid) {
          let storeGroup = getObjectGroupByUuid(node.uuid)
          let elementToDuplicate = query.items("all", i=> i.uuid == node.uuid)[0]
          if (elementToDuplicate) {
            var id = convertUuid(node.uuid)
            let newElement = deepCopy(elementToDuplicate)        //first get a clean node copy
            newElement.uuid = id
            newElement.name = newElement.name +extraText
            push(act.add(storeGroup,newElement))
            if (storeGroup == "currentPbs") {
              //check if parent is copied too
              let hasParent = store.currentPbs.links.find(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
              if (!hasParent) {
                push(act.addLink(storeGroup,{source:query.currentProject().currentPbs.items[0].uuid, target:id}))
              }
            }

            //find and duplicate links
            let metaLinksToSearch =query.items("metaLinks")
            let relatedLinks = metaLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

            let catLinksToSearch =query.items("metaLinks").filter(l=>l.type=="category")
            let relatedCatLinks = catLinksToSearch.filter(l=>l.type=="category"&&l.source == node.uuid)

            let interfacesToSearch =query.items("interfaces")
            let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
            // let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid)||(selectedNodesUuid.includes(l.target)&&l.source == node.uuid))

            let localLinksToSearch =store[storeGroup].links
            let relatedLocalLinks = localLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
            // let relatedLocalLinks = localLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid)||(selectedNodesUuid.includes(l.target)&&l.source == node.uuid))

            console.log(relatedCatLinks);
            relatedLinks.forEach(function (l) {
              push(act.add("metaLinks",{type:l.type, source:convertUuid(l.source), target:convertUuid(l.target)}))
            })
            deepCopy(relatedCatLinks).forEach(function (l) {
              push(act.add("metaLinks",{type:l.type, source:convertUuid(l.source), target:l.target}))
            })

            deepCopy(relatedInterfaceLinks).forEach(function (il) {
              push(act.add("interfaces",{type:il.type, name:il.name,description:il.description, source:convertUuid(il.source), target:id}))
            })
            deepCopy(relatedLocalLinks).forEach(function (il) {
              push(act.addLink("currentPbs",{source:convertUuid(il.source), target:id}))
            })

            console.log(relatedInterfaceLinks, relatedLocalLinks);
          }
        }
      })
      update()

      // isolateSelectedNodes(selectedNodes, false)
    }, container)
    bind(".action_relations_store_nodes_as_templates","click",(e)=>{
      let store = query.currentProject()
      let selectedNodes = activeGraph.getSelectedNodes()
      let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
      let selectedNodesUuidConversion = selectedNodes.map(n=>[n.uuid, genuuid()])
      let convertUuid = function (convTable) {
        return function (id) {
          return convTable.find(i=>i[0] == id)[1]
        }
      }(selectedNodesUuidConversion)//convert uuid to predictable new ones to avoid issues with relations links
      //duplicate and add
      let template = {
        nodes:[],
        relatedLinks:[],
        relatedCatLinks:[],
        relatedInterfaceLinks:[],
        relatedLocalLinks:[]
      }
      let extraText = "";
      selectedNodes.forEach(function (node) {
        if (node.uuid) {
          let storeGroup = getObjectGroupByUuid(node.uuid)
          let elementToDuplicate = query.items("all", i=> i.uuid == node.uuid)[0]
          if (elementToDuplicate) {
            var id = convertUuid(node.uuid)
            let newElement = deepCopy(elementToDuplicate)        //first get a clean node copy
            newElement.uuid = id
            newElement.name = newElement.name +extraText
            newElement.storeGroup = storeGroup
            template.nodes.push(newElement)
            if (storeGroup == "currentPbs") {
              //check if parent is copied too
              let hasParent = store.currentPbs.links.find(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
              if (!hasParent) {
                // template.links.push({source:query.currentProject().currentPbs.items[0].uuid, target:id})
              }
            }
            //find and duplicate links
            let metaLinksToSearch =query.items("metaLinks")
            let relatedLinks = metaLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

            let catLinksToSearch =query.items("metaLinks").filter(l=>l.type=="category")
            let relatedCatLinks = catLinksToSearch.filter(l=>l.type=="category"&&l.source == node.uuid)

            let interfacesToSearch =query.items("interfaces")
            let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

            let localLinksToSearch =store[storeGroup].links
            let relatedLocalLinks = localLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

            relatedLinks.forEach(function (l) {
              template.relatedLinks.push({type:l.type, source:convertUuid(l.source), target:convertUuid(l.target)})
            })
            deepCopy(relatedCatLinks).forEach(function (l) {
              template.relatedCatLinks.push({type:l.type, source:convertUuid(l.source), target:l.target})
            })

            deepCopy(relatedInterfaceLinks).forEach(function (il) {
              template.relatedInterfaceLinks.push({type:il.type, name:il.name,description:il.description, source:convertUuid(il.source), target:id})
            })
            deepCopy(relatedLocalLinks).forEach(function (il) {
              template.relatedLocalLinks.push({source:convertUuid(il.source), target:id})
            })

          }
        }
      })

      // isolateSelectedNodes(selectedNodes, false)
      push(act.add("templates",{name:prompt("Add a new Template"), template:template}))
      console.log(template);
    }, container)

    bind(".action_relations_isolate_nodes","click",(e)=>{
      let selectedNodes = activeGraph.getSelectedNodes()
      isolateSelectedNodes(selectedNodes, false)
    }, container)
    bind(".action_relations_isolate_nodes_and_children","click",(e)=>{
      let selectedNodes = activeGraph.getSelectedNodes()
      isolateSelectedNodes(selectedNodes, true)
    }, container)
    bind(".action_relations_remove_nodes","click",(e)=>{
      let selectedNodes = activeGraph.getSelectedNodes()
      deleteSelectedNodes(selectedNodes, true)
    }, container)
    bind(".action_restore_last_interface_toogle_network","click",(e)=>{
      toggleFixedGraph()
    }, container)
    bind(".action_relations_load_view","click",(e)=>{
      setTimeout(function () {
        setSnapshot(e.target.dataset.id)
      }, 1);
    }, container)
    bind(".action_relations_reset_view","click",(e)=>{
      function setReset() {
        fixedValues = false
        hiddenItemsFromSideView= []
        groupElements= deepCopy(defaultGroupElements);//prevent memory space linking between graph and view TODO investigate why needed here and in save
        elementVisibility= deepCopy(defaultElementVisibility);
        currentSnapshot = undefined
        update()
      }
      function setResetInterfaces() {
        fixedValues = false
        update()
      }
      setTimeout(function () {
        if (activeMode == "interfaces") {
          setResetInterfaces()
        }else {
          setReset()
        }
        //fix graph after a few seconds
        setTimeout(function () {
          setGraphToFixed()
        }, 1900);

      }, 1);
    }, container)
    bind(".action_relations_add_snap_view","click",(e)=>{
      let snapshotName = prompt("Add a Snapshot")
      let useImages = true // create a snsphot when saving graph
      if (useImages) {
        svgAsPngUri(container.querySelector('.stellae-graph'),{scale: 0.1}).then(function (uri) {
          let snapId = uuid()
          resizeCropImage(uri, function (uri) {
            let graphItem = {uuid:snapId, preview:uri, view:activeMode, name:snapshotName, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
            push(act.add("graphs", graphItem))
            setSnapshot(snapId)
          })
        })
      }else {
        let snapId = uuid()
        let graphItem = {uuid:genuuid(), view:activeMode, name:snapshotName, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
        push(act.add("graphs", graphItem))
        setSnapshot(snapId)
      }
    }, container)

    bind(".action_relations_remove_snapshot","click",(e)=>{
      if (confirm("Delete this snapshot")) {
        push(act.remove("graphs", {uuid:e.target.dataset.id}))
        update()
      }
    }, container)
    bind(".action_relations_update_snapshot","click",(e)=>{
      if (confirm("Update this snapshot")) {
        let useImages = true // create a snsphot when saving graph

        let graph = query.currentProject().graphs.items.find(i=> i.uuid == e.target.dataset.id)

        if (useImages) {
          svgAsPngUri(container.querySelector('.stellae-graph'),{scale: 0.1}).then(function (uri) {
            resizeCropImage(uri, function (uri) {
              let snapId = uuid()
              let newGraphItem = {uuid:snapId,preview:uri, view:activeMode, name:graph.name, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
              push(act.remove("graphs", {uuid:e.target.dataset.id}))
              push(act.add("graphs", newGraphItem))
              setSnapshot(snapId)
            })
          })
        }else {
          let snapId = uuid()
          let newGraphItem = {uuid:snapId,view:activeMode, name:graph.name, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
          push(act.remove("graphs", {uuid:e.target.dataset.id}))
          push(act.add("graphs", newGraphItem))
          setSnapshot(snapId)
        }
      }
    }, container)
    bind(".action_fade_other_node_toogle_network","change",(e)=>{
      console.log(e.target.value);
      fadeOtherNodesOnHoover = !fadeOtherNodesOnHoover
      activeGraph.setFadeOtherNodesOnHoover(fadeOtherNodesOnHoover)
      if (!queryDOM('.action_fade_other_node_toogle_network_button').classList.contains('active')) {
        queryDOM('.action_fade_other_node_toogle_network_button').classList.add('active')
      }else {
        queryDOM('.action_fade_other_node_toogle_network_button').classList.remove('active')
      }
    }, container)
    bind(".action_fade_other_node_toogle_network_button","click",(e)=>{
      console.log(e.target.value);
      fadeOtherNodesOnHoover = !fadeOtherNodesOnHoover
      activeGraph.setFadeOtherNodesOnHoover(fadeOtherNodesOnHoover)
      console.log(queryDOM('.action_fade_other_node_toogle_network_button'));
      if (!queryDOM('.action_fade_other_node_toogle_network_button').classList.contains('active')) {
        queryDOM('.action_fade_other_node_toogle_network_button').classList.add('active')
      }else {
        queryDOM('.action_fade_other_node_toogle_network_button').classList.remove('active')
      }
    }, container)
    bind(".action_relations_show_extra_labels","click",(e)=>{
      console.log(e.target.value);
      showExtraLabels = !showExtraLabels
      update()
    }, container)
    bind(".action_relations_show_current_matrix","click",(e)=>{
      let nodes = itemsToDisplay.filter(i=> !hiddenItemsFromSideView.includes(i.uuid))
      showOccurrenceDiagramService.show(nodes.filter(r=>getObjectGroupByUuid(r.uuid) == "currentPbs"), relations.filter(r=>r.type=="Physical connection"))

    }, container)
    bind(".action_relations_toogle_links_text","click",(e)=>{
      console.log(e.target.value);
      showLinksText = !showLinksText
      update()
    }, container)

    //INTERFACES MENU connections
    bind(".action_interfaces_toogle_compose","click",(e)=>{
      addMode = "compose"
      if (!queryDOM('.action_interfaces_toogle_compose').classList.contains('active')) {
        queryDOM('.action_interfaces_toogle_compose').classList.add('active')
        queryDOM('.action_interfaces_toogle_physical').classList.remove('active')
      }else {
        queryDOM('.action_interfaces_toogle_compose').classList.remove('active')
      }
      // update()
    }, container)
    bind(".action_interfaces_toogle_physical","click",(e)=>{
      addMode = "physical"
      if (!queryDOM('.action_interfaces_toogle_physical').classList.contains('active')) {
        queryDOM('.action_interfaces_toogle_physical').classList.add('active')
        queryDOM('.action_interfaces_toogle_compose').classList.remove('active')
      }else {
        queryDOM('.action_interfaces_toogle_physical').classList.remove('active')
      }
      // update()
    }, container)
    bind(".action_interfaces_add_pbs","click",(e)=>{
      var id = genuuid()
      var newReq = prompt("Nouveau Besoin")
      push(addPbs({uuid:id, name:newReq}))
      push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:id}))
      //activeGraph.updateWithD3Data(data);
      update()
    }, container)
    bind(".action_interfaces_toogle_show_compose","click",(e)=>{
        elementVisibility.compose = !elementVisibility.compose
        update()
    }, container)
    bind(".action_interfaces_toogle_show_interfaces","click",(e)=>{
        elementVisibility.interfaces = !elementVisibility.interfaces
        update()
    }, container)

  }

  var quickstartConnections = function (container) {
    bind(".action_relations_qs_show_snapshot","click",(e)=>{
      setTimeout(function () {
        setSnapshot(e.target.dataset.id)
      }, 1);
    }, container)
    bind(".action_relations_qs_remove_snapshot","click",(e)=>{
      if (confirm("Delete this snapshot")) {
        push(act.remove("graphs", {uuid:e.target.dataset.id}))
        renderQuickstart()
      }
    }, container)
    bind(".action_relations_qs_show_last_view","click",(e)=>{
      update()
    }, container)
    bind(".action_relations_qs_start_from_element","click",(e)=>{
      let store = query.currentProject()
      let elements = store.currentPbs.items
      let elementsLinks = store.currentPbs.links
      showListMenu({
        sourceData:elements,
        sourceLinks:elementsLinks,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true,edit:false},
          {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks.items, choices:()=>store.tags.items, edit:false},
          {prop:"WpOwn",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks.items, choices:()=>store.workPackages.items, edit:false}

        ],
        idProp:"uuid",
        extraButtons : [
          {name:"show", class:"show", prop:"uuid", closeAfter:true, action: (orev)=>{
            if (activeMode=="interfaces") {//TODO should use default
              elementVisibility = {functions : false,requirements : false,  stakeholders : false, metaLinks : true, interfaces : true, compose : true }
            }else {
              elementVisibility = {
                functions : true,
                requirements : true,
                stakeholders : true,
                physicalSpaces : true,
                metaLinks : true,
                interfaces : false,
                compose : true
              }
            }
            fixedValues = false
            hiddenItemsFromSideView= []
            currentSnapshot = undefined
            updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
            isolateSelectedNodes([{uuid:orev.dataset.extra}], true)

          }}
        ],
        onEditItem: (ev)=>{
        },
        onClick: (ev)=>{
        }
      })
    }, container)
    bind(".action_relations_qs_show_whole_project","click",(e)=>{
      function setReset() {
        fixedValues = false
        hiddenItemsFromSideView= []
        groupElements= deepCopy(defaultGroupElements);//prevent memory space linking between graph and view TODO investigate why needed here and in save
        elementVisibility= deepCopy(defaultElementVisibility);
        currentSnapshot = undefined
        update()
      }
      function setResetInterfaces() {
        fixedValues = false
        hiddenItemsFromSideView= []
        update()
      }
      setTimeout(function () {
        if (activeMode == "interfaces") {
          setResetInterfaces()
        }else {
          setReset()
        }
        //fix graph after a few seconds
        setTimeout(function () {
          setGraphToFixed()
        }, 1900);
      }, 1);
    }, container)
    bind(".action_relations_qs_create_new_empty","click",(e)=>{
      if (activeMode=="interfaces") {//TODO should use default
        elementVisibility = {functions : false,requirements : false,  stakeholders : false, metaLinks : true, interfaces : true, compose : true }
      }else {
        elementVisibility = {
          functions : true,
          requirements : true,
          stakeholders : true,
          physicalSpaces : true,
          metaLinks : true,
          interfaces : true,
          compose : true
        }
      }

      updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
      hiddenItemsFromSideView = itemsToDisplay.map(i=>i.uuid)
      update()
      setTimeout(function () {
        if (activeGraph) {
          setGraphToFixed()
        }
      }, 1900);
    }, container)
  }

  var render = function () {

    container = document.createElement("div")
    container.style.height = "100%"

    listContainer = document.createElement("div")
    document.querySelector(".left-list").appendChild(listContainer)
    connections(container)
    //update all connections at each render. otherwise multiple views share the updae

    var store = JSON.stringify(query.currentProject())
    store = JSON.parse(store)
    container.innerHTML=`
      <div class='menuArea'></div>
      <div style="height: calc(100% - 45px); position: relative" class='graphArea'>
        <div style="height: 100%" class="interfaceGraph"></div>
        <div style="opacity: 0.85;height: 99%;width: 250px;position: absolute;right:0px;top:1px;background-color: white; overflow-y:auto;overflow-x: hidden;" class="${showVisibilityMenu ? '':'hidden'} menuGraph"></div>
        <div style="opacity: 0.85;height: 99%;width: 210px;position: absolute;left:0px;top:1px;background-color: white; overflow-y:auto;overflow-x: hidden;" class="${showVisibilityMenuSnapshot ? '':'hidden'} menuSnapshotGraph"></div>
      </div>`

    renderMenu(container)

    //append container and add graph afterward //TODO should be reveresed

    document.querySelector(".center-container").innerHTML=''
    document.querySelector(".center-container").appendChild(container)

    //render graph
    //reset items to display component var

    updateItemsToDisplayAndRelations(elementVisibility)

    //remove hidden items from tree

    let filteredItemsToDisplay = itemsToDisplay.filter(i=> !hiddenItemsFromSideView.includes(i.uuid))
    //copy relations
    let relationToDisplay = relations.concat([])

    var groupLinks =[]
    var initIndex = 0
    var currentIndex = 0
    // check the elements that should be grouped together
    //TODO not connected to stellae.. REDO
    var groups = []
    currentGroupedLabels = []


    if (groupElements.requirements) { currentGroupedLabels.push('Requirements')}
    if (groupElements.functions) { currentGroupedLabels.push('Functions') };
    if (groupElements.stakeholders) { currentGroupedLabels.push('User') }
    if (groupElements.pbs) { currentGroupedLabels.push('Pbs') }
    if (groupElements.physicalSpaces) { currentGroupedLabels.push('physicalSpaces') }
    // if (groupElements.requirements) { groups.push(array3); currentGroupedLabels.push('Requirements')}
    // if (groupElements.functions) { groups.push(array1); currentGroupedLabels.push('Functions') };
    // if (groupElements.stakeholders) { groups.push(array4); currentGroupedLabels.push('User') }
    // if (groupElements.pbs) { groups.push(array2); currentGroupedLabels.push('Pbs') }

    for (group of groups) {
      var groupLinks1  = group.map((e)=>{
        currentIndex +=1;
        return {source: initIndex, target: currentIndex}
      })
      initIndex +=groupLinks1.length
      currentIndex = initIndex
      groupLinks = groupLinks.concat(groupLinks1)
      groupLinks.splice(-1,1)
    }

    if (displayType == "state") {
      var state = createStateDiagram({container:".interfaceGraph",data:concatData, links:store.metaLinks.items,positions :undefined, groupLinks:groupLinks})
      state.init()
    }else if(displayType == "network"){
      var fixedValuesList = []
      if (fixedValues) { //check if network is fixed or dynamic
        if (currentSnapshot) {// has a snapshot been activated
          fixedValuesList = query.currentProject().graphs.items.find(i=>i.uuid == currentSnapshot).nodesPositions

          if (fixedValuesList && itemsToDisplay && filteredItemsToDisplay.length-fixedValuesList.length > 0 ) {// if element to display are note the same as the snapshot
            if (!confirm(filteredItemsToDisplay.length-fixedValuesList.length +1 +" extra items have been added since this snapshot was created. Show them in the snapshot?")) {//TODO why is the +1 needed?

              let originalFilteredItemsToDisplay = deepCopy(filteredItemsToDisplay)
              let originalHiddenItemsFromSideView = deepCopy(hiddenItemsFromSideView)//store value before modyfing theme

              let extraFilter = fixedValuesList.map(e=>e.uuid)
              filteredItemsToDisplay= filteredItemsToDisplay.filter(f => extraFilter.includes(f.uuid)) //remove other nodes
              hiddenItemsFromSideView = hiddenItemsFromSideView.concat(originalFilteredItemsToDisplay.filter(f => !extraFilter.includes(f.uuid)).map(o=>o.uuid))//update the hidden item prop

              if (confirm('Check if new nodes are related to graph and show them?')) {
                let childrenFilter = findChildrenUuid(fixedValuesList, itemsToDisplay, relations)
                console.log(filteredItemsToDisplay);
                console.log(childrenFilter);
                filteredItemsToDisplay= originalFilteredItemsToDisplay.filter(f => childrenFilter.includes(f.uuid))
                hiddenItemsFromSideView = originalHiddenItemsFromSideView.concat(originalFilteredItemsToDisplay.filter(f => !childrenFilter.includes(f.uuid)).map(o=>o.uuid))
              }
            }
          }
          currentSnapshot = undefined//clear current snapshot

        }else if( activeMode =="relations") {// if not go to default
          if (query.currentProject().graphs && query.currentProject().graphs.default) {
            fixedValuesList = query.currentProject().graphs.default.nodesPositions ||query.currentProject().graphs.items[0] //check if graph is in DB backward compatibility (TODO: remove)
          }
          console.log("relations")
          // alert("relations")
        }else if (activeMode == 'interfaces') {
          if (query.currentProject().graphs && query.currentProject().graphs.interfaces) {
            fixedValuesList = query.currentProject().graphs.interfaces.nodesPositions
          }
          console.log("interfaces")
          // alert("interfaces")
        }
      }
      //concat with items to fix this time
      var allFixedValues = fixedValuesList.concat(itemsToFixAtNextUpdate)
      itemsToFixAtNextUpdate = []//clear buffer of new objects to be fixed
      allFixedValues.forEach(f =>{
        var match = filteredItemsToDisplay.find(c => c.uuid == f.uuid)
        if (match) {
          match.fx =f.fx ; match.x =f.fx;
          match.fy=f.fy; match.y =f.fy;
        }
      })



      renderforcesTree({nodes:filteredItemsToDisplay, relationships:relationToDisplay, groupLinks:groupLinks})
    }
    // console.log(sideListe);
    // console.log(document.querySelector(".tree_list_area"));
    // console.log(!document.querySelector(".tree_list_area")==null);
    // console.log(sideListe && !document.querySelector(".tree_list_area")==null);
    if (sideListe && document.querySelector(".tree_list_area")) {
      udapteSideListe()
    }else {
      renderSideListe()
    }
  }

  var renderSideListe = function () {
    document.querySelector('.left-menu-area > .title').innerHTML="Overview"
    sideListe = createTreeList({
      container:listContainer,
      searchContainer:document.querySelector(".side_searchArea"),
      items: itemsToDisplay,
      links:relations,
      customEyeActionClass:"action_tree_list_relations_toogle_visibility",
      customExtraActionClass:"fas fa-link action_toogle_diag_relations_options",
      customTextActionClass:"action_LM_project_tree_show_item_popup"//works because event listener is specified in leftmenu.projectTree
    })
    updateSideListeVisibility()
  }

  var udapteSideListe = function () {
    sideListe.refresh(itemsToDisplay, relations)
    updateSideListeVisibility()
  }

  var updateSideListeVisibility = function () {//TODO integrate in list tree
    let elementList = document.querySelector(".left-list").querySelectorAll('.action_tree_list_relations_toogle_visibility')
    for (var i = 0; i < elementList.length; i++) {
      let current = elementList[i]
      let linkedNodeId = current.dataset.id
      let isVisible = !hiddenItemsFromSideView.includes(linkedNodeId)
      if (isVisible) {
        current.classList.add('fa-eye')
        current.classList.remove('fa-eye-slash')
      }else {
        current.classList.remove('fa-eye')
        current.classList.add('fa-eye-slash')
      }

    }
  }
  function findChildrenUuid(roots,items, links) {
    return roots.reduce(function (acc, r) {
      console.log(acc);
      let rootArray = [r.uuid]
      let itemsChildren = items.filter((i) => {//get all the children of this element
        return links.find((l)=> {
          if (l.source.uuid) {return l.source.uuid == r.uuid && l.target.uuid == i.uuid//check if links source is object
          }else { return l.source == r.uuid && l.target == i.uuid}//or ID
        })
      })
      //recursively trandform them in leaf and branches
      let thisitemChildrenArray = findChildrenUuid(itemsChildren,items, links)
      rootArray = rootArray.concat(thisitemChildrenArray)
      console.log(acc);
      return acc.concat(rootArray)
    }, [])
  }

  var isolateSelectedNodes = function (currentSelected, showChildren) {

    let selectedNodes = currentSelected
    let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
    let selectedNodesAndChildrenUuid = findChildrenUuid(selectedNodes, itemsToDisplay, relations)
    let stayVisibleNodes = showChildren? selectedNodesAndChildrenUuid : selectedNodesUuid
    hiddenItemsFromSideView=[] //resetGraph
    let newDisplayList= itemsToDisplay.filter( i => !stayVisibleNodes.includes(i.uuid))
    newDisplayList.forEach(function (item) {// hide everyting
      hiddenItemsFromSideView.push(item.uuid)
    })
    update()
  }
  var deleteSelectedNodes = function (currentSelected, showChildren) {
    var store = query.currentProject()
    let selectedNodes = currentSelected

    selectedNodes.forEach(function (n) {
      let nodeType = getObjectGroupByUuid(n.uuid)
      if (nodeType) {
        let object = store[nodeType].items.find(i=>i.uuid == n.uuid)
        if (confirm("Delete "+ object.name)) {
          push(act.remove(nodeType, {uuid:object.uuid}))
        }
      }
    })
    update()
  }

  var displaySideMenuFromSearch = function (filteredIds) {
    console.log(filteredIds);
    var searchedItems = document.querySelectorAll(".searchable_item.list-item")
    for (item of searchedItems) {
      if (filteredIds.includes(item.dataset.id) || !filteredIds[0]) {item.style.display = "block"}else{item.style.display = "none"}
    }

  }
  var getSvgPathFromItemId = function (uuid) {
    let cat = getCategoryFromItemUuid(uuid)
    if (cat) { return cat.svgPath
    }else { return undefined}
  }
  var updateItemsToDisplayAndRelations= function (elementVisibility) {//only side effect TODO: find a better way?
    var store = JSON.stringify(query.currentProject())
    store = JSON.parse(store)// TODO used multiple time. Should do it only once
    var array1 =store.functions.items.map((e) => {e.customColor="#ffc766";e.labels = ["Functions"]; return e})
    var array2 =store.currentPbs.items.map((e) => {e.customColor="#6dce9e";e.labels = ["Pbs"]; e.extraLabel=getSvgPathFromItemId(e.uuid); return e})
    var array3 = store.requirements.items.map((e) => {e.customColor="#ff75ea";e.labels = ["Requirements"]; return e})
    var array4 = store.stakeholders.items.map((e) => {e.customColor="#68bdf6 ";e.labels = ["User"]; e.properties= {"fullName": e.lastName}; return e})
    var array5 = store.physicalSpaces.items.map((e) => {e.customColor="#02b5ab ";e.labels = ["physicalSpaces"]; return e})

    itemsToDisplay = []
    itemsToDisplay = itemsToDisplay.concat(array2)
    if (elementVisibility.requirements) { itemsToDisplay = itemsToDisplay.concat(array3) }
    if (elementVisibility.functions) { itemsToDisplay = itemsToDisplay.concat(array1) }
    if (elementVisibility.stakeholders) { itemsToDisplay = itemsToDisplay.concat(array4) }
    if (elementVisibility.physicalSpaces) { itemsToDisplay = itemsToDisplay.concat(array5) }

    relations = []//checl what connection to display TODO store in func
    if (elementVisibility.metaLinks) {
      relations = relations.concat(store.metaLinks.items)
    }
    if (elementVisibility.interfaces ) {
      relations = relations.concat(store.interfaces.items.map((e) => {e.customColor="#6dce9e"; return e}))
    }
    if (elementVisibility.compose) {
      relations = relations.concat(store.currentPbs.links.map((e) => {e.type = "Composed by"; return e}))
      if (elementVisibility.physicalSpaces) {
        relations = relations.concat(store.physicalSpaces.links.map((e) => {e.type = "Contains"; return e}))
      }
      groupLinks = []//TODO WHat is the point?
    }
    //check if some relation are on the same nodes;
    var duplicates = []
    function isOverlap(ra, rb) {
      if (ra != rb) {
        return ((ra.source== rb.source && ra.target== rb.target ) || (ra.target== rb.source && ra.source== rb.target ))
      }
    }
    for (relation of relations) {
      if ( relations.find(e=>isOverlap(relation, e)) ) {
        var previouslyStored = duplicates.find(e=>isOverlap(relation, e))
        if (!previouslyStored) {
          duplicates.push({source:relation.source, target:relation.target, qty:1})
          relation.displacement = 6
        }else {//Why is it activated so much
          previouslyStored.qty ++
          relation.displacement = 6*previouslyStored.qty
        }
      }
    }
  }

  var renderQuickstart = function () {
    let quickstartContainer = document.createElement("div")
    quickstartContainer.style.height = "100%"

    //Add viewSelectionMenu
    let relationViews = query.currentProject().graphs.items
    console.log(relationViews);
    let viewMenuObjects =relationViews.slice()
    if (activeMode=="interfaces") {
      viewMenuObjects=viewMenuObjects.filter(v=>v.view == activeMode)
    }
    let viewMenuHtml = viewMenuObjects
      .sort(function(a, b) {
        if (a.name && b.name) {
          var nameA = a.name.toUpperCase(); // ignore upper and lowercase
          var nameB = b.name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {return -1;}
          if (nameA > nameB) {return 1;}
        }
        return 0;})
      .map(v=>theme.quickStartItem(v))
      .join('')


    quickstartContainer.innerHTML=theme.quickstartView(viewMenuHtml)

    document.querySelector(".center-container").innerHTML=""
    document.querySelector(".center-container").appendChild(quickstartContainer)

    quickstartConnections(quickstartContainer)
  }



  var update = function () {
    if (objectIsActive) {
      render()
    }
  }

  var setActive =function (options) {
    if (options && options.param) {
      if (options.param.context && options.param.context == "extract") {
        elementVisibility = {
          functions : true,
          requirements : true,
          stakeholders : true,
          physicalSpaces : true,
          metaLinks : true,
          interfaces : false,
          compose : true
        }
        objectIsActive = true;
        fixedValues = false
        hiddenItemsFromSideView= []
        currentSnapshot = undefined
        updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
        isolateSelectedNodes([{uuid:options.param.uuid}], true)
        //fix graph after a few seconds
        setTimeout(function () {
          if (activeGraph) {
            setGraphToFixed()
          }
        }, 1900);
      }
      if (options.param.context && options.param.context == "quickstart") {
        objectIsActive = true;
        updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
        renderQuickstart()
      }
    }else {
      objectIsActive = true;
      update()
      //fix graph after a few seconds
      setTimeout(function () {
        if (activeGraph) {
          setGraphToFixed()
        }
      }, 1900);
    }

  }

  var setInactive = function () {
    //clean side menu
    document.querySelector(".left-list").innerHTML=""
    document.querySelector(".side_searchArea").innerHTML=""
    objectIsActive = false;
  }

  var renderMenu=function (container) {
    let commonMenuHTML = `


    <div class="ui item">
      <div class="ui icon input">
        <input class="input_relation_search_nodes" type="text" placeholder="Search...">
        <i class="search icon"></i>
      </div>
    </div>

    <div class="ui item">
      <div class="ui toggle checkbox">
        <input ${fixedValues ? 'checked':''} class="action_restore_last_interface_toogle_network" type="checkbox" name="public">
        <label>Pinned Nodes</label>
      </div>
    </div>

    <div class="item">
      <div class="ui mini basic icon buttons">
        <button class="disabled ui basic icon button " >
          Tools
        </button>
        <button class="${showVisibilityMenuSnapshot ? 'active':''} ui basic icon button action_relations_toogle_show_graph_snapshot_menu" data-tooltip="Show Snapshot Tools" data-position="bottom center" >
          <i class="camera icon action_relations_toogle_show_graph_snapshot_menu"></i>
        </button>
        <button class="ui mini button action_relations_show_all_nodes_in_view" data-tooltip="Show All" data-position="bottom center">
          <i class="eye icon action_relations_show_all_nodes_in_view"></i>
        </button>
        <button class="ui mini button action_relations_hide_all_nodes_in_view" data-tooltip="Hide All" data-position="bottom center">
          <i class="eye slash icon action_relations_hide_all_nodes_in_view"></i>
        </button>
        <button class="ui mini button action_relations_isolate_nodes" data-tooltip="Crop selection" data-position="bottom center">
          <i class="crop icon action_relations_isolate_nodes"></i>
        </button>
        <button class="ui mini button action_relations_isolate_nodes_and_children" data-tooltip="Show only selected relations" data-position="bottom center">
          <i class="eye dropper icon action_relations_isolate_nodes_and_children"></i>
        </button>
        <div class="ui icon button action_relations_duplicate_nodes" data-tooltip="duplicate selected Product" data-position="bottom center">
          <i class="copy outline icon action_relations_duplicate_nodes"></i>
        </div>
        <div class="ui icon button action_relations_store_nodes_as_templates" data-tooltip="store selected as Template" data-position="bottom center">
          <i class="archive icon action_relations_store_nodes_as_templates"></i>
        </div>
        <div class="ui icon button action_relations_add_nodes_from_templates" data-tooltip="Add from template" data-position="bottom center">
          <i class="paste icon action_relations_add_nodes_from_templates"></i>
        </div>
        <button class="ui mini button action_relations_remove_nodes" data-tooltip="Delete Selected" data-position="bottom center">
          <i class="trash icon action_relations_remove_nodes"></i>
        </button>
        <button class="ui basic icon button" data-tooltip="Export as .png" data-position="bottom center">
          <i class="download icon action_relations_export_png"></i>
        </button>
      </div>
    </div>

    <div class="item">
      <div class="ui mini basic icon buttons">
        <button class="disabled ui basic icon button " >
          Show
        </button>
        <button class="${fadeOtherNodesOnHoover ? 'active':''} ui mini button action_fade_other_node_toogle_network_button" data-tooltip="Highlight connection on hover" data-position="bottom center">
          <i class="sun outline icon action_fade_other_node_toogle_network_button"></i>
        </button>
        <button class="${showLinksText ? 'active':''} ui mini button action_relations_toogle_links_text" data-tooltip="Relations texts" data-position="bottom center">
          <i class="underline icon action_relations_toogle_links_text"></i>
        </button>
        <button class="${showExtraLabels ? 'active':''} ui mini button action_relations_show_extra_labels" data-tooltip="Extra Category labels" data-position="bottom center">
          <i class="tag icon action_relations_show_extra_labels"></i>
        </button>
        <button class=" ui mini button action_relations_show_current_matrix" data-tooltip="interface matrix" data-position="bottom center">
          <i class="table icon action_relations_show_current_matrix"></i>
        </button>
      </div>
    </div>
    `
    let relationsMenuHTML =`

    <div class="right menu">
      <div class="ui item">
        <div class="ui mini basic buttons">
          <div class="disabled ui icon button">
            Add
          </div>
          <div class="${addItemMode=="stakeholders" ? 'active':''} ui icon button add_relations_nodes action_interface_add_stakeholder" data-tooltip="Stakeholder" data-position="bottom center">
            <i class="user icon action_interface_add_stakeholder"></i>
          </div>
          <div class="${addItemMode=="requirements" ? 'active':''} ui icon button add_relations_nodes action_interface_add_requirement" data-tooltip="Requirement" data-position="bottom center">
            <i class="comment icon action_interface_add_requirement"></i>
          </div>
          <div class="${addItemMode=="currentPbs" ? 'active':''} ui icon button add_relations_nodes action_interface_add_pbs" data-tooltip="Product" data-position="bottom center">
            <i class="dolly icon action_interface_add_pbs"></i>
          </div>
          <div class="${addItemMode=="functions" ? 'active':''} ui icon button add_relations_nodes action_interface_add_functions" data-tooltip="Functions" data-position="bottom center">
            <i class="cogs icon action_interface_add_functions"></i>
          </div>
        </div>

        <div class="ui item">
          <div class="ui icon button basic action_relations_toogle_show_graph_menu">
            <i class="ellipsis horizontal icon action_relations_toogle_show_graph_menu"></i>
          </div>
        </div>
      </div>

    </div>`
    let interfacesMenuHTML =`
    <div class="right menu">



      <div class="ui item">
        <div class="ui mini basic buttons">
          <div class="ui disabled icon button">
            display
          </div>
          <button class="${elementVisibility.compose ? 'active':''} ui mini icon button action_interfaces_toogle_show_compose" data-tooltip="Show composition links" data-position="bottom center">
            <i class="object group icon action_interfaces_toogle_show_compose"></i>
          </button>
          <button class="${elementVisibility.interfaces ? 'active':''} ui mini icon button action_interfaces_toogle_show_interfaces" data-tooltip="Show interfaces links" data-position="bottom center">
            <i class="cubes icon action_interfaces_toogle_show_interfaces"></i>
          </button>
        </div>
      </div>

      <div class="ui item">
        <div class="ui mini basic buttons">
          <div class="ui icon button action_interfaces_add_pbs" data-tooltip="Add Product" data-position="bottom center">
            <i class="plus  icon action_interfaces_add_pbs"></i>
            <i class="dolly icon action_interfaces_add_pbs"></i>
          </div>
        </div>
      </div>
      <div class="ui item">
        <div class="ui mini basic buttons">
          <div class="ui disabled icon button">
            Add links
          </div>
          <div class="${addMode=='compose' ? 'active':''} ui icon button action_interfaces_toogle_compose" data-tooltip="New links will be composition relations" data-position="bottom center">
            <i class="object group icon action_interfaces_toogle_compose"></i>
          </div>
          <div class="${addMode=='physical' ? 'active':''} ui icon button action_interfaces_toogle_physical" data-tooltip="New links will be physical interfaces relations" data-position="bottom center">
            <i class="cubes icon action_interfaces_toogle_physical"></i>
          </div>
        </div>
      </div>
    </div>`
    if (activeMode == "relations") {
      container.querySelector('.menuArea').innerHTML=`<div class="ui mini compact text menu">`+ commonMenuHTML + relationsMenuHTML +`</div>`
    }else {
      container.querySelector('.menuArea').innerHTML=`<div class="ui mini compact text menu">`+ commonMenuHTML + interfacesMenuHTML +`</div>`
    }

    container.querySelector('.input_relation_search_nodes').addEventListener('keyup', function(e){
      //e.stopPropagation()
      var value = document.querySelector(".input_relation_search_nodes").value
      console.log(value);
      if (value != "") {
        var filteredData = itemsToDisplay.filter((item) => {
          if (fuzzysearch(value, item.name) || fuzzysearch (value, item.name.toLowerCase())) {
            return true
          }
          return false
        })
        let filteredDataUuid = filteredData.map(d => d.uuid)
        console.log(filteredDataUuid);
        activeGraph.setFocusedNodes("uuid", filteredDataUuid, ["mark","hideOthers"])
        //displaySideMenuFromSearch(filteredDataUuid)//todo check if needed
      }else {//if null reset
        activeGraph.setFocusedNodes("uuid", [], ["mark","hideOthers"])
        //displaySideMenuFromSearch([])
      }
    });

    container.querySelector('.menuGraph').innerHTML=`
    <div class="ui item action_relations_toogle_show_graph_menu"><i class="close icon"></i></div>
    <div class="ui secondary pointing vertical menu">
      <div class="item">
        <div class="header">Show Items</div>
        <div class="menu">
        <a class="${elementVisibility.functions ? 'active teal':''} ui item action_relations_toogle_show_functions">Functions</a>
        <a class="${elementVisibility.requirements ? 'active teal':''} ui item action_relations_toogle_show_requirements">Requirements</a>
        <a class="${elementVisibility.stakeholders ? 'active teal':''} ui item action_relations_toogle_show_stakeholders">Stakeholders</a>
        <a class="${elementVisibility.physicalSpaces ? 'active teal':''} ui item action_relations_toogle_show_physicalSpaces">Physical Spaces</a>
        </div>
      </div>
      <div class="item">
        <div class="header">Show Links</div>
        <div class="menu">
        <a class="${elementVisibility.metaLinks ? 'active teal':''} ui item action_relations_toogle_show_metalinks">Origins</a>
        <a class="${elementVisibility.compose ? 'active teal':''} ui item action_relations_toogle_show_compose">Compositions</a>
        <a class="${elementVisibility.interfaces ? 'active teal':''} ui item action_relations_toogle_show_interfaces">Interfaces</a>
        </div>
      </div>
      <div class="item">
        <div class="header">Group Items Together</div>
        <div class="menu">
        <a class="${groupElements.functions ? 'active teal':''} ui item action_relations_toogle_group_functions">Functions</a>
        <a class="${groupElements.requirements ? 'active teal':''} ui item action_relations_toogle_group_requirements">Requirements</a>
        <a class="${groupElements.stakeholders ? 'active teal':''} ui item action_relations_toogle_group_stakeholders">Stakeholders</a>
        <a class="${groupElements.pbs ? 'active teal':''} ui item action_relations_toogle_group_pbs">Products</a>
        <a class="${groupElements.physicalSpaces ? 'active teal':''} ui item action_relations_toogle_group_physicalSpaces">Physical Spaces</a>
        </div>
      </div>

      <div class="item">
        <div class="header">Show</div>
          <div class="ui item">
            <div class="ui toggle checkbox">
              <input ${fadeOtherNodesOnHoover ? 'checked':''} class="action_fade_other_node_toogle_network" type="checkbox" name="public">
              <label>Highlight connections</label>
            </div>
          </div>
        <div class="ui mini vertical basic buttons">
          <div class="ui mini button action_relations_isolate_nodes">Selected</div>
          <div class="ui mini button action_relations_isolate_nodes_and_children">Selected and relations</div>
        </div>
      </div>

      <div class="item">
        <div class="header">Isolate</div>
        <div class="ui mini vertical basic buttons">
          <div class="ui mini button action_relations_isolate_nodes">Selected</div>
          <div class="ui mini button action_relations_isolate_nodes_and_children">Selected and relations</div>
        </div>
      </div>
    </div>
    `
    container.querySelector('.menuSnapshotGraph').innerHTML=`
    <div style="right: 9px;position: absolute;" class="ui item action_relations_toogle_show_graph_snapshot_menu"><i class="close icon"></i></div>
    <div class="ui secondary pointing vertical menu">
      <div class="item">
        <div class="header">Snapshots</div>
        <div style="max-height=150px; overflow=auto;" class="target_relations_view_list">
        </div>
      </div>
    </div>
    `
    //Add viewSelectionMenu
    let relationViews = query.currentProject().graphs.items
    // if (query.currentProject().graphs && query.currentProject().graphs.items[0]) {
    //   relationViews = query.currentProject().graphs.items[0] //check if graph is in DB
    //   // fixedValuesList = query.currentProject().graphs.items[0] //check if graph is in DB
    // }
    let viewMenuObjects =relationViews.slice()
    if (activeMode=="interfaces") {
      viewMenuObjects=viewMenuObjects.filter(v=>v.view == activeMode)
    }
    let viewMenuHtml = viewMenuObjects
      .sort(function(a, b) {
        if (a.name && b.name) {
          var nameA = a.name.toUpperCase(); // ignore upper and lowercase
          var nameB = b.name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {return -1;}
          if (nameA > nameB) {return 1;}
        }
        return 0;})
      .map(v=>theme.viewListItem(v))
      .join('')

    let recentSnapshotHtml =""
    recentSnapshot = currentSnapshot || recentSnapshot //save in case no element is available next time
    let recentSnapshotElement =viewMenuObjects.find(r=>r.uuid == currentSnapshot) ||viewMenuObjects.find(r=>r.uuid == recentSnapshot)
      if (recentSnapshotElement) {
      recentSnapshotHtml  = "<b>Last used</b><br>" + theme.viewListItem(recentSnapshotElement)+"<br><br><b>All</b><br>"
      }

    container.querySelector('.target_relations_view_list').innerHTML= theme.viewListOptions() + recentSnapshotHtml+viewMenuHtml
  }

  var dataToD3Format = function (data) {
    var count =0
    return {
      nodes : data.nodes.map((e) => {
        e.id=e.uuid;
        e.properties= {
                name: e.name + " " + (e.lastName || ""),
            }
        return e
      }),
      relationships : data.relationships
        .filter(e=>{
          var foundSourceNodeToConnect = data.nodes.find(i=>i.uuid == e.source)
          var foundTargetNodeToConnect = data.nodes.find(i=>i.uuid == e.target)
          return (foundSourceNodeToConnect && foundTargetNodeToConnect)
        })
        .map((e) => {
          e.id=count++;
          e.startNode = e.source;
          e.endNode=e.target;
          e.properties= {
                  from: 1470002400000
              }
          return e
        })
    }
  }

  var renderforcesTree = function (data) {

    var d3format = dataToD3Format(data)
    console.log(data);
    activeGraph = new stellae('.interfaceGraph', {
      highlight: [
          {
              class: 'Project',
              property: 'state',
              value: 'root'
          }, {
              class: 'User',
              property: 'userId',
              value: 'start'
          }
      ],
      groupLabels:currentGroupedLabels,
      extraLabels:showExtraLabels,
      rootNode:false,
      showLinksOverlay:false,
      fadeOtherNodesOnHoover:fadeOtherNodesOnHoover,
      // icons: {
      //     'Functions': 'cogs',
      //     'Pbs': 'dolly',
      //     'Requirements': 'comment',
      //     'User': 'user',
      //     'Project': 'building'
      // },
      customPathIcons: {
          'Functions': {fill:"#ffffff", transform:"scale("+0.05+") translate(-290, -250)", path:"M512.1 191l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0L552 6.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zm-10.5-58.8c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.7-82.4 14.3-52.8 52.8zM386.3 286.1l33.7 16.8c10.1 5.8 14.5 18.1 10.5 29.1-8.9 24.2-26.4 46.4-42.6 65.8-7.4 8.9-20.2 11.1-30.3 5.3l-29.1-16.8c-16 13.7-34.6 24.6-54.9 31.7v33.6c0 11.6-8.3 21.6-19.7 23.6-24.6 4.2-50.4 4.4-75.9 0-11.5-2-20-11.9-20-23.6V418c-20.3-7.2-38.9-18-54.9-31.7L74 403c-10 5.8-22.9 3.6-30.3-5.3-16.2-19.4-33.3-41.6-42.2-65.7-4-10.9.4-23.2 10.5-29.1l33.3-16.8c-3.9-20.9-3.9-42.4 0-63.4L12 205.8c-10.1-5.8-14.6-18.1-10.5-29 8.9-24.2 26-46.4 42.2-65.8 7.4-8.9 20.2-11.1 30.3-5.3l29.1 16.8c16-13.7 34.6-24.6 54.9-31.7V57.1c0-11.5 8.2-21.5 19.6-23.5 24.6-4.2 50.5-4.4 76-.1 11.5 2 20 11.9 20 23.6v33.6c20.3 7.2 38.9 18 54.9 31.7l29.1-16.8c10-5.8 22.9-3.6 30.3 5.3 16.2 19.4 33.2 41.6 42.1 65.8 4 10.9.1 23.2-10 29.1l-33.7 16.8c3.9 21 3.9 42.5 0 63.5zm-117.6 21.1c59.2-77-28.7-164.9-105.7-105.7-59.2 77 28.7 164.9 105.7 105.7zm243.4 182.7l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0l8.2-14.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zM501.6 431c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.6-82.4 14.3-52.8 52.8z"},
          'Pbs': {fill:"#ffffff", transform:"scale("+0.05+") translate(-250, -250)", path:"M294.2 277.7c18 5 34.7 13.4 49.5 24.7l161.5-53.8c8.4-2.8 12.9-11.9 10.1-20.2L454.9 47.2c-2.8-8.4-11.9-12.9-20.2-10.1l-61.1 20.4 33.1 99.4L346 177l-33.1-99.4-61.6 20.5c-8.4 2.8-12.9 11.9-10.1 20.2l53 159.4zm281 48.7L565 296c-2.8-8.4-11.9-12.9-20.2-10.1l-213.5 71.2c-17.2-22-43.6-36.4-73.5-37L158.4 21.9C154 8.8 141.8 0 128 0H16C7.2 0 0 7.2 0 16v32c0 8.8 7.2 16 16 16h88.9l92.2 276.7c-26.1 20.4-41.7 53.6-36 90.5 6.1 39.4 37.9 72.3 77.3 79.2 60.2 10.7 112.3-34.8 113.4-92.6l213.3-71.2c8.3-2.8 12.9-11.8 10.1-20.2zM256 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"},
          'Requirements': {fill:"#ffffff", transform:"scale("+0.05+") translate(-250, -250)", path:"M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"},
          'User': {fill:"#ffffff", transform:"scale("+0.05+") translate(-210, -250)", path:"M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"},
          'Project': {fill:"#73787f", transform:"scale("+0.05+") translate(-220, -250)", path:"M128 148v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12zm140 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-128 96h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm128 0h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-76 84v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm76 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm180 124v36H0v-36c0-6.6 5.4-12 12-12h19.5V24c0-13.3 10.7-24 24-24h337c13.3 0 24 10.7 24 24v440H436c6.6 0 12 5.4 12 12zM79.5 463H192v-67c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v67h112.5V49L80 48l-.5 415z"},
          'physicalSpaces': {fill:"#ffffff", transform:"scale("+0.05+") translate(-220, -250)", path:"M128 148v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12zm140 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-128 96h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm128 0h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-76 84v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm76 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm180 124v36H0v-36c0-6.6 5.4-12 12-12h19.5V24c0-13.3 10.7-24 24-24h337c13.3 0 24 10.7 24 24v440H436c6.6 0 12 5.4 12 12zM79.5 463H192v-67c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v67h112.5V49L80 48l-.5 415z"}
          // 'Functions': 'cogs',
          // 'Pbs': 'dolly',
          // 'Requirements': 'comment',
          // 'User': 'user',
          // 'Project': 'building'
      },
      // images: {
      //     'Address': 'img/twemoji/1f3e0.svg',
      //     'Usedr': 'img/twemoji/1f600.svg'
      // },
      minCollision: 60,
      chargeStrength: -500,
      customData: {
        "results": [
            {
                "columns": ["user", "entity"],
                "data": [
                    {
                        "graph": {
                            "nodes": [
                                {
                                    "id": "1",
                                    "labels": ["Project"],
                                    fx: 806,
                                    fy: 343,
                                    vx: 0,
                                    vy: 0,
                                    x: 806,
                                    y: 343,
                                    "name":query.currentProject().name,
                                    "properties": {
                                        "state": "root",
                                        "name":query.currentProject().name
                                    }
                                }
                            ],
                            "relationships": [
                            ]
                        }
                    }
                ]
            }
          ],
          "errors": []
      },
      nodeRadius: 25,
      showLinksText:showLinksText,
      unpinNodeOnClick:!fixedValues,//disable node unpin when fixedgraph mode
      onNodeDragEnd:function (node) {
        if (fixedValues) {
          //TODO test to clean
          if (!query.currentProject().graphs ) {//backward compatibility
            query.currentProject().graphs = {}
            query.currentProject().graphs.items =[]
          }
          let graphItem = {uuid:genuuid(), name:"Last", nodesPositions:activeGraph.exportNodesPosition("all")}
          //append to graph DB
          if (activeMode=="relations") {
            query.currentProject().graphs.default = graphItem//TODO use actions
          }else if (activeMode == "interfaces") {
            query.currentProject().graphs.interfaces = graphItem//TODO use actions
          }
        }
      },
      onRelationshipDoubleClick:function (d) {
        console.log(d);

        if (d.type != "Composed by" && confirm("remove link? ("+d.type+")")) {
          if (d.type == "Physical connection") {
            push(act.remove("interfaces",{uuid:d.uuid}))
          }else {
            push(act.remove("metaLinks",{uuid:d.uuid}))
          }

          update()
        }
      },
      onNodeContextMenu:function (node) {
        showEditMenu(node)
      },
      onNodeClick:function (node) {
        previousSelectedNode = lastSelectedNode;
        lastSelectedNode = node;
        if (addLinkMode) {
          renderMenu()
        }
        console.log(lastSelectedNode,previousSelectedNode);
      },
      onNodeDoubleClick: function(node) {
        console.log(node);

        // showEditMenu(node)

          // switch(node.id) {
          //     case '25':
          //         // Google
          //         window.open(node.properties.url, '_blank');
          //         break;
          //     default:
          //         var maxNodes = 5,
          //             data = stellae.randomD3Data(node, maxNodes);
          //         stellae.updateWithD3Data(data);
          //         break;
          // }
      },
      onLinkingEnd :function (e) {
        console.log(e);
        linkNodes(e[0],e[1])
        update()
      },
      onCanvasDoubleClick:function (e) {//TODO finish implementation
        console.log(e);
        if (addItemMode) {//if item mode engaged
          var initValue = prompt("Add an item")
          if (initValue) {
            var uuid = genuuid()
            addItems(addItemMode, uuid, initValue)
            //itemsToFixAtNextUpdate=[]
            itemsToFixAtNextUpdate.push({uuid:uuid, fx:e.x, fy:e.y})
            update()
          }
        }
      },
      onCanvasZoom:function (e) {//TODO finish implementation
        console.log(e);
        currentGraphTransformation=[e.translate[0],e.translate[1],e.scale]
      },
      startTransform:currentGraphTransformation,
      zoomFit: false
  });
  activeGraph.updateWithD3Data(d3format)
  }

  var showEditMenu = function (node) {

    showSingleItemService.showById(node.uuid, function (e) {
      update()//update graph
    })
  }

  function linkNodes(lastSelectedNode, previousSelectedNode) {
    var store = query.currentProject() //TODO ugly
    var nodeTypes = [lastSelectedNode.labels[0],previousSelectedNode.labels[0]]
    console.log(nodeTypes);
    console.log(nodeTypes[0] =="Requirements" && nodeTypes[1] == "User");
    if (nodeTypes[0] =="Requirements" && nodeTypes[1] == "User") {
      console.log("Requirements", "User");
      push(act.add("metaLinks",{type:"origin", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
    }else if (nodeTypes[0] =="User" && nodeTypes[1] == "Requirements") {
      console.log( "User", "Requirements");
      push(act.add("metaLinks",{type:"origin", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "Requirements") {
      push(act.add("metaLinks",{type:"originNeed", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Requirements" && nodeTypes[1] == "Pbs") {
      push(act.add("metaLinks",{type:"originNeed", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Functions" && nodeTypes[1] == "Requirements") {
      push(act.add("metaLinks",{type:"originNeed", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Requirements" && nodeTypes[1] == "Functions") {
      push(act.add("metaLinks",{type:"originNeed", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "Functions") {
      push(act.add("metaLinks",{type:"originNeed", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Functions" && nodeTypes[1] == "Pbs") {
      push(act.add("metaLinks",{type:"originFunction", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="physicalSpaces" && nodeTypes[1] == "Pbs") {
      push(act.add("metaLinks",{type:"contains", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "physicalSpaces") {
      push(act.add("metaLinks",{type:"contains", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "Pbs") {
      //check for circular references
      if (addMode == "physical") {
          let isCircularRef = store.interfaces.items.find(i => (i.target == lastSelectedNode.uuid && i.source == previousSelectedNode.uuid)|| (i.source == lastSelectedNode.uuid && i.target == previousSelectedNode.uuid) )
          if (!isCircularRef) {
            push(act.add("interfaces",{type:"Physical connection", name:"Interface between "+lastSelectedNode.name+" and "+previousSelectedNode.name, source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
          }else {
            alert("Circular reference. Action not possible")
          }
      }else if (addMode == "compose") {
          let isCircularRef = store.currentPbs.links.find(i => (i.target == lastSelectedNode.uuid && i.source == previousSelectedNode.uuid)|| (i.source == lastSelectedNode.uuid && i.target == previousSelectedNode.uuid) )
          let targetIsRoot = !store.currentPbs.links.find(i=> i.target == previousSelectedNode.uuid)

          if (!isCircularRef && !targetIsRoot) {
            // push(movePbs({origin:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
            push(removePbsLink({target:previousSelectedNode.uuid}))

            push(act.addLink("currentPbs",{ source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
          }else if(isCircularRef){
            alert("Circular reference. Action not possible")
          }else if(targetIsRoot){
            alert("Cannot target the root node")
          }

      }
    }
  }
  function toggleFixedGraph() {
    if (objectIsActive) {
      setTimeout(function () {
        if (!fixedValues) {
          setGraphToFixed()
        }else {
          fixedValues = false
          update()
        }
      }, 1);
    }
  }
  function setGraphToFixed() {
    if (!fixedValues) {
      let snapId = "wipgraph484622464"
      let newGraphItem = {uuid:snapId,view:activeMode, name:"0-Current WIP", groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
      push(act.remove("graphs", {uuid:snapId}))
      push(act.add("graphs", newGraphItem))
      let savedCurrentSnapshot = currentSnapshot
      setSnapshot(snapId)

    }
  }

  function addItems(type, uuid, initValue) {
    if (type == 'requirements') {
      push(addRequirement({uuid:uuid, name:initValue}))
    }else if (type == 'currentPbs') {
      push(addPbs({uuid:uuid, name:initValue}))
      push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:uuid}))
    }else if (type == 'stakeholders') {
      push(act.add('stakeholders',{uuid:uuid, name:initValue}))
    }else if (type = 'functions') {
      push(act.add('functions',{uuid:uuid, name:initValue}))
    }
  }

  function setSnapshot(uuid) {
    let graph = query.currentProject().graphs.items.find(i=> i.uuid == uuid)
    fixedValues = true
    hiddenItemsFromSideView= graph.hiddenItems || []
    if (graph.elementVisibility) {
      groupElements= deepCopy(graph.groupElements);//prevent memory space linking between graph and view TODO investigate why needed here and in save
      elementVisibility= deepCopy(graph.elementVisibility);
    }
    currentSnapshot = uuid
    update()
    //regsiter la position also TODO put in own fuction as it's used by stellae dragend
    if (fixedValues) {
      //TODO test to clean
      if (!query.currentProject().graphs ) {//backward compatibility
        query.currentProject().graphs = {}
        query.currentProject().graphs.items =[]
      }
      let graphItem = {uuid:genuuid(), name:"Last", nodesPositions:activeGraph.exportNodesPosition("all")}
      //append to graph DB
      if (activeMode=="relations") {
        query.currentProject().graphs.default = graphItem//TODO use actions
      }else if (activeMode == "interfaces") {
        query.currentProject().graphs.interfaces = graphItem//TODO use actions
      }
    }

  }


  var resizeCropImage = function (uri, callback) {//TODO move to helpers

    var canvas=document.createElement("canvas");
    var ctx=canvas.getContext("2d");
    var cw=canvas.width;
    var ch=canvas.height;
    var maxW=290;
    var maxH=1290;

    handleFiles()

    function handleFiles() {
      var img = new Image;
      img.onload = function() {
        var iw=img.width;
        var ih=img.height;
        var scale=Math.min((maxW/iw),(maxH/ih));
        var iwScaled=iw*scale;
        var ihScaled=ih*scale;
        canvas.width=iwScaled;
        canvas.height=ihScaled;
        canvas.width=250;
        canvas.height=100;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img,(0-ih/5),(0-ih/2),iwScaled,ihScaled);
        let dataUrl = canvas.toDataURL("image/jpeg",0.9);
        if (callback) {
          callback(dataUrl)
        }
      }
      img.src = uri;
    }
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var relationsView = createRelationsView();
relationsView.init()

var interfacesView = createRelationsView();
interfacesView.init({context:"interfaces"})
