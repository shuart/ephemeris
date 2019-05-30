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
    items:[{uuid:"plaefse", name:"Planning du projet", items:[], links:[]}
    ],
    links:[]
  },
  requirements:{
    items:[
      {uuid:"fefsfse", name:"Ajouter des besoins"},
      {uuid:"555sfse", name:"Un besoin dépendant du précédent"},
      {uuid:"444sfse", name:"Un autre besoin dépendant du précédent"},

      {uuid:"789sfse", name:"Encore un besoin dépendant du précédent"},
      {uuid:"999sfse", name:"Un sous sous besoin"},
      {uuid:"f54846e", name:"Un autre besoin"}
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
      {uuid:"fefsf867", name:"Une fonction du projet"},
      {uuid:"55567687", name:"Une fonction du dépendant de la précédente"},
      {uuid:"f54877777", name:"Une autre fonction"},
      {uuid:"99eeee86fse", name:"Une sous fonction"},
    ],
    links:[
      {source:"fefsf867", target:"55567687"},
      {source:"f54877777", target:"99eeee86fse"}
    ]
  },
  stakeholders:{
    items:[
      {uuid:"fefiose", name:"Stéphane", lastName:"Huart", org:"na", role:"", mail:""},
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
