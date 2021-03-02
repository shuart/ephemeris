var createShowTreeFromListService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function (catId, callback) {
    renderMindmapTree(catId, callback)
  }

  async function generateDataSource(itemList, store) {
    var placeholder = true
    var data =undefined
    if (itemList[0]) {
      var targets = store.links.map(item => item.target)
      var roots = itemList.filter(item => !targets.includes(item.uuid))
      if (roots && roots[1]) {//if more than one root node
        placeholder = true
        var newData = itemList.slice()
        var newLinks = store.links.slice()
        newData.push({uuid:"placeholder", name:"placeholder"})
        for (root of roots) {
          newLinks.push({source:"placeholder", target:root.uuid})
        }
        data = hierarchiesList(newData, newLinks)[0]
      }else {
        data = hierarchiesList(itemList, store.links)[0]
      }
      console.log(data);
    }
    return data
  }

  var getRelatedItems = function (store, catId) {
    if (!catId) {
      return store.currentPbs
    }else {
      let typeToDisplay = catId
      let relatedNodes = store.metaLinks.filter(m=>m.target==typeToDisplay)
      let relatedNodesId = relatedNodes.map(rn=>rn.source)
      console.log(relatedNodesId);
      let nodes =  store.currentPbs.filter(n=>relatedNodesId.includes(n.uuid))
      return nodes
    }
  }

  var renderMindmapTree = async function (catId, callback) {
    var callbackFunction = callback || undefined;
    var storeGroup = catId || undefined;
    var store = await query.currentProject()
    var itemList = getRelatedItems(store, storeGroup)

    if (true) {


      displayThree({
        data:await generateDataSource(itemList, store),
        edit:true,
        onClose:(e)=>{
          if (callbackFunction) {
            callbackFunction(e)
          }
        },
        onAdd:async (ev)=>{
          var uuid = genuuid()
          var newName = prompt("Name?")
          push(act.add("currentPbs",{uuid:uuid, name:newName}))
          //push(addRequirement({uuid:uuid, name:newName}))
          if (ev.element.data.uuid != "placeholder") {
            push(act.addLink("currentPbs",{source:ev.element.data.uuid, target:uuid}))
          }

          //ev.sourceTree.updateFromRoot(ev.element)
        },
        onMove:async(ev)=>{
          let sourceUuid= ev.element.data.uuid
          let targetUuid = ev.newParent.data.uuid
          var store = await query.currentProject()
          if (checkIfSourceIsParent(sourceUuid,targetUuid, storeGroup, store)) { //check if the target is a child of the source
            alert("The node you are moving is a parent of your target")
          }else {
            push(act.removeLink("currentPbs",{source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))

            if (ev.newParent.data.uuid != "placeholder") {
              push(act.addLink("currentPbs",{source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
            }

          }
        },
        onRemove:async (ev)=>{
          if (confirm("Remove?")) {
            if (true) {
              console.log(ev);
              var originalLinks = store.links.filter(e=>e.source == ev.element.data.uuid)
              for (link of originalLinks) {
                push(act.addLink(storeGroup,{source:ev.element.parent.data.uuid, target:link.target}))
              }
            }
            // if (confirm("Keep Childs?")) {
            //   console.log(ev);
            //   var originalLinks = store[storeGroup].links.filter(e=>e.source == ev.element.data.uuid)
            //   for (link of originalLinks) {
            //     push(act.addLink(storeGroup,{source:ev.element.parent.data.uuid, target:link.target}))
            //   }
            // }
            //remove all links
            console.log(ev);
            push(act.removeLink(storeGroup,{source:ev.element.data.uuid}))
            //addNewLinks
            push(act.remove("currentPbs",{uuid:ev.element.data.uuid}))
            //push(addPbsLink({source:ev.element.data.uuid, target:uuid}))

          }
        },
        onLabelClicked:(originev)=>{
          showSingleItemService.showById(originev.element.data.uuid)
        },
        onStoreUpdate:async (originev)=>{
          var store = await query.currentProject()
          var itemList = getRelatedItems(store, storeGroup)
          let newData = await generateDataSource(itemList, store)
          originev.sourceTree.setData(newData)
        }
      })
    }
  }


  function checkIfSourceIsParent(sourceUuid,targetUuid, storeGroup, store){
    var storeLinks = store.links
    function getParentUuid(uuid, storeLinks) {
      let parentLink = storeLinks.find(l=>l.target == uuid)
      console.log(parentLink);
      if (parentLink) {
        return parentLink.source
      }else {
        return undefined
      }
    }

    let haveParents = true
    let currentTarget = targetUuid

    while (haveParents) {
      let parentUuid = getParentUuid(currentTarget, storeLinks)
      if (!parentUuid) {
        haveParents = false //not needed
        return false
      }else {
        if (parentUuid == sourceUuid) {
          return true
        }else {
          currentTarget = parentUuid
        }
      }

    }

  }


  var update = function () {
    render()
  }
  var showByStoreGroup = function (storeGroup, callback) {
    render(storeGroup, callback)
  }

  var showAll= function (catId, callback) {
    render(catId, callback)
  }


  self.showAll = showAll
  self.showByStoreGroup = showByStoreGroup
  self.update = update
  self.init = init

  return self
}

var showTreeFromListService = createShowTreeFromListService()
showTreeFromListService.init()
