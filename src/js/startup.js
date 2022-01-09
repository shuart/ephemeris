function createStartUp() {
  var self = {}
  var sourceEl;
  var view = createAdler()
  var localState={}
  let userCards = undefined;
  localState.userData = [{"name":"tesddddt", uuid:"1esefsfes"},{"name":"teaaast", uuid:"2esefsfes"}, {"name":"3tggest", uuid:"esefsfes"},{"name":"teebbbest", uuid:"4esefsfes"}]

  function init() {

    // render()
    // connect()
    setupView()
    getUsersData()
    handleUserReconnection()
  }

  function setupView(){
    view.addCSS(`
        .welcomeArea{
        z-index: 999999999;
        width:100%;
        height:100%;
        background-color:white;
        position: fixed;
        top: 0px;
        }
        .bgBubble{
          background-color :  white;
          position: fixed;
          bottom: 0px;
          width: 100%;
          height: 35%;
          background-image: url('././img/bubble.jpg');
          background-size:  contain; 
          background-repeat: no-repeat;
          background-position: center center;
          
        }
        .eph-title{
          font-family: 'Poiret One',Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
        }
    `)
    view.createLens("welcomeContainer",(d)=>`
        <div class="welcomeArea">
          <div class="bgBubble"></div>
            <div class="container has-text-centered">
              <figure class="image is-96x96 is-inline-block">
                <img src="./img/app.png">
              </figure>
              <p class="title eph-title">${d.title}</p>
              <div class="box is-inline-block">

                <section>
                    <p class="subtitle">
                        User list
                    </p>
                    <div class="load_area">
                    
                    </div>
                    <div class="block"></div>
                    <button class="button is-primary is-light action_startup_add_user">Create a new user</button>
                    <div class="block"></div>
                    <div class="columns is-multiline is-desktop ">
                    
                    </div>
                </section>
              </div>
            </div>
        </div>`
    )
    view.createLens("card",(p)=>`

        <div class="buttons has-addons is-fullwidth">
          <button style="min-width: 200px;" class="button is-primary action_load">${p.name}</button>
          <button class="button is-info is-light action_startup_remove_user">X</button>
        </div>
      
    `)

    let supane = view.addLens("welcomeContainer",{
      data:{title:"Ephemeris"},
      on:[
          [".action_startup_add_user", "click", async ()=>{
            var popup= await createPromptPopup({
              title:"Add a new session",
              imageHeader:"./img/tele.png",
              fields:{ type:"input",id:"sessionName" ,label:"Session name", placeholder:"Set a name for this new session" }
            })
            // var userName = prompt("Add a user")
            userName = popup.result
            if (userName && userName != "") {
              dbConnector.setUser({name:userName,projects:[]}).then(function () {
                getUsersData()
              })
            }
            
          }],
      ],
      
     })

     userCards = supane.addLens("card",{
        // data:{name:key}, 
        data:{nam:"kedzqdzqdzqdqdzqdqzy"}, 
        for:function(){
          return localState.userData
        },
        on:[
            [".action_load", "click", (e, p)=>{
              loadUser(p.uuid)
          } ],
            [".action_startup_remove_user", "click", (e,p)=>{
                if (confirm("This will remove "+ p.name +" and all it's projects")) {
                  dbConnector.removeUser(p.uuid).then(function () {
                    getUsersData()
                  })
                }
            } ]
          ],
        }, ".load_area")
     view.render()
     if (document.querySelector('.app-loader-cache')) {
      document.querySelector('.app-loader-cache').remove();
    }

  }

  function loadUser(uuid){
    setLastUser (uuid)
    dbConnector.getUser(uuid).then(async function (user) {
      // app.store.projects = user.projects; //TODO use actions //DBCHANGE
      app.store.userData = user.userData; //TODO use actions
      app.store.relatedProjects = user.relatedProjects; //TODO use actions
      app.state.currentUser = user.uuid; //TODO use actions
      //setup profile if Needed
      if (!app.store.userData.info.userLastName || !app.store.userData.info.userFirstName) {

        var popup= await createPromptPopup({
          title:"Complete your profile",
          iconHeader:"far fa-user",
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
        await dbConnector.setUserInfo(uuid, "userFirstName", app.store.userData.info.userFirstName)
        app.store.userData.info.userLastName = popup.result.lastName
        await dbConnector.setUserInfo(uuid, "userLastName", app.store.userData.info.userLastName)

      }
      if (!app.store.userData.info.userUuid) {
        app.store.userData.info.userUuid = genuuid()
      }
      updateFileForRetroCompatibility()
      urlHandlerService.setPageFromUrl()

      // pageManager.setActivePage("projectSelection")
      // pageManager.setActivePage("projectSelection", {param:{context:"firstView"}})
      view.remove()
    }).catch(function(err) {
        console.log(err);
    });
  }

  function setLastUser (uuid){
    localStorage.setItem('eph_lastUser', JSON.stringify({uuid:uuid}));
  }
  function clearLastUser (){
    localStorage.setItem('eph_lastUser', null);
  }

  function handleUserReconnection (){
    const lastUser = localStorage.getItem('eph_lastUser');
    console.log(lastUser)
    if (lastUser) {
      const lastUserUuid = JSON.parse(lastUser)
      loadUser(lastUserUuid.uuid)
    }else{
      return false
    }

  }

  function render() {
    app.state.currentUser=undefined //TODO move to actions
    renderHTML()
    renderUserSessionView()
  }
  function update() {
    app.state.currentUser=undefined //TODO move to actions
    // sourceEl.remove()
    init()
  }
  function logOut() {
    app.state.currentUser=undefined //TODO move to actions
    clearLastUser()
    // sourceEl.remove()
    init()
  }
  function showLoader() {
    app.state.currentUser=undefined //TODO move to actions
    sourceEl.remove()
    renderHTML()
  }

  function getUsersData(){
    let userArray =[]
    dbConnector.getUsers().then(function (users) {
      console.log(users);
      users.forEach(function (user) {
        userArray.push({
          uuid:user.uuid,
          name:user.name,
        })
      })
      localState.userData = userArray
      userCards.update()
    }).catch(function(err) {
    // This code runs if there were any errors
        console.log(err);
    });
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
  self.logOut = logOut
  self.init = init
  return self
}

var startupScreen = createStartUp()
// startupScreen.init()
