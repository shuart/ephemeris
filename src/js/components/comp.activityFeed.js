var createActivityFeed = function ({
  originalData = "",
  container=undefined,
  onClick = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;

  var theme={
    feed:function (events) {
      return `
      <div class="ui small feed">
        ${events}
      </div>`
    },
    event:function(event) {
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${event.name? ("Item \'"+event.name + "\'" ): ("An item")} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>`
    },
    actionEvent:function(event) {//todo add separate theme for actions
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${event.name? ("Item \'"+event.name + "\'" ): ("An item")} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>`
    },
    noEvent:function() {
      return `
      <div class="event">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div class="summary">
            No events or activity yet
          </div>
        </div>
      </div>`
    }
  }

  var init = function () {
    connections()
    render()
  }
  var connections =function () {
    connect(".action_event_feed_click_content","click",(e)=>{
      console.log(e.target);
      if (onClick) {
        console.log('launchAction');
        onClick(e)
      }
    })
  }

  var render = function () {
    console.log(container);
    if (container) {
      let html = renderFeed(originalData)
      console.log(html);
      console.log(container);
      document.querySelector(container).innerHTML=html
    }else {

    }

  }

  var formatText = function(prop) {
    let out = ""
    if (prop == 'currentPbs') {
      out = 'Products'
    }else if (prop == 'requirements') {
      out = 'Requirements'
    }else if (prop == 'functions') {
      out = 'Functions'
    }else if (prop == 'actions') {
      out = 'Actions'
    }else if (prop == 'addItem') {
      out = 'added'
    }else if (prop == 'removeItem') {
      out = 'removed'
    }else if (prop == 'modifyItem') {
      out = 'modified'
    }
    return out
  }

  var renderFeed = function (originalData) {
    var store = query.currentProject()
    if (store.history.items[0]) {
      let formatedData = store.history.items
      .filter(i=>(i.type !='addLink' && i.type !='removeLink'))
      .map(i=>({
        uuid:i.uuid,
        id:i.id,
        storeGroup:i.storeGroup,
        storeGroupTxt: formatText(i.storeGroup),
        type:i.type,
        typeTxt: formatText(i.type),
        timestamp:i.timestamp,
        name:i.change.name|| i.change.prop,
        change:JSON.stringify(i.change)
      }))
      let eventList = formatedData.map(function (d) {
        return theme.event(d)
      }).reverse().join('')
      let html = theme.feed(eventList)
      return html
    }else {
      return theme.feed(theme.noEvent())
    }


  }

  var update = function () {
    render()
  }

  var setActive =function () {
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

// createInputPopup({originalData:jsonFile})
