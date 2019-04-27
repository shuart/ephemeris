var createRelationsView = function () {
  var self ={};
  var objectIsActive = false;

  var displayType = "network";
  var activeGraph = undefined;
  var fixedValues = undefined;
  var fadeOtherNodesOnHoover =true;
  var lastSelectedNode = undefined;
  var previousSelectedNode = undefined;
  var addLinkMode = false;
  var itemsToFixAtNextUpdate = []

  var currentGraphTransformation=[0,0,1]
  var addItemMode ="currentPbs"
  //What to show
  var hiddenItemsFromSideView = [];
  var showVisibilityMenu = false;

  var showFunctions = true;
  var showRequirements = true;
  var showStakeholders = true;
  var showMetaLinks = true;
  var showInterfaces = false;
  var showCompose = false;

  var groupFunctions = true;
  var groupRequirements = true;
  var groupStakeholders = true;
  var groupPbs = false;
  var currentGroupedLabels = [];

  var currentSnapshot=undefined

  var itemsToDisplay = []
  var relations = []

  var sideListe = undefined

  var theme={
    viewListItem:(item) => {
     let html = `
      <div class="ui mini basic icon buttons">
        <button data-id="${item.uuid}" class="ui mini basic button action_relations_load_view">
          <i class="icon user"></i>
          ${item.name}
        </button>
        <button data-id="${item.uuid}" class="ui button action_relations_update_snapshot"><i data-id="${item.uuid}" class="save icon "></i></button>
        <button data-id="${item.uuid}" class="ui button action_relations_remove_snapshot"><i data-id="${item.uuid}" class="times circle outline icon "></i></button>
      </div>
      `

    return html
    },
    viewListAdd:() => {
     let html = `
      <button data-id="" class="ui mini basic button action_relations_add_snap_view">
        <i class="icon plus"></i>
        Add a snapshot
      </button>`
    return html
    }
  }



  var init = function () {
    connections()


  }
  var connections =function () {//TODO rename everyting with _Relations_
    connect(".action_interface_toogle_state","click",(e)=>{
      displayType = "state"
      update()
    })
    connect(".action_interface_toogle_network","click",(e)=>{
      displayType = "network"
      update()
    })
    connect(".action_relations_toogle_group_functions","click",(e)=>{ groupFunctions = !groupFunctions; update(); })
    connect(".action_relations_toogle_group_requirements","click",(e)=>{ groupRequirements = !groupRequirements; update(); })
    connect(".action_relations_toogle_group_stakeholders","click",(e)=>{ groupStakeholders = !groupStakeholders; update(); })
    connect(".action_relations_toogle_group_pbs","click",(e)=>{ groupPbs = !groupPbs; update(); })

    connect(".action_relations_toogle_show_functions","click",(e)=>{ showFunctions = !showFunctions; update(); })
    connect(".action_relations_toogle_show_requirements","click",(e)=>{ showRequirements = !showRequirements; update(); })
    connect(".action_relations_toogle_show_stakeholders","click",(e)=>{ showStakeholders = !showStakeholders; update(); })
    connect(".action_relations_toogle_show_metalinks","click",(e)=>{ showMetaLinks = !showMetaLinks; update(); })
    connect(".action_relations_toogle_show_interfaces","click",(e)=>{ showInterfaces = !showInterfaces; update(); })
    connect(".action_relations_toogle_show_compose","click",(e)=>{ showCompose = !showCompose; update(); })

    connect(".action_interface_add_stakeholder","click",(e)=>{
      addItemMode = 'stakeholders'
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_stakeholder").classList.add('active')
    })
    connect(".action_tree_list_relations_toogle_visibility","click",(e)=>{
      let current = e.target
      let linkedNodeId = current.dataset.id
      let isVisible = !hiddenItemsFromSideView.includes(linkedNodeId)
      if (isVisible) {
        hiddenItemsFromSideView.push(linkedNodeId)
      }else {
        hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, linkedNodeId)
        // current.classList.remove('fa-eye')
        // current.classList.add('fa-eye-slash')
      }
      update()
    })
    connect(".action_relations_toogle_show_graph_menu","click",(e)=>{
      var elem = queryDOM('.menuGraph')
      if (elem.classList.contains('hidden')) {
        elem.classList.remove('hidden')
        showVisibilityMenu = true
      }else{
        elem.classList.add('hidden')
        showVisibilityMenu = false
      }
    })
    connect(".action_interface_add_requirement","click",(e)=>{
      addItemMode = 'requirements'
      console.log(document.querySelectorAll(".add_relations_nodes"));
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_requirement").classList.add('active')
    })
    connect(".action_interface_add_functions","click",(e)=>{
      addItemMode = 'functions'
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_functions").classList.add('active')
    })
    connect(".action_interface_set_new_metalink_mode","click",(e)=>{
      lastSelectedNode = undefined;
      previousSelectedNode = undefined;
      addLinkMode = !addLinkMode
      renderMenu()
    })
    connect(".action_interface_add_new_metalink","click",(e)=>{
      addLinkMode = !addLinkMode
      linkNodes(lastSelectedNode,previousSelectedNode)
      update()
    })
    connect(".action_interface_add_pbs","click",(e)=>{
      addItemMode = 'currentPbs'
      document.querySelectorAll(".add_relations_nodes").forEach(e=>e.classList.remove('active'))
      queryDOM(".action_interface_add_pbs").classList.add('active')
    })
    connect(".action_restore_last_interface_toogle_network","click",(e)=>{
      function toggleFixedGraph() {
        fixedValues = !fixedValues
        update()
      }
      setTimeout(function () {
        toggleFixedGraph()
      }, 1);
    })
    connect(".action_relations_load_view","click",(e)=>{
      function setSnapshot() {
        let graph = query.currentProject().graphs.items.find(i=> i.uuid == e.target.dataset.id)
        fixedValues = true
        hiddenItemsFromSideView= graph.hiddenItems || []
        currentSnapshot = e.target.dataset.id
        update()
      }
      setTimeout(function () {
        setSnapshot()
      }, 1);
    })
    connect(".action_relations_add_snap_view","click",(e)=>{
      let snapshotName = prompt("Add a Snapshot")
      let graphItem = {uuid:genuuid(), name:snapshotName, hiddenItems:hiddenItemsFromSideView, nodesPositions:activeGraph.exportNodesPosition("all")}
      push(act.add("graphs", graphItem))
      update()
    })
    connect(".action_relations_remove_snapshot","click",(e)=>{
      if (confirm("Delete this snapshot")) {
        push(act.remove("graphs", {uuid:e.target.dataset.id}))
        update()
      }
    })
    connect(".action_relations_update_snapshot","click",(e)=>{
      if (confirm("Update this snapshot")) {
        let graph = query.currentProject().graphs.items.find(i=> i.uuid == e.target.dataset.id)
        let newGraphItem = {uuid:genuuid(), name:graph.name, nodesPositions:activeGraph.exportNodesPosition("all")}
        push(act.remove("graphs", {uuid:e.target.dataset.id}))
        push(act.add("graphs", newGraphItem))
        update()
      }
    })
    connect(".action_fade_other_node_toogle_network","change",(e)=>{
      console.log(e.target.value);
      fadeOtherNodesOnHoover = !fadeOtherNodesOnHoover
      activeGraph.setFadeOtherNodesOnHoover(fadeOtherNodesOnHoover)
      console.log(queryDOM('.action_fade_other_node_toogle_network'));
      // queryDOM('.action_fade_other_node_toogle_network').checked = true;
      // queryDOM('.action_fade_other_node_toogle_network').dispatchEvent(new Event('change'))
      //update()
    })

  }

  var render = function () {
    var store = JSON.stringify(query.currentProject())
    store = JSON.parse(store)
    document.querySelector('.center-container').innerHTML=`
      <div class='menuArea'></div>
      <div style="height: 100%; position: relative" class='graphArea'>
        <div style="height: 100%" class="interfaceGraph"></div>
        <div style="opacity: 0.85;height: 99%;width: 250px;position: absolute;right:0px;top:1px;background-color: white;" class="${showVisibilityMenu ? '':'hidden'} menuGraph"></div>
      </div>`

    renderMenu()

    var array1 =store.functions.items.map((e) => {e.customColor="#ffc766";e.labels = ["Functions"]; return e})
    var array2 =store.currentPbs.items.map((e) => {e.customColor="#6dce9e";e.labels = ["Pbs"]; return e})
    var array3 = store.requirements.items.map((e) => {e.customColor="#ff75ea";e.labels = ["Requirements"]; return e})
    var array4 = store.stakeholders.items.map((e) => {e.customColor="#68bdf6 ";e.labels = ["User"]; e.properties= {"fullName": e.lastName}; return e})

    itemsToDisplay = []
    itemsToDisplay = itemsToDisplay.concat(array2)
    if (showRequirements) { itemsToDisplay = itemsToDisplay.concat(array3) }
    if (showFunctions) { itemsToDisplay = itemsToDisplay.concat(array1) }
    if (showStakeholders) { itemsToDisplay = itemsToDisplay.concat(array4) }

    //remove hidden items from tree

    let filteredItemsToDisplay = itemsToDisplay.filter(i=> !hiddenItemsFromSideView.includes(i.uuid))

    var groupLinks =[]
    var initIndex = 0
    var currentIndex = 0
    // check the elements that should be grouped together
    //TODO not connected to stellae.. REDO
    var groups = []
    currentGroupedLabels = []


    if (groupRequirements) { currentGroupedLabels.push('Requirements')}
    if (groupFunctions) { currentGroupedLabels.push('Functions') };
    if (groupStakeholders) { currentGroupedLabels.push('User') }
    if (groupPbs) { currentGroupedLabels.push('Pbs') }
    // if (groupRequirements) { groups.push(array3); currentGroupedLabels.push('Requirements')}
    // if (groupFunctions) { groups.push(array1); currentGroupedLabels.push('Functions') };
    // if (groupStakeholders) { groups.push(array4); currentGroupedLabels.push('User') }
    // if (groupPbs) { groups.push(array2); currentGroupedLabels.push('Pbs') }

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
        }else {// if not go to default
          if (query.currentProject().graphs && query.currentProject().graphs.default) {
            fixedValuesList = query.currentProject().graphs.default.nodesPositions ||query.currentProject().graphs.items[0] //check if graph is in DB backward compatibility
          }
          console.log(fixedValuesList);
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
      if (showMetaLinks) {
        relations = relations.concat(store.metaLinks.items)
      }
      if (showInterfaces) {
        relations = relations.concat(store.interfaces.items)
      }
      if (showCompose) {
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
    console.log(sideListe);
    if (sideListe && !document.querySelector(".tree_list_area")==null) {
      udapteSideListe()
    }else {
      renderSideListe()
    }
  }

  var renderSideListe = function () {
    sideListe = createTreeList({
      container:document.querySelector(".left-list"),
      items: itemsToDisplay,
      links:relations,
      customEyeActionClass:"action_tree_list_relations_toogle_visibility"
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



  var renderMenu=function () {
    document.querySelector('.center-container .menuArea').innerHTML=`
    <div class="ui mini compact text menu">
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
        <div class="ui item">
          <div class="ui icon input">
            <input class="input_relation_search_nodes" type="text" placeholder="Search...">
            <i class="search icon"></i>
          </div>
        </div>
      </div>
    </div>
    `
    document.querySelector('.input_relation_search_nodes').addEventListener('keyup', function(e){
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
      }else {//if null reset
        activeGraph.setFocusedNodes("uuid", [], ["mark","hideOthers"])
      }
    });

    document.querySelector('.center-container .menuGraph').innerHTML=`
    <div class="ui item action_relations_toogle_show_graph_menu"><i class="close icon"></i></div>
    <div class="ui secondary pointing vertical menu">
      <div class="item">
        <div class="header">Show Items</div>
        <div class="menu">
        <a class="${showFunctions ? 'active teal':''} ui item action_relations_toogle_show_functions">Functions</a>
        <a class="${showRequirements ? 'active teal':''} ui item action_relations_toogle_show_requirements">Requirements</a>
        <a class="${showStakeholders ? 'active teal':''} ui item action_relations_toogle_show_stakeholders">Stakeholders</a>
        </div>
      </div>
      <div class="item">
        <div class="header">Show Links</div>
        <div class="menu">
        <a class="${showMetaLinks ? 'active teal':''} ui item action_relations_toogle_show_metalinks">Origins</a>
        <a class="${showCompose ? 'active teal':''} ui item action_relations_toogle_show_compose">Compositions</a>
        <a class="${showInterfaces ? 'active teal':''} ui item action_relations_toogle_show_interfaces">Interfaces</a>
        </div>
      </div>
      <div class="item">
        <div class="header">Group Items Together</div>
        <div class="menu">
        <a class="${groupFunctions ? 'active teal':''} ui item action_relations_toogle_group_functions">Functions</a>
        <a class="${groupRequirements ? 'active teal':''} ui item action_relations_toogle_group_requirements">Requirements</a>
        <a class="${groupStakeholders ? 'active teal':''} ui item action_relations_toogle_group_stakeholders">Stakeholders</a>
        <a class="${groupPbs ? 'active teal':''} ui item action_relations_toogle_group_pbs">Products</a>
        </div>
      </div>
      <div class="item">
        <div class="header">Snapshots</div>
        <div class="menu target_relations_view_list">
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
    let viewMenuHtml =relationViews.slice()
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
    queryDOM('.target_relations_view_list').innerHTML= theme.viewListAdd() + viewMenuHtml
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
      fadeOtherNodesOnHoover:fadeOtherNodesOnHoover,
      icons: {
          'Functions': 'cogs',
          'Pbs': 'dolly',
          'Requirements': 'comment',
          'User': 'user',
          'Project': 'building'
      },
      images: {
          'Address': 'img/twemoji/1f3e0.svg',
          'Usedr': 'img/twemoji/1f600.svg'
      },
      minCollision: 60,
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
          query.currentProject().graphs.default = graphItem//TODO use actions
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
      onEditItem: (ev)=>{
        // console.log("Edit");
        // var newValue = prompt("Edit Item",ev.target.dataset.value)
        // if (newValue) {
        //   console.log(ev.target.dataset.id);
        //   console.log(ev.target.dataset.prop);
        //   push(act.edit(storeGroup,{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        // }
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

  function generateRulesFromNodeType(type, store) {
    if (type == "Functions") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Lié au besoins", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false}
      ]
    }else if (type =="Requirements") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"origin", displayAs:"Lié à", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:false}
      ]
    }else if (type =="Pbs") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Lié au besoins", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:false},
        {prop:"originFunction", displayAs:"Lié à la fonction", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:false}
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
