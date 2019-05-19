var createInterfacesView = function () {
  var self ={};
  var objectIsActive = false;

  var displayType = "network";
  var activeGraph = undefined;
  var fixedValues = undefined;
  var fadeOtherNodesOnHoover =false;
  var lastSelectedNode = undefined;
  var previousSelectedNode = undefined;
  var addMode = "physical";
  var addItemMode ="currentPbs"
  var showCompose = true;
  var showInterfaces = true;

  var itemsToFixAtNextUpdate = []

  var currentGraphTransformation=[0,0,1]

  var init = function () {
    connections()

  }
  var connections =function () {
    connect(".action_interfaces_toogle_compose","click",(e)=>{
      addMode = "compose"
      update()
    })
    connect(".action_interfaces_toogle_physical","click",(e)=>{
      addMode = "physical"
      update()
    })
    connect(".action_interfaces_add_pbs","click",(e)=>{
      var id = genuuid()
      var newReq = prompt("Nouveau Besoin")
      push(addPbs({uuid:id, name:newReq}))
      push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:id}))
      //activeGraph.updateWithD3Data(data);
      update()
    })
    connect(".action_interfaces_toogle_show_compose","click",(e)=>{
        showCompose = !showCompose
        update()
    })
    connect(".action_interfaces_toogle_show_interfaces","click",(e)=>{
        showInterfaces = !showInterfaces
        update()
    })
    connect(".action_interfaces_restore_last_interface_toogle_network","click",(e)=>{
      function toggleFixedGraph() {
        fixedValues = !fixedValues
        update()
      }
      setTimeout(function () {
        toggleFixedGraph()
      }, 1);
    })
    connect(".action_interfaces_fade_other_node_toogle_network","change",(e)=>{
      console.log(e.target.value);
      fadeOtherNodesOnHoover = !fadeOtherNodesOnHoover
      activeGraph.setFadeOtherNodesOnHoover(fadeOtherNodesOnHoover)
      console.log(queryDOM('.action_interfaces_fade_other_node_toogle_network'));
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
      <div style="height: 100%" class="interfaceGraph"></div>`

    renderMenu()
    // var array1 =store.functions.items.map((e) => {e.color="#3da4ab";e.labels = ["Functions"]; return e})
    var array2 =store.currentPbs.items.map((e) => {e.customColor="#6dce9e";e.labels = ["Pbs"]; return e})
    // var array3 = store.requirements.items.map((e) => {e.color="#e6e6ea";e.labels = ["Requirements"]; return e})
    // var array4 = store.stakeholders.items.map((e) => {e.color="#fed766 ";e.labels = ["User"]; e.properties= {"fullName": e.lastName}; return e})
    // var concatData = array1.concat(array2).concat(array3).concat(array4)
    var concatData = array2

    var groupLinks =[]
    var initIndex = 0
    var currentIndex = 0
    var groups = [array2]
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
    console.log(concatData);
    console.log(groupLinks);

    if(displayType == "network"){
      if (fixedValues) {
        var fixedValuesList = []
        if (query.currentProject().graphs && query.currentProject().graphs.items[1]) {
          fixedValuesList = query.currentProject().graphs.items[1] //check if graph is in DB
        }
        //concat with items to fix this time
        var allFixedValues = fixedValuesList.concat(itemsToFixAtNextUpdate)
        itemsToFixAtNextUpdate = []//clear buffer of new objects to be fixed
        allFixedValues.forEach(f =>{
          var match = concatData.find(c => c.uuid == f.uuid)
          if (match) {
            match.fx =f.fx ; match.x =f.fx;
            match.fy=f.fy; match.y =f.fy;
          }
        })
      }
      var relations = []//checl what connection to display TODO store in func
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
          }else {
            //Why is it activated so much
            previouslyStored.qty ++
            relation.displacement = 6*previouslyStored.qty
          }
        }
      }
      renderforcesTree({nodes:concatData, relationships:relations, groupLinks:groupLinks})
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
          <input ${fixedValues ? 'checked':''} class="action_interfaces_restore_last_interface_toogle_network" type="checkbox" name="public">
          <label>Fixed Graph</label>
        </div>
      </div>
      <div class="ui item">
        <div class="ui toggle checkbox">
          <input ${fadeOtherNodesOnHoover ? 'checked':''} class="action_interfaces_fade_other_node_toogle_network" type="checkbox" name="public">
          <label>Highlight connections</label>
        </div>
      </div>
      <div class="right menu">
        <div class="ui item">
          <div class="ui toggle checkbox">
            <input ${showCompose ? 'checked':''} class="action_interfaces_toogle_show_compose" type="checkbox" name="public">
            <label>Show Compositions</label>
          </div>
        </div>
        <div class="ui item">
          <div class="ui toggle checkbox">
            <input ${showInterfaces ? 'checked':''} class="action_interfaces_toogle_show_interfaces" type="checkbox" name="public">
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
      </div>
    </div>
    `
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
      groupLabels:false,
      rootNode:true,
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
          if (!query.currentProject().graphs ) {
            query.currentProject().graphs = {}
            query.currentProject().graphs.items =[]
          }
          query.currentProject().graphs.items[1] = activeGraph.exportNodesPosition("all")
          console.log(query.currentProject());
          //END TEST
        }
      },
      onNodeContextMenu:function (node) {
        showEditMenu(node)
      },
      onNodeClick:function (node) {
        previousSelectedNode = lastSelectedNode;
        lastSelectedNode = node;
        //TODO clean not needed
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
      onRelationshipDoubleClick:function (d) {
        console.log(d);
        if (d.type != "Composed by" && confirm("remove interface?")) {
          push(act.remove("interfaces",{uuid:d.uuid}))
          update()
        }
      },
      onLinkingEnd :function (e) {
        console.log(e);
        linkNodes(e[0],e[1])
        update()
      },
      onCanvasZoom:function (e) {//TODO finish implementation
        console.log(e);
        currentGraphTransformation=[e.translate[0],e.translate[1],e.scale]
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
      onEditChoiceItem: (ev)=>{
        startSelectionFromParametersView(ev)
      },
      onLabelClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id)
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

  function generateRulesFromNodeType(type, store) {
    if (type == "Functions") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Lié au besoins", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true}
      ]
    }else if (type =="Requirements") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"origin", displayAs:"Lié à", meta:()=>store.metaLinks.items, choices:()=>store.stakeholders.items, edit:true}
      ]
    }else if (type =="Pbs") {
      return [{prop:"name", displayAs:"Name", edit:"true"},
        {prop:"desc", displayAs:"Description", edit:"true"},
        {prop:"originNeed", displayAs:"Lié au besoins", meta:()=>store.metaLinks.items, choices:()=>store.requirements.items, edit:true},
        {prop:"originFunction", displayAs:"Lié à la fonction", meta:()=>store.metaLinks.items, choices:()=>store.functions.items, edit:true}
      ]
    }else {
      return [{prop:"name", displayAs:"Name", edit:"true"},
              {prop:"desc", displayAs:"Description", edit:"true"}
      ]
    }
  }

  function linkNodes(lastSelectedNode, previousSelectedNode) {
    if (addMode == "physical") {
      var store = query.currentProject() //TODO ugly
      var nodeTypes = [lastSelectedNode.labels[0],previousSelectedNode.labels[0]]
      if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "Pbs") {
        console.log("Pbs", "Pbs");
        push(act.add("interfaces",{type:"Physical connection", source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
      }
    }else if (addMode == "compose") {
      var store = query.currentProject() //TODO ugly
      var nodeTypes = [lastSelectedNode.labels[0],previousSelectedNode.labels[0]]
      if (nodeTypes[0] =="Pbs" && nodeTypes[1] == "Pbs") {
        console.log("Pbs", "Pbs");

        push(movePbs({origin:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
        push(removePbsLink({target:previousSelectedNode.uuid}))

        push(act.addLink("currentPbs",{ source:lastSelectedNode.uuid, target:previousSelectedNode.uuid}))
      }
    }

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
    showListMenu({
      sourceData:sourceData,
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

var interfacesView = createInterfacesView();
interfacesView.init()
