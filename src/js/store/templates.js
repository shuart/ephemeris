var store = {
  uuid:uuid(),
  name:"My Project",
  reference:"REF-001",
  description:{
  },
  db:{
    topCat : [],
    middleCat : [],
    subCat : [],
    items:[]
  },
  currentCDC:{
    items:[]
  },
  currentPbs:{
    items:[],
    links:[]
  },
  plannings:{
    items:[],
    links:[]
  },
  events:{
    items:[],
    links:[]
  },
  timeTracks:{
    items:[],
    links:[]
  },
  timeLinks:{
    items:[],
    links:[]
  },
  requirements:{
    items:[
      {uuid:"fefsfse", name:"A requirement"},
      {uuid:"555sfse", name:"A linked requirement"},
      {uuid:"444sfse", name:"An other linked requirement"},

      {uuid:"789sfse", name:"Yet an other linked requirement"},
      {uuid:"999sfse", name:"Requirements can have many levels"},
      {uuid:"f54846e", name:"Another exemple requirement"}
    ],
    links:[
      {source:"fefsfse", target:"555sfse"},
      {source:"fefsfse", target:"789sfse"},
      {source:"444sfse", target:"999sfse"},
      {source:"fefsfse", target:"444sfse"}
    ]
  },
  functions:{
    items:[
      {uuid:"fefsf867", name:"A function"},
      {uuid:"55567687", name:"A linked function"},
      {uuid:"f54877777", name:"Another function"},
      {uuid:"99eeee86fse", name:"Another linked function"},
    ],
    links:[
      {source:"fefsf867", target:"55567687"},
      {source:"f54877777", target:"99eeee86fse"}
    ]
  },
  stakeholders:{
    items:[
      {uuid:"fefiose", name:"A", lastName:"Stakeholder", org:"na", role:"", mail:""},
      {uuid:"f896546e", name:"John", lastName:"Doe", org:"Entreprise inc", role:"PM", mail:""}
    ],
    links:[]
  },
  actions:{
    items:[
    ]
  },
  tags:{
    items:[
      {uuid: uuid(), name: "Approved", color: "#ffffff"},
      {uuid: uuid(), name: "Closed", color: "#ffffff"},
      {uuid: uuid(), name: "Rejected", color: "#ffffff"}
    ]
  },
  categories:{
    items:[
      {uuid: uuid(), name: "Space", svgPath: "M504 352H136.4c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0 96H136.1c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0-192H136.6c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm106.5-139L338.4 3.7a48.15 48.15 0 0 0-36.9 0L29.5 117C11.7 124.5 0 141.9 0 161.3V504c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V256c0-17.6 14.6-32 32.6-32h382.8c18 0 32.6 14.4 32.6 32v248c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V161.3c0-19.4-11.7-36.8-29.5-44.3z"},
      {uuid: uuid(), name: "Electrical", svgPath: "M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"},
      {uuid: uuid(), name: "Network", svgPath: "M640 264v-16c0-8.84-7.16-16-16-16H344v-40h72c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H224c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h72v40H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h104v40H64c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h304v40h-56c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h104c8.84 0 16-7.16 16-16zM256 128V64h128v64H256zm-64 320H96v-64h96v64zm352 0h-96v-64h96v64z"},
      {uuid: uuid(), name: "Mechanical", svgPath: "M288 64c17.7 0 32-14.3 32-32S305.7 0 288 0s-32 14.3-32 32 14.3 32 32 32zm223.5-12.1c-2.3-8.6-11-13.6-19.6-11.3l-480 128c-8.5 2.3-13.6 11-11.3 19.6C2.5 195.3 8.9 200 16 200c1.4 0 2.8-.2 4.1-.5L240 140.8V224H64c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H272v-91.7l228.1-60.8c8.6-2.3 13.6-11.1 11.4-19.6zM176 384H80v-96h96v96zm160-96h96v96h-96v-96zm-32 0v96h-96v-96h96zM192 96c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"},
      {uuid: uuid(), name: "Architecture", svgPath: "M560 448h-16V96H32v352H16.02c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16H176c8.84 0 16-7.16 16-16V320c0-53.02 42.98-96 96-96s96 42.98 96 96l.02 160v16c0 8.84 7.16 16 16 16H560c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm0-448H16C7.16 0 0 7.16 0 16v32c0 8.84 7.16 16 16 16h544c8.84 0 16-7.16 16-16V16c0-8.84-7.16-16-16-16z"}
    ]
  },
  extraFields:{
    items:[
      // {uuid: uuid(), name: "A custom Field", prop:"_acustomfield", type: "requirements"}
    ]
  },
  meetings:{
    items:[{
      uuid:uuid(),
      relations:[],
      createdOn:new Date(),
      title:"Meeting example",
      content:"Use Markdown",
      participants:{
        present:["f896546e"],
        absent:["fefiose"],
        cc:["fefiose"]
      },
      chapters:[
        {
          uuid:uuid(),
          name:"Meeting chapter",
          topics:[
            {
              uuid:uuid(),
              name:"Topic",
              items:[
                {uuid:uuid(),createdOn:new Date(),type:"action",assignedTo:["f896546e"], date:new Date(), content:"An example item"}
              ]
            }
          ]
        }
      ]
    }]
  },
  workPackages:{
    items:[
      {uuid: uuid(), name: "A work package"}
    ]
  },
  physicalSpaces:{
    items:[
      {uuid: uuid(), name: "A physical space"}
    ],
    links:[]
  },
  graphs:{
    items:[
      [{uuid: "f896546e", fx: 303.3567591326126, fy: 456.92026148965726},
      {uuid: "fefiose", fx: 280.90578607861664, fy: 340.49053534573414}]
    ]
  },
  templates:{
    items:[]
  },
  documents:{
    items:[{uuid:uuid(), name:"Ephemeris Handbook",type:"html", osPath:undefined, idb:undefined, link:"https://github.com/shuart/ephemeris/blob/master/README.md", description:"Quickstart guide for Ephemeris"}]
    // items:[{uuid:uuid(), name:"An exemple document",type:"pdf", osPath:"/subdir", idb:"indexedDB id", link:"Link to another cloud place", description:"Un interface"}]
  },
  metaLinks:{
    items:[{uuid:uuid(),type:"origin", source:"555sfse", target:"f896546e"}]
  },
  interfaces:{
    items:[]
    // items:[{uuid:uuid(), name:"An exemple interface",type:"physical connection", source:"555sfse", target:"f896546e", description:"Un interface"}]
  },
  vvSets:{
    items:[],
    links:[]
  },
  vvReports:{
    items:[],
    links:[]
  },
  vvDefinitions:{
    items:[],
    links:[]
  },
  vvActions:{
    items:[],
    links:[]
  },
  history:{
    items:[]
    // items:[{uuid:uuid(), name:"An exemple interface",type:"physical connection", source:"555sfse", target:"f896546e", description:"Un interface"}]
  },
  links:[] //TODO unifier links et metalinks
}

var projectTemplate = JSON.stringify(store)
var createNewProject = function (name) {
  var secondProject = JSON.parse(projectTemplate)
  secondProject.uuid =genuuid()
  secondProject.name =name
  return secondProject
}
