function createSaver({
  targetID = undefined,
  data = [],
  type = "json",
  filename = "save.json"
}={}) {

 let file, url, reader = new FileReader;

 let jsonToSave = {type:type, data:app.store.projects}//TODO closure issue, shoud not be here

 function createJSONFile(json) {
    let e = void 0;
    try {
      JSON.parse(json)
    } catch (err) {
      e = err;
      alert(e);
    }
    finally {
      if (e) {
        return "Invalid JSON";
      }
      else {
        file = new File([json], filename, {type:"application/json"});
        url = URL.createObjectURL(file);
        return url;
      }
    }
  };

  function revokeBlobURL() {
    window.removeEventListener("focus", revokeBlobURL);
    URL.revokeObjectURL(url);
    if (file.close) {
      file.close();
    }
  }

  function readJSON(e) {
    reader.readAsText(input.files[0]);
  }

  let create = document.getElementById(targetID)
    // textbox = document.getElementById("textbox"),
    // code = document.querySelector("code"),
    // input = document.querySelector("input[type=file]"),
    // pre = document.querySelector("pre");

  // create.addEventListener("click", function () {
  //     var link = document.createElement("a");
  //     link.setAttribute("download", filename);
  //     var json = createJSONFile(JSON.stringify({type:type, userData:app.store.userData , data:app.store.projects}));//TODO closure issue again
  //     // var json = createJSONFile(JSON.stringify(object));
  //     //var json = createJSONFile(JSON.stringify(store.db));
  //     if (json !== "Invalid JSON") {
  //       link.href = json;
  //       document.body.appendChild(link);
  //       console.log("Valid JSON");
  //       //code.textContent = "Valid JSON";
  //       link.click();
  //       window.addEventListener("focus", revokeBlobURL);
  //     } else {
  //       //code.textContext = json;
  //     }
  //
  // }, false);

  // reader.addEventListener("load", function() {
  //   pre.textContent = JSON.stringify(reader.result, null, 2);
  // });
  //
  // input.addEventListener("change", readJSON);
};

// createSaver("saver",app.store.projects,"info.json")
createSaver({targetID:"saver", type:"session", dataGetter:app.store.projects, filename:"ephemeris_session.json"})
// createSaver("saverDB",app.cscDB.db,"csc.txt")

function createSingleProjectSaver({
  targetID = undefined,
  data = [],
  type = "json",
  filename = "save",
  fileExtensions = ".json"
}={}) {

 let file, url, reader = new FileReader;

 let jsonToSave = {type:type, data:app.store.projects}//TODO closure issue, shoud not be here

 function createJSONFile(json) {
    let e = void 0;
    try {
      JSON.parse(json)
    } catch (err) {
      e = err;
      alert(e);
    }
    finally {
      if (e) {
        return "Invalid JSON";
      }
      else {
        let extraName = query.currentProject().name
        if (query.currentProject()) { extraName = "_" +query.currentProject().name}
        file = new File([json], filename + extraName + fileExtensions, {type:"application/json"});
        url = URL.createObjectURL(file);
        return url;
      }
    }
  };

  function revokeBlobURL() {
    window.removeEventListener("focus", revokeBlobURL);
    URL.revokeObjectURL(url);
    if (file.close) {
      file.close();
    }
  }

  function readJSON(e) {
    reader.readAsText(input.files[0]);
  }
  let create = document.getElementById(targetID)
  create.addEventListener("click", async function () {
    if (query.currentProject()) {
      var link = document.createElement("a");
      let projectToSave = await query.currentProject()
      let extraName = "_" +projectToSave.name
      let currentDate = "_" + new Date(Date.now()).toLocaleString()
      link.setAttribute("download", filename + extraName + currentDate + fileExtensions);
      var json = createJSONFile(JSON.stringify({type:type, data:projectToSave}));//TODO closure issue again
      // var json = createJSONFile(JSON.stringify(object));
      //var json = createJSONFile(JSON.stringify(store.db));
      if (json !== "Invalid JSON") {
        link.href = json;
        document.body.appendChild(link);
        console.log("Valid JSON");
        //code.textContent = "Valid JSON";
        link.click();
        window.addEventListener("focus", revokeBlobURL);
      } else {
        //code.textContext = json;
      }
    }else {
      alert("Focus on a project to export")
    }
  }, false);
};
createSingleProjectSaver({targetID:"topmenu_project_saver", type:"project", data:app.store.projects, fileExtension:".json", filename:"ephemeris_project"})

async function loadSavedData(data, callback) {
  var jsonContent = JSON.parse(data);
  if (jsonContent.type == "session") {
    if (!app.state.currentUser) {
      var userName = prompt("Select a user name to import this section")
      if (userName != "") {
        persist.setUser({name:userName,userData:jsonContent.userData,projects:jsonContent.data}).then(function () {
          callback()
        })
      }
    }else {
      alert("Session files can only be loaded in user selection view")
    }
  }else if (jsonContent.type == "project") {
    if (jsonContent.data._id) {
      delete jsonContent.data._id;
    }
    let allProjects = await query.items("projects")
    if (app.state.currentUser) {
      // if (allProjects.find(e=> e.uuid == jsonContent.data.uuid )) {
      //   if (confirm("This project exist already. Do you want to replace it?")) {
      //     // var projectIndex = app.store.projects.findIndex(e=> e.uuid == jsonContent.data.uuid )
      //     // app.store.projects[projectIndex] = jsonContent.data
      //     // renderCDC()
      //     await dbConnector.removeProject(ev.target.dataset.id)
      //     await dbConnector.addProject(jsonContent.data)
      //     pageManager.setActivePage("projectSelection")
      //   }else if(confirm("Create a copy?")){
      //     jsonContent.data.uuid=genuuid()
      //     jsonContent.data.name +="_copy"
      //     console.log(jsonContent.data);
      //     await dbConnector.addProject(jsonContent.data)
      //     pageManager.setActivePage("projectSelection")
      //   }
      // }else {
      //   if (confirm("Import this project?")) {
      //     dbConnector.addProject(jsonContent.data)
      //     pageManager.setActivePage("projectSelection")
      //   }
      // }
      if (confirm("Import this project?")) {

        jsonContent.data.uuid=genuuid()
        jsonContent.data.name +="_imported"
        let importedProject = jsonContent.data
        let newProjectSchema = {links:[]}
        let fields = Object.keys(importedProject)

        fields.forEach((field, i) => {
          if (field != "links") { //avoid links as it was added manualy
            newProjectSchema[field] = []
            if (importedProject[field].items) {
              newProjectSchema[field] = importedProject[field].items
            }
            if (importedProject[field].links) {
              importedProject[field].links.forEach((link, i) => {
                newProjectSchema.links.push(link)
              });
            }
          }
        });

        newProjectSchema.uuid=genuuid();
        newProjectSchema.name=jsonContent.data.name +"_imported";
        newProjectSchema.reference=jsonContent.data.reference ;
        newProjectSchema.description=jsonContent.data.description ;
        console.log(newProjectSchema);

        crdtsDB._import(newProjectSchema)//TODO remove


        dbConnector.addProject(newProjectSchema)

        pageManager.setActivePage("projectSelection")
        alert("Project has been imported")
      }
    }else {alert("project files can only be added when logged in")}
  }
}
