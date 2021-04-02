var createRelationsView = function () {
  var self ={};
  var objectIsActive = false;
  var activeMode = 'relations'

  var quickstartModal=undefined
  var displayType = "network";
  var activeGraph = undefined;
  var fixedValues = undefined;
  var fadeOtherNodesOnHoover =false;
  var lastSelectedNode = undefined;
  var lastFixedNodes = undefined;
  var previousSelectedNode = undefined;
  var addLinkMode = false;
  var itemsToFixAtNextUpdate = [];
  var graphSelectionModeActive = false;

  var currentGraphTransformation=undefined;
  var addMode = "compose";
  var addModeInterfaceType = undefined;
  var addItemCatType = undefined;
  var addItemMode ="currentPbs"
  var nodeWalkModeActive = false;
  //What to show
  var hiddenItemsFromSideView = [];
  var graphHelpersDefault = {notes:[], groups:[]};
  var graphHelpers = {notes:[], groups:[]};
  var showVisibilityMenu = false;
  var showVisibilityMenuSnapshot = false;
  var showVisibilityAddMenu = false;
  var showVisibilityAddLinksMenu = false;

  var showExtraLabels = true;
  var showLinksText = true;

  var elementVisibility = {
    functions : true,
    requirements : true,
    stakeholders : true,
    physicalSpaces : false,
    workPackages : false,
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
    workPackages : false,
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
  var relationsTree = {}
  var relationsTargetTree = {}
  var interfacesToTypesMapping = {}
  var nodeWalkType="menu"

  var sideListe = undefined

  var container = undefined

  var theme={
    viewInterfaceList:(interfaceItems)=> {
      let html =
      `<div class="header item">Select, then draw links from the nodes external radius</div>
      <a style="${(addMode == 'compose')? "background-color: #6dce9e !important":""}" data-id="" class="item action_interfaces_toogle_compose">
        <i class='object group icon'></i>
        Composition
      </a>`
      html += interfaceItems.map(i=>
        `<a style="${(addModeInterfaceType == i.uuid && addMode != 'compose')? "background-color: #6dce9e !important":""}" data-id="${i.uuid}" class="item action_interface_change_interface_type">
          ${i.name}
        </a>`
        ).join('')
      return html
    },
    viewItemsList:(categoriesItems)=> {
      items=[
        {name:'Products', type:'currentPbs', icon:"dolly"},
        {name:'Stakeholders', type:'stakeholders',  icon:"user"},
        {name:'Requirements', type:'requirements', icon:"comment"},
        {name:'Functions', type:'functions', icon:"cogs"}
      ]

      let categoryArray = categoriesItems.map(c=>{
        return {uuid:c.uuid, name:c.name, type:'currentPbs', icon:"dolly"}
      })
      let html =
      `<div class="header item">Select, then double click on the graph to add</div>`

      html += items.concat(categoryArray).map(i=>
        `<a style="${((addItemMode == i.type && addItemCatType == i.uuid)||(addItemMode == i.type && !i.uuid))? "background-color: #6dce9e !important":""}" data-type="${i.type}"  data-id="${i.uuid}"  class="item action_interface_change_add_item_type">
          <i class='${i.icon?i.icon:'dolly'} icon'></i>
          ${i.name}
        </a>`
        ).join('')
      return html
    },
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
          <div style="width: 80%;margin-left: 10%;justify-content: center;" class="ui cards">
          ${theme.quickStartLastViewItem("file outline","New","Start from an empty graph","action_relations_qs_create_new_empty")}
           ${theme.quickStartLastViewItem("sitemap","Whole Project","Create a graph of the whole project","action_relations_qs_show_whole_project")}
           ${theme.quickStartLastViewItem("dolly","Only PBS","Create a graph of the Product Breakdown Structure","action_relations_qs_show_only_PBS")}
           ${theme.quickStartLastViewItem("cubes","Only Interfaces","Show only the projects interfaces","action_relations_qs_show_only_interfaces")}
           ${theme.quickStartLastViewItem("search","Focus","Create a graph focused on a product","action_relations_qs_start_from_element")}
           ${theme.quickStartLastViewItem("redo","Reload","Go to last WIP graph","action_relations_qs_show_last_view")}
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
    bind(".action_relations_toogle_group_workPackages","click",(e)=>{ groupElements.workPackages = !groupElements.workPackages; update(); }, container)

    bind(".action_relations_toogle_show_functions","click",(e)=>{ elementVisibility.functions = !elementVisibility.functions; update(); }, container)
    bind(".action_relations_toogle_show_requirements","click",(e)=>{ elementVisibility.requirements = !elementVisibility.requirements; update(); }, container)
    bind(".action_relations_toogle_show_stakeholders","click",(e)=>{ elementVisibility.stakeholders = !elementVisibility.stakeholders; update(); }, container)
    bind(".action_relations_toogle_show_physicalSpaces","click",(e)=>{ elementVisibility.physicalSpaces = !elementVisibility.physicalSpaces; update(); }, container)
    bind(".action_relations_toogle_show_workPackages","click",(e)=>{ elementVisibility.workPackages = !elementVisibility.workPackages; update(); }, container)
    bind(".action_relations_toogle_show_metalinks","click",(e)=>{ elementVisibility.metaLinks = !elementVisibility.metaLinks; update(); }, container)
    bind(".action_relations_toogle_show_interfaces","click",(e)=>{ elementVisibility.interfaces = !elementVisibility.interfaces; update(); }, container)
    bind(".action_relations_toogle_show_compose","click",(e)=>{ elementVisibility.compose = !elementVisibility.compose; update(); }, container)

    bind(".action_relations_toogle_nodewalk_type","click",(e)=>{
      if (nodeWalkType=="menu") {
        nodeWalkType = "explode";
      }else {
        nodeWalkType = "menu"
      }
      update()
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
        if (controlChildrenVisibility == true && current.parentNode.parentNode.nextElementSibling) {
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
        if (controlChildrenVisibility == true && current.parentNode.parentNode.nextElementSibling) {
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
    bind(".action_relations_show_all_nodes_in_view","click",async (e)=>{

      // let children = document.querySelector('.left-list').querySelectorAll('.action_tree_list_relations_toogle_visibility')
      // for (var i = 0; i < children.length; i++) {
      //   let child = children[i];let linkedChildId = child.dataset.id;
      //
      //   let isVisible = !hiddenItemsFromSideView.includes(linkedChildId)
      //   if (!isVisible) {  hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, linkedChildId)  }
      // }
      await updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
      hiddenItemsFromSideView = []
      update()
    }, container)
    bind(".action_relations_hide_all_nodes_in_view","click",async (e)=>{

      // let children = document.querySelector('.left-list').querySelectorAll('.action_tree_list_relations_toogle_visibility')
      // for (var i = 0; i < children.length; i++) {
      //   let child = children[i];let linkedChildId = child.dataset.id;let isVisible = !hiddenItemsFromSideView.includes(linkedChildId)
      //   if (isVisible && child.dataset.label) {hiddenItemsFromSideView.push(linkedChildId)}
      // }

      await updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
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
    bind(".action_relations_toogle_show_add_menu","click",(e)=>{
      var elem = queryDOM('.graphLeftToolsOptionsArea')
      console.log(elem);
      if (elem.classList.contains('hidden')) {
        elem.classList.remove('hidden')
        queryDOM('.action_relations_toogle_show_add_menu').classList.add('active')
        showVisibilityAddMenu = true
        //hide the other menu
        queryDOM('.graphLeftToolsOptionsLinksArea').classList.add('hidden')
        queryDOM('.action_relations_toogle_show_add_links_menu').classList.remove('active')
        showVisibilityAddLinksMenu = false
      }else{
        elem.classList.add('hidden')
        queryDOM('.action_relations_toogle_show_add_menu').classList.remove('active')
        showVisibilityAddMenu = false
      }
    }, container)
    bind(".action_relations_toogle_show_add_links_menu","click",(e)=>{
      var elem = queryDOM('.graphLeftToolsOptionsLinksArea')
      console.log(elem);
      if (elem.classList.contains('hidden')) {
        elem.classList.remove('hidden')
        queryDOM('.action_relations_toogle_show_add_links_menu').classList.add('active')
        showVisibilityAddLinksMenu = true
        //hide the product add
        queryDOM('.graphLeftToolsOptionsArea').classList.add('hidden')
        queryDOM('.action_relations_toogle_show_add_menu').classList.remove('active')
        showVisibilityAddMenu = false
      }else{
        elem.classList.add('hidden')
        queryDOM('.action_relations_toogle_show_add_links_menu').classList.remove('active')
        showVisibilityAddLinksMenu = false
      }
    }, container)
    bind(".action_relations_toogle_graph_selection_mode","click",(e)=>{
      if (graphSelectionModeActive) {
        activeGraph.setSelectionModeInactive()
        graphSelectionModeActive = false
      }else{
        activeGraph.setSelectionModeActive()
        graphSelectionModeActive = true
      }
    }, container)
    bind(".action_relations_toogle_graph_node_walking_mode","click",(e)=>{
      if (nodeWalkModeActive) {
        queryDOM('.action_relations_toogle_graph_node_walking_mode').classList.remove('active')
        nodeWalkModeActive = false
      }else{
        queryDOM('.action_relations_toogle_graph_node_walking_mode').classList.add('active')
        nodeWalkModeActive = true
      }
    }, container)

    bind(".action_interface_add_functions","click",(e)=>{
      addItemMode = 'functions'


    }, container)
    bind(".action_relations_add_note","click",async (e)=>{

      var popup= await createPromptPopup({
        title:"Add a new note",
        fields:{ type:"input",id:"noteName" ,label:"Note name", placeholder:"Content" }
      })
      if (popup && popup.result) {
        graphHelpers.notes.push({uuid:genuuid(),x:0, y:0, content:popup.result})
        update()
      }
    }, container)
    bind(".action_relations_add_group","click",async (e)=>{

      var popup= await createPromptPopup({
        title:"Add a new group",
        fields:{ type:"input",id:"groupName" ,label:"Group name", placeholder:"Content" }
      })
      if (popup && popup.result) {
        let selectedNodes = activeGraph.getSelectedNodes()
        console.log(selectedNodes);
        if (selectedNodes && selectedNodes[0] && !selectedNodes[1]) {
          graphHelpers.groups.push({uuid:genuuid(),x:selectedNodes[0].fx, y:selectedNodes[0].fy,h:100, w:200, master:selectedNodes[0].uuid, nodes:[], content:popup.result})
          update()
        }else {
          graphHelpers.groups.push({uuid:genuuid(),x:0, y:0,h:100, w:200, nodes:[], content:popup.result})
          update()
        }
      }
    }, container)
    bind(".action_interface_set_new_metalink_mode","click",(e)=>{
      lastSelectedNode = undefined;
      previousSelectedNode = undefined;
      addLinkMode = !addLinkMode
      renderMenu()
    }, container)
    // bind(".action_interface_add_new_metalink","click",(e)=>{
    //   addLinkMode = !addLinkMode
    //   linkNodes(lastSelectedNode,previousSelectedNode)
    //   update()
    // }, container)

    bind(".action_relations_add_nodes_from_templates","click",async (e)=>{
      let store = await query.currentProject()
      showListMenu({
        sourceData:store.templates,
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
            ev.select.updateData(store.templates)
          }
        },
        idProp:"uuid",
        extraButtons : [
          {name:"Select", class:"select", prop:"uuid", action: async  (orev)=>{

            await loadFromTemplate(orev.dataset.id)
          }}
        ],
      })

      async function loadFromTemplate(id) {
        let store = await query.currentProject()
        let template = store.templates.find(t=>t.uuid == id).template
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
        console.log(selectedNodes);
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
                  push(act.addLink(storeGroup,{source:store.currentPbs[0].uuid, target:id}))
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
    bind(".action_relations_duplicate_nodes","click",async (e)=>{
      let store = await query.currentProject()

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


      selectedNodes.forEach(async function (node) {
        if (node.uuid) {

          let storeGroup = getObjectGroupByUuid(node.uuid, store)
          // let elementToDuplicate =  await query("all", i=> i.uuid == node.uuid)[0]
          let allItems = []
          for (var keys in store) {
            if (store.hasOwnProperty(keys)) {
              if (store[keys]) {
                allItems = allItems.concat(store[keys])
              }
            }
          }
          let elementToDuplicate =  allItems.filter(i=> i.uuid == node.uuid)[0]
          console.log(elementToDuplicate);
          if (elementToDuplicate) {
            var id = convertUuid(node.uuid)
            let newElement = deepCopy(elementToDuplicate)        //first get a clean node copy
            newElement.uuid = id
            newElement.name = newElement.name +extraText
            push(act.add(storeGroup,newElement))
            if (storeGroup == "currentPbs") {
              //check if parent is copied too
              let hasParent = store.links.find(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
              if (!hasParent) {
                push(act.addLink(storeGroup,{source:store.currentPbs[0].uuid, target:id}))
              }
            }

            //find and duplicate links
            let metaLinksToSearch =store.metaLinks
            let relatedLinks = metaLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

            let catLinksToSearch =store.metaLinks.filter(l=>l.type=="category")
            let relatedCatLinks = catLinksToSearch.filter(l=>l.type=="category"&&l.source == node.uuid)

            let interfacesToSearch =store.interfaces
            let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
            // let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid)||(selectedNodesUuid.includes(l.target)&&l.source == node.uuid))

            let localLinksToSearch =store.links
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
    bind(".action_relations_store_nodes_as_templates","click",async (e)=>{
      let store = await query.currentProject()
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
          let storeGroup = getObjectGroupByUuid(node.uuid, store)
          // let elementToDuplicate = query("all", i=> i.uuid == node.uuid)[0]
          let allItems = []
          for (var keys in store) {
            if (store.hasOwnProperty(keys)) {
              if (store[keys]) {
                allItems = allItems.concat(store[keys])
              }
            }
          }
          let elementToDuplicate =  allItems.filter(i=> i.uuid == node.uuid)[0]
          if (elementToDuplicate) {
            var id = convertUuid(node.uuid)
            let newElement = deepCopy(elementToDuplicate)        //first get a clean node copy
            newElement.uuid = id
            newElement.name = newElement.name +extraText
            newElement.storeGroup = storeGroup
            template.nodes.push(newElement)
            if (storeGroup == "currentPbs") {
              //check if parent is copied too
              let hasParent = store.links.find(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))
              if (!hasParent) {
                // template.links.push({source:query.currentProject().currentPbs[0].uuid, target:id})
              }
            }
            //find and duplicate links
            let metaLinksToSearch =store.metaLinks
            let relatedLinks = metaLinksToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

            let catLinksToSearch =store.metaLinks.filter(l=>l.type=="category")
            let relatedCatLinks = catLinksToSearch.filter(l=>l.type=="category"&&l.source == node.uuid)

            let interfacesToSearch =store.interfaces
            let relatedInterfaceLinks = interfacesToSearch.filter(l=>(selectedNodesUuid.includes(l.source)&&l.target == node.uuid))

            let localLinksToSearch =store.links
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
      isolateSelectedNodesWithInterfaces(selectedNodes, false)
    }, container)
    bind(".action_relations_isolate_nodes_and_all_children","click",(e)=>{
      let selectedNodes = activeGraph.getSelectedNodes()
      isolateSelectedNodesWithInterfaces(selectedNodes, true)
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
        activeGraph.getScreenshot(function (uri) {
          let snapId = uuid()
          resizeCropImage(uri, function (urib) {
            let graphItem = {uuid:snapId, preview:uri, view:activeMode, name:snapshotName, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all"), graphHelpers:activeGraph.exportHelpers()}
            push(act.add("graphs", graphItem))
            setSnapshot(snapId)
          })
        })
        // svgAsPngUri(container.querySelector('.stellae-graph'),{scale: 0.1}).then(function (uri) {
        //   let snapId = uuid()
        //   resizeCropImage(uri, function (uri) {
        //     let graphItem = {uuid:snapId, preview:uri, view:activeMode, name:snapshotName, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all"), graphHelpers:activeGraph.exportHelpers()}
        //     push(act.add("graphs", graphItem))
        //     setSnapshot(snapId)
        //   })
        // })
      }else {
        let snapId = uuid()
        let graphItem = {uuid:genuuid(), view:activeMode, name:snapshotName, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all"), graphHelpers:activeGraph.exportHelpers()}
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
    bind(".action_relations_update_snapshot","click",async (e)=>{
      if (confirm("Update this snapshot")) {
        let useImages = true // create a snsphot when saving graph
        let currentStore = await query.currentProject()
        let graph = currentStore.graphs.find(i=> i.uuid == e.target.dataset.id)

        if (useImages) {
          svgAsPngUri(container.querySelector('.stellae-graph'),{scale: 0.1}).then(function (uri) {
            resizeCropImage(uri, function (uri) {
              let snapId = uuid()
              let newGraphItem = {uuid:snapId,preview:uri, view:activeMode, name:graph.name, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all"), graphHelpers:activeGraph.exportHelpers()}
              push(act.remove("graphs", {uuid:e.target.dataset.id}))
              push(act.add("graphs", newGraphItem))
              setSnapshot(snapId)
            })
          })
        }else {
          let snapId = uuid()
          let newGraphItem = {uuid:snapId,view:activeMode, name:graph.name, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all"), graphHelpers:activeGraph.exportHelpers()}
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
    bind(".action_relations_show_current_matrix","click",async(e)=>{
      var store = await query.currentProject()
      let nodes = itemsToDisplay.filter(i=> !hiddenItemsFromSideView.includes(i.uuid))
      showOccurrenceDiagramService.show(nodes.filter(r=>getObjectGroupByUuid(r.uuid, store) == "currentPbs"), relations.filter(r=>r.type=="Physical connection"))

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
      update()
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
      update()
      // update()
    }, container)
    bind(".action_interfaces_add_pbs","click",(e)=>{
      var id = genuuid()
      var newReq = prompt("Nouveau Besoin")
      push(addPbs({uuid:id, name:newReq}))
      push(addPbsLink({source:query.currentProject().currentPbs[0].uuid, target:id}))
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
    bind(".action_interface_change_interface_type","click",(e)=>{
        let interfaceDefaultTypeId = e.target.dataset.id;
        addModeInterfaceType = interfaceDefaultTypeId
        addMode = "physical"
        update()
    }, container)
    bind(".action_interface_change_add_item_type","click",(e)=>{
        let itemDefaultType = e.target.dataset.type;
        addItemCatType = e.target.dataset.id;
        addItemMode = itemDefaultType
        update()
    }, container)

  }

  var quickstartConnections = async function (container) {
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
    bind(".action_relations_qs_start_from_element","click",async (e)=>{
      let store = await query.currentProject()
      let elements = store.currentPbs
      let elementsLinks = store.links
      showListMenu({
        sourceData:elements,
        sourceLinks:elementsLinks,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true,edit:false},
          {prop:"tags", displayAs:"Tags", meta:()=>store.metaLinks, choices:()=>store.tags, edit:false},
          {prop:"WpOwn",isTarget:true, displayAs:"Work Packages", meta:()=>store.metaLinks, choices:()=>store.workPackages, edit:false}

        ],
        idProp:"uuid",
        extraButtons : [
          {name:"show", class:"show", prop:"uuid", closeAfter:true, action: async (orev)=>{
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
            await updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
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
      addMode='compose'
      setTimeout(function () {
        setReset()
        //fix graph after a few seconds
        setTimeout(function () {
          setGraphToFixed()
        }, 1900);
      }, 1);
    }, container)
    bind(".action_relations_qs_show_only_PBS","click",(e)=>{
      function setReset() {
        fixedValues = false
        hiddenItemsFromSideView= []
        elementVisibility = {
          functions : false,
          requirements : false,
          stakeholders : false,
          physicalSpaces : false,
          workPackages : false,
          metaLinks : false,
          interfaces : false,
          compose : true
        }
        groupElements={
          functions: false,
          requirements: false,
          stakeholders: false,
          pbs:  false,
          physicalSpaces : false,
        }
        addMode='compose'
        currentSnapshot = undefined
        update()
      }
      setTimeout(function () {
        setReset()
        //fix graph after a few seconds
        setTimeout(function () {
          setGraphToFixed()
        }, 1900);
      }, 1);
    }, container)
    bind(".action_relations_qs_show_only_interfaces","click",(e)=>{
      function setReset() {
        fixedValues = false
        hiddenItemsFromSideView= []
        elementVisibility = {
          functions : false,
          requirements : false,
          stakeholders : false,
          physicalSpaces : false,
          workPackages : false,
          metaLinks : false,
          interfaces : true,
          compose : false
        }
        groupElements={
          functions: false,
          requirements: false,
          stakeholders: false,
          pbs:  false,
          physicalSpaces : false,
        }
        addMode='physical'
        currentSnapshot = undefined
        update()
      }
      setTimeout(function () {
        setReset()
        //fix graph after a few seconds
        setTimeout(function () {
          setGraphToFixed()
        }, 1900);
      }, 1);
    }, container)
    bind(".action_relations_qs_create_new_empty","click",async (e)=>{
      if (activeMode=="interfaces") {//TODO should use default
        elementVisibility = {functions : false,requirements : false,  stakeholders : false, metaLinks : true, interfaces : true, compose : true }
      }else {
        elementVisibility = {
          functions : true,
          requirements : true,
          stakeholders : true,
          workPackages : true,
          physicalSpaces : true,
          metaLinks : true,
          interfaces : true,
          compose : true
        }
      }

      await updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
      hiddenItemsFromSideView = itemsToDisplay.map(i=>i.uuid)
      update()
      setTimeout(function () {
        if (activeGraph) {
          setGraphToFixed()
        }
      }, 1900);
    }, container)
  }

  var render = async function () {
    if (quickstartModal) {
      quickstartModal.remove()
    }
    var store = await query.currentProject()
    container = document.createElement("div")
    container.style.height = "100%"

    listContainer = document.createElement("div")
    listContainer.style.height = "100%"
    document.querySelector(".left-list").appendChild(listContainer)
    document.querySelector(".left-list").style.overflow = "hidden"
    connections(container)
    //update all connections at each render. otherwise multiple views share the updae

    let graphSearchStyle =`
    opacity: 0.90;
    border-radius: 5px;
    background-color: white;
    height: 46px;
    width: 475px;
    position: absolute;
    right: 10px;
    bottom: 20px;
    padding-top: 5px;
    padding-left: 5px;
    box-shadow: 0px 0px 18px -6px rgba(0,0,0,0.35);`

    let graphViewStyle =graphSearchStyle +'bottom: auto;top:20px;'

    let graphLeftToolsStyle =`
    opacity: 0.90;
    border-radius: 5px;
    background-color: white;
    width: 46px;
    position: absolute;
    left: 287px;
    top: 144px;
    padding: 5px;
    box-shadow: 0px 0px 18px -6px rgba(0,0,0,0.35);`

    let graphLeftToolsOptionsStyle =`
    opacity: 0.90;
    border-radius: 5px;
    background-color: white;
    width: 146px;
    height: 800px;
    overflow: auto;
    position: absolute;
    left: 350px;
    top: 144px;
    padding: 5px;
    box-shadow: 0px 0px 18px -6px rgba(0,0,0,0.35);`

    //height: calc(100% - 45px);
    //TODO Reuse the top menu area
    container.innerHTML=`

      <div style="height: 100%; position: relative" class='graphArea'>
        <div style="height: 100%" class="interfaceGraph"></div>
        <div style="opacity: 0.90;border-radius: 5px;box-shadow: 0px 0px 18px -6px rgba(0,0,0,0.35); height: 90%;width: 250px;position: absolute;right:0px;top:1px;background-color: white; overflow-y:auto;overflow-x: hidden;" class="${showVisibilityMenu ? '':'hidden'} menuGraph"></div>
        <div style="opacity: 0.90; border-radius: 5px;box-shadow: 0px 0px 18px -6px rgba(0,0,0,0.35); height: 90%;width: 210px;position: absolute;left:68px;top:10px;background-color: white; overflow-y:auto;overflow-x: hidden;" class="${showVisibilityMenuSnapshot ? '':'hidden'} menuSnapshotGraph"></div>
      </div>
      <div style="${graphViewStyle}" class='hidden menuArea'></div>
      <div style="${graphSearchStyle}" class='graphSearchArea'></div>
      <div style="${graphLeftToolsStyle}" class='graphLeftToolsArea'></div>
      <div style="${graphLeftToolsOptionsStyle}" class='hidden graphLeftToolsOptionsArea'></div>
      <div style="${graphLeftToolsOptionsStyle}" class='hidden graphLeftToolsOptionsLinksArea'></div>
      `

      container.ondragover = function (ev) {
        ev.preventDefault();
        console.log(ev);
      }
      container.ondrop = function (ev) {
        ev.preventDefault();
        console.log(ev);
        let dropUuid = ev.dataTransfer.getData("text")
        console.log(ev.dataTransfer.getData("text"));
        if (dropUuid) {
          setTimeout(function () {
            let mousePosition = activeGraph.getlocalMousePositionFromLayerMousePosition([ev.layerX, ev.layerY])
            console.log(mousePosition);
            //if hidden, SHOW
            if (hiddenItemsFromSideView.includes(dropUuid)) {
              hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, dropUuid)
            }
            //update Position
            itemsToFixAtNextUpdate.push({uuid:dropUuid, fx:mousePosition.x, fy:mousePosition.y})
            update()
            setTimeout(function () {
              setGraphToFixed()
            }, 200);
          }, 300);
        }

      }

    renderMenu(container)



    //render graph
    //reset items to display component var

    await updateItemsToDisplayAndRelations(elementVisibility)

    //remove hidden items from tree
    let hiddenItemsFromSideViewObjectMapping = {}//create mapping for performance //PERF do it one TODO
    for (var i = 0; i < hiddenItemsFromSideView.length; i++) {
      let hiddenElementId = hiddenItemsFromSideView[i]
      hiddenItemsFromSideViewObjectMapping[hiddenElementId] = true
    }

    let filteredItemsToDisplay = itemsToDisplay.filter(i=> !hiddenItemsFromSideViewObjectMapping[i.uuid])
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

    //append container and add graph afterward //TODO should be reveresed

    document.querySelector(".center-container").innerHTML=''
    document.querySelector(".center-container").appendChild(container)

    if (displayType == "state") {
      var state = createStateDiagram({container:".interfaceGraph",data:concatData, links:store.metaLinks,positions :undefined, groupLinks:groupLinks})
      state.init()
    }else if(displayType == "network"){
      var fixedValuesList = []
      if (fixedValues) { //check if network is fixed or dynamic
        if (currentSnapshot) {// has a snapshot been activated
          fixedValuesList = store.graphs.find(i=>i.uuid == currentSnapshot).nodesPositions
          console.log(filteredItemsToDisplay.length, fixedValuesList.length);

          if (fixedValuesList && itemsToDisplay && filteredItemsToDisplay.length-fixedValuesList.length > 0 ) {// if element to display are note the same as the snapshot
            if (!confirm("Update this snapshot with " + (filteredItemsToDisplay.length-fixedValuesList.length +0) +" newly added items?")) {//TODO why is the +1 needed?

              let originalFilteredItemsToDisplay = deepCopy(filteredItemsToDisplay)
              let originalHiddenItemsFromSideView = deepCopy(hiddenItemsFromSideView)//store value before modyfing theme

              let extraFilter = fixedValuesList.map(e=>e.uuid)
              filteredItemsToDisplay= filteredItemsToDisplay.filter(f => extraFilter.includes(f.uuid)) //remove other nodes
              hiddenItemsFromSideView = hiddenItemsFromSideView.concat(originalFilteredItemsToDisplay.filter(f => !extraFilter.includes(f.uuid)).map(o=>o.uuid))//update the hidden item prop

              // check if new items were related
              if (fixedValuesList.length <50) { //for performance TODO check if needed
                //check if a new node is connected
                let childrenFilter = findChildrenUuid(fixedValuesList, itemsToDisplay, relations)

                let newChilds = childrenFilter.filter(f => {
                    if (!f) {
                      return false // filter if node is undefined
                    }else {
                      return !fixedValuesList.includes(f.uuid)
                    }
                  }
                )
                console.log(newChilds);
                if ((newChilds.length > 0) && confirm('Check if new nodes are related to graph and show them?')) {
                  filteredItemsToDisplay= originalFilteredItemsToDisplay.filter(f => childrenFilter.includes(f.uuid))
                  hiddenItemsFromSideView = originalHiddenItemsFromSideView.concat(originalFilteredItemsToDisplay.filter(f => !childrenFilter.includes(f.uuid)).map(o=>o.uuid))
                }
              }else {
                if (confirm('Check if new nodes are related to graph and show them?')) {
                  let childrenFilter = findChildrenUuid(fixedValuesList, itemsToDisplay, relations)
                  console.log(filteredItemsToDisplay);
                  console.log(childrenFilter);
                  filteredItemsToDisplay= originalFilteredItemsToDisplay.filter(f => childrenFilter.includes(f.uuid))
                  hiddenItemsFromSideView = originalHiddenItemsFromSideView.concat(originalFilteredItemsToDisplay.filter(f => !childrenFilter.includes(f.uuid)).map(o=>o.uuid))
                }
              }

            }
          }
          currentSnapshot = undefined//clear current snapshot

        }else if( lastFixedNodes) {// if not go to default
          fixedValuesList = deepCopy(lastFixedNodes.nodesPositions )
          // fixedValuesList = query.currentProject().graphs.default.nodesPositions ||query.currentProject().graphs[0] //check if graph is in DB backward compatibility (TODO: remove)
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
      onUpdate:updateSideListeVisibility,
      customEyeActionClass:"action_tree_list_relations_toogle_visibility",
      customExtraActionClass:"fas fa-link action_toogle_diag_relations_options",
      customTextActionClass:"action_LM_project_tree_show_item_popup"//works because event listener is specified in leftmenu.projectTree
    })
    setTimeout(function () {
      udapteSideListe()//todo, force a redraw quickly to prenvent glitch
    }, 10);
    //updateSideListeVisibility()
  }

  var udapteSideListe = function () {
    sideListe.refresh(itemsToDisplay, relations)
    //updateSideListeVisibility()
  }
  var getInterfaceTypeFromUuid = function (store, uuid) {
    let interfaceType = interfacesToTypesMapping[uuid]
    if (interfaceType) {
      return interfaceType.name
    }else {
      return "Unknown Type"
    }
    // let itemMetaLink = store.metaLinks.find(l=>l.type =="interfacesType" && l.source == uuid)
    // if (itemMetaLink) {
    //   let item = store.interfacesTypes.find(t=>t.uuid == itemMetaLink.target)
    //   if (item) {
    //     return item.name
    //   }else {
    //     console.log(itemMetaLink.target);
    //     return "Unknown Type"
    //   }
    // }else {
    //   return store.interfacesTypes[0].name
    // }

  }
  var getInterfaceDashArrayTypeFromUuid = function (store, uuid) {
    let interfaceType = interfacesToTypesMapping[uuid]
    if (interfaceType) {
      return (interfaceType.dashArray==1)? "3 4": undefined
    }else {
      return undefined
    }
    // let itemMetaLink = store.metaLinks.find(l=>l.type =="interfacesType" && l.source == uuid)
    // if (itemMetaLink) {
    //   let item = store.interfacesTypes.find(t=>t.uuid == itemMetaLink.target)
    //   return (item && item.dashArray==1)? "3 4": undefined
    // }else {
    //   return undefined
    // }
  }
  // var getInterfaceCustomColorFromUuid = function (store, uuid) {
  //   let itemMetaLink = store.metaLinks.find(l=>l.type =="interfacesType" && l.source == uuid)
  //   if (itemMetaLink) {
  //     let item = store.interfacesTypes.find(t=>t.uuid == itemMetaLink.target)
  //     return item.dashArray==1? "3 4": undefined
  //   }else {
  //     return undefined
  //   }
  // }

  var updateSideListeVisibility = function () {//TODO integrate in list tree
    let elementList = document.querySelector(".left-list").querySelectorAll('.action_tree_list_relations_toogle_visibility')

    let hiddenItemsFromSideViewObjectMapping = {}//create mapping for performance //PERF do it one TODO
    for (var i = 0; i < hiddenItemsFromSideView.length; i++) {
      let hiddenElementId = hiddenItemsFromSideView[i]
      hiddenItemsFromSideViewObjectMapping[hiddenElementId] = true
    }

    for (var i = 0; i < elementList.length; i++) {
      let current = elementList[i]
      let linkedNodeId = current.dataset.id
      let isVisible = !hiddenItemsFromSideViewObjectMapping[linkedNodeId]
      if (isVisible) {
        current.classList.add('fa-eye')
        current.classList.remove('fa-eye-slash')
      }else {
        current.classList.remove('fa-eye')
        current.classList.add('fa-eye-slash')
      }

    }
  }
  function findChildrenUuid(roots,items, links, ignoredNodes) {
    var ignoredNodes = ignoredNodes || []// if no ignored nodes than assign it an empty array to use for the other recursions
    return roots.reduce(function (acc, r) {
      console.log(acc);
      let rootArray = [r.uuid]
      console.log(links);
      let itemsChildren = items.filter((i) => {//get all the children of this element
        return links.find((l)=> {
          if (true) {//was filtering between composition and interface. Not needed
            if (l.source.uuid) {return l.source.uuid == r.uuid && l.target.uuid == i.uuid//check if links source is object
            }else { return l.source == r.uuid && l.target == i.uuid}//or ID
          }
        })
      })
      if (ignoredNodes[0]) {//remove node that have already been found previously
        itemsChildren = itemsChildren.filter(i=>!ignoredNodes.includes(i))
      }
      ignoredNodes = ignoredNodes.concat(itemsChildren)// add them to ignored list for further recursion
      //recursively trandform them in leaf and branches
      let thisitemChildrenArray = findChildrenUuid(itemsChildren,items, links, ignoredNodes)
      rootArray = rootArray.concat(thisitemChildrenArray)
      console.log(acc);
      return acc.concat(rootArray)
    }, [])
  }
  function findRelatedUuidLEGACY(roots,items, links) {

    return roots.reduce(function (acc, r) {
      console.log(acc);
      let rootArray = [r.uuid]
      let itemsRelated = items
        .filter((i) => {//get all the children of this element
          return links.find((l)=> {
            if (true) {//was filtering relations and composition. Not needed
              if (l.source.uuid) {return ( (l.source.uuid == r.uuid && l.target.uuid == i.uuid)||(l.source.uuid == i.uuid && l.target.uuid == r.uuid) )//check if links source is object
              }else { return ( (l.source == r.uuid && l.target == i.uuid)||(l.source == i.uuid && l.target == r.uuid) )}//or ID
            }
          })
        })
        .map(i=>i.uuid)
      return acc.concat(itemsRelated)
    }, [])
  }
  function findRelatedUuid(roots,items, links) {

    return roots.reduce(function (acc, r) {
      console.log(acc);
      // let rootArray = [r.uuid]
      let itemSource =relationsTargetTree[r.uuid] || []
      let itemTarget =relationsTree[r.uuid] || []
      let itemsRelated =itemSource.concat(itemTarget)
      // let itemsRelated = items
      //   .filter((i) => {//get all the children of this element
      //     return links.find((l)=> {
      //       if (true) {//was filtering relations and composition. Not needed
      //         if (l.source.uuid) {return ( (l.source.uuid == r.uuid && l.target.uuid == i.uuid)||(l.source.uuid == i.uuid && l.target.uuid == r.uuid) )//check if links source is object
      //         }else { return ( (l.source == r.uuid && l.target == i.uuid)||(l.source == i.uuid && l.target == r.uuid) )}//or ID
      //       }
      //     })
      //   })
      //   .map(i=>i.uuid)
      return acc.concat(itemsRelated)
    }, [])
  }

  var isolateSelectedNodes = function (currentSelected, showChildren) {

    let selectedNodes = currentSelected
    let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
    let selectedNodesAndChildrenUuid = undefined
    if (showChildren) {
      selectedNodesAndChildrenUuid = findChildrenUuid(selectedNodes, itemsToDisplay, relations)
    }
    let stayVisibleNodes = showChildren? selectedNodesAndChildrenUuid : selectedNodesUuid
    hiddenItemsFromSideView=[] //resetGraph
    let newDisplayList= itemsToDisplay.filter( i => !stayVisibleNodes.includes(i.uuid))
    newDisplayList.forEach(function (item) {// hide everyting
      hiddenItemsFromSideView.push(item.uuid)
    })
    update()
  }
  var isolateSelectedNodesWithInterfaces = function (currentSelected, showChildren) {

    let selectedNodes = currentSelected
    let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
    let selectedNodesAndChildrenUuid = []
    if (showChildren) {
      selectedNodesAndChildrenUuid = findChildrenUuid(selectedNodes, itemsToDisplay, relations)
    }

    let relatedNodes = findRelatedUuid(selectedNodes, itemsToDisplay, relations)

    selectedNodesAndChildrenUuid = selectedNodesAndChildrenUuid.concat(relatedNodes)
    var selectedNodesAndRelated = selectedNodesUuid.concat(relatedNodes)

    let stayVisibleNodes = showChildren? selectedNodesAndChildrenUuid : selectedNodesAndRelated
    hiddenItemsFromSideView=[] //resetGraph

    let newDisplayList= itemsToDisplay.filter( i => !stayVisibleNodes.includes(i.uuid))
    newDisplayList.forEach(function (item) {// hide everyting
      hiddenItemsFromSideView.push(item.uuid)
    })
    update()
  }
  var nodeWalk = function (currentSelected, showChildren) {

    let selectedNodes = currentSelected
    let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
    let selectedNodesAndChildrenUuid = []
    if (showChildren) {
      selectedNodesAndChildrenUuid = findChildrenUuid(selectedNodes, itemsToDisplay, relations)
    }

    let relatedNodes = findRelatedUuid(selectedNodes, itemsToDisplay, relations)

    selectedNodesAndChildrenUuid = selectedNodesAndChildrenUuid.concat(relatedNodes)
    var selectedNodesAndRelated = selectedNodesUuid.concat(relatedNodes)

    let stayVisibleNodes = showChildren? selectedNodesAndChildrenUuid : selectedNodesAndRelated

    let hiddenItemsFromSideViewObjectMapping = {}//create mapping for performance //PERF do it one TODO
    for (var i = 0; i < hiddenItemsFromSideView.length; i++) {
      let hiddenElementId = hiddenItemsFromSideView[i]
      hiddenItemsFromSideViewObjectMapping[hiddenElementId] = true
    }

    let currentVisibleNode = itemsToDisplay.filter( i => !hiddenItemsFromSideViewObjectMapping[i.uuid])
    stayVisibleNodes = currentVisibleNode.map(n=>n.uuid).concat(stayVisibleNodes)
    //check if node is

    hiddenItemsFromSideView=[] //resetGraph
    let newDisplayList= itemsToDisplay.filter( i => !stayVisibleNodes.includes(i.uuid))
    newDisplayList.forEach(function (item) {// hide everyting
      hiddenItemsFromSideView.push(item.uuid)
    })
    update()
  }
  var nodeWalkMenu = async function (currentSelected, eventData) {

    let selectedNodes = currentSelected
    let selectedNodesUuid = selectedNodes.map(n=>n.uuid)
    let selectedNodesAndChildrenUuid = []


    let relatedNodes = findRelatedUuid(selectedNodes, itemsToDisplay, relations)

    // let walkMenu = document.createElement("div")
    // for (var i = 0; i < itemsToDisplay.length; i++) {
    //   let e = itemsToDisplay[i]
    //   if (relatedNodes.includes(e.uuid) ) {
    //     walkMenu.innerHTML += " <div> "+e.name+"</div>"
    //   }
    // }
    // walkMenu.style.zIndex="999999999999999999999999999";
    // walkMenu.style.position="absolute";
    // walkMenu.style.top=eventData.canvasPosition[0]+"px";
    // walkMenu.style.left=eventData.canvasPosition[1]+"px";
    // document.body.appendChild(walkMenu)

    let nodeViewable = [{ type:"button",id:uuid(), label:"Show all", onClick:v=>{
        nodeWalk(currentSelected, false)
      } }]
    for (var i = 0; i < itemsToDisplay.length; i++) {
      let e = itemsToDisplay[i]
      if (relatedNodes.includes(e.uuid) ) {
        let field = { type:"button",id:uuid(),customColor:e.customColor,value:e.uuid, label:e.name, onClick:v=>{
          console.log(v);
          hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, v)
          update()
        } }
        nodeViewable.push(field)
      }
    }

    var popup= await createPromptPopup({
      title:"Related Nodes",
      iconHeader:"sitemap",
      fields:nodeViewable,
      confirmationType:"cancel"
    })

    console.log(relatedNodes);

  }

  var deleteSelectedNodes = async function (currentSelected, showChildren) {
    var store = await query.currentProject()
    let selectedNodes = currentSelected

    selectedNodes.forEach(function (n) {
      let nodeType = getObjectGroupByUuid(n.uuid, store)
      if (nodeType) {
        let object = store[nodeType].find(i=>i.uuid == n.uuid)
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
  var getSvgPathFromItemId = function (uuid, store, categoryStore) {
    let cat = getCategoryFromItemUuid(uuid, store, categoryStore)
    if (cat) { return cat.svgPath
    }else { return undefined}
  }
  var getCustomColorFromItemId = function (uuid, store, categoryStore) {
    let cat = getCategoryFromItemUuid(uuid, store, categoryStore)
    if (cat) { return cat.color
    }else { return undefined}
  }
  var updateItemsToDisplayAndRelations= async function (elementVisibility) {//only side effect TODO: find a better way?
    var store = await query.currentProject()
    var categoryStore = {}
    for (var i = 0; i < store.metaLinks.length; i++) {
      let metaType = store.metaLinks[i].type
      if (metaType == "category") {
        categoryStore[store.metaLinks[i].source] = store.metaLinks[i].target
      }
    }
    var array1 =store.functions.map((e) => {e.customColor="#ffc766";e.labels = ["Functions"]; return e})
    var array2 =store.currentPbs.map((e) => {e.customColor=getCustomColorFromItemId(e.uuid, store, categoryStore)||"#6dce9e";e.labels = ["Pbs"]; e.extraLabel=getSvgPathFromItemId(e.uuid, store, categoryStore); return e})
    var array3 = store.requirements.map((e) => {e.customColor="#ff75ea";e.labels = ["Requirements"]; return e})
    var array4 = store.stakeholders.map((e) => {e.customColor="#68bdf6 ";e.labels = ["User"]; e.properties= {"fullName": e.lastName}; return e})
    var array5 = store.physicalSpaces.map((e) => {e.customColor="#02b5ab ";e.labels = ["physicalSpaces"]; return e})
    var array6 = store.workPackages.map((e) => {e.customColor="#b8431f ";e.labels = ["workPackages"]; return e})

    itemsToDisplay = []
    itemsToDisplay = itemsToDisplay.concat(array2)
    if (elementVisibility.requirements) { itemsToDisplay = itemsToDisplay.concat(array3) }
    if (elementVisibility.functions) { itemsToDisplay = itemsToDisplay.concat(array1) }
    if (elementVisibility.stakeholders) { itemsToDisplay = itemsToDisplay.concat(array4) }
    if (elementVisibility.physicalSpaces) { itemsToDisplay = itemsToDisplay.concat(array5) }
    if (elementVisibility.workPackages) { itemsToDisplay = itemsToDisplay.concat(array6) }

    relations = []//checl what connection to display TODO store in func
    relationsTree = {}//checl what connection to display TODO store in func
    relationsTargetTree = {}
    interfacesToTypesMapping = {}

    var mapInterfacesToIds = function (store) {//build mapping for performances

      for (var i = 0; i < store.interfaces.length; i++) {
        let ml=  store.interfaces[i]
        if (ml.typeId) {
          let item = store.interfacesTypes.find(t=>t.uuid == ml.typeId)
          if (!interfacesToTypesMapping[ml.uuid]) {
            interfacesToTypesMapping[ml.uuid] = item
          }
        }
      }
      // for (var i = 0; i < store.metaLinks.length; i++) {
      //   let ml=  store.metaLinks[i]
      //   if (ml.type =="interfacesType") {
      //     let item = store.interfacesTypes.find(t=>t.uuid == ml.target)
      //     if (!interfacesToTypesMapping[ml.source]) {
      //       interfacesToTypesMapping[ml.source] = item
      //     }
      //   }
      // }

      // let itemMetaLink = store.metaLinks.find(l=>l.type =="interfacesType" && l.source == uuid)
      // if (itemMetaLink) {
      //   let item = store.interfacesTypes.find(t=>t.uuid == itemMetaLink.target)
      //   if (item) {
      //     return item.name
      //   }else {
      //     console.log(itemMetaLink.target);
      //     return "Unknown Type"
      //   }
      // }else {
      //   return store.interfacesTypes[0].name
      // }

    }

    mapInterfacesToIds(store)

    var transferToRelationsForEach = function (relations,relationsTree, array, mofidication) {
      for (var i = 0; i < array.length; i++) {
        let item = array[i]
        let newItem = Object.assign({},item)
        mofidication(newItem)
        relations.push(newItem)

        //add to sourceMap
        let sourceUuid = newItem.source.uuid || newItem.source
        let targetUuid = newItem.target.uuid || newItem.target
        if (!relationsTree[sourceUuid]) {
          relationsTree[sourceUuid] = [targetUuid]
        }else {
          relationsTree[sourceUuid].push(targetUuid)
        }

        if (!relationsTargetTree[targetUuid]) {
          relationsTargetTree[targetUuid] = [sourceUuid]
        }else {
          relationsTargetTree[targetUuid].push(sourceUuid)
        }
      }
      console.log(relationsTree);
    }
    if (elementVisibility.metaLinks) {
      //relations = relations.concat(store.metaLinks.map((e) => { e.displayType = e.type; return e}))
      //
      transferToRelationsForEach(relations,relationsTree, store.metaLinks, e=> {e.displayType = e.type;})
    }
    if (elementVisibility.interfaces ) {
      // relations = relations.concat(store.interfaces.map((e) => { e.displayType = getInterfaceTypeFromUuid(store, e.uuid); e.customDashArray = getInterfaceDashArrayTypeFromUuid(store, e.uuid); e.customColor="#6dce9e"; return e}))
      transferToRelationsForEach(relations,relationsTree, store.interfaces, e=> {e.displayType = getInterfaceTypeFromUuid(store, e.uuid); e.customDashArray = getInterfaceDashArrayTypeFromUuid(store, e.uuid); e.customColor="#6dce9e";})
    }
    if (elementVisibility.compose) {
      // relations = relations.concat(store.currentPbs.links.map((e) => { e.displayType = "Composed by";  e.type = "Composed by"; return e}))
      transferToRelationsForEach(relations,relationsTree, store.links, e=> {e.displayType = "Composed by";  e.type = "Composed by";})
      if (elementVisibility.physicalSpaces) {
        // relations = relations.concat(store.physicalSpaces.links.map((e) => {e.displayType = "Contains"; e.type = "Contains"; return e}))
        transferToRelationsForEach(relations,relationsTree, store.links, e=> {e.displayType = "Contains"; e.type = "Contains";})
      }
      groupLinks = []//TODO WHat is the point?
    }
    //check if some relation are on the same nodes;
    let overlapObject = {}
    for (var i = 0; i < relations.length; i++) {
      let relation = relations[i]
      let relationCode = relation.source+relation.target
      let relationCodeReverse = relation.target+relation.source
      //check if item is overlap
      if (overlapObject[relationCode]) {//overlap exist
        relation.displacement = 6*overlapObject[relationCode]
        overlapObject[relationCode] +=1 //add an overlap
      }else if (overlapObject[relationCodeReverse]) {
        relation.displacement = 6*overlapObject[relationCodeReverse]
        overlapObject[relationCodeReverse] +=1 //add an overlap
      }else {
        overlapObject[relationCode] =1 //
      }
    }


    // var duplicates = []
    // function isOverlap(ra, rb) {
    //   if (ra != rb) {
    //     return ((ra.source== rb.source && ra.target== rb.target ) || (ra.target== rb.source && ra.source== rb.target ))
    //   }
    // }
    //
    // for (relation of relations) {
    //   if ( relations.find(e=>isOverlap(relation, e)) ) {
    //     var previouslyStored = duplicates.find(e=>isOverlap(relation, e))
    //     if (!previouslyStored) {
    //       duplicates.push({source:relation.source, target:relation.target, qty:1})
    //       relation.displacement = 6
    //     }else {//Why is it activated so much
    //       previouslyStored.qty ++
    //       relation.displacement = 6*previouslyStored.qty
    //     }
    //   }
    // }
  }

  var renderQuickstart = async function () {
    if (quickstartModal) {
      quickstartModal.remove()
    }
    let quickstartContainer = document.createElement("div")
    quickstartContainer.style.height = "100%"

    //Add viewSelectionMenu
    let graphCollection= await query.collection("graphs")
    console.log(graphCollection);
    let relationViews = graphCollection
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

    // document.querySelector(".center-container").innerHTML=""
    // document.querySelector(".center-container").appendChild(quickstartContainer)

    quickstartModal = ephHelpers.addModalDOM()
    quickstartModal.querySelector('.modal_container').appendChild(quickstartContainer)

    quickstartConnections(quickstartContainer)
  }



  var update = function () {
    if (objectIsActive) {
      render()
    }
  }

  var setActive =async function (options) {
    //clean the graph helpers
    graphHelpers = deepCopy(graphHelpersDefault)

    //load element depending of the options
    if (options && options.param) {
      if (options.param.context && options.param.context == "extract") {
        elementVisibility = {
          functions : true,
          requirements : true,
          stakeholders : true,
          physicalSpaces : true,
          workPackages : true,
          metaLinks : true,
          interfaces : true,
          compose : true
        }
        objectIsActive = true;
        fixedValues = false
        hiddenItemsFromSideView= []
        currentSnapshot = undefined
        await updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
        isolateSelectedNodes([{uuid:options.param.uuid}], true)
        //fix graph after a few seconds
        setTimeout(function () {
          if (activeGraph) {
            setGraphToFixed()
          }
        }, 1900);
      }
      if (options.param.context && options.param.context == "extractDirect") {
        elementVisibility = {
          functions : true,
          requirements : true,
          stakeholders : true,
          physicalSpaces : true,
          workPackages : true,
          metaLinks : true,
          interfaces : true,
          compose : true
        }
        objectIsActive = true;
        fixedValues = false
        hiddenItemsFromSideView= []
        currentSnapshot = undefined
        await updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
        isolateSelectedNodesWithInterfaces([{uuid:options.param.uuid}], false)
        //fix graph after a few seconds
        setTimeout(function () {
          if (activeGraph) {
            setGraphToFixed()
          }
        }, 1900);
      }
      if (options.param.context && options.param.context == "quickstart") {
        objectIsActive = true;
        await updateItemsToDisplayAndRelations(elementVisibility)//populate or update the current module copy of the source
        await renderQuickstart()
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

  var renderMenu= async function (container) {
    let store =  await query.currentProject()
    let interfaceListItems =  store.interfacesTypes
    let categoriesListItems =  store.categories
    let searchAreaHtml =`
    <div class="ui item">
      <div class="ui icon input">
        <input class="input_relation_search_nodes" type="text" placeholder="Search...">
        <i class="search icon"></i>
      </div>
    </div>

    <div class="ui mini basic icon buttons">
      <button class="${fadeOtherNodesOnHoover ? 'active':''} ui mini button action_fade_other_node_toogle_network_button" data-tooltip="Highlight connection on hover" >
        <i class="sun outline icon action_fade_other_node_toogle_network_button"></i>
      </button>
      <button class="${showLinksText ? 'active':''} ui mini button action_relations_toogle_links_text" data-tooltip="Relations texts" >
        <i class="underline icon action_relations_toogle_links_text"></i>
      </button>
      <button class="${showExtraLabels ? 'active':''} ui mini button action_relations_show_extra_labels" data-tooltip="Extra Category labels" >
        <i class="tag icon action_relations_show_extra_labels"></i>
      </button>
      <button class="ui icon button basic action_relations_toogle_show_graph_menu">
        <i class="ellipsis horizontal icon action_relations_toogle_show_graph_menu"></i>
      </button>
    </div>

    <div class="ui item">
      <div class="ui toggle checkbox">
        <input ${fixedValues ? 'checked':''} class="action_restore_last_interface_toogle_network" type="checkbox" name="public">
        <label>Fix</label>
      </div>
    </div>
    `

    let leftToolsHTML = `
      <div class="ui mini vertical  icon buttons">
        <button class="${showVisibilityAddMenu ? 'active':''} ui basic icon button action_relations_toogle_show_add_menu" data-tooltip="Show items to add" data-position="bottom center" >
          <i class="plus square outline icon action_relations_toogle_show_add_menu"></i>
        </button>
        <button class="${showVisibilityAddLinksMenu ? 'active':''} ui basic icon button action_relations_toogle_show_add_links_menu" data-tooltip="Show items to add" data-position="bottom center" >
          <i class="code branch icon action_relations_toogle_show_add_links_menu"></i>
        </button>
        <button class="${graphSelectionModeActive ? 'active':''} ui basic icon button action_relations_toogle_graph_selection_mode" data-tooltip="Select items" data-position="bottom center" >
          <i class="border style icon action_relations_toogle_graph_selection_mode"></i>
        </button>
        <button class="${nodeWalkModeActive ? 'active':''} ui basic icon button action_relations_toogle_graph_node_walking_mode" data-tooltip="Expand nodes children on click" data-position="bottom center" >
          <i class="random icon action_relations_toogle_graph_node_walking_mode"></i>
        </button>
        <button class="ui mini basic button action_relations_show_all_nodes_in_view" data-tooltip="Show All" data-position="bottom center">
          <i class="eye icon action_relations_show_all_nodes_in_view"></i>
        </button>
        <button class="ui mini basic button action_relations_hide_all_nodes_in_view" data-tooltip="Hide All" data-position="bottom center">
          <i class="eye slash icon action_relations_hide_all_nodes_in_view"></i>
        </button>
        <button class="ui mini basic button action_relations_isolate_nodes" data-tooltip="Crop selection" data-position="bottom center">
          <i class="crop icon action_relations_isolate_nodes"></i>
        </button>
        <button class="ui mini basic button action_relations_isolate_nodes_and_children" data-tooltip="Show only selected relations" data-position="bottom center">
          <i class="expand alternate icon action_relations_isolate_nodes_and_children"></i>
        </button>
        <button class="ui mini basic button action_relations_isolate_nodes_and_all_children" data-tooltip="Show only selected relations and children" data-position="bottom center">
          <i class="expand arrows alternate icon action_relations_isolate_nodes_and_all_children"></i>
        </button>
        <div class="ui basic icon button action_relations_duplicate_nodes" data-tooltip="duplicate selected Product" data-position="bottom center">
          <i class="copy outline icon action_relations_duplicate_nodes"></i>
        </div>
        <div class="ui basic icon button action_relations_store_nodes_as_templates" data-tooltip="store selected as Template" data-position="bottom center">
          <i class="archive icon action_relations_store_nodes_as_templates"></i>
        </div>
        <div class="ui basic icon button action_relations_add_nodes_from_templates" data-tooltip="Add from template" data-position="bottom center">
          <i class="paste icon action_relations_add_nodes_from_templates"></i>
        </div>
        <button class="ui basic mini button action_relations_remove_nodes" data-tooltip="Delete Selected" data-position="bottom center">
          <i class="trash icon action_relations_remove_nodes"></i>
        </button>
        <button class="ui basic mini button action_relations_add_note" data-tooltip="add a Note" data-position="bottom center">
          <i class="heading icon action_relations_add_note"></i>
        </button>
        <button class="ui basic mini button action_relations_add_group" data-tooltip="add a group" data-position="bottom center">
          <i class="object group outline icon action_relations_add_group"></i>
        </button>
        <button class=" ui basic mini button action_relations_show_current_matrix" data-tooltip="interface matrix" data-position="bottom center">
          <i class="table icon action_relations_show_current_matrix"></i>
        </button>
        <button class="ui basic basic basic icon button" data-tooltip="Export as .png" data-position="bottom center">
          <i class="camera icon action_relations_export_png"></i>
        </button>
        <button class="${showVisibilityMenuSnapshot ? 'active':''} ui basic icon button action_relations_toogle_show_graph_snapshot_menu" data-tooltip="Show Snapshot Tools" data-position="bottom center" >
          <i class="download icon action_relations_toogle_show_graph_snapshot_menu"></i>
        </button>
      </div>
    `
    let addElementsMenu = `
      <div class="ui secondary vertical mini compact basic menu" style="margin-top:0px;">
        ${theme.viewItemsList(categoriesListItems)}
      </div>
    `
    let addLinksMenu = `
      <div class="ui secondary vertical mini compact basic menu" style="margin-top:0px;">
          ${theme.viewInterfaceList(interfaceListItems)}
      </div>
    `
    let commonMenuHTML = `
    <div class="item">
      <div class="ui mini basic icon buttons">
        <button class="disabled ui basic icon button " >
          Show
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
          <div data-type="stakeholders" class="${addItemMode=="stakeholders" ? 'active':''} ui icon button add_relations_nodes action_interface_change_add_item_type" data-tooltip="Stakeholder" data-position="bottom center">
            <i data-type="stakeholders" class="user icon action_interface_change_add_item_type"></i>
          </div>
          <div data-type="requirements" class="${addItemMode=="requirements" ? 'active':''} ui icon button add_relations_nodes action_interface_change_add_item_type" data-tooltip="Requirement" data-position="bottom center">
            <i data-type="requirements" class="comment icon action_interface_change_add_item_type"></i>
          </div>
          <div data-type="currentPbs" class="${addItemMode=="currentPbs" ? 'active':''} ui icon button add_relations_nodes action_interface_change_add_item_type" data-tooltip="Product" data-position="bottom center">
            <i data-type="currentPbs" class="dolly icon action_interface_change_add_item_type"></i>
          </div>
          <div data-type="functions" class="${addItemMode=="functions" ? 'active':''} ui icon button add_relations_nodes action_interface_change_add_item_type" data-tooltip="Functions" data-position="bottom center">
            <i data-type="functions" class="cogs icon action_interface_change_add_item_type"></i>
          </div>
        </div>

        <div class="ui simple dropdown item">
          Other items
          <i class="dropdown icon"></i>
          <div class="menu" style="margin-top:0px;">
            ${theme.viewItemsList(categoriesListItems)}
          </div>
        </div>


      </div>

    </div>`
    let interfacesMenuHTML =`
    <div class="right menu">
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
      <div class="ui simple dropdown item">
        Types
        <i class="dropdown icon"></i>
        <div class="menu" style="margin-top:0px;">
          ${theme.viewInterfaceList(interfaceListItems)}
        </div>
      </div>
    </div>`
    // container.querySelector('.menuArea').innerHTML=`<div class="ui mini compact text menu">`+ commonMenuHTML +`</div>`
    container.querySelector('.graphSearchArea').innerHTML=`<div class="ui mini compact text menu">`+ searchAreaHtml +`</div>`
    container.querySelector('.graphLeftToolsArea').innerHTML=leftToolsHTML
    container.querySelector('.graphLeftToolsOptionsArea').innerHTML=addElementsMenu
    container.querySelector('.graphLeftToolsOptionsLinksArea').innerHTML=addLinksMenu

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
        <a class="${elementVisibility.workPackages ? 'active teal':''} ui item action_relations_toogle_show_workPackages">Work Packages</a>
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
        <a class="${groupElements.workPackages ? 'active teal':''} ui item action_relations_toogle_group_workPackages">Work Packages</a>
        </div>
      </div>
      <div class="item">
        <div class="header">Tools Options</div>
        <div class="menu">
        <a class="${nodeWalkType=="menu" ? 'active teal':''} ui item action_relations_toogle_nodewalk_type">Show a menu in Nodewalk tool</a>
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
    let relationViews = store.graphs
    // if (query.currentProject().graphs && query.currentProject().graphs[0]) {
    //   relationViews = query.currentProject().graphs[0] //check if graph is in DB
    //   // fixedValuesList = query.currentProject().graphs[0] //check if graph is in DB
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
        }),
      notes: data.notes.map((e) => {
        e.id=e.uuid;
        return e
      }),
      groups: data.groups.map((e) => {
        e.id=e.uuid;
        return e
      }),
    }
  }

  var renderforcesTree = function (data) {

    //add the current Helpers to the data
    data.notes=graphHelpers.notes;
    data.groups=graphHelpers.groups;

    //prepare the data in the right format

    var d3format = dataToD3Format(data)
    console.log(data);

    //set up the graph
    if (activeGraph) {//first clean existing graph
      activeGraph.cleanAll()
    }
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
          'physicalSpaces': {fill:"#ffffff", transform:"scale("+0.05+") translate(-220, -250)", path:"M128 148v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12zm140 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-128 96h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm128 0h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-76 84v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm76 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm180 124v36H0v-36c0-6.6 5.4-12 12-12h19.5V24c0-13.3 10.7-24 24-24h337c13.3 0 24 10.7 24 24v440H436c6.6 0 12 5.4 12 12zM79.5 463H192v-67c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v67h112.5V49L80 48l-.5 415z"},
          'workPackages': {fill:"#ffffff", transform:"scale("+0.05+") translate(-220, -250)", path:"M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"}
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
      minCollision: 110,
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
                            ],
                            "notes": [
                            ]
                        }
                    }
                ]
            }
          ],
          "errors": []
      },
      nodeRadius: 25,
      onSelectionEnd:function (node) {
        activeGraph.setSelectionModeInactive()
        graphSelectionModeActive = false;
      },
      showLinksText:showLinksText,
      unpinNodeOnClick:!fixedValues,//disable node unpin when fixedgraph mode
      onNodeDragEnd:function (node) {
        if (fixedValues) {
          // //TODO test to clean
          // if (!query.currentProject().graphs ) {//backward compatibility DBCHANGE
          //   query.currentProject().graphs = {}
          //   query.currentProject().graphs =[]
          // }
          let graphItem = {uuid:genuuid(), name:"Last", nodesPositions:activeGraph.exportNodesPosition("all"), graphHelpers:activeGraph.exportHelpers()}
          //append to graph DB
          lastFixedNodes = graphItem
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
      onLinkContextMenu:function (link) {
        showEditMenu(link)
      },
      onNodeClick:function (node,eventData) {
        previousSelectedNode = lastSelectedNode;
        lastSelectedNode = node;
        if (addLinkMode) {
          renderMenu()
        }
        if (nodeWalkModeActive) {
          if (nodeWalkType == "explode") {
            nodeWalk([node, false])
          }else if (nodeWalkType =="menu") {
            nodeWalkMenu([node], eventData)
          }



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
      onLinkingEnd :async function (e) {
        console.log(e);
        await linkNodes(e[0],e[1])
        update()
      },
      onCanvasDoubleClick:async function (e) {
        console.log(e);
        let availableItems =[
          {name:'Product', type:'currentPbs', icon:"dolly"},
          {name:'Stakeholder', type:'stakeholders',  icon:"user"},
          {name:'Requirement', type:'requirements', icon:"comment"},
          {name:'Function', type:'functions', icon:"cogs"}
        ]
        if (addItemMode) {//if item mode engaged
          var popup= await createPromptPopup({
            title:"Add a new "+availableItems.find(a=>a.type==addItemMode).name,
            iconHeader:availableItems.find(a=>a.type==addItemMode).icon,
            fields:{ type:"input",id:"itemNewName" ,label:"Item name", placeholder:"Set a name for the item" }
          })
          if (popup && popup.result) {
            var uuid = genuuid()
            addItems(addItemMode, uuid, popup.result, addItemCatType)
            //itemsToFixAtNextUpdate=[]
            itemsToFixAtNextUpdate.push({uuid:uuid, fx:e.x, fy:e.y})
            update()
          }
        }
      },
      onCanvasZoom:function (e) {//TODO finish implementation
        console.log(e);
        currentGraphTransformation=e
      },
      startTransform:currentGraphTransformation,
      zoomFit: false
  });
  // console.log(d3format);
  activeGraph.updateWithD3Data(d3format)
  }

  var showEditMenu = function (item) {

    showSingleItemService.showById(item.uuid, function (e) {
      update()//update graph
    })
  }

  async function linkNodes(lastSelectedNode, previousSelectedNode) {
    var store = await query.currentProject() //TODO ugly
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
      push(act.add("metaLinks",{type:"originNeed", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
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
    }else if (nodeTypes[0] =="workPackages" && nodeTypes[1] == "Pbs") {
      push(act.add("metaLinks",{type:"WpOwn", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "workPackages") {
      push(act.add("metaLinks",{type:"WpOwn", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="workPackages" && nodeTypes[1] == "Requirements") {
      push(act.add("metaLinks",{type:"WpOwnNeed", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Requirements" && nodeTypes[1] == "workPackages") {
      push(act.add("metaLinks",{type:"WpOwnNeed", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="workPackages" && nodeTypes[1] == "User") {
      push(act.add("metaLinks",{type:"assignedTo", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
    }else if (nodeTypes[0] =="User" && nodeTypes[1] == "workPackages") {
      push(act.add("metaLinks",{type:"assignedTo", source:previousSelectedNode.uuid, target:lastSelectedNode.uuid}))
    }else if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "Pbs") {
      //check for circular references
      if (addMode == "physical") {
          let isCircularRef = store.interfaces.find(i => (i.target == lastSelectedNode.uuid && i.source == previousSelectedNode.uuid)|| (i.source == lastSelectedNode.uuid && i.target == previousSelectedNode.uuid) )
          if (!isCircularRef) {
            let newInterfaceUuid = uuid()
            push(act.add("interfaces",{
              uuid:newInterfaceUuid,
              typeId:addModeInterfaceType,
              type:"Physical connection",
              name:"Interface between "+lastSelectedNode.name+" and "+previousSelectedNode.name,
              source:lastSelectedNode.uuid,
              target:previousSelectedNode.uuid
            }))
            if (addModeInterfaceType) {
              push(act.add("metaLinks",{type:"interfacesType", source:newInterfaceUuid, target:addModeInterfaceType}))
            }
          }else {
            alert("Circular reference. Action not possible")
          }
      }else if (addMode == "compose") {
          let isCircularRef = store.links.find(i => (i.target == lastSelectedNode.uuid && i.source == previousSelectedNode.uuid)|| (i.source == lastSelectedNode.uuid && i.target == previousSelectedNode.uuid) )
          // let targetIsRoot = !store.links.find(i=> i.target == previousSelectedNode.uuid)

          if (!isCircularRef) {
            // push(movePbs({origin:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
            push(removePbsLink({target:previousSelectedNode.uuid}))

            push(act.addLink("currentPbs",{ source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
          }else if(isCircularRef){
            alert("Circular reference. Action not possible")
          }
          // }else if(targetIsRoot){
          //   alert("Cannot target the root node")
          // }

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
      let newGraphItem = {uuid:snapId,view:activeMode, name:"0-Current WIP", groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all"), graphHelpers:activeGraph.exportHelpers()}

      push(act.remove("graphs", {uuid:snapId}))
      push(act.add("graphs", newGraphItem))
      let savedCurrentSnapshot = currentSnapshot
      setSnapshot(snapId)

    }
  }

  async function addItems(type, uuid, initValue, addItemCatType) {
    if (type == 'requirements') {
      push(addRequirement({uuid:uuid, name:initValue}))
    }else if (type == 'currentPbs') {
      let store = await query.currentProject()
      push(addPbs({uuid:uuid, name:initValue}))
      push(addPbsLink({source:store.currentPbs[0].uuid, target:uuid}))
      if (addItemCatType) {
        push(act.add("metaLinks",{type:"category", source:uuid, target:addItemCatType}))
      }
    }else if (type == 'stakeholders') {
      push(act.add('stakeholders',{uuid:uuid, name:initValue}))
    }else if (type = 'functions') {
      push(act.add('functions',{uuid:uuid, name:initValue}))
    }
  }

  async function setSnapshot(uuid) {
    let store = await query.currentProject()
    let graph = store.graphs.find(i=> i.uuid == uuid)
    lastFixedNodes = graph
    fixedValues = true
    hiddenItemsFromSideView= graph.hiddenItems || []
    if (graph.elementVisibility) {
      groupElements= deepCopy(graph.groupElements);//prevent memory space linking between graph and view TODO investigate why needed here and in save
      elementVisibility= deepCopy(graph.elementVisibility);
    }
    if (graph.graphHelpers) {
      graphHelpers = deepCopy(graph.graphHelpers);
    }else {
      graphHelpers = deepCopy(graphHelpersDefault)
    }
    currentSnapshot = uuid
    update()
    //regsiter la position also TODO put in own fuction as it's used by stellae dragend
    if (fixedValues) {
      //TODO test to clean
      // if (!query.currentProject().graphs ) {//backward compatibility
      //   query.currentProject().graphs = {}
      //   query.currentProject().graphs =[]
      // }
      let graphItem = {uuid:genuuid(), name:"Last", nodesPositions:activeGraph.exportNodesPosition("all")}
      //append to graph to local state

      lastFixedNodes = graphItem

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
