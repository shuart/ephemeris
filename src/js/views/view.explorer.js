var createExplorerView = function ({
  originalData = "",
  container=".center-container",
  onClick = undefined,
  searchForAllItemsNames = false,
  maxElements = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var table = undefined
  var currentData = undefined

  var tabledata = [
    {id:1, name:"Oli Bob", progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1},
    {id:2, name:"Mary May", progress:1, gender:"female", rating:2, col:"blue", dob:"14/05/1982", car:true},
    {id:3, name:"Christine Lobowski", progress:42, gender:"female", rating:0, col:"green", dob:"22/05/1982", car:"true"},
    {id:4, name:"Brendon Philips", progress:100, gender:"male", rating:1, col:"orange", dob:"01/08/1980"},
    {id:5, name:"Margret Marmajuke", progress:16, gender:"female", rating:5, col:"yellow", dob:"31/01/1999"},
    {id:6, name:"Frank Harbours", progress:38, gender:"male", rating:4, col:"red", dob:"12/05/1966", car:1},
  ];
  var tableCols = [                 //define the table columns
      {title:"Name", field:"name", editor:"input"},
      {title:"Task Progress", field:"progress", hozAlign:"left", formatter:"progress", editor:true},
      {title:"Gender", field:"gender", width:95, editor:"select", editorParams:{values:["male", "female"]}},
      {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100, editor:true},
      {title:"Color", field:"col", width:130, editor:"input"},
      {title:"Date Of Birth", field:"dob", width:130, sorter:"date", hozAlign:"center"},
      {title:"Driver", field:"car", width:90,  hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true},
  ]

  var theme={
    table:function () {
      return `
      <div class="example-table">
      </div>`
    },
    feed:function (events) {
      return `
      <div class="ui small feed">
        ${events}
      </div>`
    },
    event:function(event) {
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${(event.name && event.name!= "Missing item")? ("Item \'"+event.name + "\'" ): ("An item")} ${event.prop? (", property \'"+event.prop + "\', " ): ""} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${event.user?"by "+event.user+",":""} ${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>`
    },
    actionEvent:function(event) {//todo add separate theme for actions
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${event.name? ("Item \'"+event.name + "\'" ): ("An item")} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${event.user?"by "+event.user+",":""} ${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>`
    },
    noEvent:function() {
      return `
      <div class="event">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div class="summary">
            No events or activity yet
          </div>
        </div>
      </div>`
    }
  }

  var init = function () {
    connections()
    // render()
  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentData) {
        var store = await query.currentProject()
        let data = getData(store,currentData.typeId)
        table.updateData(data)
      }
    })
  }

  var getData = function (store, typeId) {
    let typeToDisplay = typeId
    let relatedNodes = store.metaLinks.filter(m=>m.target==typeToDisplay)
    let relatedNodesId = relatedNodes.map(rn=>rn.source)
    console.log(relatedNodesId);
    let nodes =  store.currentPbs.filter(n=>relatedNodesId.includes(n.uuid))
    console.log(nodes);

    let data = nodes.map(n=>{
      return n
      // return {id:1, uuid:n.uuid, name:n.name, progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1}
    })
    return data
  }

  var getAllItemOfCategory = function (store,cat) {
    let relevantObjects = {}
    let filteredObject = []

    for (var j = 0; j < cat.length; j++) {

      for (var i = 0; i < store.metaLinks.length; i++) {
        let link = store.metaLinks[i]
        if (link.type=="category") {
          if (link.target == cat[j]) {
            relevantObjects[link.source] = true
          }
        }
      }
    }


    for (var i = 0; i < store.currentPbs.length; i++) {
      if (relevantObjects[ store.currentPbs[i].uuid ]) {
        filteredObject.push(store.currentPbs[i])
      }
    }
    return filteredObject
  }

  var getRelatedCategories =function (store,field) {
    //var catInfos = store.categories.find(c=>c.uuid == cat)
    let fieldObject= store.extraFields.find(e=>e.uuid == field)
    let fieldRelation= store.interfacesTypes.find(e=>e.uuid == fieldObject.relationId)
    let allowedRel =[]
    for (var i = 0; i < store.categories.length; i++) {
      if (fieldRelation[store.categories[i].uuid]) {
        allowedRel.push(store.categories[i])
      }
    }
    return allowedRel
  }
  var checkIfTarget =function (store,cat, field) {
    //var catInfos = store.categories.find(c=>c.uuid == cat)
    let fieldObject= field
    let fieldRelation= store.interfacesTypes.find(e=>e.uuid == fieldObject.relationId)
    return fieldRelation[cat]
  }

  var render =async function ({
    typeId = undefined
    }={}) {
      var store = await query.currentProject()
      let data = getData(store,typeId)

      console.log(data);
      let columns = [
        // {formatter:'action', formatterParams:{name:"test"}, width:40, hozAlign:"center", cellClick:function(e, cell){alert("Printing row data for: " + cell.getRow().getData().name)}},
        {title:"Name", field:"name", editor:"modalInput"}
        // {title:"Name", field:"name", editor:"input"}
      ]

      //extraFields
      let fields = store.extraFields.filter(i=>i.target == typeId).map(e=> {
        if (e.type == "text") {
          return {title:e.name, field:e.uuid, editor:"modalInput", formatter:'textarea'}
        }else if (e.type == "relation") {
          let catIsTarget = checkIfTarget(store,typeId , e)
          let allowedTargetsCat =getRelatedCategories(store, e.uuid)
          console.log(allowedTargetsCat);
          let allowedTargets =getAllItemOfCategory(store, allowedTargetsCat.map(a=>a.uuid))
          console.log(allowedTargets);
          return {
            title:e.name,
            formatter:'relation',
            cellClick:function (event, cell) {
              console.log(event);
              if (event.target.dataset.id) {
                showSingleItemService.showById(event.target.dataset.id)
              }else {
                if (!catIsTarget) {
                  createEditRelationPopup(cell.getRow().getData().uuid,e.relationId,store.interfaces.filter(i=>i.typeId==e.relationId),allowedTargets)
                }
              }
            },
            formatterParams:{
              isTarget:catIsTarget,
              relationList:store.interfaces.filter(i=>i.typeId==e.relationId),
              relationTargets: store.currentPbs
            },
            field:e.uuid,
            editor:"modalRelation"
          }
        }

      })
      fields.forEach((item, i) => {
        columns.push(item)
      });

      let onUpdate  =function () {
        //alert("fesfef")
        //update({type,typeId, onUpdate:onUpdate})
      }

      //
      let addAction = async function () {
        var popup= await createPromptPopup({
          title:"Add a new item",
          iconHeader:"plus",
          fields:{ type:"input",id:"requirementName" ,label:"Item name", placeholder:"Set a name for the new item" }
        })
        var newReq = popup.result
        let id = genuuid()
        push(act.add("currentPbs",{uuid:id,name:newReq}))
        push(act.add("metaLinks",{source:id,target:typeId,type:"category"}))
      }

      let showTreeAction = function () {
        showTreeFromListService.showAll(typeId, function (e) {
        })
      }

      let menutest = [
        {type:'action', name:"Add", color:"#29b5ad", onClick:e=>{addAction()}},
        {type:'action', name:"Tree", color:"grey", onClick:e=>{showTreeAction()}},
        {type:'search', name:"Add", color:"grey"}
      ]
      table = tableComp.create({data:data, columns:columns, menu:menutest, onUpdate:onUpdate})
  }

  var createEditRelationPopup = function (itemIdMain,interfaceTypeId, relationList,relationTargets, isTarget) {
    let selectOptions = relationTargets.map(t=>{
      return {name:t.name, value:t.uuid}
    })

      console.log(itemIdMain);
      let preSelected = relationList.filter(r=>r.source==itemIdMain).map(sr=>sr.target)
      console.log(preSelected);
      var popup=  createPromptPopup({
        title:"Create a new relation affecting "+itemIdMain,
        callback :function (res) {
          console.log(res);
          if (res.result == "") {
          }else {
            let nameArr = res.result.split(',')
            let originalSelected = preSelected
            let added = nameArr.filter(r=>!originalSelected.includes(r))
            let removedItems = originalSelected.filter(r=>!nameArr.includes(r))
            let removedInterfaces = relationList.filter(r=>r.source==itemIdMain).filter(r=>removedItems.includes(r.target)).map(r=>r.uuid)
            added.forEach((item, i) => {
              push(act.add("interfaces",{
                typeId:interfaceTypeId,
                type:"Physical connection",
                name:"Interface between "+itemIdMain+" and "+item,
                source:itemIdMain,
                target:item
              }))
            });
            removedInterfaces.forEach((item, i) => {
              push(act.remove("interfaces",{uuid:item}))
            });
          }
        },
        fields:[
          { type:"select",id:"targetCat",preSelected:preSelected,selectOptions:selectOptions, label:"target categories", placeholder:"Set linkable categories" }
        ]
      })

  }


  var update = function (data) {
    render(data)
  }

  // var setData =function ({
  //   data = [],
  //   columns=undefined
  //   }={}) {
  //     tabledata = data;
  //     tableCols = columns;
  //
  //   update()
  // }


  var setActive =function (data) {
    currentData = data||{}
    objectIsActive = true;
    update(data)
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}
var explorerView = createExplorerView();
explorerView.init();
