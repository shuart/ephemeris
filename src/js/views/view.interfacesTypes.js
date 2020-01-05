var createInterfacesTypesView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    showListMenu({
      sourceData:store.interfacesTypes.items,
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:"true"},
        // {prop:"color", displayAs:"Color", edit:"true"},
        {prop:"dashArray", displayAs:"Style", options:listOptions.interface_type_stroke_type, edit:"true"}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("interfacesTypes", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onEditOptionsItem: (ev)=>{
        console.log("Edit_option");
          let newValue = ev.value
          push(act.edit("interfacesTypes", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          ev.select.updateData(store.interfacesTypes.items)
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("interfacesTypes",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.interfacesTypes.items)
        }
      },
      onAdd: (ev)=>{
        let typeName = prompt("New interfaces Type")
        push(act.add("interfacesTypes",{uuid:genuuid(), name:typeName, color:"#ffffff"}))
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

var interfacesTypesView = createInterfacesTypesView()
interfacesTypesView.init()
