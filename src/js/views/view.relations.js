var createRelationsView = function () {
  var self ={};
  var objectIsActive = false;


  var currentSnapshot=undefined
  var recentSnapshot=undefined

  var itemsToDisplay = []
  var relations = []
  var relationsTree = {}
  var relationsTargetTree = {}
  var interfacesToTypesMapping = {}
  var view = createAdler({
    container:document.querySelector(".center-container")
  })
  var nodeWalkType="menu"

  var sideListe = undefined

  var container = undefined

  var activeGraph = undefined

  var data = {
    nodes:[
          {
              id:"efsfdsfse",
              uuid:"efsfdsfse",
              x:0,
              y:0,
              name:"variable_1",
              customColor:"#f27506",
              properties: {
                  name: "variable_1",
                  type:"variable",
                  value:5,
                  function:"",
              }
          },
          {
              id:"efddddsfdsfse",
              uuid:"efddddsfdsfse",
              x:10,
              y:10,
              name:"variable_2",
              customColor:"#f27506",
              properties: {
                  name: "variable_2",
                  type:"variable",
                  value:15,
                  function:"",
              }
          }
      ],
      relationships:[
        {
          addedDate: 1642265630886,
          customColor: "#6dce9e",
          customDashArray: undefined,
          displayType: "related",
          index: 0,
          name: "Interface between eQTCeorQ8bdUFhrv and eZg3kiIRG55DD9ee",
          source: "efsfdsfse",
          target: "efddddsfdsfse",
          type: "Physical connection",
          typeId: "eCE7v9p9YCO3Y57O",
          uuid: "ef7IUJkfoYAmU5IO",
        }
      ],
      notes:[],
      groups:[]
    }
    var dataB = {
      nodes:[
            {
                id:"efsfdsfse",
                uuid:"efsfdsfse",
                x:0,
                y:0,
                name:"variable_1",
                customColor:"#f27506",
                properties: {
                    name: "variable_1",
                    type:"variable",
                    value:5,
                    function:"",
                }
            },
            {
                id:"efddddsfdsfse",
                uuid:"efddddsfdsfse",
                x:10,
                y:10,
                vx:10,
                vy:10,
                fx:10,
                fy:10,
                name:"variable_2",
                customColor:"#f27506",
                properties: {
                    name: "variable_2",
                    type:"variable",
                    value:15,
                    function:"",
                }
            }
        ],
        relationships:[
          {
            addedDate: 1642265630886,
            customColor: "#6dce9e",
            customDashArray: undefined,
            displayType: "related",
            index: 0,
            name: "Interface between eQTCeorQ8bdUFhrv and eZg3kiIRG55DD9ee",
            source: "efsfdsfse",
            target: "efddddsfdsfse",
            type: "Physical connection",
            typeId: "eCE7v9p9YCO3Y57O",
            uuid: "ef7IUJkfoYAmU5IO",
          }
        ],
        notes:[],
        groups:[]
      }



  var init = function (options) {
    setUpMenu()

  }

  var setUpMenu = function () {
    view.addCSS(`
        .relations_toolbar{
          opacity: 0.90;
          border-radius: 5px;
          background-color: white;
          width: 46px;
          position: absolute;
          left: 287px;
          top: 144px;
          padding: 5px;
          box-shadow: 0px 0px 18px -6px rgba(0,0,0,0.35);
          z-index:999999999999999999999;
        }
        .relations_button{
          margin-top:0.6em;
          opacity: 0.7;
          margin-bottom:0.6em;
          display: block;
          float: none;
          width: 100%;
          text-align: center;
          box-shadow: none;
          border-radius: 0;
          cursor:pointer;
        }
        .relations_button:hover{
          opacity: 1;
        }

    `)
    view.createLens("relations_toolbar",(d)=>`
        <div class="relations_toolbar">
          <div class="relations_button" ><i class="fa-solid fa-circle-plus"></i></div>
          <div class="relations_button" ><i class="fa-solid fa-code-branch"></i></div>
          <div class="relations_button" ><i class="fa-solid fa-shuffle"></i></div>
          <div class="relations_button actions_relations_selection" ><i class="fas fa-border-style"></i></div> 
          <div class="relations_button" ><i class="fa-regular fa-eye"></i></div> 
          <div class="relations_button" ><i class="fa-regular fa-eye-slash"></i></i></div> 
          <div class="relations_button actions_relations_addNote" ><i class="fa-regular fa-note-sticky"></i></div> 
          <div class="relations_button actions_relations_addGroup" ><i class="fa-solid fa-object-group"></i></div> 
          <div class="relations_button" ><i class="fa-regular fa-bookmark"></i></div> 
          

        </div>
        <div class='graph' style='width:100%; height:100%; position:absolute;'></div>`
    )

    let relations_toolbar = view.addLens("relations_toolbar",{
      data:{title:"Ephemeris"},
      on:[
          [".actions_relations_selection", "click", async ()=>{
            activeGraph.setSelectionModeActive()
          }],
          [".actions_relations_addNote", "click", async ()=>{
            addNote()
          }],
          [".actions_relations_addGroup", "click", async ()=>{
            addGroup()
          }],
      ],
      // on:[
      //     [".action_startup_add_user", "click", async ()=>{
      //       var popup= await createPromptPopup({
      //         title:"Add a new session",
      //         imageHeader:"./img/tele.png",
      //         fields:{ type:"input",id:"sessionName" ,label:"Session name", placeholder:"Set a name for this new session" }
      //       })
      //       // var userName = prompt("Add a user")
      //       userName = popup.result
      //       if (userName && userName != "") {
      //         dbConnector.setUser({name:userName,projects:[]}).then(function () {
      //           getUsersData()
      //         })
      //       }
            
      //     }],
      // ],
      
     })

  }

  // HELPER Function for data structure

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

  var mapInterfacesToIds = function (store) {//build mapping for performances
    interfacesToTypesMapping = {}
    for (var i = 0; i < store.interfaces.length; i++) {
      let ml=  store.interfaces[i]
      if (ml.typeId) {
        let item = store.interfacesTypes.find(t=>t.uuid == ml.typeId)
        if (!interfacesToTypesMapping[ml.uuid]) {
          interfacesToTypesMapping[ml.uuid] = item
        }
      }
    }
    return interfacesToTypesMapping
  }

  var transferToRelationsForEach = function (array, modificationCallback) {
    relations = []//checl what connection to display TODO store in func
    relationsTree = {}//checl what connection to display TODO store in func
    relationsTargetTree = {}
    for (var i = 0; i < array.length; i++) {
      let item = array[i]
      let newItem = Object.assign({},item)
      modificationCallback(newItem)
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

    return {relations:relations,relationsTree: relationsTree,relationsTargetTree:relationsTargetTree}
  }

  var getInterfaceTypeFromUuid = function (store,interfacesToTypesMapping, uuid) {
    let interfaceType = interfacesToTypesMapping[uuid]
    if (interfaceType) {
      return interfaceType.name
    }else {
      return "Unknown Type"
    }
  }
  var getInterfaceDashArrayTypeFromUuid = function (store,interfacesToTypesMapping, uuid) {
    let interfaceType = interfacesToTypesMapping[uuid]
    if (interfaceType) {
      return (interfaceType.dashArray==1)? "3 4": undefined
    }else {
      return undefined
    }
  }


  var createCategoriesData = async function (store) {
    var store = store || await query.currentProject()
    let dic = {}
    let data = []
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      dic[cat.uuid] = cat

    }
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      if (cat.parentCat) {
        cat.parentCatName = [ dic[cat.parentCat] ]
        if (!dic[cat.parentCat]._children) {dic[cat.parentCat]._children =[]}
        dic[cat.parentCat]._children.push(cat)
      }else {
        cat.parentCatName = [ ]//needed so tag formater can go trough the empty array
        data.push(cat)
      }
    }
    return data
  }

  //////////////////////////////////////////////////


  var render = async function(){
    // document.querySelector(".center-container").innerHTML="<div class='graph' style='width:100%; height:100%; position:absolute;'></div>"
    view.render()
    var store = await query.currentProject()
    var categoryStore = {}
    for (var i = 0; i < store.metaLinks.length; i++) {
      let metaType = store.metaLinks[i].type
      if (metaType == "category") {
        categoryStore[store.metaLinks[i].source] = store.metaLinks[i].target
      }
    }
    var array2 =store.currentPbs.map((e) => {e.id=e.uuid, e.customColor=getCustomColorFromItemId(e.uuid, store, categoryStore)||"#6dce9e";e.labels = ["Pbs"]; e.extraLabel=getSvgPathFromItemId(e.uuid, store, categoryStore); return e})
    var array4 = store.stakeholders.map((e) => {e.id=e.uuid, e.customColor="#68bdf6 ";e.labels = ["User"]; e.properties= {"fullName": e.lastName}; return e})

    var itemsToDisplay = []
    itemsToDisplay = itemsToDisplay.concat(array2)


    var interfacesToTypesMapping = mapInterfacesToIds(store)
    var relationsData = transferToRelationsForEach(store.interfaces, e=> {e.displayType = getInterfaceTypeFromUuid(store,interfacesToTypesMapping, e.uuid); e.customDashArray = getInterfaceDashArrayTypeFromUuid(store,interfacesToTypesMapping, e.uuid); e.customColor="#6dce9e";})
    
    data.nodes = itemsToDisplay
    data.relationships = relationsData.relations
    console.log(data)
    // alert("fesfse")

    activeGraph = new stellae(".graph",{
      onCanvasDoubleClick: function (event) {
        console.log("test");
        addNode(event)
      }
        // onLinkingEnd :async function (e) {
        //     console.log(e);
        //     await linkNodes(e[0],e[1])

        //     console.log("save tree",graph.exportNodesPosition());
        //     data.nodesPositions = graph.exportNodesPosition()
        //     update()
        //   },
        //   onNodeClick:function (node,eventData) {
        //     console.log(node,eventData)
        //     updatePropPane(data.nodes.find(n=>n.uuid == node.uuid))
        //     selectedNode = node.uuid
            
        //   },
        //   onNodeDragEnd:function (node,eventData) {
        //       console.log("save tree",graph.exportNodesPosition());
        //     updateNodesPositions()
        //     saveTree(data)
        //     //update()
        //   },
        //   onHelperDragEnd:function (node,eventData) {
        //     console.log("save tree",graph.exportNodesPosition());
        //   updateNodesPositions()
        //   saveTree(data)
        // },
        // onRelationshipDoubleClick:function (d) {
        //     console.log(d)
        //     var confirmed = confirm("delete"+ d.id)
        //     if (confirmed) {
        //         console.log("delte")
        //         deleteRelation(d.id)
        //     }
        //     updateNodesPositions()
        //     saveTree(data)
        // },
        // onNoteRemove:function (d) {
        //     console.log(d)
        //     deleteNote(d.id)
        //     saveTree(data)
          
        // },
        // onSelectionEnd:function (node) {
        //     graph.setSelectionModeInactive()
        // },
        // onCanvasZoom:function (e) {//TODO finish implementation
        //     // console.log(e);
        //     currentGraphTransformation=e
        //   },
        //   startTransform:currentGraphTransformation,
        //   zoomFit: false
    })

    activeGraph.updateWithD3Data(data)
    
    

  }


  /////////////GRAPH INTERACTIONS//////////////////

  var addNote = function () {
    var name = prompt("Note")
    let newId = uuid()
    var noteObject ={
        id:newId,
        uuid:newId,
        x:0,
        y:0,
        name:name,
        customColor:"#25847d",
        content:name
    }
    data.notes.push(noteObject)
    partialUpdateGraph({notes:[noteObject]})
  }
  var addNode = async function (event) {
    let categories = await createCategoriesData()
    console.log(categories);

    let options = categories.map(c => {
      return { type:"button",id:uuid(), label:c.name, onClick:v=>{
        // nodeWalk(currentSelected, false)
        alert("fesfe")
        }
      }
    })

    // let nodeViewable = [{ type:"button",id:uuid(), label:"Show all", onClick:v=>{
      // nodeWalk(currentSelected, false)
    // } }]
    // for (var i = 0; i < itemsToDisplay.length; i++) {
    //   let e = itemsToDisplay[i]
    //   if (relatedNodes.includes(e.uuid) ) {
    //     let field = { type:"button",id:uuid(),customColor:e.customColor,value:e.uuid, label:e.name, onClick:v=>{
    //       console.log(v);
    //       hiddenItemsFromSideView = removeFromArray(hiddenItemsFromSideView, v)
    //       update()
    //     } }
    //     nodeViewable.push(field)
    //   }
    // }

    var popup= await createPromptPopup({
      title:"Related Nodes",
      iconHeader:"sitemap",
      fields:options,
      confirmationType:"cancel"
    })

    var name = prompt("Node")
    let newId = uuid()
    var posX = event.position.x;
    var posY = event.position.y;
    var nodeObject =  {
      id:newId,
      uuid:newId,
      x:posX,
      y:posY,
      fx:posX,
      fy:posY,
      name:name,
      customColor:"#f27506",
      properties: {
          name: "variable_2",
          type:"variable",
          value:15,
          function:"",
      }
    }

    // var popup= await createPromptPopup({
    //   title:"Add a new "+availableItems.find(a=>a.type==addItemMode).name,
    //   iconHeader:availableItems.find(a=>a.type==addItemMode).icon,
    //   fields:{ type:"input",id:"itemNewName" ,label:"Item name", placeholder:"Set a name for the item" }
    // })
    // if (popup && popup.result) {
    //   var uuid = genuuid()
    //   addItems(addItemMode, uuid, popup.result, addItemCatType)
    //   //itemsToFixAtNextUpdate=[]
    //   itemsToFixAtNextUpdate.push({uuid:uuid, fx:e.x, fy:e.y})
    //   update()
    // }

    data.nodes.push(nodeObject)
    partialUpdateGraph({nodes:[nodeObject]})
  }

  var addGroup= function () {
    var name = prompt("Group")
    let newId = uuid()
    var groupObject={
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#25847d",
            content:name
        }
    data.groups.push(groupObject)
    partialUpdateGraph({groups:[groupObject]})
  }

  var partialUpdateGraph = function (dataToAdd) {
    var newData = {
      nodes:[],
      relationships:[],
      notes:[],
      groups:[]
    }
    if (dataToAdd.nodes) {
      newData.nodes = dataToAdd.nodes
    }
    if (dataToAdd.notes) {
      newData.notes = dataToAdd.notes
    }
    if (dataToAdd.groups) {
      newData.groups = dataToAdd.groups
    }
    activeGraph.updateWithD3Data(newData)
  }


  ////////////////////////////////////////////////

  var update = function () {
    if (objectIsActive) {
      render()
    }
  }

  var setActive =async function (options) {
    render()
  }

  var setInactive = function () {
    //clean side menu
    // document.querySelector(".left-list").innerHTML=""
    // document.querySelector(".side_searchArea").innerHTML=""
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var relationsView = createRelationsView();
relationsView.init()
