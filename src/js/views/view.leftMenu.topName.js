var createLeftMenuTopName = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("storeUpdated", function () {
      if (objectIsActive) {
        update()
      }
    })
    document.addEventListener("pageUpdated", function () {
      if (objectIsActive) {
        update()
      }
    })
  }

  var renderAppName=function () {
    document.querySelector(".project_title_area").innerHTML=`
    <h3 class="ui header">
      <div class="content">
        Ephemeris
      </div>
      <!-- <div style="font-family:'Poiret One',Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;" class="content">
        Ephemeris
      </div> -->
    </h3>
    `
  }

  var render = async function () {
    var store = await query.currentProject() //TODO no need to download everything DBCHANGE
    let currentView = app.state.currentView;
    if (store) {
      //update document title
      //add current cdc area
      document.querySelector(".current-area-title").innerHTML = ""//Temporary blank

      //Display project name or application name

      if (app.state.currentProject) {
        console.log(document.querySelector(".project_title_area"));
        document.querySelector(".project_title_area").innerHTML=`
        <h5 class="ui header">
          <i class="building outline icon"></i>
          <div class="content">
            ${store.reference}, ${store.name}
          </div>
        </h5>
        `
      }else{
        renderAppName()
      }
    }else{
      renderAppName()
    }
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    //clear
    document.querySelector(".left-list").innerHTML=""

    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var leftMenuTopName = createLeftMenuTopName()
leftMenuTopName.init()
leftMenuTopName.setActive()
