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

  create.addEventListener("click", function () {
      var link = document.createElement("a");
      link.setAttribute("download", filename);
      var json = createJSONFile(JSON.stringify({type:type, userData:app.store.userData , data:app.store.projects}));//TODO closure issue again
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

  }, false);

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
  create.addEventListener("click", function () {
    if (query.currentProject()) {
      var link = document.createElement("a");
      let extraName = "_" +query.currentProject().name
      let currentDate = "_" + new Date(Date.now()).toLocaleString()
      link.setAttribute("download", filename + extraName + currentDate + fileExtensions);
      var json = createJSONFile(JSON.stringify({type:type, data:query.currentProject()}));//TODO closure issue again
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

function loadSavedData(data, callback) {
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
    if (app.state.currentUser) {
      if (app.store.projects.find(e=> e.uuid == jsonContent.data.uuid )) {

        var projectIndex = app.store.projects.findIndex(e=> e.uuid == jsonContent.data.uuid )

        checkProjectDifferences(app.store.projects[projectIndex], jsonContent.data)
        
        if (confirm("This project exist already. Do you want to replace it?")) {

          app.store.projects[projectIndex] = jsonContent.data
          renderCDC()
          pageManager.setActivePage("projectSelection")
        }
      }else {
        if (confirm("Import this project?")) {
          app.store.projects.push(jsonContent.data)
          renderCDC()
          pageManager.setActivePage("projectSelection")
        }
      }
    }else {alert("project files can only be added when logged in")}
  }
}

function checkProjectDifferences(original, target) {
  let differences = []
  let diffResult = DeepDiff.diff(original,target)
  console.log(diffResult);

}
