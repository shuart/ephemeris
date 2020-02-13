var createShowUpdateLinksService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function (ev,callerType, callback) {
    startSelectionFromParametersView(ev,callerType, callback)
  }

  async function startSelectionFromParametersView(ev,callerType, callback) {
    var store = await query.currentProject()
    var metalinkType = ev.target.dataset.prop;
    var sourceTriggerId = ev.target.dataset.id;
    var batch = ev.batch;
    var currentLinksUuidFromDS = JSON.parse(ev.target.dataset.value)
    var sourceGroup = undefined
    var invert = false
    var source = "source"
    var target = "target"
    var sourceData = undefined
    var sourceLinks= undefined
    var displayRules = [
      {prop:"name", displayAs:"Name", edit:false},
      {prop:"desc", displayAs:"Description", fullText:true, edit:false}
    ];
    var showColoredIconsRule = undefined
    var prependContent=undefined
    var onLoaded = undefined
    if (metalinkType == "originNeed") {
      if (callerType != "requirements") {
        sourceGroup="requirements"
        sourceLinks=store.requirements.links
        sourceData=store.requirements.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false}
        ]
      }else{
        sourceGroup="currentPbs";
        invert = true;
        source = "target"//invert link order for after
        target = "source"
        sourceLinks=store.currentPbs.links
        sourceData=store.currentPbs.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true, edit:false}
        ]
      }
    }else if (metalinkType == "originFunction") {
      if (callerType != "functions") {
        sourceGroup="functions"
        sourceLinks=store.functions.links
        sourceData=store.functions.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false}
        ]
      }else{
        sourceGroup="currentPbs";
        invert = true;
        source = "target"//invert link order for after
        target = "source"
        sourceLinks=store.currentPbs.links
        sourceData=store.currentPbs.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true, edit:false}
        ]
      }
    }else if (metalinkType == "origin") {
      sourceGroup="stakeholders";
      showColoredIconsRule= lettersFromNames,
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"lastName", displayAs:"Last name", fullText:true, edit:false}
      ];
    }else if (metalinkType == "contains") {
      if (callerType != "physicalSpaces") {
        sourceGroup="physicalSpaces"
        invert = true;
        source = "target"//invert link order for after
        target = "source"
        sourceLinks=store.physicalSpaces.links
        sourceData=store.physicalSpaces.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false}
        ]
      }else{
        sourceGroup="currentPbs";
        sourceLinks=store.currentPbs.links
        sourceData=store.currentPbs.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true, edit:false}
        ]
      }

    }else if (metalinkType == "tags") {
      sourceGroup="tags";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "interfacesType") {
      sourceGroup="interfacesTypes";
      sourceData=store.interfacesTypes.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ]
    }else if (metalinkType == "category") {
      sourceGroup="categories";
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "WpOwn") {
      if (callerType != "workPackages") {
        sourceGroup="workPackages"
        invert = true;
        source = "target"//invert link order for after
        target = "source"
        sourceLinks=store.workPackages.links
        sourceData=store.workPackages.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false}
        ]
      }else {
        alert("fefsefs")
        sourceGroup='currentPbs';
        sourceData=store.currentPbs.items
        sourceLinks=store.currentPbs.links
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true, edit:false}
        ];
      }

    }else if (metalinkType == "WpOwnNeed") {
      if (callerType != "workPackages") {
        sourceGroup="workPackages"
        invert = true;
        source = "target"//invert link order for after
        target = "source"
        sourceLinks=store.workPackages.links
        sourceData=store.workPackages.items
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true, edit:false}
        ]
      }else{
        sourceGroup="requirements";
        sourceData=store.requirements.items
        sourceLinks=store.requirements.links
        displayRules = [
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", fullText:true, edit:false}
        ];
      }

    }else if (metalinkType == "reqChangedBy") {
      sourceGroup="changes"
      sourceLinks=store.changes.links
      sourceData=store.changes.items
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false},
        {prop:"desc", displayAs:"Description", edit:false}
      ]
    }else if (metalinkType == "documents") {
      sourceGroup="documents";
      if (typeof nw !== "undefined") {//if using node webkit
        prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`
        onLoaded = function (ev) {
          dropAreaService.setDropZone(".prepend", function () {
            ev.select.updateData(store.documents.items)
            ev.select.refreshList()
            setTimeout(function () {
              ev.select.scrollDown()
            }, 100);
            // ev.select.scrollDown()
          })
        }
      }
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "documentsNeed") {
      sourceGroup="documents";
      prependContent = `<div class="ui basic prepend button"><i class="upload icon"></i>Drop new documents here</div>`,
      onLoaded = function (ev) {
        dropAreaService.setDropZone(".prepend", function () {
          ev.select.updateData(store.documents.items)
          ev.select.refreshList()
          setTimeout(function () {
            ev.select.scrollDown()
          }, 100);
        })
      },
      displayRules = [
        {prop:"name", displayAs:"Name", edit:false}
      ];
    }else if (metalinkType == "assignedTo") {
      sourceGroup="stakeholders";
      displayRules = [
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"lastName", displayAs:"Last name", fullText:true, edit:false}
      ];
    }

    var sourceData = store[sourceGroup].items
    var sourceLinks = undefined
    if (store[sourceGroup].links && store[sourceGroup].links[0]) {
       sourceLinks= store[sourceGroup].links
    }

    showListMenu({
      sourceData:sourceData,
      sourceLinks:sourceLinks,
      parentSelectMenu:ev.select ,
      multipleSelection:currentLinksUuidFromDS,
      displayProp:"name",
      searchable : true,
      display:displayRules,
      idProp:"uuid",
      showColoredIcons:showColoredIconsRule,
      prependContent:prependContent,
      onLoaded:onLoaded,
      onAdd:(ev)=>{
        var uuid = genuuid()
        push(act.add(sourceGroup, {uuid:uuid,name:"Edit Item"}))
        //special rules
        if (sourceGroup == "changes") {
          push(act.edit("changes",{uuid:uuid, prop:"createdAt", value:Date.now()}))
        }
        // setTimeout(function () {
        //   ev.select.scrollDown()
        // }, 100);
        ev.select.setEditItemMode({
          item:store[sourceGroup].items.filter(e=> e.uuid == uuid)[0],
          onLeave: (ev)=>{
            push(act.remove(sourceGroup,{uuid:uuid}))
            ev.select.updateData(store[sourceGroup].items)
          }
        })
      },
      onEditItem: (ev)=>{
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit(sourceGroup, {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
      },
      onCloseMenu: (ev)=>{
        console.log(ev.select);
        ev.select.getParent().update()
      },
      onChangeSelect: (ev)=>{
        var changeProp = async function (sourceTriggerId) {
          var store = await query.currentProject()
          await batchRemoveMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)
          await batchAddMetaLinks(store, metalinkType,currentLinksUuidFromDS, ev.select.getSelected(), source, sourceTriggerId)

          ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
          ev.select.getParent().refreshList()
        }
        //ev.select.getParent().updateMetaLinks(store.metaLinks.items)//TODO remove extra call
        // ev.select.getParent().update()
        if (batch[0]) { //check if batch action is needed
          batch.forEach(function (sourceTriggerId) {
            changeProp(sourceTriggerId)
          })
        }else {
          changeProp(sourceTriggerId)
        }
      },
      onClick: (ev)=>{
        console.log("select");
      }
    })
  }


  var update = function () {
    render()
  }
  var show = function (ev,callerType, callback) {
    render(ev,callerType, callback)
  }


  self.show = show
  self.update = update
  self.init = init

  return self
}

var showUpdateLinksService = createShowUpdateLinksService()
showUpdateLinksService.init()
