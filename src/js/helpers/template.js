var createFactory = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()
    update()

  }
  var connections =function () {

  }

  var render = function () {

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
