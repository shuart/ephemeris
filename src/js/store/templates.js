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
    items:[{uuid:"plaefse", name:"Project Planning", items:[], links:[]}
    ],
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
  graphs:{
    items:[
      [{uuid: "f896546e", fx: 303.3567591326126, fy: 456.92026148965726},
      {uuid: "fefiose", fx: 280.90578607861664, fy: 340.49053534573414}]
    ]
  },
  metaLinks:{
    items:[{type:"origin", source:"555sfse", target:"f896546e"}]
  },
  interfaces:{
    items:[{type:"physical connection", source:"555sfse", target:"f896546e", description:"Un interface"}]
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
