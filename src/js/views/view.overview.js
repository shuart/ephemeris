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


  var init = function () {
    connections()
    update()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    if (store) {
      clearUncompleteLinks()//clean all uncomplete metalink of the project
      updateFileForRetroCompatibility() //check file for retrocompatbiity
      //create a PBS if first opening of project
      if (!store.currentPbs.items[0]) {
        createPBS()
      }

      var headerHtml =`
      <h2 class="ui center aligned icon header">
        <i class="circular building outline icon"></i>
        ${store.reference}, ${store.name}
      </h2>
      `
      var html = `
      <div class="ui very padded container">
        <div class="ui placeholder segment">
          <div class="ui four statistics">
            <div class="statistic">
              <div class="value">
                <i class="comment icon"></i>
                ${store.requirements.items.length}
              </div>
              <div class="label">
                Requirements
              </div>
            </div>
            <div class="statistic">
              <div class="value">
                <i class="users icon"></i>
                ${store.stakeholders.items.length}
              </div>
              <div class="label">
                Stakeholders
              </div>
            </div>
            <div class="statistic">
              <div class="value">
                <i class="sitemap icon"></i> ${(store.currentPbs.items.length - 1)}
              </div>
              <div class="label">
                Sub-Systems
              </div>
            </div>
            <div class="statistic">
              <div class="value">
                <i class="cogs icon"></i> ${(store.functions.items.length)}
              </div>
              <div class="label">
                functions
              </div>
            </div>
          </div>
        </div>

        <div class="ui center aligned basic segment">
          ${theme.quickstart()}
        </div>

      </div>
      `
      // <div class="statistic">
      //   <div class="value">
      //     <img src="/images/avatar/small/joe.jpg" class="ui circular inline image">
      //     ${(store.currentCDC.items.length)}
      //   </div>
      //   <div class="label">
      //     Specs
      //   </div>
      // </div> TODO readd spec when ready
      container.innerHTML = headerHtml+html;
    }
  }

  function createPBS() {
    var store = query.currentProject()
    store.currentPbs.items.push({name: store.reference+store.name, uuid: "ita2215151-a50f-4dd3-904e-146118d5d444"})
    store.currentPbs.items.push({name: "A linked product", uuid:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
    store.currentPbs.items.push({name: "Another linked product", uuid:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
    store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
    store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
  }

  function updateFileForRetroCompatibility() {
    function alertAboutUpdate(extraInfos) {
      alert("This project was created with an earlier version and was updated. " +extraInfos)
    }
    //Tags from 1.7.2
    var store = query.currentProject()
    if (!store.tags) {
      store.tags = {
        items:[
          {uuid: uuid(), name: "Approved", color: "#ffffff"},
          {uuid: uuid(), name: "Closed", color: "#ffffff"},
          {uuid: uuid(), name: "Rejected", color: "#ffffff"}
        ]
      }
      alertAboutUpdate("Tags feature has been added.")
    }
    if (!store.workPackages) {
      store.workPackages = {
        items:[
          {uuid: uuid(), name: "A work package"}
        ]
      }
      alertAboutUpdate("Work Packages feature has been added.")
    }
    if (!store.meetings) {
      store.meetings = {
        items:[{uuid:uuid(),relations:[],  createdOn:new Date(),title:"Meeting exemple",content:"Use Markdown",
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
      },
      alertAboutUpdate("Meetings feature has been added.")
    }
    if (!store.extraFields) {
      store.extraFields={
        items:[]
      }
      alertAboutUpdate("Extra Fields feature has been added.")
    }
    if (!store.physicalSpaces) {
      store.physicalSpaces={
        items:[
          {uuid: uuid(), name: "A physical space"}
        ],
        links:[]
      }
      alertAboutUpdate("Physical Spaces feature has been added.")
    }
    if (store.interfaces.items.find(i=>(i.description=="Un interface" && i.type=="physical connection" && i.source=="555sfse" && i.target=="f896546e") )) {

      store.interfaces.items = store.interfaces.items.filter(i=>!(i.description=="Un interface" && i.type=="physical connection" && i.source=="555sfse" && i.target=="f896546e") )

      alertAboutUpdate("Interfaces list feature has been added.")
    }
    if (!store.categories) {
      store.categories={
        items:[
          {uuid: uuid(), name: "Space", svgPath: "M504 352H136.4c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0 96H136.1c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0-192H136.6c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm106.5-139L338.4 3.7a48.15 48.15 0 0 0-36.9 0L29.5 117C11.7 124.5 0 141.9 0 161.3V504c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V256c0-17.6 14.6-32 32.6-32h382.8c18 0 32.6 14.4 32.6 32v248c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V161.3c0-19.4-11.7-36.8-29.5-44.3z"},
          {uuid: uuid(), name: "Electrical", svgPath: "M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"},
          {uuid: uuid(), name: "Network", svgPath: "M640 264v-16c0-8.84-7.16-16-16-16H344v-40h72c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H224c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h72v40H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h104v40H64c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h304v40h-56c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h104c8.84 0 16-7.16 16-16zM256 128V64h128v64H256zm-64 320H96v-64h96v64zm352 0h-96v-64h96v64z"},
          {uuid: uuid(), name: "Mechanical", svgPath: "M288 64c17.7 0 32-14.3 32-32S305.7 0 288 0s-32 14.3-32 32 14.3 32 32 32zm223.5-12.1c-2.3-8.6-11-13.6-19.6-11.3l-480 128c-8.5 2.3-13.6 11-11.3 19.6C2.5 195.3 8.9 200 16 200c1.4 0 2.8-.2 4.1-.5L240 140.8V224H64c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H272v-91.7l228.1-60.8c8.6-2.3 13.6-11.1 11.4-19.6zM176 384H80v-96h96v96zm160-96h96v96h-96v-96zm-32 0v96h-96v-96h96zM192 96c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"},
          {uuid: uuid(), name: "Architecture", svgPath: "M560 448h-16V96H32v352H16.02c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16H176c8.84 0 16-7.16 16-16V320c0-53.02 42.98-96 96-96s96 42.98 96 96l.02 160v16c0 8.84 7.16 16 16 16H560c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm0-448H16C7.16 0 0 7.16 0 16v32c0 8.84 7.16 16 16 16h544c8.84 0 16-7.16 16-16V16c0-8.84-7.16-16-16-16z"}
        ]
      },
      alertAboutUpdate("Categories feature has been added.")
    }
    if (!store.templates) {
      store.templates={
        items:[],
        links:[]
      }
      alertAboutUpdate("Templates management feature has been added.")
    }
    if (!store.documents) {
      store.documents={
        items:[
          {uuid:uuid(), name:"Ephemeris Handbook",type:"html", osPath:undefined, idb:undefined, link:"https://github.com/shuart/ephemeris/blob/master/README.md", description:"Quickstart guide for Ephemeris"}
        ],
        links:[]
      }
      alertAboutUpdate("Documents management feature has been added.")
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
