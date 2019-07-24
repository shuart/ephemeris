var createInterfacesListView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var getObjectNameByUuid = function (uuid) {
    let foundItem = query.items("all", i=> i.uuid == uuid)[0]
    if (foundItem) {
      return foundItem.name
    }else {
      return "Missing item"
    }
  }

  var readifyInterfaces = function () {
    var originalLinks = query.currentProject().interfaces.items
    let data = originalLinks.map(function (l) {

      let newItem = {uuid:l.uuid,
        description:l.description,
        source: getObjectNameByUuid(l.source),
        target:getObjectNameByUuid(l.target),
        type:l.type
      };
      return newItem
    })
    return data
  }

  var render = function () {
    var store = query.currentProject()
    console.log(readifyInterfaces());
    showListMenu({
      sourceData:readifyInterfaces(),
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"type", displayAs:"Type", edit:false},
        {prop:"description", displayAs:"Description", edit:true},
        {prop:"source", displayAs:"Source item", edit:false},
        {prop:"target", displayAs:"Target item", edit:false}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        createInputPopup({
          originalData:ev.target.dataset.value,
          onSave:e =>{
            push(act.edit("interfaces",{uuid:ev.target.dataset.id, prop:"description", value:e}))
            ev.select.updateData(readifyInterfaces())
          },
          onClose:e =>{
            push(act.edit("interfaces",{uuid:ev.target.dataset.id, prop:"description", value:e}))
            ev.select.remove()
            ev.select.updateData(readifyInterfaces())
            ev.select.update()//TODO Why is it necessary?
          }
        })
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("interfaces",{uuid:ev.target.dataset.id}))
          ev.select.updateData(readifyInterfaces())
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
          name:"Export",
          action:(ev)=>{
            exportToCSV()
          }
        }
      ]
    })
  }
  var exportToCSV = function () {
    let store = query.currentProject()
    let data = readifyInterfaces().map(i=>{
      return {id:i.uuid, type:i.type, description:i.description, source:i.source, target:i.target}
    })
    JSONToCSVConvertor(data, 'Interfaces', true)

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

var interfacesListView = createInterfacesListView()
interfacesListView.init()
