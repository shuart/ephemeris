var createUrlHandlerService = function () {
  var self ={};
  var objectIsActive = false;
  var currentProjectUuid = undefined;

  var init = function () {
    var hash = new URL(document.URL).hash;

    console.log(hash);
    // alert(hash)
  }

  var connections = function(){
    window.addEventListener('hashchange', function() {
      // new hash value
      // alert(new URL(document.URL).hash);
    });
  }

  var setPageFromUrl = async function(){
    var hash = new URL(document.URL).hash;
    if (hash) {
      var path = hash.split("/")
      if (path[0] && !path[1]) { //go to project overview
        setProjectUuid(path[0].substring(1))
        await setCurrentProject(path[0].substring(1))
        pageManager.setActivePage("overview")
      }else if (path[0] && path[1]) {
        setProjectUuid(path[0].substring(1))
        await setCurrentProject(path[0].substring(1))
        pageManager.setActivePage(path[1])
      }
    }else{
      pageManager.setActivePage("projectSelection")

    }
    
  }

  var setPageUrl = function(module){
    if (currentProjectUuid) {
      var url_ob = new URL(document.URL);
      url_ob.hash = '#'+currentProjectUuid+"/"+module;
      // new url
      var new_url = url_ob.href;
      // change the current url
      document.location.href = new_url;
    }

  }

  var setProjectUuid = function(uuid){
    currentProjectUuid = uuid
  }


  self.init = init
  self.setPageFromUrl = setPageFromUrl
  self.setProjectUuid = setProjectUuid
  self.setPageUrl = setPageUrl

  return self
}

var urlHandlerService = createUrlHandlerService()

