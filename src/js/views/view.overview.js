var createOverview = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)

  var theme = {}
  theme.startSection=function() {
    return `
      <div class="ui horizontal segments">
        <div class="ui segment">
          <p></p>
        </div>
        <div class="ui segment">
        </div>
      </div>
    `
  }
  theme.quickstart=function() {
    return `
    <h4>Quickstart guide</h4>

      <div class="ui small steps">
        <div class="link step action_toogle_stakeholders">
          <i class="address book icon"></i>
          <div class="content">
            <div class="title">Add a stakeholder</div>
            <div class="description">To start capturing needs</div>
          </div>
        </div>
        <div class="link step action_toogle_requirements_view">
          <i class="comment icon"></i>
          <div class="content">
            <div class="title">Add a requirement</div>
            <div class="description">To record a user need</div>
          </div>
        </div>
        <div class="link step action_toogle_tree_pbs">
          <i class="dolly icon"></i>
          <div class="content">
            <div class="title">Add a product</div>
            <div class="description">And link it to a requirement</div>
          </div>
        </div>
      </div>
    `
  }
  theme.quickstartForeignProject=function() {
    return `
    <h4>Quickstart guide</h4>

      <div class="ui small steps">

        <div class="link step action_toogle_stakeholders">
          <i class="address book icon"></i>
          <div class="content">
            <div class="title">Add a stakeholder</div>
            <div class="description">To start capturing needs</div>
          </div>
        </div>
        <div class="link step action_toogle_requirements_view">
          <i class="comment icon"></i>
          <div class="content">
            <div class="title">Add a requirement</div>
            <div class="description">To record a user need</div>
          </div>
        </div>
        <div class="link step action_toogle_tree_pbs">
          <i class="dolly icon"></i>
          <div class="content">
            <div class="title">Add a product</div>
            <div class="description">And link it to a requirement</div>
          </div>
        </div>
      </div>
    `
  }


  var init = function () {
    connections()
    update()

  }
  var connections =function () {
    connect(".action_toogle_add_me_in_stakeholders","click",async (e)=>{
      alert("Select your name in the stakeholder list to mark it as yourself, or add yourself as a new stakeholder")
      var projectScope = await query.currentProject()
      showListMenu({
        sourceData:projectScope.stakeholders,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"Prénom", edit:false},
          {prop:"lastName", displayAs:"Nom", edit:false},
          {prop:"org", displayAs:"Entreprise", edit:false},
          {prop:"role", displayAs:"Fonction", edit:false},
          {prop:"mail", displayAs:"E-mail", edit:false}
        ],
        idProp:"uuid",
        showColoredIcons: lettersFromNames,
        onClick: async (ev)=>{
          let idToReplace = ev.target.dataset.id
          if (confirm("Do you want to mark this stakehoder as yourself?")) {

            var projectScope = await query.currentProject()
            console.log(projectScope);

            push(act.edit("stakeholders", {project:projectScope.uuid, uuid:idToReplace, prop:"uuid", value:app.store.userData.info.userUuid}))

            var metalinksOriginToChange = projectScope.metaLinks.filter(m=>m.source==idToReplace)
            var metalinksTargetToChange = projectScope.metaLinks.filter(m=>m.target==idToReplace)
            for (link of metalinksOriginToChange) {
              // link.source = ev.target.dataset.id
              push(act.edit("metaLinks", {project:projectScope.uuid, uuid:link.uuid, prop:"source", value:app.store.userData.info.userUuid}))
            }
            for (link of metalinksTargetToChange) {
              // link.target = ev.target.dataset.id
              push(act.edit("metaLinks", {project:projectScope.uuid, uuid:link.uuid, prop:"target", value:app.store.userData.info.userUuid}))
            }

            await workarounds.replaceStakeholderIdInMeetings(projectScope, idToReplace, app.store.userData.info.userUuid)

          }
          setTimeout(function () {
            render()
          }, 1000);
        },
        extraActions:[
          {
            name:"Add",action:(ev)=>{
              addUserStakeholder()
              ev.select.remove()
            }
          }
        ]
      })
    })

  }

  var render = async function () {
    var store = await query.currentProject()
    if (store) {
      var projectInfos = getCriticalInfos(store)
      // alert("uncoment here")
      await clearUncompleteLinks()//clean all uncomplete metalink of the project
      updateFileForRetroCompatibility(store) //check file for retrocompatbiity
      // //create a PBS and current user stakholder if first opening of project
      // if (!store.currentPbs[0]) {
      //   createPBS()
      //   createUserStakeholder()
      // }

      var headerHtml =`
      <h2 class="ui center aligned icon header">
        <i class="circular building outline icon"></i>
        ${projectInfos.reference}, ${projectInfos.name}
      </h2>
      `
      var html = `
      <div class="ui very padded container">

      <div class="ui divider"></div>

        <div style="box-shadow: 0 0px 0px 0 rgba(255, 255, 255, 0.15);border-style: none;" class="ui horizontal segments">
          <div class="ui basic segment">
            <div class="ui placeholder segment">
              <div class="ui four statistics">
                <div class="statistic">
                  <div class="value">
                    <i class="comment icon"></i>
                    ${store.requirements.length}
                  </div>
                  <div class="label">
                    Requirements
                  </div>
                </div>
                <div class="statistic">
                  <div class="value">
                    <i class="users icon"></i>
                    ${store.stakeholders.length}
                  </div>
                  <div class="label">
                    Stakeholders
                  </div>
                </div>
                <div class="statistic">
                  <div class="value">
                    <i class="sitemap icon"></i> ${(store.currentPbs.length - 1)}
                  </div>
                  <div class="label">
                    Sub-Systems
                  </div>
                </div>
                <div class="statistic">
                  <div class="value">
                    <i class="cogs icon"></i> ${(store.functions.length)}
                  </div>
                  <div class="label">
                    functions
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div style="width: 200px;overflow: auto;max-height: 300px;" class="ui basic segment">
            <div class="ui center aligned basic segment overviewActivity"></div>
          </div>
        </div>

        <div class="ui center aligned basic segment">
          ${checkIfCurrentUserIsInStakeholders(store) ? theme.quickstart():theme.quickstartForeignProject()}
        </div>

      </div>
      `
      // <div class="statistic">
      //   <div class="value">
      //     <img src="/images/avatar/small/joe.jpg" class="ui circular inline image">
      //     ${(store.currentCDC.length)}
      //   </div>
      //   <div class="label">
      //     Specs
      //   </div>
      // </div> TODO readd spec when ready
      container.innerHTML = headerHtml+html;
      createActivityFeed({
        container:'.overviewActivity',
        maxElements:30,
        searchForAllItemsNames :true,
        onClick:function (e) {
          showSingleItemService.showById(e.target.dataset.id)
        }
      })
    }
  }

  function checkIfCurrentUserIsInStakeholders(store) {
    return store.stakeholders.find(s=>s.uuid == app.store.userData.info.userUuid)
  }

  // function createPBS() {
  //   var store = query.currentProject()
  //   store.currentPbs.push({name: store.reference+store.name, uuid: "ita2215151-a50f-4dd3-904e-146118d5d444"})
  //   store.currentPbs.push({name: "A linked product", uuid:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
  //   store.currentPbs.push({name: "Another linked product", uuid:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
  //   store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
  //   store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
  // }
  function createUserStakeholder() {
    var store = query.currentProject()
    let i = app.store.userData.info
    store.stakeholders[0] = {uuid:i.userUuid, name:i.userFirstName, lastName:i.userLastName, org:"na", role:"", mail:""}
  }
  async function addUserStakeholder() {
    var store = await query.currentProject()
    let i = app.store.userData.info
    push(act.add("stakeholders",{uuid:i.userUuid, name:i.userFirstName, lastName:i.userLastName}))
  }

  function updateFileForRetroCompatibility(store) {
    function alertAboutUpdate(extraInfos) {
      alert("This project was created with an earlier version and was updated. " +extraInfos)
    }
    //Tags from 1.7.2
    if (!store.tags) {
      store.tags = [
          {uuid: uuid(), name: "Approved", color: "#ffffff"},
          {uuid: uuid(), name: "Closed", color: "#ffffff"},
          {uuid: uuid(), name: "Rejected", color: "#ffffff"}
        ]
      dbConnector.addProjectCollection(store.uuid, "tags", store.tags)
      alertAboutUpdate("Tags feature has been added.")
    }
    if (!store.workPackages) {
      store.workPackages = [
          {uuid: uuid(), name: "A work package"}
        ]
      dbConnector.addProjectCollection(store.uuid, "workPackages", store.workPackages)
      alertAboutUpdate("Work Packages feature has been added.")
    }
    if (!store.meetings) {
      store.meetings = [{uuid:uuid(),relations:[],  createdOn:new Date(),title:"Meeting exemple",content:"Use Markdown",
          participants:{
            present:["f896546e"],
            absent:["fefiose"],
            cc:["fefiose"]
          },
          chapters:[{
            uuid:uuid(),
            name:"Chapitre",
            topics:[
            ]
          }]
        }]
      dbConnector.addProjectCollection(store.uuid, "meetings", store.meetings)
      alertAboutUpdate("Meetings feature has been added.")
    }
    if (!store.extraFields) {
      store.extraFields=[]
      dbConnector.addProjectCollection(store.uuid, "extraFields", store.extraFields)
      alertAboutUpdate("Extra Fields feature has been added.")
    }
    if (!store.physicalSpaces) {
      store.physicalSpaces=[
          {uuid: uuid(), name: "A physical space"}
        ]
      dbConnector.addProjectCollection(store.uuid, "physicalSpaces", store.physicalSpaces)
      alertAboutUpdate("Physical Spaces feature has been added.")
    }
    // if (store.interfaces.find(i=>(i.description=="Un interface" && i.type=="physical connection" && i.source=="555sfse" && i.target=="f896546e") )) {
    //
    //   store.interfaces = store.interfaces.filter(i=>!(i.description=="Un interface" && i.type=="physical connection" && i.source=="555sfse" && i.target=="f896546e") )
    //
    //   alertAboutUpdate("Interfaces list feature has been added.")
    // }
    if (!store.categories) {
      store.categories=[
          {uuid: uuid(), name: "Space", svgPath: "M504 352H136.4c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0 96H136.1c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0-192H136.6c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm106.5-139L338.4 3.7a48.15 48.15 0 0 0-36.9 0L29.5 117C11.7 124.5 0 141.9 0 161.3V504c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V256c0-17.6 14.6-32 32.6-32h382.8c18 0 32.6 14.4 32.6 32v248c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V161.3c0-19.4-11.7-36.8-29.5-44.3z"},
          {uuid: uuid(), name: "Electrical", svgPath: "M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"},
          {uuid: uuid(), name: "Network", svgPath: "M640 264v-16c0-8.84-7.16-16-16-16H344v-40h72c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H224c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h72v40H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h104v40H64c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h304v40h-56c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h104c8.84 0 16-7.16 16-16zM256 128V64h128v64H256zm-64 320H96v-64h96v64zm352 0h-96v-64h96v64z"},
          {uuid: uuid(), name: "Mechanical", svgPath: "M288 64c17.7 0 32-14.3 32-32S305.7 0 288 0s-32 14.3-32 32 14.3 32 32 32zm223.5-12.1c-2.3-8.6-11-13.6-19.6-11.3l-480 128c-8.5 2.3-13.6 11-11.3 19.6C2.5 195.3 8.9 200 16 200c1.4 0 2.8-.2 4.1-.5L240 140.8V224H64c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H272v-91.7l228.1-60.8c8.6-2.3 13.6-11.1 11.4-19.6zM176 384H80v-96h96v96zm160-96h96v96h-96v-96zm-32 0v96h-96v-96h96zM192 96c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"},
          {uuid: uuid(), name: "Architecture", svgPath: "M560 448h-16V96H32v352H16.02c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16H176c8.84 0 16-7.16 16-16V320c0-53.02 42.98-96 96-96s96 42.98 96 96l.02 160v16c0 8.84 7.16 16 16 16H560c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm0-448H16C7.16 0 0 7.16 0 16v32c0 8.84 7.16 16 16 16h544c8.84 0 16-7.16 16-16V16c0-8.84-7.16-16-16-16z"}
        ]
      dbConnector.addProjectCollection(store.uuid, "categories", store.categories)
      alertAboutUpdate("Categories feature has been added.")
    }
    if (!store.templates) {
      store.templates=[]
      dbConnector.addProjectCollection(store.uuid, "templates", store.templates)
      alertAboutUpdate("Templates management feature has been added.")
    }
    if (!store.documents) {
      store.documents=[
          {uuid:uuid(), name:"Ephemeris Handbook",type:"html", osPath:undefined, idb:undefined, link:"https://github.com/shuart/ephemeris/blob/master/README.md", description:"Quickstart guide for Ephemeris"}
        ]
      dbConnector.addProjectCollection(store.uuid, "documents", store.documents)
      alertAboutUpdate("Documents management feature has been added.")
    }
    if (!store.history) {
      store.history=[]
      dbConnector.addProjectCollection(store.uuid, "history", store.history)
      alertAboutUpdate("activities history feature has been added.")
    }
    if (!store.events) {
      store.events=[]
      dbConnector.addProjectCollection(store.uuid, "events", store.events)
      alertAboutUpdate("planning feature has been added.")
    }
    if (!store.timeTracks) {
      store.timeTracks=[]
      dbConnector.addProjectCollection(store.uuid, "timeTracks", store.timeTracks)
      alertAboutUpdate("planning feature has been added.")
    }
    if (!store.timeLinks) {
      store.timeLinks=[]
      dbConnector.addProjectCollection(store.uuid, "timeLinks", store.timeLinks)
      alertAboutUpdate("planning feature has been added.")
    }
    if (!store.vvSets) {
      store.vvSets=[]
      dbConnector.addProjectCollection(store.uuid, "vvSets", store.vvSets)
      alertAboutUpdate("Verification feature (V&V sets) has been added.")
    }
    if (!store.vvDefinitions) {
      store.vvDefinitions=[]
      dbConnector.addProjectCollection(store.uuid, "vvDefinitions", store.vvDefinitions)
      alertAboutUpdate("Verification feature (V&V definitions) has been added.")
    }
    if (!store.vvDefinitions) {
      store.vvReports=[]
      dbConnector.addProjectCollection(store.uuid, "vvDefinitions", store.vvDefinitions)
      alertAboutUpdate("Verification feature (V&V reports) has been added.")
    }
    if (!store.vvActions) {
      store.vvActions=[]
      dbConnector.addProjectCollection(store.uuid, "vvActions", store.vvActions)
      alertAboutUpdate("Verification feature (V&V actions) has been added.")
    }
    if (!store.settings) {
      store.settings=[]
      dbConnector.addProjectCollection(store.uuid, "settings", store.settings)
      alertAboutUpdate("Project Settings view has been added.")
    }
    if (!store.interfacesTypes) {
      store.interfacesTypes=[
          {uuid: uuid(), name: "Interface", color: "#ffffff"},
          {uuid: uuid(), name: "Physical connection", color: "#ffffff"},
          {uuid: uuid(), name: "Data connection", color: "#ffffff"},
          {uuid: uuid(), name: "Command connection", color: "#ffffff"},
          {uuid: uuid(), name: "Power connection", color: "#ffffff"},
          {uuid: uuid(), name: "Electrical connection", color: "#ffffff"},
          {uuid: uuid(), name: "Mechanical connection", color: "#ffffff"}
        ],
      dbConnector.addProjectCollection(store.uuid, "interfacesTypes", store.interfacesTypes)
      alertAboutUpdate("Interfaces types have been added.")
    }
    if (!store.changes) {
      store.changes=[],
      dbConnector.addProjectCollection(store.uuid, "changes", store.changes)
      alertAboutUpdate("Changes have been added.")
    }
    if (!store.itemsOrder) {
      store.itemsOrder=[],
      dbConnector.addProjectCollection(store.uuid, "itemsOrder", store.itemsOrder)
      alertAboutUpdate("custom item order have been added.")
    }
    if (!store.onlineHistory) {
      store.onlineHistory=[],
      dbConnector.addProjectCollection(store.uuid, "onlineHistory", store.onlineHistory)
      alertAboutUpdate("Online History have been added.")
    }
    if (!store.actors) {
      store.actors=[],
      dbConnector.addProjectCollection(store.uuid, "actors", store.onlineHistory)
      alertAboutUpdate("Actors have been added.")
    }


  }



  var update = function () {
    if (objectIsActive) {
      render()
    }
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
    container.innerHTML = "";
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var overview = createOverview(".center-container");
overview.init();
overview.setActive();
