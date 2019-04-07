var app = {}
app.store = {
  user : undefined,
  userData: undefined,
  // projects : [JSON.parse(JSON.stringify(store)), createNewProject("AnotherProject") ]
  projects : [JSON.parse(JSON.stringify(store)), createNewProject("Another Project") ]
}

app.state = {
  currentUser : undefined,
  currentProject: undefined
}

app.cscDB ={
  db:{
    topCat : [],
    middleCat : [],
    subCat : [],
    items:[]
  }
}
