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
        }
    `)
    view.createLens("relations_toolbar",(d)=>`
        <div class="relations_toolbar">
         
        </div>
        <div class='graph' style='width:100%; height:100%; position:absolute;'></div>`
    )

    let relations_toolbar = view.addLens("relations_toolbar",{
      data:{title:"Ephemeris"},
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

  /////////

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
