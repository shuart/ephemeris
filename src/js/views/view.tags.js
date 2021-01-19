var createTagsView = function () {
  var self ={};
  var objectIsActive = false;
  var currentVisibleList = undefined

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var updateList =  function () {
    setTimeout(async function () {
      var store = await query.currentProject()
      ephHelpers.updateListElements(currentVisibleList,{
        items:store.tags
      })
    }, 1500);
  }

  var render = async function () {
    var store = await query.currentProject()
    currentVisibleList = showListMenu({
      sourceData:store.tags,
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"color", displayAs:"Color", color:true, edit:"true"}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("tags", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
        updateList()
      },
      onEditColorItem: (ev)=>{
        if (ev.color && ev.color.hex) {
          push(act.edit("tags", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:(ev.color.hex+"").slice(0,-2)}))
        }
        updateList()
      },
      onRemoveColorItem: (ev)=>{
          push(act.edit("tags", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:undefined}))
          updateList()
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("tags",{uuid:ev.target.dataset.id}))
        }
        updateList()
      },
      onAdd: (ev)=>{
        let tagName = prompt("New tag")
        push(act.add("tags",{uuid:genuuid(), name:tagName, color:"#ffffff"}))
        updateList()
      },
      onClick: (ev)=>{
        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      }
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
    currentVisibleList = undefined
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var tagsView = createTagsView()
tagsView.init()
