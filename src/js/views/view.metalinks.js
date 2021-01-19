var createMetalinksView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var getObjectNameByUuid = function (uuid, store) {
    let allItems = []
    for (var keys in store) {
      if (store.hasOwnProperty(keys)) {
        if (store[keys]) {
          allItems = allItems.concat(store[keys])
        }
      }
    }
    let foundItem = allItems.filter(i=> i.uuid == uuid)[0]
    if (foundItem) {
      return foundItem.name
    }else {
      return "Missing item"
    }
  }

  var readifyMetalinks = function (store) {
    var originalLinks =store.metaLinks
    let data = originalLinks.map(function (l) {

      let newItem = {uuid:l.uuid,
        source: getObjectNameByUuid(l.source, store),
        target:getObjectNameByUuid(l.target, store),
        type:l.type
      };
      return newItem
    })
    return data
  }

  var render = async function () {
    var store = await query.currentProject()
    showListMenu({
      sourceData:readifyMetalinks(store),
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"type", displayAs:"Type", edit:false},
        {prop:"source", displayAs:"Source item", edit:false},
        {prop:"target", displayAs:"Target item", edit:false}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        // console.log("Edit");
        // var newValue = prompt("Edit Item",ev.target.dataset.value)
        // if (newValue) {
        //   push(act.edit("tags", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        // }
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("metaLinks",{uuid:ev.target.dataset.id}))
          ev.select.updateData(readifyMetalinks())
        }
      },
      // onAdd: (ev)=>{
      //   let tagName = prompt("New tag")
      //   push(act.add("tags",{uuid:genuuid(), name:tagName, color:"#ffffff"}))
      // },
      onClick: (ev)=>{
        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      },
      extraActions:[
        {
          name:"Clear_Missing",
          action:(ev)=>{
            if (confirm("All uncomplete links will be cleared")) {
              clearUncompleteLinks()
              ev.select.updateData(readifyMetalinks())
            }
          }
        }
      ]
    })
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

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var metalinksView = createMetalinksView()
metalinksView.init()
