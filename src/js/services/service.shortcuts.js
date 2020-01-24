var createShortcutsService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {
    document.addEventListener("keydown", function(event) {
      if (!( event.key == 'e' && event.ctrlKey) ) return true;

      document.querySelector('#topmenu_project_saver').click()
      //A bit ugly TODO: check for a better way
      event.preventDefault();
      return false;
    })
    document.addEventListener("keydown", function(event) {
      if (!( event.key == 'g' && event.ctrlKey) ) return true;

      //document.querySelector('#topmenu_project_saver').click()
      //A bit ugly TODO: check for a better way

      for (var i = 0; i < 10; i++) {
        if (true) {
          let thisID = genuuid()
          push(addPbs({uuid:thisID, name:"newReq "+i+ Date.now()}))
          push(addPbsLink({source:query.currentProject().currentPbs.items[0].uuid, target:thisID}))
        }
      }


      event.preventDefault();
      return false;
    })
  }

  var render = function (uuid) {
  }


  var update = function () {
    render()
  }

  self.update = update
  self.init = init

  return self
}

var shortcutsService = createShortcutsService()
shortcutsService.init()
