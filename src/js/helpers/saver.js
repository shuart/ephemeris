function createSaver(elementID, object, name) {

 let file, url, reader = new FileReader;

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
        file = new File([json], name, {type:"application/json"});
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

  let create = document.getElementById(elementID)
    // textbox = document.getElementById("textbox"),
    // code = document.querySelector("code"),
    // input = document.querySelector("input[type=file]"),
    // pre = document.querySelector("pre");

  create.addEventListener("click", function () {
    var link = document.createElement("a");
    link.setAttribute("download", name);
    var json = createJSONFile(JSON.stringify(app.store.projects));
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

createSaver("saver",app.store.projects,"info.json")
// createSaver("saverDB",app.cscDB.db,"csc.txt")
