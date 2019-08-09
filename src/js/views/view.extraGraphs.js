var createExtraGraphsView = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)

  var theme = {}
  theme.startSection=function() {
    return `
      <div style="height:90%;" class="ui horizontal segments">
        <div style="height:100%;" class="ui segment mermaid">

        </div>
      </div>
      <button class="ui button action_extra_graphs_download">
        Download
      </button>
    `
  }
  theme.startSectionOld=function() {
    return `
      <div class="ui horizontal segments">
        <div class="ui segment mermaid">

        </div>
        <div class="ui segment">
        fesfefessef
        </div>
      </div>
    `
  }


  var init = function () {
    connections()
    update()

  }
  var connections =function () {
    connect(".action_extra_graphs_download", "click",function (event) {
      saveSvgAsPng(container.querySelector(".mermaid svg"), "graph.png", {scale: 5})

      // saveSvg(container.querySelector(".mermaid svg"), "graph")

      // event.target.href = `data:image/svg+xml;base64,${btoa(container.querySelector(".mermaid svg"))}`
      // event.target.download = `mermaid-diagram-${moment().format('YYYYMMDDHHmmss')}.svg`
    })
  }

  var render = function () {
    var store = query.currentProject()
    if (store) {
      container.innerHTML = theme.startSection()
      let mermaidTarget = container.querySelector(".mermaid")
      // mermaidTarget.innerHTML=`
      // graph LR\n
      //  A --- B\n
      //  B-->C[fa:fa-ban forbidden]\n
      //  B-->D(fa:fa-spinner);
      // `
      mermaidTarget.innerHTML=createGraphEDR()

      // mermaid.init({theme: "forest"}, $(".mermaid"));
      mermaid.initialize({theme: "neutral"})
      mermaid.init({theme: "forest"}, $(".mermaid"));

      var svgPanZoom= $(".mermaid svg").svgPanZoom({maxZoom:15})
    }
  }

  function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

  function createGraphEDROld() {
    var store = query.currentProject()

    let allObjects = []
          .concat(store.currentPbs.items)
          .concat(store.requirements.items)
          .concat(store.functions.items)
          .concat(store.stakeholders.items)
    // let links = store.metaLinks.items.map(m=>m.source+"-->"+m.target).join("\n")
    // let header = "graph LR\n"
    let nbr =0
    let links = store.metaLinks.items.map(function (m) {
      let sourceObject = allObjects.find(i=>i.uuid == m.source)
      let targetObject = allObjects.find(i=>i.uuid == m.target)
      if (sourceObject && targetObject) {
        return sourceObject.name.replace(/-/g,'')+"--*"+targetObject.name.replace(/-/g,'') + "\n"
      }
    }).join("")
    let header = `classDiagram\n`
    return header+links

  }
  function createGraphEDR() {
    var store = query.currentProject()

    let allObjects = []
          .concat(store.currentPbs.items)
          .concat(store.requirements.items)
          .concat(store.functions.items)
          .concat(store.stakeholders.items)
    // let links = store.metaLinks.items.map(m=>m.source+"-->"+m.target).join("\n")
    // let header = "graph LR\n"
    let nbr =0
    let links = store.currentPbs.links.map(function (m) {
      let sourceObject = allObjects.find(i=>i.uuid == m.source)
      let targetObject = allObjects.find(i=>i.uuid == m.target)
      if (sourceObject && targetObject && sourceObject.name && targetObject.name) {
        return cleanName(sourceObject.name)+"*--"+cleanName(targetObject.name) + "\n"
      }
    }).join("")


    let definitions = []
    for (var i = 0; i < store.currentPbs.items.length; i++) {
      let p = store.currentPbs.items[i]

      let relatedReq = getRelatedItems(p, "requirements", {metalinksType:"originNeed"}).map(l=>l[0] ? cleanName(p.name)+": -"+l[0].name :"")
      definitions = definitions.concat(relatedReq)
    }
    console.log(definitions);
    definitions = definitions.join('\n')

    let header = `classDiagram\n`
    return header+links+definitions

  }

  function cleanName(name) {
    let cleared = name.replace(/-/g,'')
    cleared = cleared.replace(/\./g,'')
    cleared = cleared.replace(/ /g,'')
    cleared = cleared.replace(/'/g,'')
    cleared = cleared.replace(/\(/g,'')
    cleared = cleared.replace(/\)/g,'')
    console.log(cleared);
    return cleared
  }






  var update = function () {
    if (objectIsActive) {
      render()
    }
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
    container.innerHTML = "";
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var extraGraphsView = createExtraGraphsView(".center-container");
extraGraphsView.init();
