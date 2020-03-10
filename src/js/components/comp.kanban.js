var createKanban = function ({
  container = undefined,
  onSave= undefined,
  customCardHtml=false,
  onClose= undefined,
  hideEmptyPanels= true,
  data = []
  }={}) {
  var self ={};
  var objectIsActive = false;
  var sourceEl = undefined;


  var theme={
    board:function (panelsArray) {
      return `
      <div class="kanbanUi">
        <nav class="navbar app"></nav>
        <nav class="navbar board">Board bar</nav>
        <div class="lists">
        ${panelsArray.join('')}
        </div>
      </div>
      `
    },
    panel:function (panelTitle, cardsDataArray) {
      return `
      <div class="list">
        <header>${panelTitle}</header>
        <ul>
        ${cardsDataArray.map(c=>theme.card(c)).join('')}
        </ul>
        <footer>Add a card...</footer>
      </div>
      `
    },
    card:function(data) { //data={title}
      return `
      <li>${data.title}</li>
      `
    },
    panelCustomHtml:function (panelTitle, cardsDataArray) {
      return `
      <div class="list">
        <header>${panelTitle}</header>
        <ul>
        ${cardsDataArray.map(c=>theme.cardCustomHtml(c)).join('')}
        </ul>
        <footer>Add a card...</footer>
      </div>
      `
    },
    cardCustomHtml:function(data) { //data={title}
      return `
      <li>${data.html}</li>
      `
    },
    cardLegacy:function(title) {
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${(event.name && event.name!= "Missing item")? ("Item \'"+event.name + "\'" ): ("An item")} ${event.prop? (", property \'"+event.prop + "\', " ): ""} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>
      `
    }
  }


  var init = function () {
    connections()
    render()
  }
  var connections =function () {

  }

  var render = function () {
    sourceEl = document.createElement('div');
    sourceEl.style.height = "90%"
    sourceEl.style.width = "100%"
    sourceEl.classList ="kanbanComponent"

    // let kanbanObject =[
    //   {
    //     title:"test",
    //     content:[
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"}
    //     ]
    //   },
    //   {
    //     title:"test2",
    //     content:[
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"},
    //       {title:"123"}
    //     ]
    //   }
    // ]

    let kanbanObject = deepCopy(data)

    if (hideEmptyPanels) {
      kanbanObject = kanbanObject.filter(o=>o.content[0])
    }

    let panelsArray = []

    for (var i = 0; i < kanbanObject.length; i++) {
      let currentPanel = kanbanObject[i]
      let currentPanelHtml=""
      if (customCardHtml) {
        currentPanelHtml = theme.panelCustomHtml(currentPanel.title, currentPanel.content)
      }else {
        currentPanelHtml = theme.panel(currentPanel.title, currentPanel.content)
      }
      panelsArray.push(currentPanelHtml)
    }

    let boardHtml = theme.board(panelsArray)

    sourceEl.innerHTML =boardHtml

    container.appendChild(sourceEl)
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
