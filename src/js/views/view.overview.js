var createOverview = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)

  var init = function () {
    connections()
    update()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    if (store) {
      updateFileForRetroCompatibility() //check file for retrocompatbiity
      //create a PBS if first opening of project
      if (!store.currentPbs.items[0]) {
        createPBS()
      }

      var headerHtml =`
      <h2 class="ui center aligned icon header">
        <i class="circular building outline icon"></i>
        ${store.reference}, ${store.name}
      </h2>
      `
      var html = `
      <div class="ui very padded container">
        <div class="ui placeholder segment">
          <div class="ui four statistics">
            <div class="statistic">
              <div class="value">
                <i class="comment icon"></i>
                ${store.requirements.items.length}
              </div>
              <div class="label">
                Requirements
              </div>
            </div>
            <div class="statistic">
              <div class="value">
                <i class="users icon"></i>
                ${store.stakeholders.items.length}
              </div>
              <div class="label">
                Stakeholders
              </div>
            </div>
            <div class="statistic">
              <div class="value">
                <i class="sitemap icon"></i> ${(store.currentPbs.items.length - 1)}
              </div>
              <div class="label">
                Sub-Systems
              </div>
            </div>
            <div class="statistic">
              <div class="value">
                <i class="cogs icon"></i> ${(store.functions.items.length)}
              </div>
              <div class="label">
                functions
              </div>
            </div>
          </div>
        </div>
      </div>
      `
      // <div class="statistic">
      //   <div class="value">
      //     <img src="/images/avatar/small/joe.jpg" class="ui circular inline image">
      //     ${(store.currentCDC.items.length)}
      //   </div>
      //   <div class="label">
      //     Specs
      //   </div>
      // </div> TODO readd spec when ready
      container.innerHTML = headerHtml+html;
    }
  }

  function createPBS() {
    var store = query.currentProject()
    store.currentPbs.items.push({name: store.reference+store.name, uuid: "ita2215151-a50f-4dd3-904e-146118d5d444"})
    store.currentPbs.items.push({name: "Sous catégorie A", uuid:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
    store.currentPbs.items.push({name: "Sous catégorie B", uuid:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
    store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
    store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
  }

  function updateFileForRetroCompatibility() {
    function alertAboutUpdate() {
      alert("This project was created with an earlier version and was updated")
    }
    //Tags from 1.7.2
    var store = query.currentProject()
    if (!store.tags) {
      store.tags = {
        items:[{uuid: uuid(), name: "My Tag", color: "#ffffff"}]
      }
      alertAboutUpdate()
    }
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

var overview = createOverview(".center-container");
overview.init();
overview.setActive();
