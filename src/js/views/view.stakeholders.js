var createStakeholdersView = function () {
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
        items:store.stakeholders.items,
        links:store.stakeholders.links,
      })
    }, 1500);
  }

  var render = async function () {
    var store = await query.currentProject()
    //e.target.dataset.id
    currentVisibleList = showListMenu({
      sourceData:store.stakeholders.items,
      sourceLinks:store.stakeholders.links,
      displayProp:"name",
      display:[
        {prop:"name", displayAs:"First name", edit:"true"},
        {prop:"lastName", displayAs:"Last Name", edit:"true"},
        {prop:"org", displayAs:"Org", edit:"true"},
        {prop:"role", displayAs:"Role", edit:"true"},
        {prop:"mail", displayAs:"E-mail", edit:"true"}
      ],
      idProp:"uuid",
      showColoredIcons: lettersFromNames,
      onEditItem: (ev)=>{
        console.log("Edit");
        console.log(ev.target.dataset.id);
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          push(act.edit("stakeholders",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
        }
        updateList()
      },
      onRemove: (ev)=>{
        console.log("remove");
        if (confirm("remove item ?")) {
          push(act.remove("stakeholders",{uuid:ev.target.dataset.id}))
          updateList()
        }
      },
      // onMove: (ev)=>{
      //   console.log("move");
      //   if (confirm("move item ?")) {
      //     push(act.move("stakeholders", {origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
      //     //update links if needed
      //     push(act.removeLink("stakeholders",{target:ev.originTarget.dataset.id}))
      //     if (ev.targetParentId && ev.targetParentId != "undefined") {
      //       push(act.addLink("stakeholders",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
      //     }
      //     ev.select.updateData(store.stakeholders.items)
      //     ev.select.updateLinks(store.stakeholders.links)
      //   }
      // },
      onAdd: async (ev)=>{
        var popup= await createPromptPopup({
          title:"Add a new Stakeholder",
          iconHeader:"user",
          fields:[
            { type:"input",id:"firstName" ,label:"First Name", placeholder:"Set the stakeholder first name" },
            { type:"input",id:"lastName" ,label:"Last Name", placeholder:"Set the stakeholder last name" },
            { type:"input",id:"org" ,label:"Organisation", placeholder:"Set an org", optional:true },
            { type:"input",id:"role" ,label:"Role", placeholder:"Set the stakeholder role",optional:true  },
            { type:"input",id:"mail" ,label:"e-mail adress", placeholder:"Set the stakeholder mail",optional:true  }
          ]
        })

        if (!popup) {
          return undefined
        }

        let firstName = popup.result.firstName
        let lastName = popup.result.lastName
        let org = popup.result.org
        let role = popup.result.role
        let mail = popup.result.mail
        push(act.add("stakeholders",{uuid:genuuid(), name:firstName, lastName:lastName, org:org, role:role, mail:mail}))
        updateList()
      },
      onAddFromPopup: (ev)=>{
        var uuid = genuuid()
        let firstName = prompt("New stakeholder - First name")
        let lastName = prompt("Last name")
        if (firstName && lastName) {
          push(act.add("stakeholders", {uuid:uuid,name:firstName, lastName:lastName}))
          if (ev.target && ev.target != "undefined") {
            push(act.move("stakeholders", {origin:uuid, target:ev.target.dataset.id}))
            //check for parenting
            let parent = store.stakeholders.links.find(l=>l.target == ev.target.dataset.id)
            if (parent) {
              push(act.addLink("stakeholders",{source:parent.source, target:uuid}))
            }
          }
          updateList()
        }
      },
      onClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          updateList()
        })
      },
      extraActions:[
        {
          name:"WP",
          action:(ev)=>{
            pageManager.setActivePage("workPackages")
            setTimeout(function () {
              ev.select.remove() //TODO UGLY! find a better way. Needed because the list comp wil reload after invoking
            }, 200);
          }
        },
        {
          name:"Import",
          action:(ev)=>{
            importCSVfromFileSelector(function (results) {
              let startImport = confirm(results.data.length+" stakeholders will be imported")
              if (startImport) {
                for (stakeholder of results.data) {
                  push(act.add("stakeholders",{uuid:genuuid(), name:stakeholder[0], lastName:stakeholder[1],org:stakeholder[2], role:stakeholder[3]}))

                }
                alert("Close and restart view to complete import")//todo, not working automaticaly
                updateList()
              }
            })

          }
        },
        {
          name:"Diagramme",
          action:(ev)=>{
            setTimeout(function () {
              ev.select.remove() //TODO UGLY! find a better way. Needed because the list comp wil reload after invoking
            }, 200);

            showTreeFromListService.showByStoreGroup("stakeholders", function (e) {
              updateList()

            })
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
    currentVisibleList = undefined
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var stakeholdersView = createStakeholdersView()
stakeholdersView.init()
