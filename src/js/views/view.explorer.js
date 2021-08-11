var createExplorerView = function ({
  originalData = "",
  container=".center-container",
  onClick = undefined,
  searchForAllItemsNames = false,
  maxElements = undefined,
  manualUpdate = false
  }={}) {
  var self ={};
  var objectIsActive = false;
  var table = undefined
  var currentData = undefined

  var tabledata = [
    {id:1, name:"Oli Bob", progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1},
  ];
  var tableCols = [                 //define the table columns
      {title:"Name", field:"name", editor:"input"},
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
    }
  }

  var init = function () {
    connections()
    // render()
  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentData && !manualUpdate) {
        var store = await query.currentProject()
        let data = getData(store,currentData.typeId)
        table.updateData(data)
      }
    })
  }

  var updateModule = function (store) {
    let data = getData(store,currentData.typeId)
    table.updateData(data)
  }

  var getData = function (store, typeId) {
    let catData = createCatData(store)
    let typeToDisplay = typeId
    let relatedNodes = store.metaLinks.filter(m=>m.target==typeToDisplay)
    let relatedNodesId = relatedNodes.map(rn=>rn.source)
    console.log(relatedNodesId);
    let nodeMap = {}
    let nodes=[]
    for (var i = 0; i < store.currentPbs.length; i++) {
      nodeMap[store.currentPbs[i].uuid] = store.currentPbs[i]
      if (relatedNodesId.includes(store.currentPbs[i].uuid)) {
        nodes.push(store.currentPbs[i])
      }
    }

    let data = nodes.map(n=>{
      let allInterfacesWhereTarget = store.interfaces.filter(i=>i.target==n.uuid)
      let allInterfacesWhereSource = store.interfaces.filter(i=>i.source==n.uuid)
      let currentCat = catData.dic[typeId]
      for (var i = 0; i < currentCat._assignedExtraFields.length; i++) {
        let e = currentCat._assignedExtraFields[i]
        let relatedInterfaceType = e._relatedInterfaceType
        if (!relatedInterfaceType) {
          relatedInterfaceType ={uuid:"notype"} //prevent error when not interfaces
        }
        let isTarget = currentCat._isTargetIn.includes(relatedInterfaceType.uuid)
        let allAllowedInterfacesWhereTarget = allInterfacesWhereTarget.filter(i=>i.typeId==e.relationId)
        let allAllowedInterfacesWhereSource = allInterfacesWhereSource.filter(i=>i.typeId==e.relationId)
        if (isTarget) {
          n["_extra"+e.uuid] = allAllowedInterfacesWhereTarget.map(i => nodeMap[i.source])
          n["_targetForExtra"+e.uuid] = true
        }else {
          n["_extra"+e.uuid] = allAllowedInterfacesWhereSource.map(i => nodeMap[i.target])
          n["_sourceForExtra"+e.uuid] = true
        }
      }
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

  var getRelatedCategories =function (store,field, isTarget) {
    //var catInfos = store.categories.find(c=>c.uuid == cat)
    let fieldObject= field
    let fieldRelation= store.interfacesTypes.find(e=>e.uuid == fieldObject.relationId)
    let allowedRel =[]
    for (var i = 0; i < store.categories.length; i++) {
      if (isTarget) {
        if (fieldRelation[("hasSource_"+store.categories[i].uuid)]) {
          allowedRel.push(store.categories[i])
        }
      }else {
        if (fieldRelation[("hasTarget_"+store.categories[i].uuid)]) {
          allowedRel.push(store.categories[i])
        }
      }

    }
    return allowedRel
  }
  var checkIfTarget =function (store,cat, field) {
    //var catInfos = store.categories.find(c=>c.uuid == cat)
    let fieldObject= field
    let fieldRelation= store.interfacesTypes.find(e=>e.uuid == fieldObject.relationId)
    return fieldRelation[("hasTarget_"+cat)]
  }

  var render =async function ({
    typeId = undefined
    }={}) {

      var store = await query.currentProject()
      let catData = createCatData(store)//TDO romove
      let data = getData(store,typeId)
      let allowedExtraFields = catData.dic[typeId]._parents.map(p=>p.uuid)

      let columns = [
        // {formatter:'action', formatterParams:{name:"test"}, width:40, hozAlign:"center", cellClick:function(e, cell){alert("Printing row data for: " + cell.getRow().getData().name)}},
        {title:"Name", field:"name", editor:"modalInput"}
        // {title:"Name", field:"name", editor:"input"}
      ]
      //extraFields
      let fields = catData.dic[typeId]._assignedExtraFields.map(e=> {
      // let fields = store.extraFields.filter(i=>i.target == typeId).map(e=> {
        if (e.type == "text") {
          return {title:e.name, field:e.uuid, editor:"modalInput", formatter:'textarea'}
        }else if (e.type == "time") {
          return {title:e.name, field:e.uuid, editor:"timePicker", formatter:'time'}
        }else if (e.type == "actions") {
          return {
            title:e.name,
            field:e.uuid,
            cellClick:function (event, cell) {
              localPlanningView.update(cell.getRow().getData().uuid)
            //   console.log(event);
            //   if (event.target.dataset.id) {
            //     showSingleItemService.showById(event.target.dataset.id)
            //   }else {
            //     if (!cell.getRow().getData()["_targetForExtra"+e.uuid]) {
            //       createEditRelationPopup(cell.getRow().getData().uuid,typeId,e)
            //     }else {
            //       createEditRelationPopup(cell.getRow().getData().uuid,typeId,e, cell.getRow().getData()["_targetForExtra"+e.uuid])
            //     }
            //   }
            },
          }
        }else if (e.type == "relation") {
          return {
            title:e.name,
            formatter:'tags',
            cellClick:function (event, cell) {
              console.log(event);
              if (event.target.dataset.id) {
                showSingleItemService.showById(event.target.dataset.id)
              }else {
                if (!cell.getRow().getData()["_targetForExtra"+e.uuid]) {
                  createEditRelationPopup(cell.getRow().getData().uuid,typeId,e)
                }else {
                  createEditRelationPopup(cell.getRow().getData().uuid,typeId,e, cell.getRow().getData()["_targetForExtra"+e.uuid])
                }
              }
            },
            field:"_extra"+e.uuid,
            editor:"modalRelation"
          }
        }

      })
      fields.forEach((item, i) => {
        columns.push(item)
      });

      //add remove option
      columns.push({
        formatter:'remove',
        cellClick:function(e, cell){
          console.log(e.target.dataset.id);
          if (confirm("remove item ?")) {
            push(act.remove("currentPbs",{uuid:e.target.dataset.id}))
          }
        }
      },)

      let onUpdate  =function () {
        //alert("fesfef")
        //update({type,typeId, onUpdate:onUpdate})
      }

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
      let tableComp = createTableComp()
      table = tableComp.create({domElement:container,data:data, columns:columns, menu:menutest, onUpdate:onUpdate})
  }

  var createEditRelationPopup = async function (itemIdMain,catId, field, isTarget) {
    var store = await query.currentProject()
    let e = field
    let relationList = store.interfaces.filter(i=>i.typeId==e.relationId)
    // let catData = createCatData(store)
    // let currentCat = catData.dic[typeId]
    let catIsTarget = checkIfTarget(store,catId, e)
    let allowedTargetsCat =getRelatedCategories(store, e, catIsTarget)
    // console.log(allowedTargetsCat);
    let allowedTargets =getAllItemOfCategory(store, allowedTargetsCat.map(a=>a.uuid))
    console.log(allowedTargets);
    let selectOptions = allowedTargets.map(t=>{
      return {name:t.name, value:t.uuid}
    })

      let preSelected = relationList.filter(r=>r.source==itemIdMain).map(sr=>sr.target)
      if (isTarget) {
        preSelected = relationList.filter(r=>r.target==itemIdMain).map(sr=>sr.source)
      }
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
              if (isTarget) {
                push(act.add("interfaces",{
                  typeId:e.relationId,
                  type:"Physical connection",
                  name:"Interface between "+item+" and "+itemIdMain,
                  source:item,
                  target:itemIdMain
                }))
              }else {
                push(act.add("interfaces",{
                  typeId:e.relationId,
                  type:"Physical connection",
                  name:"Interface between "+itemIdMain+" and "+item,
                  source:itemIdMain,
                  target:item
                }))
              }

            });
            removedInterfaces.forEach((item, i) => {
              push(act.remove("interfaces",{uuid:item}))
            });
          }
        },
        fields:[
          { type:"selection",id:"targetCat",preSelected:preSelected,selectOptions:selectOptions, label:"target categories", placeholder:"Set linkable categories" }
          // { type:"select",id:"targetCat",preSelected:preSelected,selectOptions:selectOptions, label:"target categories", placeholder:"Set linkable categories" }
        ]
      })

  }

  var createCatData = function (store) {
    let dic = {}
    let dicInterfaces = {}
    let data = []
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      if (!cat._parents) {cat._parents =[]}
      if (!cat._children) {cat._children =[]}
      dic[cat.uuid] = cat

    }
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      if (cat.parentCat) {
        cat.parentCatName = dic[cat.parentCat].name
        dic[cat.parentCat]._children.push(cat)
      }else {
        data.push(cat)
      }
    }
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      let currentCat = cat
      while (currentCat.parentCat) {
        console.log(currentCat.parentCat);
        cat._parents.push(dic[currentCat.parentCat])
        currentCat = dic[currentCat.parentCat]
      }
    }
    //assign extra fields
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      let linkedExtraFieldsTargets = cat._parents.map(p=>p.uuid)
      cat._relatedInterfacesTypes = []
      cat._assignedExtraFields = store.extraFields.filter(i=>linkedExtraFieldsTargets.includes(i.target) || i.target == cat.uuid)
      for (var j = 0; j < cat._assignedExtraFields.length; j++) {
        let ef = cat._assignedExtraFields[j]
        let relatedInterfaceType = store.interfacesTypes.find(e=>e.uuid == ef.relationId)
        if (relatedInterfaceType) {
          ef._relatedInterfaceType = relatedInterfaceType
          cat._relatedInterfacesTypes.push( relatedInterfaceType)
        }
      }
    }

    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      cat._isTargetIn = []
      cat._isSourceIn = []
      for (var j = 0; j < store.interfacesTypes.length; j++) {
        let currentInterface = store.interfacesTypes[j]
        // console.log(cat);
        // console.log(cat._relatedInterfacesTypes);
        if (!dicInterfaces[currentInterface.uuid]) {
          dicInterfaces[currentInterface.uuid] ={targets:[], sources:[],mainTargets:[], mainSources:[]}
        }
        let isSource = currentInterface["hasSource_"+cat.uuid]
        let isTarget = currentInterface["hasTarget_"+cat.uuid]
        if (isSource) {
          cat._isSourceIn.push(currentInterface.uuid)
          dicInterfaces[currentInterface.uuid].mainSources.push(cat)
        }
        if (isTarget) {
          cat._isTargetIn.push(currentInterface.uuid)
          dicInterfaces[currentInterface.uuid].mainTargets.push(cat)
        }
        for (var k = 0; k < cat._parents.length; k++) {
          let catParent = cat._parents[k]
          let isSource = currentInterface["hasSource_"+catParent.uuid]
          let isTarget = currentInterface["hasTarget_"+catParent.uuid]
          if (isSource) {
            cat._isSourceIn.push(currentInterface.uuid)
            dicInterfaces[currentInterface.uuid].sources.push(cat)
          }
          if (isTarget) {
            cat._isTargetIn.push(currentInterface.uuid)
            dicInterfaces[currentInterface.uuid].targets.push(cat)
          }
        }
      }
    }
    console.log(data);
    return {data:data, dic:dic, interfaces:dicInterfaces}
  }

  var update = function (data) {
    render(data)
  }

  var setActive =function (data) {
    currentData = data||{}
    objectIsActive = true;
    update(data)
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  self.updateModule = updateModule
  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}
var explorerView = createExplorerView();
explorerView.init();
