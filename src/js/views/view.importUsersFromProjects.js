var createImportUsersFromProjects = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  var currentVisibleList = undefined

  var init = function () {
    connections()
    // update()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentVisibleList) {
        var store = await query.currentProject()
        ephHelpers.updateListElements(currentVisibleList,{
          items:getAllUsers(store)
        })
      }
    })

  }

  var render = async function () {
    var store = await query.currentProject()
    var allUsers = await getAllUsers(store)
    //var html = generateUsersViewHtml(allUsers)
    generateUsersViewList(store, allUsers)
    //container.innerHTML = html
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

  var getAllUsers = async function (store) {
    var allProjects = await query.items("projects")
    var relatedProjects = allProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))

    var ownerTable = relatedProjects
        .filter(p=> p.uuid!=store.uuid)
        .map(e =>{
          return e.stakeholders.map(i => Object.assign({projectId:e.uuid, projectName:e.name}, i)) //add project prop to all items
        } )
        .reduce((a, b) => {return a.concat(b)},[])
        // .map((e) => {return {uuid:e.uuid, name:e.name}});
    console.log(ownerTable);
    return ownerTable
  }

  var generateUsersViewHtml = function (owners) {
    var html =""
    for (owner of owners) {
      html += `<h2 class="">${owner.name}</h2>`
      html += `<div class="ui very relaxed list">`
      html +=" </div>"
    }
    return html
  }

  var generateUsersViewList = function (store, owners) {
    currentVisibleList = showListMenu({
      sourceData:owners,
      targetDomContainer:".center-container",
      fullScreen:true,
      displayProp:"name",
      display:[
        {prop:"projectName", displayAs:"Project", edit:false},
        {prop:"name", displayAs:"First name", edit:false},
        {prop:"lastName", displayAs:"Last name", edit:false},
        {prop:"org", displayAs:"Org", edit:false},
        {prop:"role", displayAs:"Role", edit:false},
        {prop:"mail", displayAs:"E-mail", edit:false},
        {prop:"uuid", displayAs:"uuid", edit:false}
      ],
      idProp:"uuid",
      extraButtons : [
        {name:"Import", class:"iufp_import", prop:"projectId", action: async (orev)=>{
          // generateUsersFusionList(owners, orev.dataset.id, orev.dataset.extra )
          console.log(orev);
          var allProjectsList= await query.items("projects")
          let project = allProjectsList.find(p=>p.uuid == orev.dataset.extra)
          let userToImport= project.stakeholders.find(s=>s.uuid == orev.dataset.id)
          console.log(userToImport)
          var storeChecked = await query.currentProject()
          if(storeChecked.stakeholders.find(s=> s.uuid == userToImport.uuid)){
            alert("This user already exist in the current project")
          }else if (confirm("add user"+ userToImport.name+" "+userToImport.lastName+ " from project "+ project.name+ "?")) {
            push(act.add("stakeholders",deepCopy(userToImport)))
            // setTimeout(function () {
            //   render()
            // }, 1000);
          }
        }}
      ],
      onEditItem: (ev)=>{
        console.log("Edit");
        console.log(ev.target.dataset.id);
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          var item = store.stakeholders.filter((item)=>item.uuid == ev.target.dataset.id)
          console.log(item);
          console.log(item[0][ev.target.dataset.prop]);
          item[0][ev.target.dataset.prop] = newValue
        }

      },
      onRemoveNOTYET: (ev)=>{
        console.log("remove");
        if (confirm("remove item ?")) {
          store.stakeholders = store.stakeholders.filter((item)=>item.uuid != ev.target.dataset.id)
          store.links = store.links.filter((item)=>item.source != ev.target.dataset.id && item.target != ev.target.dataset.id   )
          ev.select.updateData(store.stakeholders)
          console.log(store.stakeholders);
        }
      },
      onClick: (ev)=>{
        setActive()
        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      }
    })
  }

  var generateUsersFusionList = function (owners, IdToFuse, ProjectWhereFusedIs) {
    showListMenu({
      sourceData:owners,
      displayProp:"name",
      display:[
        {prop:"projectName", displayAs:"Project", edit:false},
        {prop:"name", displayAs:"Prénom", edit:false},
        {prop:"lastName", displayAs:"Nom", edit:false},
        {prop:"org", displayAs:"Entreprise", edit:false},
        {prop:"role", displayAs:"Fonction", edit:false},
        {prop:"mail", displayAs:"E-mail", edit:false}
      ],
      idProp:"uuid",
      onClick: async (ev)=>{
        console.log(IdToFuse, ProjectWhereFusedIs);
        console.log(ev);
        if (confirm("Fuse the users? The original id of the user will be replace with this one.")) {
          var allProjects = await query.items("projects")
          var relatedProjects = allProjects.filter(p=>app.store.relatedProjects.includes(p.uuid))

          var projectScope = relatedProjects.find(p=> p.uuid==ProjectWhereFusedIs)
          console.log(projectScope);
          var idToChange = projectScope.stakeholders.find(s=>s.uuid==IdToFuse)
          idToChange.uuid = ev.target.dataset.id //TODO BAD, Move to API
          var metalinksOriginToChange = projectScope.metaLinks.filter(m=>m.source==IdToFuse)
          var metalinksTargetToChange = projectScope.metaLinks.filter(m=>m.target==IdToFuse)
          for (link of metalinksOriginToChange) {
            // link.source = ev.target.dataset.id
            push(act.edit("metaLinks", {uuid:link.uuid, prop:"source", value:ev.target.dataset.id}))

          }

          for (link of metalinksTargetToChange) {
            // link.target = ev.target.dataset.id
            push(act.edit("metaLinks", {uuid:link.uuid, prop:"target", value:ev.target.dataset.id}))
          }
        }
        setTimeout(function () {
          render()
        }, 1000);

        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      }
    })
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var importUsersFromProjects = createImportUsersFromProjects(".center-container")
