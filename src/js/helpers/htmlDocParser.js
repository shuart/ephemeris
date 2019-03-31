var itemPropList = [
  ["GÉNÉRALITÉS","generalites"],
  ["DESCRIPTION","description"],
  ["SONT INCLUS DANS LE PRIX","inclus"],
  ["MESURAGE","mesurage"],
  ["EXÉCUTION / MISE EN ŒUVRE","execution"],
  ["EXECUTION / MISE EN OEUVRE","execution"],
  ["DOCUMENTS DE REFERENCE","documents"],
  ["MATERIAUX","materiaux"],
  ["MATÉRIAUX","materiaux"],
  ["MATÉRIAUX ","materiaux"],
  ["DOCUMENTS A SOUMETTRE PAR L’ADJUDICATAIRE","requiredDoc"],
  ["CARACTÉRISTIQUES","caracteristiques"],
  ["PRESCRIPTIONS PARTICULIÈRES","prescriptions"]
]

function nodeIsInProps(node,itemPropList) {
  for (prop of itemPropList) {
    if (node.textContent === prop[0]) {
      return true
    }
  }
  return false
}

var lastCDCInnerHtml;

var lastTopCat;
var lastMiddleCat;
var lastSubCat;
var itemContentAggregator;
var lastItem = {};
var lastCat = undefined;
var aggregate = false
var isInItem = false

function loopParser(node){
    // do some thing with the node here


    //check if title and cat
    if (node.classList && node.classList.contains("CDC1")) {
      aggregate = false//stop aggregation of item html
      isInItem = false
      lastTopCat = {name:node.textContent, general:""}
      lastCat = "topCat"
      store.db.topCat.push(lastTopCat)
    }else if (node.classList && node.classList.contains("CDC2")) {
      aggregate = false//stop aggregation of item html
      isInItem = false
      lastCat = "middleCat"

      lastMiddleCat = {name:node.textContent, general:""}
      store.db.middleCat.push(lastMiddleCat)
    }else if (node.classList && node.classList.contains("CDC3")) {
      aggregate = false//stop aggregation of item html
      isInItem = false
      lastCat = "subCat"

      lastSubCat = {name:node.textContent, general:""}
      store.db.subCat.push(lastSubCat)
    }else if (node.classList && node.classList.contains("CDC4")) {
      //Check if Item
      aggregate = false //stop aggregation of item html
      isInItem = true //stop aggregation of item html
      if (lastItem.name) {
        store.db.items.push(lastItem) //push previous items
      }
      lastItem ={} //reset item
      lastItem.uuid = uuid()
      lastItem.name = node.textContent
      lastItem.topCat = lastTopCat
      lastItem.middleCat = lastMiddleCat
      lastItem.subCat = lastSubCat
    }else if (node.classList && node.classList.contains("CDC5")&& isInItem) {
      for (prop of itemPropList) {
        if (node.textContent == prop[0]) {
          lastItem[prop[1]] = ""
          aggregate = prop[1]
        }
      }
    }else if (aggregate && isInItem && (node.classList.contains("MsoNormal") || node.classList.contains("bulletpointsCxSpFirst")|| node.classList.contains("bulletpointsCxSpMiddle")|| node.classList.contains("bulletpointsCxSpLast")|| node.classList.contains("CDC6")|| node.classList.contains("CDC7"))) {
      if (!nodeIsInProps(node,itemPropList)) {
        lastItem[aggregate] += node.outerHTML
      }
    }else if(node.classList.contains("CDC5") || (node.classList.contains("MsoNormal") || node.classList.contains("bulletpointsCxSpFirst")|| node.classList.contains("bulletpointsCxSpMiddle")|| node.classList.contains("bulletpointsCxSpLast")|| node.classList.contains("CDC6")|| node.classList.contains("CDC7"))){
      //if is in a cat only
      if (lastCat == "topCat") {lastTopCat.general += node.outerHTML }
      if (lastCat == "middleCat") {lastMiddleCat.general += node.outerHTML }
      if (lastCat == "subCat") {lastSubCat.general += node.outerHTML }
    }
    var nodes = node.childNodes;
    for (var i = 0; i <nodes.length; i++){
        if(!nodes[i]){
            continue;
        }

        if(nodes[i].childNodes.length > 0){
            loopParser(nodes[i]);
        }
    }

  }
  
