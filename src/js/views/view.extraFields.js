var createExtraFieldsView = function () {
  var self ={};
  var objectIsActive = false;
  var currentVisibleList = undefined;
  var currentViewFilter = undefined;

  var init = function () {
    connections()

  }
  var connections =function () {
    // document.addEventListener("storeUpdated", async function () {
    //   alert(objectIsActive)
    //   alert(currentVisibleList)
    //   if (objectIsActive && currentVisibleList) {
    //     var store = await query.currentProject()
    //     ephHelpers.updateListElements(currentVisibleList,{
    //       items:store.extraFields,
    //       displayRules:setDisplayRules(store)
    //     })
    //   }
    // })
  }

  var updateList =  function () {
    setTimeout(async function () {
      var store = await query.currentProject()
      ephHelpers.updateListElements(currentVisibleList,{
        items:store.extraFields,
        displayRules:setDisplayRules(store)
      })
    }, 1500);
  }

  var setDisplayRules = function (store) {
    var displayRules = [
      {prop:"type", displayAs:"Type", edit:false},
      {prop:"name", displayAs:"Name", edit:true},
      {prop:"linkedTo", displayAs:"Concerns", edit:false},
      {prop:"limitToGroups", displayAs:"Categories", edit:false},
      {prop:"prop", displayAs:"Registered Property", edit:false},
      {prop:"isVisible", displayAs:"Visible", edit:false}
    ]

    return displayRules
  }

  var getObjectNameByUuid = function (uuid) {
    let foundItem = query.items("all", i=> i.uuid == uuid)[0]
    if (foundItem) {
      return foundItem.name
    }else {
      return "Missing item"
    }
  }

  var readifyExtraLinks = function (store) {
    var originalLinks = store.extraFields
    var visibleLinks = undefined
    if (currentViewFilter) {
      visibleLinks = originalLinks.filter(l=>l.linkedTo == currentViewFilter)
    }else {
      visibleLinks = originalLinks
    }
    // let data = originalLinks.map(function (l) {
    //   let visibility = "Visible"
    //   // alert(l.hidden)
    //   if (!l.isVisible) {
    //     visibility = "Hidden"
    //   }else if (l.isVisible === true) {
    //     visibility = "Visible"
    //   }else if (l.isVisible === false) {
    //     visibility = "Hidden"
    //   }
    //   // alert(visibility)
    //
    //   let newItem = {uuid:l.uuid,
    //     name: l.name,
    //     prop:l.prop,
    //     type:l.type,
    //     hidden:l.hidden,//(l.hidden? "Hidden":"Visible")
    //     fakevisibility:visibility
    //   };
    //   return newItem
    // })
    // return data.sort(function(a, b) {
    //   if (a.type && b.type) {
    //     var nameA = a.type.toUpperCase(); // ignore upper and lowercase
    //     var nameB = b.type.toUpperCase(); // ignore upper and lowercase
    //     if (nameA < nameB) {return -1;}
    //     if (nameA > nameB) {return 1;}
    //   }
    //   return 0;})
    return originalLinks
  }

  var render = async function () {
    var store = await query.currentProject()
    currentVisibleList = showListMenu({
      sourceData:store.extraFields,
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:setDisplayRules(store),
      idProp:"uuid",
      onAdd: async (ev)=>{
        var store = await query.currentProject({extraFields:1})
        var popup= await createPromptPopup({
          title:"Add a new property to items",
          fields:{ type:"input",id:"propName" ,label:"Property name", placeholder:"Set a name for the new property" }
        })
        var newProp = popup.result
        let slug = ephHelpers.slugify(newProp)
        let propAlreadyExist = false
        if (store.extraFields.find(i=>i.prop == 'custom_prop_'+slug)) {
          alert("This field has already been registered")//in rare case where an identical field would be generated
          propAlreadyExist =true
        }
        if (newProp && !propAlreadyExist) {
          push(act.add("extraFields", {name:newProp,type:"text",linkedTo:"currentPbs",limitToGroups:undefined ,prop:'custom_prop_'+slug ,isVisible:true}))
          updateList()
        }
      },
      onEditItem: (ev)=>{
        console.log("Edit");
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("extraFields", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          updateList()
          // ev.select.updateData(readifyExtraLinks())
        }
      },
      onRemove: (ev)=>{
        if (confirm("remove item definitively?")) {
          // let itemToRemove = store.extraFields.find(i=>i.uuid == ev.target.dataset.id)
          // if (itemToRemove) {
          //   let type = itemToRemove.type
          //   let prop = itemToRemove.prop
          //   //clean all items from this property TODO do in reducer
          //   store[type].forEach(function (i) {
          //     if (i[prop]) {
          //       console.log(i);
          //       console.log(i[prop]);
          //       delete i[prop]
          //       console.log("Deleted");
          //       console.log(i[prop]);
          //     }
          //   })
            push(act.remove("extraFields",{uuid:ev.target.dataset.id}))
          // }

          updateList()
        }
      },

      extraButtons : [
        {name:"show/hide", class:"iufp_hide", prop:"isVisible", closeAfter:true, action: (orev)=>{
          // generateUsersFusionList(owners, orev.dataset.id, orev.dataset.extra )
          console.log(orev);
          if (orev) {
            let isVisible = true
            if (orev.dataset.extra =="true") {
              isVisible = false
            }else {
              isVisible = true
            }
            push(act.edit("extraFields",{uuid:orev.dataset.id, prop:"isVisible",value:isVisible}))
            // orev.select.updateData(readifyExtraLinks())

            setTimeout(function () {
              update()//TODO close first view
            }, 500);

          }

        }}
      ],
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

var extraFieldsView = createExtraFieldsView()
extraFieldsView.init()
