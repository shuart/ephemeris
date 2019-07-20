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

  var renderMindmapTree = function (storeName, callback) {
    var callbackFunction = callback || undefined;
    var storeGroup = storeName || undefined;
    var store = query.currentProject()

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
          push(act.removeLink(storeGroup,{source:ev.element.parent.data.uuid, target:ev.element.data.uuid}))
          if (ev.newParent.data.uuid != "placeholder") {
            push(act.addLink(storeGroup,{source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
          }
          ev.sourceTree.setData(generateDataSource(storeGroup))
        },
        onRemove:(ev)=>{
          if (confirm("Keep Childs?")) {
            var originalLinks = store.requirements.links.filter(e=>e.source == ev.element.data.uuid)
            for (link of originalLinks) {
              push(act.addLink(storeGroup,{source:ev.newParent.data.uuid, target:ev.element.data.uuid}))
            }
          }
          //remove all links
          push(act.removeLink(storeGroup,{source:ev.element.data.uuid}))
          //addNewLinks
          push(act.remove(storeGroup,{uuid:ev.target.dataset.id}))
          //push(addPbsLink({source:ev.element.data.uuid, target:uuid}))
          ev.sourceTree.setData(generateDataSource(storeGroup))
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


  function checkIfTargetIsReachable(uuid){
    var store = query.currentProject()
    if (store.currentPbs.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.requirements.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.functions.items.find(i=>i.uuid == uuid)) { return true}
    else if (store.stakeholders.items.find(i=>i.uuid == uuid)) {return true }
    else {
      return false
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
