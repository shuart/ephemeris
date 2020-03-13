var createKanban = function ({
  container = undefined,
  onSave= undefined,
  customCardHtml=false,
  onClose= undefined,
  onAddCard = undefined,
  onPanelHeaderClick = undefined,
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
        <nav class="navbar board"></nav>
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
        <footer class="kanban_add_card">${onAddCard?"Add a card...":""}</footer>
      </div>
      `
    },
    card:function(data) { //data={title}
      return `
      <li>${data.title}</li>
      `
    },
    panelCustomHtml:function (panelTitle, cardsDataArray, panelUuid) {
      let uuid=panelUuid||""
      return `
      <div class="list kanban_panel_id_${uuid}">
        <header data-id="${uuid}" class="kanban_panel_header">${panelTitle}</header>
        <ul class="kanban_inside_list">
        ${cardsDataArray.map(c=>theme.cardCustomHtml(c)).join('')}
        </ul>
        <footer data-id="${uuid}" class="kanban_add_card">${onAddCard?"Add a card...":"_"}</footer>
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
    sourceEl.style.height = "100%"
    sourceEl.style.width = "100%"
    sourceEl.classList ="kanbanComponent"

    // let kanbanObject =[
    //   {
    //     title:"test",
    //     uuid:"fefeefsfes"
    //     content:[
    //       {title:"123"},
    //       {title:"123"}
    //     ]
    //   },
    //   {
    //     title:"test2",
    //     content:[
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
        currentPanelHtml = theme.panelCustomHtml(currentPanel.title, currentPanel.content, currentPanel.uuid)
      }else {
        currentPanelHtml = theme.panel(currentPanel.title, currentPanel.content)
      }
      panelsArray.push(currentPanelHtml)
    }

    let boardHtml = theme.board(panelsArray)

    sourceEl.innerHTML =boardHtml

    container.appendChild(sourceEl)

    if (onAddCard) {
      document.querySelectorAll(".kanban_add_card").forEach(item => {
        item.addEventListener('click', e => {
          let value = prompt("Add a card")
          if (value) {
            onAddCard({data:e, value:value})
          }
        })
      })
    }
    if (onPanelHeaderClick) {
      document.querySelectorAll(".kanban_panel_header").forEach(item => {
        item.style.cursor="pointer"
        item.addEventListener('click', e => {
          onPanelHeaderClick({data:e})
        })
      })
    }

  }

  var renderPartial = function () {

    // let kanbanObject =[
    //   {
    //     title:"test",
    //     uuid:"fefeefsfes"
    //     content:[
    //       {title:"123"},
    //       {title:"123"}
    //     ]
    //   }
    // ]
    for (var i = 0; i < data.length; i++) {
      let currentData = data[i]

      if (currentData.uuid) {
        let dataPanel = container.querySelector('.kanban_panel_id_'+currentData.uuid)
        if (dataPanel && currentData.content[0]) {
          console.log(currentData);
          let cardData = currentData.content.map(c=>theme.cardCustomHtml(c)).join('')
          dataPanel.querySelector('.kanban_inside_list').innerHTML=cardData
        }
      }
    }
  }

  var update = function () {
    render()
  }
  var updateData = function (newData) {
    data = newData
    renderPartial()
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
  self.updateData = updateData
  self.update = update
  self.init = init

  return self
}
