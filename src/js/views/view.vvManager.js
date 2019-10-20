var createVvManager = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)

  var theme={}

  theme.vvSetArea = function (sets) {
    return`
    <h2>Verification & Validation Sets</h2>
    <button class="action_vv_manager_add_set ui right labeled icon green mini button">
      <i class="plus icon"></i>
      Add a V&V set
    </button>
    <div class="ui link cards" style="padding:5px;">
      ${sets.map(set=> theme.vvSet(set)).join('')}
    </div>
    `
  }
  theme.vvReportArea = function (reports) {
    return`
    <h2>Reports</h2>
    <div class="ui link cards" style="padding:5px;">
      ${reports.map(report=> theme.vvReport(report)).join('')}
    </div>
    `
  }
  theme.vvSet = function (set) {
    return `
    <div class="ui card">
      <div class="content">
        <div class="header">${set.name}</div>
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
        <button data-id="${set.uuid}" class="action_toogle_vv_set_view ui mini button">View</button>
        <button data-id="${set.uuid}" class="action_vv_manager_add_report_from_set ui mini button">Create a report</button>
      </div>
    </div>
    `
  }
  theme.vvReport= function (report) {
    return `
    <div class="ui card">
      <div class="content">
        <div class="header">${report.name}</div>
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
        <button data-id="${report.uuid}" class="action_toogle_vv_report_view ui button">View</button>
      </div>
    </div>
    `
  }

  var init = function () {
    connections()

  }
  var connections =function () {
    connect(".action_vv_manager_add_set", "click", function (e) {
      push(act.add("vvSets",{name:"new Set"}))
      render()
    })
    connect(".action_vv_manager_add_report_from_set", "click", function (e) {
      var store = query.currentProject()
      let reportUuid = genuuid()
      push(act.add("vvReports",{uuid:reportUuid, name:"New Report based on "+ e.target.dataset.id}))
      //generate the report action based on the set
      let vvDefinitionsInOrigin = deepCopy( store.vvDefinitions.items.filter(def=> def.sourceSet == e.target.dataset.id) )
      vvDefinitionsInOrigin.forEach(function (def) {
        let newDefUuid = genuuid()
        //copy related metalinks
        let relatedMetalink = deepCopy(store.metaLinks.items.filter(l=> l.source == def.uuid && l.type == 'vvDefinitionNeed'))
        relatedMetalink.forEach(function (relatedLink) {
          relatedLink.uuid = genuuid()
          relatedLink.source =newDefUuid
          relatedLink.type ="vvReportNeed"
          push(act.add("metaLinks",relatedLink))
        })
        //then modify the def to an action
        def.uuid = newDefUuid
        def.sourceReport = reportUuid
        push(act.add("vvActions",def))
      })
      render()
    })
  }

  var render = function () {
    var store = query.currentProject()
    container.innerHTML = ""
    if (store) {
      // let vvSetsList = [1,2,3,4]
      let vvSetsList = store.vvSets.items
      container.appendChild(
        toNode(theme.vvSetArea(vvSetsList))
      )
      let vvReportsList = store.vvReports.items
      container.appendChild(
        toNode(theme.vvReportArea(vvReportsList))
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
