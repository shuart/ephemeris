function createStartUp() {
  var self = {}
  var sourceEl;

  function init() {

    render()
    connect()
  }

  function createPBS(projectIn, name) {
    var projectIn = projectIn || "REF-001, "
    var projectName = name || "New Project"
    var store = app.store.projects[0]//TODO remove
    store.name = projectName
    app.store.projects[0].name = projectName
    store.reference = projectIn
    store.currentPbs.items.push({name: projectIn+projectName, uuid: "ita2215151-a50f-4dd3-904e-146118d5d444"})
    store.currentPbs.items.push({name: "Sub Category A", uuid:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
    store.currentPbs.items.push({name: "Sub Category B", uuid:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
    store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it23bb697b-9418-4671-bf4b-5410af03dfc3"})
    store.currentPbs.links.push({source: "ita2215151-a50f-4dd3-904e-146118d5d444", target:"it9ba7cc64-970a-4846-b9af-560d8125623e"})
  }

  function connect() {
    let file, url, reader = new FileReader;

    sourceEl.onclick = async function(event) {
        if (event.target.classList.contains("action_startup_submit_item")) {
          console.log(event.target);
          console.log(document.querySelector('.input-su-name').value);
          createPBS(document.querySelector('.input-su-in').value, document.querySelector('.input-su-name').value)
          //renderCDC(store.db, "")
          pageManager.setActivePage("projectSelection")
          renderCDC() //TODO change update mecanism
          sourceEl.remove()
        }
        if (event.target.classList.contains("action_startup_reload_item")) {//TODO remove when session is removed
          console.log(event.target);
          localforage.getItem('sessionProjects').then(function(value) {
              app.store.projects = value;
              pageManager.setActivePage("projectSelection")
              renderCDC() //TODO change update mecanism
              sourceEl.remove()
          }).catch(function(err) {
              // This code runs if there were any errors
              console.log(err);
          });
        }
        if (event.target.classList.contains("action_startup_load_user")) {
          dbConnector.getUser(event.target.dataset.id).then(async function (user) {
            // app.store.projects = user.projects; //TODO use actions //DBCHANGE
            app.store.userData = user.userData; //TODO use actions
            app.store.relatedProjects = user.relatedProjects; //TODO use actions
            app.state.currentUser = user.uuid; //TODO use actions
            //setup profile if Needed
            if (!app.store.userData.info.userLastName || !app.store.userData.info.userFirstName) {

              var popup= await createPromptPopup({
                title:"Complete your profile",
                iconHeader:"user outline",
                fields:[
                  { type:"input",id:"firstName" ,label:"First Name", placeholder:"Set your first name" },
                  { type:"input",id:"lastName" ,label:"Last Name", placeholder:"Set your last name" },
                  { type:"input",id:"userId" ,label:"This is your user ID. Change it if you have already one", placeholder:app.store.userData.info.userUuid, optional:true, secondary:true }
                ]
              })

              if (!popup) {
                return undefined
              }

              app.store.userData.info.userFirstName = popup.result.firstName
              await dbConnector.setUserInfo(event.target.dataset.id, "userFirstName", app.store.userData.info.userFirstName)
              app.store.userData.info.userLastName = popup.result.lastName
              await dbConnector.setUserInfo(event.target.dataset.id, "userLastName", app.store.userData.info.userLastName)

            }
            if (!app.store.userData.info.userUuid) {
              app.store.userData.info.userUuid = genuuid()
            }
            updateFileForRetroCompatibility()
            pageManager.setActivePage("projectSelection")
            sourceEl.remove()
          }).catch(function(err) {
              console.log(err);
          });
        }
        if (event.target.classList.contains("action_startup_load_reveal")) {
          function readJSON(e) {
            reader.readAsText(document.querySelector(".statup_input").files[0]);
          }
          //document.querySelector(".statup_input_zone").style.visibility = "visible"
          document.querySelector(".statup_input").addEventListener("change", readJSON);
          reader.addEventListener("load", function() {
            console.log(reader.result);
            // var textContent = JSON.stringify(reader.result, null, 2);
            // var jsonContent = JSON.parse(reader.result);
            // console.log(jsonContent);
            // app.store.projects = jsonContent
            loadSavedData(reader.result, function() {
              renderUserSessionView()
            })
            // pageManager.setActivePage("unified")
            // renderCDC() //TODO change update mecanism
            // sourceEl.remove()
          });

          document.querySelector(".statup_input").click();
        }

        if (event.target.classList.contains("action_startup_add_user")) {
          var popup= await createPromptPopup({
            title:"Add a new session",
            imageHeader:"./img/tele.png",
            fields:{ type:"input",id:"sessionName" ,label:"Session name", placeholder:"Set a name for this new session" }
          })
          // var userName = prompt("Add a user")
          userName = popup.result
          if (userName && userName != "") {
            dbConnector.setUser({name:userName,projects:[]}).then(function () {
              renderUserSessionView()
            })
          }
        }//end event
        if (event.target.classList.contains("action_startup_remove_user")) {
            if (confirm("This will remove the user and all it's projects")) {
              dbConnector.removeUser(event.target.dataset.id).then(function () {
                renderUserSessionView()
              })
            }
        }//end event
    }
  }

  function render() {
    app.state.currentUser=undefined //TODO move to actions
    renderHTML()
    renderUserSessionView()
  }
  function update() {
    app.state.currentUser=undefined //TODO move to actions
    sourceEl.remove()
    init()
  }
  function showLoader() {
    app.state.currentUser=undefined //TODO move to actions
    sourceEl.remove()
    renderHTML()
  }

  function renderUserSessionView() {
    var targetDOM = queryDOM('.startup_userlist')//get hook with html generated by startup
    var html =""
    dbConnector.getUsers().then(function (users) {
      console.log(users);
      html+= `
      <div class="ui center aligned container">
      <div class="ui horizontal divider">Log in</div>`
      if (users[0]) {
        html +=`<div class="ui list">`
        users.forEach(function (user) {
          html+= `
            <div class="item">
            <div class="ui labeled button" tabindex="0">
              <div data-id="${user.uuid}" style="min-width: 140px;" class="ui teal button action_startup_load_user">
                <i class="user icon"></i> ${user.name}
              </div>
              <a data-id="${user.uuid}" class="ui basic label action_startup_remove_user">
                X
              </a>
            </div>
            </div>
            `
        })
        html+= `
        </div>
        <button class="ui center aligned basic button action_startup_add_user">Create a new user</button>
        </div>`
      }else {
        html+= `
          <button class="ui center aligned big teal button action_startup_add_user">Create a new user</button>
        </div>`
      }
      targetDOM.innerHTML = html //inject new HTML
    }).catch(function(err) {
    // This code runs if there were any errors
        console.log(err);
    });
  }

  function renderHTML() {

    sourceEl = document.createElement('div');
    sourceEl.style.display= "flex";
    sourceEl.style.justifyContent= "center";
    document.querySelector('body').appendChild(sourceEl);
    var dimmer = document.createElement('div');
    dimmer.classList="dimmer"
    // dimmer.style.background = "linear-gradient(#b0d6be, #535f5e)"
    // dimmer.style.background = "linear-gradient(#bad4c4, #535f5e)"

    // dimmer.style.background = "linear-gradient(#99b6c1, #4a524b)"//grad only
    dimmer.style.backgroundColor =  "white"
    // dimmer.style.backgroundImage =  "url('././img/bubble.jpg')"
    dimmer.style.backgroundRepeat= "no-repeat";
    dimmer.style.backgroundPosition =  "center bottom"
    // dimmer.style.backgroundPosition =  "25% 0%"
    // dimmer.style.background = "linear-gradient(to bottom, #bbd2c5, #536976)"
    dimmer.style.opacity = 1;
    var mainEl = document.createElement('div');

    // mainEl.classList ="ui raised very padded text container segment"
    mainEl.style.maxWidth = "600px"
    mainEl.style.height = "60%"
    mainEl.style.overflow = "auto"
    mainEl.style.position = "fixed"
    mainEl.style.top = "30px"
    // mainEl.style.right = "14%"
    // mainEl.style.width = "50%"
    mainEl.style.zIndex = "99999"
    // mainEl.style.backgroundColor = "white"
    // mainEl.style.top= "50%";
    // mainEl.style.transform= "translate(-50%, -50%);"

    bgEl = document.createElement('div');

    bgEl.style.backgroundColor =  "white"
    bgEl.style.position= "fixed"
    bgEl.style.bottom= "0px"
    bgEl.style.width= "50%"
    bgEl.style.height= "35%"
    bgEl.style.position= "fixed"
    bgEl.style.backgroundImage= "url('././img/bubble.jpg')"
    bgEl.style.backgroundSize=     "contain";                      /* <------ */
    bgEl.style.backgroundRepeat= "no-repeat";
    bgEl.style.backgroundPosition= "center center";
    bgEl.style.zIndex = "999999"

    sourceEl.appendChild(dimmer)
    sourceEl.appendChild(mainEl)
    sourceEl.appendChild(bgEl)
    mainEl.innerHTML = `
    <div class="ui container">
      <h2 class='ui center aligned icon header'>
        <img class="ui image" src="./img/app.png">
        <!-- <i class="circular compass outline icon"></i> -->
        <div class="ui content app-title">
        Ephemeris
        </div>
      </h2>
      <div class="startup_userlist">
        <div class="ui horizontal divider">Log in</div>
        <div class="ui vertical loading segment">
          <p></p>
          <p></p>
        </div>
      </div>

      <div class="ui horizontal divider">-</div>
        <!-- <div class="ui center aligned container">
          <button class="ui button action_startup_load_reveal" type="submit">load a database file</button>
          <div style="visibility:hidden" class="statup_input_zone">
            <input class="ui input statup_input" type="file" accept=".json" />
          </div>
        </div> -->
      </div>
    </div>
    `
    if (document.querySelector('.app-loader-cache')) {
      document.querySelector('.app-loader-cache').remove();
    }
  }

  function updateFileForRetroCompatibility() {
    function alertAboutUpdate() {
      alert("This file was created with an earlier version and was updated")
    }
    //userPreferences
    if (!app.store.userData.preferences) {
      app.store.userData.preferences = {
        projectDisplayOrder:[],
        hiddenProject:[]
      }
      alertAboutUpdate()
    }
  }



  self.showLoader = showLoader
  self.update = update
  self.render = render
  self.init = init
  return self
}

var startupScreen = createStartUp()
startupScreen.init()
