var createExternalUsersManagement = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)

  var init = function () {
    connections()
    // update()

  }
  var connections =function () {

  }

  var render = function () {
    container.innerHTML = ""
    var allUsers = getAllUsers()
    //var html = generateUsersViewHtml(allUsers)
    generateUsersViewList(allUsers)
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

  var getAllUsers = function () {
    var ownerTable = query.items("projects")
        .map(e =>{
          return e.stakeholders.items.map(i => Object.assign({projectId:e.uuid, projectName:e.name}, i)) //add project prop to all items
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

  var generateUsersViewList = function (owners) {
    showListMenu({
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
        {name:"Fuse", class:"fuse", prop:"projectId", action: (orev)=>{
          generateUsersFusionList(owners, orev.dataset.id, orev.dataset.extra )
          update()
        }}
      ],
      onEditItem: (ev)=>{
        console.log("Edit");
        console.log(ev.target.dataset.id);
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          var item = store.stakeholders.items.filter((item)=>item.uuid == ev.target.dataset.id)
          console.log(item);
          console.log(item[0][ev.target.dataset.prop]);
          item[0][ev.target.dataset.prop] = newValue
        }

      },
      onRemoveNOTYET: (ev)=>{
        console.log("remove");
        if (confirm("remove item ?")) {
          store.stakeholders.items = store.stakeholders.items.filter((item)=>item.uuid != ev.target.dataset.id)
          store.stakeholders.links = store.stakeholders.links.filter((item)=>item.source != ev.target.dataset.id && item.target != ev.target.dataset.id   )
          ev.select.updateData(store.stakeholders.items)
          console.log(store.stakeholders.items);
        }
      },
      onClick: (ev)=>{
        // setActive()
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
      onClick: (ev)=>{
        console.log(IdToFuse, ProjectWhereFusedIs);
        console.log(ev);
        if (confirm("fuse?")) {
          var projectScope = query.items("projects").find(p=> p.uuid==ProjectWhereFusedIs)
          console.log(projectScope);
          var idToChange = projectScope.stakeholders.items.find(s=>s.uuid==IdToFuse)
          idToChange.uuid = ev.target.dataset.id //TODO BAD, Move to API
          var metalinksOriginToChange = projectScope.metaLinks.items.filter(m=>m.source==IdToFuse)
          var metalinksTargetToChange = projectScope.metaLinks.items.filter(m=>m.target==IdToFuse)
          for (link of metalinksOriginToChange) {link.source = ev.target.dataset.id}
          for (link of metalinksTargetToChange) {link.target = ev.target.dataset.id }
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

var externalUsersManagement = createExternalUsersManagement(".center-container")
