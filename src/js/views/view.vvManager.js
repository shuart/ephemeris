var createVvManager = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)

  var theme={}

  theme.vvSetArea = function (sets, store) {
    let stats = getGlobalStatistics(store)
    return`
    <h2>Verification & Validation Sets</h2>
    <button class="action_vv_manager_add_set ui right labeled icon green mini button">
      <i class="plus icon"></i>
      Add a V&V set
    </button>
    <div class="ui tiny progress" data-value="15" data-percent="0,0" data-total="20">
        <div style="min-width:0%; width:${stats.percentOfCoveredNeeds}%;" class="bar"></div>
        <div class="label">${stats.percentOfCoveredNeeds}% of requirements covered</div>
    </div>
    <div class="ui tiny progress" data-value="15" data-percent="0,0" data-total="20">
        <div style="min-width:0%; width:${stats.percentOfCoveredInterfaces}%;" class="bar"></div>
        <div class="label">${stats.percentOfCoveredInterfaces}% of interfaces covered</div>
    </div>

    <div class="ui link cards" style="padding:5px;">
      ${sets.map(set=> theme.vvSet(set, store)).join('')}
    </div>
    `
  }
  theme.vvReportArea = function (reports, store) {
    return`
    <h2>Reports</h2>
    <div class="ui link cards" style="padding:5px;">
      ${reports.map(report=> theme.vvReport(report, store)).join('')}
    </div>
    `
  }
  theme.vvSet = function (set, store) {
    let stats = getSetStatistics(set, store)
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
                 Contains <a>${stats.numberOfDefinitions}</a> V&V definitions
              </div>
              <div class="summary">
                Cover <a>${stats.coveredNeeds.length}</a> needs
              </div>
              <div class="summary">
                Cover <a>${stats.coveredInterfaces.length}</a> interfaces
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <button data-name="${set.name}" data-id="${set.uuid}" class="action_toogle_vv_set_view ui mini button">View</button>
        <button data-name="${set.name}" data-id="${set.uuid}" class="action_vv_manager_add_report_from_set ui mini button">Create a report</button>
        <button data-name="${set.name}" data-id="${set.uuid}" class="action_vv_manager_remove_set ui mini basic red button">X</button>
      </div>
    </div>
    `
  }
  theme.vvReport= function (report, store) {
    let stats = getReportStatistics(report, store)
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
                Contains <a>${stats.actions.length}</a> V&V actions.
                <a>${stats.completedActions.length}</a> completed
                <a>${stats.failedActions.length}</a> failed
              </div>
            </div>
          </div>
          <div class="event">
            <div class="content">
              <div class="summary">
                <div class="ui multiple small progress" data-value="15" data-percent="0,0">
                    <div style="min-width:0%; width:${stats.completedActions.length/stats.actions.length*100}%;" class="teal bar"></div>
                    <div style="min-width:0%; width:${stats.failedActions.length/stats.actions.length*100}%;" class="red bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="extra content">
        <button data-id="${report.uuid}" class="action_toogle_vv_report_view ui mini button">View</button>
        <button data-name="${report.name}" data-id="${report.uuid}" class="action_vv_manager_remove_report ui mini basic red button">X</button>
      </div>
    </div>
    `
  }

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", function () {
      if (objectIsActive) {
        update()
      }
    })
    connect(".action_vv_manager_add_set", "click", function (e) {
      var name = prompt("Name you set")
      if (name) {
        push(act.add("vvSets",{name:name}))
        render()
      }
    })
    connect(".action_vv_manager_remove_set", "click", async function (e) {
      var bRemove = confirm("Do you want to remove this set and all it's definitions?")
      if (bRemove) {
        var store = await query.currentProject()
        let definitions= store.vvDefinitions.filter(d=>d.sourceSet == e.target.dataset.id)
        let definitionsUuids= definitions.map(d=>d.uuid)
        let relatedMetaLinks = store.metaLinks.filter(l => (l.type=="vvDefinitionNeed"||l.type=="vvDefinitionInterface")  && definitionsUuids.includes(l.source))
        definitions.forEach(d=>{push(act.remove("vvDefinitions",{uuid:d.uuid}))})
        relatedMetaLinks.forEach(d=>{push(act.remove("metaLinks",{uuid:d.uuid}))})
        push(act.remove("vvSets",{uuid:e.target.dataset.id}))
        render()
      }
    })
    connect(".action_vv_manager_remove_report", "click", async function (e) {
      var bRemove = confirm("Do you want to remove this report and all it's definitions?")
      if (bRemove) {
        var store = await query.currentProject()
        let actions= store.vvActions.filter(d=>d.sourceReport == e.target.dataset.id)
        let actionsUuids= actions.map(d=>d.uuid)
        let relatedMetaLinks = store.metaLinks.filter(l => (l.type=="vvReportNeed"||l.type=="vvReportInterface") && actionsUuids.includes(l.source))
        actions.forEach(d=>{push(act.remove("vvActions",{uuid:d.uuid}))})
        relatedMetaLinks.forEach(d=>{push(act.remove("metaLinks",{uuid:d.uuid}))})
        push(act.remove("vvReports",{uuid:e.target.dataset.id}))
        render()
      }
    })
    connect(".action_vv_manager_add_report_from_set", "click", async function (e) {
      var store = await query.currentProject()
      let reportUuid = genuuid()
      push(act.add("vvReports",{uuid:reportUuid, name:"Report based on "+ e.target.dataset.name}))
      //generate the report action based on the set
      let vvDefinitionsInOrigin = deepCopy( store.vvDefinitions.filter(def=> def.sourceSet == e.target.dataset.id) )
      vvDefinitionsInOrigin.forEach(function (def) {
        let newDefUuid = genuuid()
        //copy related metalinks
        let relatedMetalink = deepCopy(store.metaLinks.filter(l=> l.source == def.uuid && l.type == 'vvDefinitionNeed'))
        relatedMetalink.forEach(function (relatedLink) {
          relatedLink.uuid = genuuid()
          relatedLink.source =newDefUuid
          relatedLink.type ="vvReportNeed"
          push(act.add("metaLinks",relatedLink))
        })
        //copy related metalinks of interfaces
        let relatedMetalinkInterface = deepCopy(store.metaLinks.filter(l=> l.source == def.uuid && l.type == 'vvDefinitionInterface'))
        relatedMetalinkInterface.forEach(function (relatedLink) {
          relatedLink.uuid = genuuid()
          relatedLink.source =newDefUuid
          relatedLink.type ="vvReportInterface"
          push(act.add("metaLinks",relatedLink))
        })
        //copy related metalinks of documents
        let relatedMetalinkDocument = deepCopy(store.metaLinks.filter(l=> l.source == def.uuid && l.type == 'documents'))
        relatedMetalinkDocument.forEach(function (relatedLink) {
          relatedLink.uuid = genuuid()
          relatedLink.source =newDefUuid
          relatedLink.type ="documents"
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

  var render = async function () {
    var store = await query.currentProject()
    container.innerHTML = ""
    if (store) {
      // let vvSetsList = [1,2,3,4]
      let vvSetsList = store.vvSets
      container.appendChild(
        toNode(theme.vvSetArea(vvSetsList, store))
      )
      let vvReportsList = store.vvReports
      container.appendChild(
        toNode(theme.vvReportArea(vvReportsList, store))
      )
      // vvSetsList.forEach(set =>{
      //   container.appendChild(toNode(theme.vvSet()))
      // })

    }

  }

  var getGlobalStatistics = function (store) {
    // let requirementsConvered= store.vvDefinitions.map().filter(d=>d.sourceSet == set.uuid)
    // let definitionsUuids= definitions.map(d=>d.uuid)
    let coveredNeedsRawList = store.metaLinks.filter(l => l.type=="vvDefinitionNeed").map(l=>l.target)
    let coveredNeedList = coveredNeedsRawList.filter((item,index)=>coveredNeedsRawList.indexOf(item)===index)
    let percentOfCoveredNeeds = store.requirements[0]? Math.round(coveredNeedList.length/store.requirements.length*100):0
    let coveredInterfaceRawList = store.metaLinks.filter(l => l.type=="vvDefinitionInterface").map(l=>l.target)
    let coveredInterfaceList = coveredInterfaceRawList.filter((item,index)=>coveredInterfaceRawList.indexOf(item)===index)
    let percentOfCoveredInterfaces = store.interfaces[0]? Math.round(coveredInterfaceList.length/store.interfaces.length*100):0
    // let coveredNeedsList = store.metaLinks.filter(l => l.type=="vvDefinitionNeed" && definitionsUuids.includes(l.source))
    return {coveredNeeds: coveredNeedList, percentOfCoveredNeeds:percentOfCoveredNeeds,percentOfCoveredInterfaces:percentOfCoveredInterfaces}
  }
  var getSetStatistics = function (set, store) {
    let definitions= store.vvDefinitions.filter(d=>d.sourceSet == set.uuid)
    let definitionsUuids= definitions.map(d=>d.uuid)
    let coveredNeedsList = store.metaLinks.filter(l => l.type=="vvDefinitionNeed" && definitionsUuids.includes(l.source))
    let coveredInterfacesList = store.metaLinks.filter(l => l.type=="vvDefinitionInterface" && definitionsUuids.includes(l.source))
    return {numberOfDefinitions: definitions.length, coveredNeeds: coveredNeedsList,coveredInterfaces: coveredInterfacesList}
  }
  var getReportStatistics = function (report, store) {
    let actions= store.vvActions.filter(d=>d.sourceReport == report.uuid)
    let completedActions= actions.filter(d=>d.status == 2)
    let failedActions= actions.filter(d=>d.status == 1)
    let actionsUuids= actions.map(d=>d.uuid)
    //let coveredNeedsList = store.metaLinks.filter(l => l.type=="vvDefinitionNeed" && definitionsUuids.includes(l.source))

    return {actions:actions, completedActions: completedActions, failedActions: failedActions}
  }


  var exportToCSV = function () {
    let store = query.currentProject()
    let data = store.physicalSpaces.map(i=>{
      let linkToTextPbs = getRelatedItems(store, i, "currentPbs", {metalinksType:"contains"}).map(s=> s[0]? s[0].name : "").join(",")
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
