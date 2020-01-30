var createShowTreeFromListService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function (storeName, callback) {
    renderMindmapTree(storeName, callback)
  }

  var renderMindmapTree = async function (storeName, callback) {
    var callbackFunction = callback || undefined;
    var storeGroup = storeName || undefined;
    var store = await query.currentProject()

    if (true) {
      function generateDataSource(storeGroup) {
        var placeholder = false
        var data =undefined
        if (store[storeGroup].items[0]) {
          var targets = store[storeGroup].links.map(item => item.target)
          var roots = store[storeGroup].items.filter(item => !targets.includes(item.uuid))
          if (roots && roots[1]) {//if more than one root node
            placeholder = true
            var newData = store[storeGroup].items.slice()
            var newLinks = store[storeGroup].links.slice()
            newData.push({uuid:"placeholder", name:"placeholder"})
            for (root of roots) {
              newLinks.push({source:"placeholder", target:root.uuid})
            }
            data = hierarchiesList(newData, newLinks)[0]
          }else {
            data = hierarchiesList(store[storeGroup].items, store[storeGroup].links)[0]
          }
          console.log(data);
        }
        return data
      }

      displayThree({
        data:generateDataSource(storeGroup),
        edit:true,
        onClose:(e)=>{
          if (callbackFunction) {
            callbackFunction(e)
          }
        },
        onAdd:(ev)=>{
          var uuid = genuuid()
          var newName = prompt("Name?")
          push(act.add(storeGroup,{uuid:uuid, name:newName}))
          //push(addRequirement({uuid:uuid, name:newName}))
          if (ev.element.data.uuid != "placeholder") {
            push(act.addLink(storeGroup,{source:ev.element.data.uuid, target:uuid}))
          }
          ev.sourceTree.setData(generateDataSource(storeGroup))
          //ev.sourceTree.updateFromRoot(ev.element)
        },
        onMove:(ev)=>{
          let sourceUuid= ev.element.data.uuid
          let targetUuid = ev.newParent.data.uuid

          if (checkIfSourceIsParent(sourceUuid,targetUuid, storeGroup, store)) { //check if the target is a child of the source
            alert("The node you are moving is a parent of your target")
            ev.sourceTree.setData(generateDataSource(storeGroup))
          }else {
            push(act.removeLink(storeGroup,{source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))

            if (ev.newParent.data.uuid != "placeholder") {
              push(act.addLink(storeGroup,{source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
            }
            ev.sourceTree.setData(generateDataSource(storeGroup))
          }
        },
        onRemove:(ev)=>{
          if (confirm("Remove?")) {
            if (true) {
              console.log(ev);
              var originalLinks = store[storeGroup].links.filter(e=>e.source == ev.element.data.uuid)
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
            push(act.remove(storeGroup,{uuid:ev.element.data.uuid}))
            //push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
            ev.sourceTree.setData(generateDataSource(storeGroup))
          }
        },
        onLabelClicked:(originev)=>{
          showSingleItemService.showById(originev.element.data.uuid)
        },
        onStoreUpdate:(originev)=>{
          originev.sourceTree.setData(generateDataSource(storeGroup))
        }
      })
    }
  }


  function checkIfSourceIsParent(sourceUuid,targetUuid, storeGroup, store){
    var storeLinks = store[storeGroup].links
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


  self.showByStoreGroup = showByStoreGroup
  self.update = update
  self.init = init

  return self
}

var showTreeFromListService = createShowTreeFromListService()
showTreeFromListService.init()
