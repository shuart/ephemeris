var createHistoryView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = async function () {
    var store = await query.currentProject()
    let formatedData = store.onlineHistory.reverse().map(i=>({
      uuid:i.uuid,
      id:i.uuid,
      storeGroup:i.selectorProperty,
      type:i.subtype,
      timestamp:i.localTimestamp,
      name:JSON.stringify(i.user),
      change:JSON.stringify(i.item)
    }))
    showListMenu({
      sourceData:formatedData,
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"type", displayAs:"Action", edit:false},
        {prop:"name", displayAs:"on Item", edit:false},
        {prop:"storeGroup", displayAs:"In group", edit:false},
        {prop:"change", displayAs:"pl", edit:false}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("history",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.history)
        }
      },
      onAdd: (ev)=>{
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
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var historyView = createHistoryView()
historyView.init()
