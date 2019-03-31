var createInterfacesView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    
    var array1 =store.functions.items.map((e) => {e.color="#3da4ab"; return e})
    var array2 =store.currentPbs.items.map((e) => {e.color="#2ebf91"; return e})
    var array3 = store.requirements.items.map((e) => {e.color="#e6e6ea"; return e})
    var array4 = store.stakeholders.items.map((e) => {e.color="#fed766 "; return e})
    var concatData = array1.concat(array2).concat(array3).concat(array4)

    var groupLinks =[]
    var initIndex = 0
    var currentIndex = 0
    var groups = [array1,array2,array3,array4]
    for (group of groups) {
      var groupLinks1  = group.map((e)=>{
        currentIndex +=1;
        return {source: initIndex, target: currentIndex}
      })
      initIndex +=groupLinks1.length
      currentIndex = initIndex
      groupLinks = groupLinks.concat(groupLinks1)
      groupLinks.splice(-1,1)
    }
    console.log(concatData);
    console.log(groupLinks);

    var state = createStateDiagram({container:".center-container",data:concatData, links:store.metaLinks,positions :undefined, groupLinks:groupLinks})
    state.init()
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var interfacesView = createInterfacesView();
interfacesView.init()
