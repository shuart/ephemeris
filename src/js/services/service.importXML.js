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

  var archimateTemplate = {
    specs:{
      layers:{
        strategy:{name:"Strategy", type:"strategy", color:"#ffffff"},
        business:{name:"Business", type:"business", color:"#ffffff"},
        application:{name:"Application", type:"application", color:"#ffffff"},
        technology:{name:"Technology", type:"technology", color:"#ffffff"},
        physical:{name:"Physical", type:"physical", color:"#ffffff"},
        motivation:{name:"Motivation", type:"motivation", color:"#ffffff"},
        implementation_migration:{name:"Implementation & Migration", type:"implementation_migration", color:"#ffffff"},
        other:{name:"Other", type:"other", color:"#ffffff"},
        relations:{name:"Relations", type:"relations", color:"#ffffff"}//connectors and view missing
      },
      elements:{
        ressource:{name:"Ressource", type:"ressource", layer:"strategy"},
        capability:{name:"Capability", type:"capability", layer:"strategy"},
        courseOfAction:{name:"Course of Action", type:"courseOfAction", layer:"strategy"},
        //strategy
        businessObject:{name:"Business Object", type:"businessObject", layer:"business"},
        contract:{name:"Contract", type:"contract", layer:"business"},
        representation:{name:"Representation", type:"representation", layer:"business"},
        product:{name:"Product", type:"product", layer:"business"},
        businessService:{name:"Business Service", type:"businessService", layer:"business"},
        businessEvent:{name:"Business Event", type:"businessEvent", layer:"business"},
        businessFunction:{name:"Business Function", type:"businessFunction", layer:"business"},
        businessInteraction:{name:"Business Interaction", type:"businessInteraction", layer:"business"},
        businessProcess:{name:"Business Process", type:"businessProcess", layer:"business"},
        businessRole:{name:"Business Role", type:"businessRole", layer:"business"},
        businessCollaboration:{name:"Business Collaboration", type:"businessCollaboration", layer:"business"},
        businessActor:{name:"Business Actor", type:"businessActor", layer:"business"},
        businessInterface:{name:"Business Interface", type:"businessInterface", layer:"business"},
        //application
        dataObject:{name:"Data Object", type:"dataObject", layer:"application"},
        applicationService:{name:"Application Service", type:"applicationService", layer:"application"},
        applicationEvent:{name:"Application Event", type:"applicationEvent", layer:"application"},
        applicationFunction:{name:"Application Function", type:"applicationFunction", layer:"application"},
        applicationInteraction:{name:"Application Interaction", type:"applicationInteraction", layer:"application"},
        applicationProcess:{name:"Application Process", type:"applicationProcess", layer:"application"},
        applicationComponent:{name:"Application Component", type:"applicationComponent", layer:"application"},
        applicationCollaboration:{name:"Application Collaboration", type:"applicationCollaboration", layer:"application"},
        applicationInterface:{name:"Application Interface", type:"applicationInterface", layer:"application"},
        //technology
        artifact:{name:"Artifact", type:"artifact", layer:"technology"},
        technologyService:{name:"Technology Service", type:"technologyService", layer:"technology"},
        technologyEvent:{name:"Technology Event", type:"technologyEvent", layer:"technology"},
        technologyFunction:{name:"Technology Function", type:"technologyFunction", layer:"technology"},
        technologyInteraction:{name:"Technology Interaction", type:"technologyInteraction", layer:"technology"},
        technologyProcess:{name:"Technology Process", type:"technologyProcess", layer:"technology"},
        node:{name:"Node", type:"node", layer:"technology"},
        technologyInterface:{name:"Technology Interface", type:"technologyInterface", layer:"technology"},
        communicationNetwork:{name:"Communication Network", type:"communicationNetwork", layer:"technology"},
        systemSoftware:{name:"System Software", type:"systemSoftware", layer:"technology"},
        technologyCollaboration:{name:"Technology Collaboration", type:"technologyCollaboration", layer:"technology"},
        path:{name:"Path", type:"path", layer:"technology"},
        device:{name:"Device", type:"device", layer:"technology"},
        //physical
        material:{name:"Materal", type:"material", layer:"physical"},
        facility:{name:"Facility", type:"facility", layer:"physical"},
        equipment:{name:"Equipment", type:"equipment", layer:"physical"},
        distributionNetwork:{name:"Distribution Network", type:"distributionNetwork", layer:"physical"},
        //implementation_migration
        deliverable:{name:"Deliverable", type:"deliverable", layer:"implementation_migration"},
        gap:{name:"Gap", type:"gap", layer:"implementation_migration"},
        workPackage:{name:"Work Package", type:"workPackage", layer:"implementation_migration"},
        implementationEvent:{name:"Implementation Event", type:"implementationEvent", layer:"implementation_migration"},
        plateau:{name:"Plateau", type:"plateau", layer:"implementation_migration"},
        //TODO Add Motivation
        //relations
        CompositionRelationship:{name:"Composition Relationship", type:"CompositionRelationship", layer:"implementation_migration"},
        AggregationRelationship:{name:"Aggregation Relationship", type:"AggregationRelationship", layer:"implementation_migration"},
        AssignmentRelationship:{name:"Assignment Relationship", type:"AssignmentRelationship", layer:"implementation_migration"},
        RealizationRelationship:{name:"Realization Relationship", type:"RealizationRelationship", layer:"implementation_migration"},
        UsedByRelationship:{name:"Used By Relationship", type:"UsedByRelationship", layer:"implementation_migration"},
        AccessRelationship:{name:"Access Relationship", type:"AccessRelationship", layer:"implementation_migration"},
        AssociationRelationship:{name:"Association Relationship", type:"AssociationRelationship", layer:"implementation_migration"},
        FlowRelationship:{name:"Flow Relationship", type:"FlowRelationship", layer:"implementation_migration"},
        TriggeringRelationship:{name:"Triggering Relationship", type:"TriggeringRelationship", layer:"implementation_migration"},
        SpecializationRelationship:{name:"Specialization Relationship", type:"SpecializationRelationship", layer:"implementation_migration"},
        JunctionRelationship:{name:"Junction Relationship", type:"JunctionRelationship", layer:"implementation_migration"},
        GroupingRelationship:{name:"Grouping Relationship", type:"GroupingRelationship", layer:"implementation_migration"}

      }
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
