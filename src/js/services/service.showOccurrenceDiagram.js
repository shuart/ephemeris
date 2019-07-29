var createShowOccurrenceDiagramService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function (nodes, relations) {
    createInterfaceMatrix(nodes, relations)
  }

  var createInterfaceMatrix = function (nodesToShow, relations) {
    // let store  = query.currentProject()
    // let data = readifyInterfaces().map(i=>{
    //   let linkToTextTags = getRelatedItems(i, "tags", {metalinksType:"tags"}).map(s=> s[0]? s[0].name : "").join(",")
    //
    //   return {id:i.uuid, type:i.type, description:i.description, source:i.source, target:i.target, tags:linkToTextTags}
    // })
    let nodes = []
    let links = []
    nodesToShow.forEach(function (p,index) {
      nodes.push({name:p.name, group:undefined, index:index, uuid:p.uuid})
    })
    console.log(relations);
    relations.forEach(function (i) {
      console.log(nodes.find(n=>n.uuid == i.source));
      let sourceNode=nodes.find(n=>n.uuid == i.source.uuid)
      if (sourceNode) {
        let source=sourceNode.index
        let targetNode=nodes.find(n=>n.uuid == i.target.uuid)
        if (targetNode) {
          let target=targetNode.index

          sourceNode.linkUuid = i.uuid
          targetNode.linkUuid = i.uuid
          links.push({source: source, target: target, value: 1, uuid:i.uuid})
        }
      }

    })
    console.log({nodes:nodes, links:links});
    createOccurrenceDiagram({originalData:{nodes:nodes, links:links}})
  }


  var update = function () {
    render(nodes, relations)
  }
  var show = function (nodes, relations) {
    render(nodes, relations)
  }


  self.show = show
  self.update = update
  self.init = init

  return self
}

var showOccurrenceDiagramService = createShowOccurrenceDiagramService()
showOccurrenceDiagramService.init()
