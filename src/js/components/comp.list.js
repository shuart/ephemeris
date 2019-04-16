function showListMenu({
  displayProp=undefined,
  idProp = undefined,
  parentSelectMenu = undefined,
  targetDomContainer = undefined,
  display = undefined,
  singleElement =undefined,
  rulesToDisplaySingleElement = undefined,
  fullScreen= false,
  sourceData = undefined,
  sourceLinks = undefined,
  metaLinks = undefined,
  multipleSelection = undefined,
  searchable = true,
  onClick = (e)=>{console.log("clik on select");},
  onAdd = undefined,
  onRemove= undefined,
  onMove= undefined,
  onEditItem = (e)=>{console.log("edit select")},
  onEditItemTime = (e)=>{console.log("edit select")},
  onEditTextItem = (e)=>{console.log("edit text")},
  onEditChoiceItem = undefined,
  onChangeSelect = undefined,
  onCloseMenu = (e)=>{console.log("list closed")},
  onClear = undefined,
  clearButtonValue = "Clear",
  addButtonValue = "Add",
  closeButtonValue = "Close",
  cancelButtonValue = "Cancel",
  extraActions = undefined,
  extraButtons = []
  }={}) {

    //utility to parse html
    function toNode(html) {
      var tpl = document.createElement('template');
      tpl.innerHTML = html;
      return tpl.content;
    }

  //LOCAL THEME
  var theme = {
    windowedContainerClass : "ui raised padded container segment",
    embededContainerClass: "ui container",
    addAreaContainerClass: "ui segment",
    menuButtonsContainerClass: "item",
    menuExtraButtonClass: "ui button",
    fullscreenContainerClass : "ui container",
    multipleElementsListClass: "ui middle aligned divided list",
    singleElementsListClass: "ui middle aligned divided list",
    menuSearchAreaHtml : function (themeSearchInputClass) {
      return `<div class="ui transparent icon input">
            <input class="${themeSearchInputClass}" type="text" placeholder="Search list...">
            <i class="search icon"></i>
        </div>`
    },
    nestedListClass: 'row',
    topMenu:() => {
      var html = /*html*/`
      <div class="ui mini menu target_menu_left_buttons">
        <div class="right menu target_menu_right_buttons">
        </div>
      </div>
      `
      return html
    },
    button:(name, color, action, data ) => {
      return /*html*/`
      <div class="item">
          <div ${data? data:''} class="ui ${color? color:''} button ${action? action:''}">${name}</div>
      </div>
      `
    },
    listWrapper:(rows, firstCol) => {
      return /*html*/`
      <div class='flexTable'>
        <div class="spreaded_titles shadowed">${firstCol}</div>
        <div class="table">${rows}</div>
      </div>
      `
    },
    listRow:(items) => {
      return `
      <div class='row'>
      ${items}
      </div>
      `
    },
    topRow:(items) => {
      return `
      <div class='top row'>
      ${items}
      </div>
      `
    },
    listItem:(content, colType) => {
      return `
      <div class='${colType||"column"}'>
        <div class='orange-column'>
          ${content}
        </div>
      </div>
      `
    },
  }

  //LOCAL VARS
  var data = undefined
  var ismoving = false
  var mainFragment = document.createDocumentFragment()
  var sourceEl = undefined
  var mainEl = undefined
  var editItemMode = undefined
  var listContainer =undefined;

  var self={}

  //LOCAL FUNC
  function init() {
    render()
  }

  function connect(){
    sourceEl.onclick = function(event) {
        if (event.target.classList.contains("action_list_clear")) {
            onClear({selectDiv:sourceEl, target:undefined})
        }
        if (event.target.classList.contains("action_list_add")) {
          onAdd({selectDiv:sourceEl, select:self, target:undefined})
          sourceEl.remove()
          render()
        }
        if (event.target.classList.contains("action_menu_select_option")) {
          onClick({selectDiv:sourceEl, select:self, target:event.target})
          console.log(event.target);
        }
        if (event.target.classList.contains("action_list_remove_item") && onRemove) {
          onRemove({select:self,selectDiv:sourceEl, target:event.target})
          console.log(event.target);
          sourceEl.remove()
          render()
          //sourceEl.remove()
        }
        if (event.target.classList.contains("action_list_remove_item_from_selection")) {
          multipleSelection = multipleSelection.filter(i => i != event.target.dataset.id)
          onChangeSelect({select:self,selectDiv:sourceEl, target:event.target})
          sourceEl.remove()
          render()
          //sourceEl.remove()
        }
        if (event.target.classList.contains("action_list_add_item_to_selection")) {
          console.log('fefsf');
          multipleSelection.push( event.target.dataset.id)
          onChangeSelect({select:self,selectDiv:sourceEl, target:event.target})
          refreshList()
          //sourceEl.remove()
        }
        if (event.target.classList.contains("action_list_move_item")) {
          if (ismoving) {
            ismoving = false
          }else {
            ismoving = event.target
          }
          refreshList()

        }
        if (event.target.classList.contains("action_list_end_move_item") ) {
          if (ismoving) {
            console.log(event.target.dataset.id,ismoving.dataset.id, event.target.dataset.parentid);
            onMove({select:self,selectDiv:sourceEl, originTarget:ismoving, target:event.target, targetParentId:event.target.dataset.parentid})
            ismoving = false
          }
          refreshList()

        }
        if (event.target.classList.contains("action_list_edit_item")) {
          onEditItem({select:self, selectDiv:sourceEl, target:event.target})
          refreshList()
        }
        if (event.target.classList.contains("action_list_edit_choice_item")) {
          onEditChoiceItem({select:self, selectDiv:sourceEl, target:event.target})
          console.log(event.target);
          refreshList()
        }
        if (event.target.classList.contains("action_list_edit_time_item")) {
          console.log(event.target.parentElement.querySelector("input"));
          event.target.parentElement.querySelector("input").style.display ="block"
          //event.target.style.opacity ="1"
          event.target.parentElement.querySelector("input").previousSibling.remove()
          event.target.style.display ="none"
          event.target.parentElement.querySelector("input").onchange = function (ev) {
            onEditItemTime({select:self, selectDiv:sourceEl, target:ev.target})
            sourceEl.remove()
            render()
          }
          //sourceEl.remove()
        }
        if (event.target.classList.contains("action_list_edit_text_item")) {
          event.target.parentElement.querySelector("textarea").style.display ="block"
          event.target.parentElement.querySelector("textarea").style.boxSizing= "border-box"
          event.target.parentElement.querySelector("textarea").style.width= "100%"
          event.target.parentElement.querySelector("textarea").previousSibling.remove()
          event.target.style.display ="none"
          event.target.parentElement.querySelector("textarea").onchange = function (ev) {
            onEditTextItem({select:self, selectDiv:sourceEl, target:ev.target})
            sourceEl.remove()
            render()
          }
          //sourceEl.remove()
        }
        if (event.target.classList.contains("action_list_close")) {
          onCloseMenu({select:self, selectDiv:sourceEl, target:event.target})
          sourceEl.remove()
        }
    }

    //handle case if extra button are specified
    if (extraButtons) {
      for (action of extraButtons) {
        sourceEl.addEventListener("click",function () {
          if (event.target.classList.contains("action_extra_"+action.class)) {
            action.action(event.target)
            refreshList()
          }
        }, false)
      }
    }
  }

  function buildHtmlContainer(){
    sourceEl = document.createElement('div');
    sourceEl.style.height = "100%"

    mainFragment.appendChild(sourceEl);

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer"
    mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "99999"
    mainEl.style.backgroundColor = "white"

    if (!fullScreen) { //windowedCase
      mainEl.classList = theme.windowedContainerClass;
      mainEl.style.width = "50%"
      mainEl.style.maxHeight = "90%"
      mainEl.style.left= "25%";
    }else if(targetDomContainer){ //embeded case
      mainEl.classList =theme.embededContainerClass;
      mainEl.style.position = "relative"
      mainEl.style.zIndex = "1"
        mainEl.style.padding = "5em"
        mainEl.style.width = "100%"
        mainEl.style.height = "100%"
        mainEl.style.left= "0px";
    }else {//fullScreen case
      mainEl.classList = theme.fullscreenContainerClass;
        mainEl.style.padding = "5em"
        mainEl.style.width = "100%"
        mainEl.style.height = "100%"
        mainEl.style.left= "0px";
    }

    if (!targetDomContainer) {//TODO check if fullscreen check needed
      sourceEl.appendChild(dimmer)
    }
    sourceEl.appendChild(mainEl)

    return sourceEl
  }

  function createAddTemplate() {//TODO refactor, this is not working
    var addArea = document.createElement('div');
    addArea.classList = theme.addAreaContainerClass;
    mainEl.appendChild(addArea)
    var html = buildSingle(sourceData, sourceLinks, [{uuid:genuuid()}])
    addArea.innerHTML ="<div class='"+ theme.multipleElementsListClass+ "'>"+ html +"</div>"
  }

  function createMenu() {
    mainEl.appendChild(toNode(theme.topMenu()));

    // clear button
    if (onClear) {
     let target = mainEl.querySelector(".target_menu_left_buttons")
     target.insertBefore(
        toNode(theme.button(clearButtonValue, 'black', 'action_list_clear')),
        target.firstChild
      )
    }
    //add button
    if (onAdd) {
      let target = mainEl.querySelector(".target_menu_left_buttons")
      target.insertBefore(
         toNode(theme.button(addButtonValue, 'teal', 'action_list_add')),
         target.firstChild
       )
    }
    //display extra action buttons
    if (extraActions) {
      for (action of extraActions) {
        var actionClass="action_extra_"+action.name;
        var buttonClass = action.customButtonClass || theme.menuExtraButtonClass

        let target = mainEl.querySelector(".target_menu_left_buttons")
        target.insertBefore(
           toNode(theme.button(action.name, 'grey', "action_extra_"+actionClass)),
           target.firstChild
         )
         //add events
        let actionTarget = mainEl.querySelector(".action_extra_"+actionClass)
        function addEventL(action) {
          var callBack = function (e) {
            e.stopPropagation()
            //console.log(action);
            console.log(action);
            action.action({select:self})
            sourceEl.remove()
            render()
          }
          return callBack
        }
        actionTarget.addEventListener('click', addEventL(action),false);
      }
    }

    //search menu
    if (searchable) {
      let target = mainEl.querySelector(".target_menu_right_buttons")

      var addSearch = document.createElement('div');
      addSearch.classList= theme.menuButtonsContainerClass
      addSearch.innerHTML =theme.menuSearchAreaHtml("list-search-input")
      target.appendChild(addSearch)

      addSearch.addEventListener('keyup', function(e){
        //e.stopPropagation()
        var value = sourceEl.querySelector(".list-search-input").value
        var filteredData = sourceData.filter((item) => {
          for (rule of display) {
            //TODO allow array search
            if (fuzzysearch (value, item[rule.prop]) && item[rule.prop] && !Array.isArray(item[rule.prop])) { return true }
          }
          return false
        })
        var filteredIds = filteredData.map(x => x.uuid);
        var searchedItems = sourceEl.querySelectorAll(".searchable")
        for (item of searchedItems) {
          if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "flex"}else{item.style.display = "none"}
        }
      });
    }
    //close button
    if (!targetDomContainer) {
      let target = mainEl.querySelector(".target_menu_right_buttons")
      target.appendChild(
         toNode(theme.button(closeButtonValue, 'red', 'action_list_close'))
       )

    }
    if (editItemMode) {//in case of editing a single item
      let target = mainEl.querySelector(".target_menu_left_buttons")
      target.innerHTML=""

      target.appendChild(
         toNode(theme.button(addButtonValue, 'teal', 'action_list_add_edit','data-id="editItemMode.item.uuid"'))
       )
       let actionAddTarget = mainEl.querySelector(".action_list_add_edit")
      actionAddTarget.addEventListener('click', function(e){
        editItemMode = undefined
        sourceEl.remove()
        render()
      });

      target.appendChild(
         toNode(theme.button(cancelButtonValue, 'red', 'action_list_cancel','data-id="editItemMode.item.uuid"'))
       )

      let actionCancelTarget = mainEl.querySelector(".action_list_cancel")
      actionCancelTarget.addEventListener('click', function(e){

        if (editItemMode.onLeave) {
          editItemMode.onLeave({select:self,selectDiv:sourceEl, target:event.target})
        }
        editItemMode = undefined
        sourceEl.remove()
        render()
      });
    }
  }

  function buildTitleLine(rules,extraButtons) {
    let props = rules
    if (onMove || onRemove || onChangeSelect ||  extraButtons[0]) {
      props = rules.concat([{displayAs:"Actions"}])
    }
    let items = props.map( p => theme.listItem(p.displayAs)).join("")
    let row = theme.topRow(items)
    let wrapper = theme.listWrapper(row)
    return wrapper
  }

  function buildSingle(sourceData, sourceLinks, rootNodes, level, parentId, greyed) {
    var source = undefined
    var targets = undefined
    var rootNodes = rootNodes || sourceData
    var level = level || 0
    var data = undefined
    var links = sourceLinks
    var rules = undefined
    var alreadySelectedItems = undefined
    var singleItem = (!Array.isArray(rootNodes))

    if (sourceLinks) { //filter list to display a hierarchy. Continued at the end
      source = links.map(item => item.source)
      targets = links.map(item => item.target)
    }
    //define what is the data source
    if (sourceLinks && !singleItem) {
      rules = display
      data = rootNodes.filter(item => !targets.includes(item.uuid)) //remove all nodes not on the same level
    }else if (singleItem) {
      rules = rulesToDisplaySingleElement || display
      data = [rootNodes]
    }else {
      rules = display
      data = sourceData
    }

    var html = ""
    if (multipleSelection) {
      alreadySelectedItems = data.filter(item => multipleSelection.includes(item[idProp]) )
      console.log(alreadySelectedItems);
    }

    // if (!singleItem) { TODO add top menu
    //   let listHeaderElements = ""
    //   for (rule of rules) {
    //     let dispName = rule.displayAs;
    //     listHeaderElements += theme.listItem(dispName, 'title')
    //   }
    //
    //   html += theme.topRow(listHeaderElements)
    // }

    for (item of data) {
      var remove =""
      var move =""
      var multipleSelect =""
      var extraButtonsHtml =""
      if (onRemove && !singleItem) {
        remove = `<div class="right floated content">
            <div data-id="${item[idProp]}" class="ui mini basic red button action_list_remove_item">remove</div>
          </div>`
      }
      if (extraButtons && !singleItem) {
        for (action of extraButtons) {
          extraButtonsHtml = `<div class="right floated content">
              <div data-extra="${item[action.prop]}" data-id="${item[idProp]}" class="ui mini basic teal button action_extra_${action.class}">${action.name}</div>
            </div>`
        }
      }
      if (multipleSelection && !singleItem) {
        if (multipleSelection.includes(item[idProp])) {
          multipleSelect = `<div class="right floated content">
              <div data-id="${item[idProp]}" class="ui mini green button action_list_remove_item_from_selection">unselect</div>
            </div>`
        }else{
          multipleSelect = `<div class="right floated content">
              <div data-id="${item[idProp]}" class="ui mini basic green button action_list_add_item_to_selection">Select</div>
            </div>`
        }
      }
      if (onMove && !greyed && !singleItem) {
        move = `<div class="right floated content">
            <div data-parentid="${parentId}" data-id="${item[idProp]}" class="ui mini basic blue button action_list_move_item">move</div>
          </div>`
        if (ismoving && ismoving.dataset.id != item[idProp]) {
          move =`
            <div class="right floated content">
              <div class="ui mini buttons">
                <button data-id="${item[idProp]}" data-parentid="${parentId}" class="ui button action_list_end_move_item">Move next</button>
                <div class="ou"></div>
                <button data-id="${item[idProp]}" data-grandparentid="${parentId}" data-parentid="${item[idProp]}" class="ui positive button action_list_end_move_item">Link</button>
              </div>
            </div>
          `
        }else if (ismoving && !singleItem) {
          move = `<div class="right floated content">
              <div data-id="${item[idProp]}" class="ui mini blue button action_list_move_item">Cancel</div>
            </div>`
        }
      }
      var extraStyle =""
      if (greyed || (ismoving && ismoving.dataset.id == item[idProp])) {
        extraStyle = "background-color: lightgrey; opacity: 0.5;"
      }
      if (multipleSelection &&  multipleSelection.includes(item[idProp])) {
        extraStyle = "background-color: #DAF7A6; opacity: 0.8;"
      }
      //define row elemet
      html += `<div ${extraStyle}' data-id='${item[idProp]}' class='searchable ${theme.nestedListClass}'>`//Start of Searchable item
      if (true) {//Display if is list

        var nestedHtml = ""
        if (singleItem) {
          html += `<h2>${item[rules[0].prop]}</h2>`
          nestedHtml = "<div class='ui container segment'>"
        }
        let firstItemStyle = `style='padding-left: ${25*level}px;'`
        for (rule of rules) {
          var propName = rule.prop
          var dispName = rule.displayAs
          var isEditable = rule.edit
          var isTime = rule.time
          var isFullText = rule.fullText
          var isMeta = rule.meta //get the metaFunction
          var editHtml = ""
          var propDisplay = item[propName]
          //force edit mode if in editItemMode
          if (editItemMode) {
            isEditable = true
          }
          if (isMeta) {
            item[propName] = isMeta().filter(e => (e.type == propName && e.source == item[idProp] )).map(e => e.target)
          }
          if (isEditable && !isMeta && !isTime) {
            editHtml+=`
            <i data-prop="${propName}" data-value="${item[propName]}" data-id="${item[idProp]}" class="edit icon action_list_edit_item" style="opacity:0.2"></i>`
          }else if (isEditable && isMeta) {
            editHtml+=`
            <i data-prop="${propName}" data-value='${JSON.stringify(item[propName])}' data-id="${item[idProp]}" class="edit icon action_list_edit_choice_item" style="opacity:0.2"></i>`

          }else if (isEditable && isTime) {
            console.log(item);
            console.log(propName);
            console.log(item[propName]);
            let today
            if (item[propName]) {
              today = new Date(item[propName]).toISOString().substr(0, 10);
            }else {
              today = new Date().toISOString().substr(0, 10);
            }

            propDisplay = moment(item[propName]).format("MMM Do YY");
            editHtml+=`
            <input data-prop="${propName}" data-id="${item[idProp]}" style="display:none;" type="date" class="dateinput ${item[idProp]} action_list_edit_time_input" name="trip-start" value="${today}">
            <i data-prop="${propName}" data-value='${JSON.stringify(item[propName])}' data-id="${item[idProp]}" class="edit icon action_list_edit_time_item" style="opacity:0.2">
            </i>`
          }
          if (rule.choices) {
            function reduceChoices(acc, e) {
              console.log(e);
              console.log(rule.choices());
              var foudItem = rule.choices().find(i=>i.uuid == e)
              if (foudItem) {
                var newItem = foudItem.name + " "+ (foudItem.lastName || " ")+" "
                var formatedNewItem = newItem
                if(formatedNewItem.length > 25) {
                    formatedNewItem = newItem.substring(0,10)+".. ";
                }
                var htmlNewItem = `<div data-inverted="" data-tooltip="${newItem}" class="ui mini teal label">${formatedNewItem}</div>`
                return acc += htmlNewItem
              }else {
                return acc
              }
            }
            propDisplay = item[propName].reduce(reduceChoices,"")
          }else if(isFullText && !singleItem){
            if(propDisplay && propDisplay.length > 35) {propDisplay = propDisplay.substring(0,35)+".. ";}
          }
          if (!singleItem) {
            nestedHtml +=`
            <div data-id="${item[idProp]}" class="column">
              <div ${firstItemStyle} data-id="${item[idProp]}" class="content action_menu_select_option">
                ${propDisplay}
                ${editHtml}
              </div>
            </div>
            `
          }else {
            nestedHtml +=`
            <div data-id="${item[idProp]}" class="">
              <h3 data-id="${item[idProp]}" class="ui header">
                <span class="">${dispName}</span>
              </h3>
              <div data-id="${item[idProp]}" class="">
                ${propDisplay}
                ${editHtml}
              </div>
            </div>
            <div class="ui divider"></div>
            `
          }
          if (firstItemStyle) {
            firstItemStyle =""
          }
        }
        html += nestedHtml
        if (singleItem) {
          if (sourceLinks && source.includes(item.uuid)) {
            html += "</div><h3>Eléments Liés</h3>"
          }
        }
      }
      //add action button
      html += remove
      html += move
      html += multipleSelect
      html += extraButtonsHtml
      html += "</div>"//End of Searchable Item

      //Check if some children exist if there is a link items
      console.log(sourceLinks);
      if (sourceLinks) {
        if (source.includes(item.uuid)) {//if children, generate the html to append them
          //first get all the children from the links
          var isGreyed =false; //check if childrens are greyed
          if (!greyed) {
            isGreyed = ismoving && ismoving.dataset.id == item[idProp]
          }else {
            isGreyed = true; //propagate to all childrend
          }
          var childrendId = links.filter(el => el.source == item.uuid).map(el => el.target)
          var childrenData = sourceData.filter(el => childrendId.includes(el.uuid))//filter the children from source
          console.log(sourceLinks);
          var childrenLinks = sourceLinks.filter(el => el.source != item.uuid)//remove all link with current item from source
          console.log(childrenData, childrenLinks)
          html += buildSingle(sourceData, childrenLinks, childrenData,(level+1), item.uuid, isGreyed)
          // if (level > 0) {
          //   html += "</div>" //close nested element
          // }
        }

      }
      // Item completed, the loop goes to the next
    }
    //All the list has been built
    //console.log(html);
    return html
  }

  // function createNewItemEditor() {
  //   var newItem = {uuid:genuuid()}
  //   var html = buildSingle(sourceData, sourceLinks, [newItem])
  //   container.innerHTML ="<div class='"+ theme.singleElementsListClass + "'>"+html+"</div>"
  // }

  function render() {
    buildHtmlContainer() //setup external container
    connect() //add events
    createMenu()//create the inside of the list
    //createAddTemplate()//create a placeholder area to add items

    //add area between menu and list
    var containerTopArea = document.createElement('div');
    containerTopArea.style.overflow = "auto"
    //item list (global var)
    listContainer = document.createElement('div');
    listContainer.style.overflow = "auto"

    //build contente
    if (singleElement) {
      listContainer.innerHTML =theme.listWrapper("<div class='"+ theme.singleElementsListClass + "'>"+ buildSingle(sourceData, sourceLinks, singleElement)+"</div>")
    }else if (editItemMode){
      listContainer.innerHTML =theme.listWrapper(buildSingle(sourceData, sourceLinks, editItemMode.item))
    }else {
      //build top row
      let titleLineHtml = buildTitleLine(display, extraButtons)
      containerTopArea.appendChild(toNode(titleLineHtml));
      //build all list
      listContainer.innerHTML = theme.listWrapper(buildSingle(sourceData, sourceLinks))
    }

    mainEl.appendChild(containerTopArea)
    mainEl.appendChild(listContainer)

    //inject document framgent in DOM
    if (!targetDomContainer) {
      document.querySelector('body').appendChild(mainFragment);
    }else if (targetDomContainer) {
      document.querySelector(targetDomContainer).appendChild(mainFragment);
    }
  }

  //PUBLIC FUNC
  function getParent() {
    return parentSelectMenu
  }
  function setSelected(data) {
    multipleSelection = data
  }
  function getSelected() {
    return multipleSelection
  }
  function updateData(data) {
    sourceData = data
  }
  function updateLinks(links) {
    sourceLinks = links
  }
  function updateMetaLinks(links) {
    metaLinks = links
  }
  function setEditItemMode(data) {
    editItemMode = {item:data.item, onLeave:data.onLeave}
  }
  function refreshList() {
    listContainer.innerHTML = theme.listWrapper(buildSingle(sourceData, sourceLinks))
  }
  function update() {
    if (sourceEl) {
      sourceEl.remove()
    }
    render()
  }

  init();

  self.setEditItemMode = setEditItemMode
  self.setSelected = setSelected
  self.getSelected = getSelected
  self.getParent = getParent
  self.updateData = updateData
  self.refreshList = refreshList
  self.updateLinks = updateLinks
  self.updateMetaLinks = updateMetaLinks
  self.update = update
  return self
}
