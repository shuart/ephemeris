function createSaver({
  target = undefined,
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

  let create = document.getElementById(target)
    // textbox = document.getElementById("textbox"),
    // code = document.querySelector("code"),
    // input = document.querySelector("input[type=file]"),
    // pre = document.querySelector("pre");

  create.addEventListener("click", function () {
    var link = document.createElement("a");
    link.setAttribute("download", filename);
    var json = createJSONFile(JSON.stringify({type:type, data:app.store.projects}));//TODO closure issue again
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
createSaver({target:"saver", type:"session", dataGetter:app.store.projects, filename:"ephemeris_session.json"})
// createSaver("saverDB",app.cscDB.db,"csc.txt")

function loadSavedData(data, callback) {
  var jsonContent = JSON.parse(data);
  if (jsonContent.type == "session") {
    var userName = prompt("Select a user name to import this section")
    if (userName != "") {
      persist.setUser({name:userName,projects:jsonContent.data}).then(function () {
        callback()
      })
    }
  }
}
