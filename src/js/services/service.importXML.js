var createImportXMLService = function () {
  var self ={};
  var objectIsActive = false;

  let file, url, reader = new FileReader;

  var options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : true,
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false,
    arrayMode: false
};

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("keydown", function(event) {
      if (!( event.key == 'i' && event.ctrlKey) ) return true;
      importXML()
      //document.querySelector('#topmenu_project_saver').click()
      //A bit ugly TODO: check for a better way
      event.preventDefault();
      return false;
    })
  }

  var render = function (uuid) {
  }

  function readJSON(e) {
    reader.readAsText(document.querySelector('#newInput').files[0]);
  }

  var xmlParser = function (xml) {
    var sMyString = xml;
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(sMyString, "application/xml");
    // print the name of the root element or error message
    console.log(oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement.nodeName);
    console.log(oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement);
    return oDOM.documentElement
  }

  var importXML = function () {

    reader = new FileReader;

    alert("fefsef")
    var input=document.createElement('input');
    input.style.display="none"
    input.id="newInput"
    input.type="file";
    document.body.appendChild(input)
    setTimeout(function () {

      reader.addEventListener("load", function() {
        console.log(reader.result);
        var xmlDOM = xmlParser(reader.result)
        xmlToProject(xmlDOM)
        //console.log(parser.parse(reader.result, options));
        document.querySelector('#newInput').remove()
      });

      document.querySelector('#newInput').addEventListener("change", readJSON);
      document.querySelector('#newInput').click()

    }, 500);

  }

  var xmlToProject = function (xmlDOM) {
    var projectProducts = []
    var projectRelations = []
    //parsingFunction
    var doForEach = function (item, callback) {
      for (var i = 0; i < item.length; i++) {
        callback(item[i])
      }
    };
    //rules
    var parseAsElementFolder =function (folder, targetArray) {
      let type = folder.getAttribute('type')
      doForEach(folder.children, function (item) {
        targetArray.push({id:item.id, name:item.getAttribute("name"), type:type})
      })
    }
    var parseAsRelations =function (folder, targetArray) {
      let type = folder.getAttribute('type')
      doForEach(folder.children, function (item) {
        targetArray.push({id:item.id, name:item.getAttribute("xsi:type"), source:item.getAttribute("source"), target:item.getAttribute("target")})
      })
    }

    doForEach(xmlDOM.children, function (folder) {// parse firstLevel
      console.log(folder);
      if (folder.getAttribute('type') != "relations" && folder.getAttribute('type') != "diagrams" && folder.getAttribute('type') != "connectors") {
        parseAsElementFolder(folder, projectProducts)
      }
      //parse relations
      if (folder.getAttribute('type') == "relations") {
        parseAsRelations(folder, projectRelations)
      }
    })

    console.log(projectProducts);
    console.log(projectRelations);

    //send to current project
    let store = query.currentProject()
    if (store) {
      alert("loading into project")
      projectProducts.forEach(function (item) {
        push(addPbs({uuid:item.id, name:item.name}))
        push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:item.id}))
      })
      projectRelations.forEach(function (item) {
        push(act.add("interfaces",{type:undefined, name:item.name,description:"Archimate relation", source:item.source, target:item.target}))
      })
    }

  }


  var update = function () {
    render()
  }

  self.update = update
  self.init = init

  return self
}

var importXMLService = createImportXMLService()
importXMLService.init()
