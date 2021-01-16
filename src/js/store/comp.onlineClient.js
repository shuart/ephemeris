var createOnlineClient = function () {
  var self ={};
  var objectIsActive = true;


  var type = "epochPHP"
  var currentServer = ""
  var currentMainToken = ""
  var currenToken = ""

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");



  var init = function () {

  }

  var connect = function () {

  }

  var getMyProjects = function () {

  }

  var configure = function (serverAdress,socketPath) {
    currentServer = serverAdress;
    currentMainToken = socketPath;
  }

  var service = function (serviceName) {

    var handler = {};
    handler.find = function () {

      return new Promise(function(resolve, reject) {


        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };

        fetch("http://localhost:8080/collections/get/"+serviceName+"?id="+currentMainToken+"&token="+currenToken, requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));

        }).catch(function(err) {
          // reject(err)
          console.log(err);
          alert("error communicate")
        });
    }
    return handler
  }


  var reAuthenticate = function () {
  }

  var authenticate = function (data) {
    var strategy= data.strategy;
    var email = data.email;
    var password = data.password;
    console.log(data);

    return new Promise(function(resolve, reject) {

      var raw = JSON.stringify({"user":{"firstname":"test","lastname":"test","email":email,"password":password}});

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      var recordAuth = function (data) {
        currenToken = data.jwt
        resolve()
      }

      fetch( currentServer + "/authenticate?id="+currentMainToken, requestOptions)
        .then(response => response.json())
        .then(result => recordAuth(result))
        .catch(error => console.log('error', error));
        // let commits = await response.html()
        // console.log(commits);
        // resolve()

      }).catch(function(err) {
        // reject(err)
        console.log(err);
        alert("error communicate")
      });
  }

  var isAuthenticated = async function () {
    try {
      await client.reAuthenticate()
      return true
    } catch (e) {
      console.log(e);
      return false
    }
  }

  const login = async function (credentials) {
    try {
      if(!credentials) {
        // Try to authenticate using an existing token
        await client.reAuthenticate();
      } else {
        // Otherwise log in with the `local` strategy using the credentials we got
        await client.authenticate({
          strategy: 'local',
          ...credentials
        });
      }

      // If successful, show the chat page
      console.log("logged")
    } catch(error) {
      // If we got an error, show the login page
      console.log("login refused")
      console.log(error);
    }
  };


self.service = service
self.reAuthenticate = reAuthenticate
self.authenticate = authenticate
self.configure = configure
self.init = init

return self
}
