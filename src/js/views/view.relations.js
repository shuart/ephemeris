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

  var elementVisibility = {
    functions : true,
    requirements : true,
    stakeholders : true,
    metaLinks : true,
    interfaces : false,
    compose : true
  }

  var groupElements={
    functions: false,
    requirements: false,
    stakeholders: false,
    pbs:  false
  }
  var defaultElementVisibility = { //todo: why default and not default?
    functions : true,
    requirements : true,
    stakeholders : true,
    metaLinks : true,
    interfaces : false,
    compose : true
  }

  var defaultGroupElements={
    functions: false,
    requirements: false,
    stakeholders: false,
    pbs:  false
  }

  var currentSnapshot=undefined

  var itemsToDisplay = []
  var relations = []

  var sideListe = undefined

  var container = undefined

  var theme={
    viewListItem:(item) => {
     let html = `
      <div style="margin: 1px;" class="ui mini basic icon buttons">
        <button style="width:95px;" data-id="${item.uuid}" class="ui mini basic button action_relations_load_view">
          <i class="icon camera"></i>
          ${item.name? item.name.substring(1, 8)+"..": item.name}
        </button>
        <button data-id="${item.uuid}" class="ui button action_relations_update_snapshot"><i data-id="${item.uuid}" class="save icon "></i></button>
        <button data-id="${item.uuid}" class="ui button action_relations_remove_snapshot"><i data-id="${item.uuid}" class="times circle outline icon "></i></button>
      </div>
      `

    return html
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
    }
  }



  var init = function (options) {
    // there is multiple mode in this view. default one
    //is relation. This is modified by the init param when non-default view is triggered
    if (options && options.context && options.context == "interfaces") {
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

    bind(".action_relations_toogle_show_functions","click",(e)=>{ elementVisibility.functions = !elementVisibility.functions; update(); }, container)
    bind(".action_relations_toogle_show_requirements","click",(e)=>{ elementVisibility.requirements = !elementVisibility.requirements; update(); }, container)
    bind(".action_relations_toogle_show_stakeholders","click",(e)=>{ elementVisibility.stakeholders = !elementVisibility.stakeholders; update(); }, container)
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
        showVisibilityMenuSnapshot = true
      }else{
        elem.classList.add('hidden')
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
    bind(".action_relations_isolate_nodes","click",(e)=>{
      let selectedNodes = activeGraph.getSelectedNodes()
      isolateSelectedNodes(selectedNodes, false)
    }, container)
    bind(".action_relations_isolate_nodes_and_children","click",(e)=>{
      let selectedNodes = activeGraph.getSelectedNodes()
      isolateSelectedNodes(selectedNodes, true)
    }, container)
    bind(".action_restore_last_interface_toogle_network","click",(e)=>{
      function toggleFixedGraph() {
        fixedValues = !fixedValues
        update()
      }
      if (objectIsActive) {
        setTimeout(function () {
          toggleFixedGraph()
        }, 1);
      }
    }, container)
    bind(".action_relations_load_view","click",(e)=>{
      function setSnapshot() {
        let graph = query.currentProject().graphs.items.find(i=> i.uuid == e.target.dataset.id)
        fixedValues = true
        hiddenItemsFromSideView= graph.hiddenItems || []
        if (graph.elementVisibility) {
          groupElements= deepCopy(graph.groupElements);//prevent memory space linking between graph and view TODO investigate why needed here and in save
          elementVisibility= deepCopy(graph.elementVisibility);
        }
        currentSnapshot = e.target.dataset.id
        update()
      }
      setTimeout(function () {
        setSnapshot()
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

      }, 1);
    }, container)
    bind(".action_relations_add_snap_view","click",(e)=>{
      let snapshotName = prompt("Add a Snapshot")
      let graphItem = {uuid:genuuid(), view:activeMode, name:snapshotName, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
      push(act.add("graphs", graphItem))
      update()
    }, container)
    bind(".action_relations_remove_snapshot","click",(e)=>{
      if (confirm("Delete this snapshot")) {
        push(act.remove("graphs", {uuid:e.target.dataset.id}))
        update()
      }
    }, container)
    bind(".action_relations_update_snapshot","click",(e)=>{
      if (confirm("Update this snapshot")) {
        let graph = query.currentProject().graphs.items.find(i=> i.uuid == e.target.dataset.id)
        let newGraphItem = {uuid:genuuid(),view:activeMode, name:graph.name, groupElements:deepCopy(groupElements), elementVisibility: deepCopy(elementVisibility), hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
        push(act.remove("graphs", {uuid:e.target.dataset.id}))
        push(act.add("graphs", newGraphItem))
        update()
      }
    }, container)
    bind(".action_fade_other_node_toogle_network","change",(e)=>{
      console.log(e.target.value);
      fadeOtherNodesOnHoover = !fadeOtherNodesOnHoover
      activeGraph.setFadeOtherNodesOnHoover(fadeOtherNodesOnHoover)
      console.log(queryDOM('.action_fade_other_node_toogle_network'));
      // queryDOM('.action_fade_other_node_toogle_network').checked = true;
      // queryDOM('.action_fade_other_node_toogle_network').dispatchEvent(new Event('change'))
      //update()
    }, container)

    //INTERFACES MENU connections
    bind(".action_interfaces_toogle_compose","click",(e)=>{
      addMode = "compose"
      update()
    }, container)
    bind(".action_interfaces_toogle_physical","click",(e)=>{
      addMode = "physical"
      update()
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
        <div style="opacity: 0.85;height: 99%;width: 250px;position: absolute;left:0px;top:1px;background-color: white; overflow-y:auto;overflow-x: hidden;" class="${showVisibilityMenuSnapshot ? '':'hidden'} menuSnapshotGraph"></div>
      </div>`

    renderMenu(container)

    //append container and add graph afterward //TODO should be reveresed

    document.querySelector(".center-container").innerHTML=''
    document.querySelector(".center-container").appendChild(container)

    //render graph

    var array1 =store.functions.items.map((e) => {e.customColor="#ffc766";e.labels = ["Functions"]; return e})
    var array2 =store.currentPbs.items.map((e) => {e.customColor="#6dce9e";e.labels = ["Pbs"]; return e})
    var array3 = store.requirements.items.map((e) => {e.customColor="#ff75ea";e.labels = ["Requirements"]; return e})
    var array4 = store.stakeholders.items.map((e) => {e.customColor="#68bdf6 ";e.labels = ["User"]; e.properties= {"fullName": e.lastName}; return e})

    itemsToDisplay = []
    itemsToDisplay = itemsToDisplay.concat(array2)
    if (elementVisibility.requirements) { itemsToDisplay = itemsToDisplay.concat(array3) }
    if (elementVisibility.functions) { itemsToDisplay = itemsToDisplay.concat(array1) }
    if (elementVisibility.stakeholders) { itemsToDisplay = itemsToDisplay.concat(array4) }

    //remove hidden items from tree

    let filteredItemsToDisplay = itemsToDisplay.filter(i=> !hiddenItemsFromSideView.includes(i.uuid))

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

      relations = []//checl what connection to display TODO store in func
      if (elementVisibility.metaLinks) {
        relations = relations.concat(store.metaLinks.items)
      }
      if (elementVisibility.interfaces) {
        relations = relations.concat(store.interfaces.items)
      }
      if (elementVisibility.compose) {
        relations = relations.concat(store.currentPbs.links.map((e) => {e.customColor="#6dce9e";e.type = "Composed by"; return e}))
        groupLinks = []
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
      //copy relations
      let relationToDisplay = relations.concat([])
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

  var isolateSelectedNodes = function (currentSelected, showChildren) {
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

  var displaySideMenuFromSearch = function (filteredIds) {
    console.log(filteredIds);
    var searchedItems = document.querySelectorAll(".searchable_item.list-item")
    for (item of searchedItems) {
      if (filteredIds.includes(item.dataset.id) || !filteredIds[0]) {item.style.display = "block"}else{item.style.display = "none"}
    }

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
          metaLinks : true,
          interfaces : false,
          compose : true
        }
        objectIsActive = true;
        update()//update first to poulate elements

        isolateSelectedNodes([{uuid:options.param.uuid}], true)
      }
    }

    objectIsActive = true;
    update()
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
      <button class="ui basic icon button action_relations_toogle_show_graph_snapshot_menu">
        <i class="camera icon action_relations_toogle_show_graph_snapshot_menu"></i>
      </button>
    </div>
    <div class="ui item">
      <div class="ui toggle checkbox">
        <input ${fixedValues ? 'checked':''} class="action_restore_last_interface_toogle_network" type="checkbox" name="public">
        <label>Fixed Graph</label>
      </div>
    </div>
    <div class="ui item">
      <div class="ui toggle checkbox">
        <input ${fadeOtherNodesOnHoover ? 'checked':''} class="action_fade_other_node_toogle_network" type="checkbox" name="public">
        <label>Highlight connections</label>
      </div>
    </div>
    <div class="ui item">
      <div class="ui icon input">
        <input class="input_relation_search_nodes" type="text" placeholder="Search...">
        <i class="search icon"></i>
      </div>
    </div>
    <div class="ui item">
      <button class="ui basic icon button">
        <i class="download icon action_relations_export_png"></i>
      </button>
    </div>
    `
    let relationsMenuHTML =`
    <div class="ui item">
      <div class="ui button basic action_relations_toogle_show_graph_menu">Toogle Visibility</div>
    </div>
    <div class="right menu">
      <div class="ui item">
        <div class="ui mini basic buttons">
          <div class="ui button add_relations_nodes action_interface_add_stakeholder">Add Stakeholders</div>
          <div class="ui button add_relations_nodes action_interface_add_requirement">Add Requirements</div>
          <div class="ui button add_relations_nodes action_interface_add_pbs">Add Product</div>
          <div class="ui button add_relations_nodes action_interface_add_functions">Add Functions</div>
        </div>
      </div>

    </div>`
    let interfacesMenuHTML =`
    <div class="right menu">
      <div class="ui item">
        <div class="ui toggle checkbox">
          <input ${elementVisibility.compose? 'checked':''} class="action_interfaces_toogle_show_compose" type="checkbox" name="public">
          <label>Show Compositions</label>
        </div>
      </div>
      <div class="ui item">
        <div class="ui toggle checkbox">
          <input ${elementVisibility.interfaces ? 'checked':''} class="action_interfaces_toogle_show_interfaces" type="checkbox" name="public">
          <label>Show Interfaces</label>
        </div>
      </div>
      <div class="ui item">
        <div class="ui mini basic buttons">
          <div class="ui button action_interfaces_add_pbs">Add Product</div>
        </div>
      </div>
      <div class="ui item">
        <div class="ui mini basic buttons">
          <div class="${addMode=='compose' ? 'active':''} ui button action_interfaces_toogle_compose">Add Composed Connection</div>
          <div class="${addMode=='physical' ? 'active':''} ui button action_interfaces_toogle_physical">Add Physical Connection</div>
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
    container.querySelector('.target_relations_view_list').innerHTML= theme.viewListOptions() + viewMenuHtml
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
          'Project': {fill:"#73787f", transform:"scale("+0.05+") translate(-250, -250)", path:"M128 148v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12zm140 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-128 96h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm128 0h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm-76 84v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm76 12h40c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12zm180 124v36H0v-36c0-6.6 5.4-12 12-12h19.5V24c0-13.3 10.7-24 24-24h337c13.3 0 24 10.7 24 24v440H436c6.6 0 12 5.4 12 12zM79.5 463H192v-67c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v67h112.5V49L80 48l-.5 415z"}
          // 'Functions': 'cogs',
          // 'Pbs': 'dolly',
          // 'Requirements': 'comment',
          // 'User': 'user',
          // 'Project': 'building'
      },
      images: {
          'Address': 'img/twemoji/1f3e0.svg',
          'Usedr': 'img/twemoji/1f600.svg'
      },
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
    var storeGroup=undefined
    if (node.labels[0] == "Requirements") { storeGroup = "requirements"}
    if (node.labels[0] == "Functions") { storeGroup = "functions"}
    if (node.labels[0] == "User") { storeGroup = "stakeholders"}
    if (node.labels[0] == "Pbs") { storeGroup = "currentPbs"}
    var store = query.currentProject()
    var originItem = store[storeGroup].items.filter(e=> e.uuid == node.uuid)
    showListMenu({
      sourceData:store[storeGroup].items,
      sourceLinks:store[storeGroup].links,
      displayProp:"name",
      searchable : false,
      singleElement:originItem[0],
      rulesToDisplaySingleElement:generateRulesFromNodeType(node.labels[0],store),
      display:[
        {prop:"name", displayAs:"Name", edit:false}
      ],
      idProp:"uuid",
      onCloseMenu: (ev)=>{

      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
      },
      onEditChoiceItem: (ev)=>{
        startSelectionFromParametersView(ev)
      },
      onEditItem: (ev)=>{
        createInputPopup({
          originalData:ev.target.dataset.value,
          onSave:e =>{
            push(act.edit(storeGroup,{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            ev.select.update()
          },
          onClose:e =>{
            push(act.edit(storeGroup,{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:e}))
            ev.select.update()
            update()//update graph
          }
        })
      }
    })
  }

  function startSelectionFromParametersView(ev) {
    var store = query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceGroup = undefined
    if (metalinkType == "originNeed") {
      sourceGroup="requirements"
    }else if (metalinkType == "originFunction") {
      sourceGroup="functions"
    }
    var sourceData = store[sourceGroup].items
    var sourceLinks=store[sourceGroup].links
    showListMenu({
      sourceData:sourceData,
      sourceLinks:sourceLinks,
      parentSelectMenu:ev.select ,
      multipleSelection:currentLinksUuidFromDS,
      displayProp:"name",
      searchable : true,
      display:[
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", fullText:true, edit:false}
      ],
      idProp:"uuid",
      onAdd:(ev)=>{
        var uuid = genuuid()
        push(act.add(sourceGroup, {uuid:uuid,name:"Edit Item"}))
        ev.select.setEditItemMode({
          item:store[sourceGroup].items.filter(e=> e.uuid == uuid)[0],
          onLeave: (ev)=>{
            push(act.remove(sourceGroup,{uuid:uuid}))
            ev.select.updateData(store[sourceGroup].items)
          }
        })
      },
      onEditItem: (ev)=>{
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit(sourceGroup, {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onCloseMenu: (ev)=>{
        console.log(ev.select);
        ev.select.getParent().update()
      },
      onChangeSelect: (ev)=>{
        console.log(ev.select.getSelected());
        console.log(store.metaLinks.items);
        store.metaLinks.items = store.metaLinks.items.filter(l=>!(l.type == metalinkType && l.source == sourceTriggerId && currentLinksUuidFromDS.includes(l.target)))
        console.log(store.metaLinks.items);
        for (newSelected of ev.select.getSelected()) {
          push(act.add("metaLinks",{type:metalinkType, source:sourceTriggerId, target:newSelected}))
        }
        //ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
        // ev.select.getParent().update()
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }

  function generateRulesFromNodeType(type, store) {
    if (type == "Functions") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false}
      ]
    }else if (type =="Requirements") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"origin", displayAs:"Linked to", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:false}
      ]
    }else if (type =="Pbs") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Linked to requirements", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"originFunction", displayAs:"Linked to functions", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:true}
      ]
    }else {
      return [{prop:"name", displayAs:"Name", edit:"true"},
              {prop:"desc", displayAs:"Description", edit:"true"}
      ]
    }
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
    }else if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "Pbs") {
      //check for circular references
      if (addMode == "physical") {
          let isCircularRef = store.interfaces.items.find(i => (i.target == lastSelectedNode.uuid && i.source == previousSelectedNode.uuid)|| (i.source == lastSelectedNode.uuid && i.target == previousSelectedNode.uuid) )
          if (!isCircularRef) {
            push(act.add("interfaces",{type:"Physical connection", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
          }else {
            alert("Circular reference. Action not possible")
          }
      }else if (addMode == "compose") {
          let isCircularRef = store.currentPbs.links.find(i => (i.target == lastSelectedNode.uuid && i.source == previousSelectedNode.uuid)|| (i.source == lastSelectedNode.uuid && i.target == previousSelectedNode.uuid) )
          let targetIsRoot = !store.currentPbs.links.find(i=> i.target == previousSelectedNode.uuid)

          if (!isCircularRef && !targetIsRoot) {
            push(movePbs({origin:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
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
