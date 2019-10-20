var createVvManager = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)

  var theme={}

  theme.vvSetArea = function (sets) {
    return`
    <h2>Verification & Validation Sets</h2>
    <div class="ui link cards" style="padding:5px;">
      ${sets.map(set=> theme.vvSet()).join('')}
    </div>
    `
  }
  theme.vvSet = function () {
    return `
    <div class="ui card">
      <div class="content">
        <div class="header">Project Timeline</div>
      </div>
      <div class="content">
        <h4 class="ui sub header">Activity</h4>
        <div class="ui small feed">
          <div class="event">
            <div class="content">
              <div class="summary">
                 <a>Elliot Fu</a> added <a>Jenny Hess</a> to the project
              </div>
            </div>
          </div>
          <div class="event">
            <div class="content">
              <div class="summary">
                 <a>Stevie Feliciano</a> was added as an <a>Administrator</a>
              </div>
            </div>
          </div>
          <div class="event">
            <div class="content">
              <div class="summary">
                 <a>Helen Troy</a> added two pictures
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <button class="ui button">Join Project</button>
      </div>
    </div>
    `
  }

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    container.innerHTML = ""
    if (store) {
      let vvSetsList = [1,2,3,4]
      // let vvSetsList = store.vvSets.items
      container.appendChild(
        toNode(theme.vvSetArea(vvSetsList))
      )
      // vvSetsList.forEach(set =>{
      //   container.appendChild(toNode(theme.vvSet()))
      // })

    }

  }


  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.physicalSpaces.items.map(i=>{
      let linkToTextPbs = getRelatedItems(i, "currentPbs", {metalinksType:"contains"}).map(s=> s[0]? s[0].name : "").join(",")
      return {id:i.uuid, name:i.name, description:i.desc, products:linkToTextPbs}
    })
    JSONToCSVConvertor(data, 'PhysicalSpaces', true)

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

var vvManager = createVvManager(".center-container")
vvManager.init()
