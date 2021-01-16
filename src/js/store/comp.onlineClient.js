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
    handler.find = function (data) {

      return new Promise(function(resolve, reject) {

        var searchFields=""
        if (data && data.query) {
          let keys = Object.keys(data.query)
          keys.forEach((key, i) => {
            if (key[0] != "$") {
              searchFields+="&fields["+key+"]="+data.query[key]
            }
          });

        }

        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };

        fetch("http://localhost:8080/collections/get/"+serviceName+"?id="+currentMainToken+searchFields+"&token="+currenToken, requestOptions)
          .then(response => response.text())
          .then(result => resolve(JSON.parse(result)))
          .catch(error => console.log('error', error));

        }).catch(function(err) {
          // reject(err)
          console.log(err);
          alert("error communicate")
        });
    }
    handler.create = function (payload) {

      return new Promise(function(resolve, reject) {

        //clean because remote DB use different  _ID
        if (payload._id) {
          delete payload._id
        }

        var raw = JSON.stringify({"payload":payload});

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:8080/collections/post/"+serviceName+"?id="+currentMainToken+"&token="+currenToken, requestOptions)
          .then(response => response.text())
          .then(result => resolve(result))
          .catch(error => console.log('error', error));

        }).catch(function(err) {
          // reject(err)
          console.log(err);
          alert("error communicate")
        });
    }
    handler.update = function (onlineId,actionItem, payload) {
      console.log(onlineId,actionItem);

      return new Promise(function(resolve, reject) {

        //clean because remote DB use different  _ID
        // if (payload._id) {
        //   delete payload._id
        // }
        }).catch(function(err) {
          // reject(err)
          console.log(err);
          alert("error communicate")
        });
    }
    return handler
  }


  var reAuthenticate = function () {
    return new Promise(function(resolve, reject) {
      console.log("check authentification");
      if (currenToken!="") {
        // TODO add better check
        resolve(true)
      }else {
        throw 'Not logged in';
      }
    }).catch(function(err) {
      throw 'Not logged in';
    });

  }

  var logout = function () {
    return new Promise(function(resolve, reject) {
      console.log("check authentification");
      if (currenToken!="") {
        currenToken=""

        resolve(true)
      }else {
        throw 'Not logged in';
      }
    }).catch(function(err) {
      throw 'Not logged in';
    });

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
        console.log(currenToken);
        resolve(true)
      }

      fetch( currentServer + "/authenticate?id="+currentMainToken, requestOptions)
        .then(response => response.json())
        .then(result => recordAuth(result))
        .catch(error => console.log('error', error));
        // let commits = await response.html()
        // console.log(commits);

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
      resolve(true)
    } catch(error) {
      // If we got an error, show the login page
      console.log("login refused")
      console.log(error);
    }
  };


self.logout = logout
self.service = service
self.reAuthenticate = reAuthenticate
self.authenticate = authenticate
self.configure = configure
self.init = init

return self
}
