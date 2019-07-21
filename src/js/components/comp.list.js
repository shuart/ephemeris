function showListMenu({
  displayProp=undefined,
  idProp = undefined,
  parentSelectMenu = undefined,
  targetDomContainer = undefined,
  display = undefined,
  extraFields =undefined,
  focusSearchOnRender = true,
  singleElement =undefined,
  rulesToDisplaySingleElement = undefined,
  fullScreen= false,
  sourceData = undefined,
  sourceLinks = undefined,
  metaLinks = undefined,
  multipleSelection = undefined,
  searchable = true,
  showColoredIcons = false,
  onClick = (e)=>{console.log("clik on select");},
  onLabelClick = (e)=>{console.log("clik on label");},
  onAdd = undefined,
  onAddFromPopup = undefined,
  onAddFromExtraField = undefined,
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
  extraButtons = [],
  currentSearchValue ="",
  currentSortProp = undefined,
  listIsExpanded = false
  }={}) {

    var extraValuesAdded =false;
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
      <div style="flex-shrink:0" class="ui mini menu target_menu_left_buttons">
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
    listExpander:( ) => {
      return /*html*/`
      <div style="cursor:pointer;cursor: pointer;width: 50px;position: absolute;right: 0px;top: 82px;" class="action_list_toogle_expand item">
          < >
      </div>
      `
    },
    listWrapper:(rows, firstCol) => {
      return /*html*/`
        ${rows}
      `
    },
    listFirstColWrapper:(rows) => {
      return /*html*/`
        <div class="spreaded_titles shadowed">${rows}</div>
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
    listItemIcon:(content, colType) => {
      return `
      <div style ="flex-grow: 0;flex-basis: 50px;" class='${colType||"column"}'>
        <div class='orange-column'>
        </div>
      </div>
      `
    },
    listItem:(content, prop, colType) => {
      let currentProp = prop;
      return `
      <div  class='${colType||"column"}'>
        <div data-prop="${currentProp}" class='orange-column ${currentProp?"action_list_toogle_sort_by_prop":""}' ${currentProp?"style='cursor:pointer;'":""}>
          ${content}
        </div>
      </div>
      `
    },
    listItemExtraField:(content, colType) => {
      let style = "color: #00b5ad;"
      return `
      <div style="${style}" class='${colType||"column"}'>

        <div class='orange-column'>
          ${content}
        </div>
        <div style="height:0px;position:relative" data-id='' class='extraFieldaddMagnet'>
          <div style="color:white;right: 0px;top: -21px;position: absolute;background: #00b5ad;width: 20px;height: 20px;opacity: 0.2;cursor:pointer" data-id='' class='action_list_add_from_extra_field'>+</div>
        </div>
      </div>
      `
    }
  }

  //LOCAL VARS
  var data = undefined
  var ismoving = false
  var ismovingExtraItems = []
  var mainFragment = document.createDocumentFragment()
  var sourceEl = undefined
  var mainEl = undefined
  var editItemMode = undefined
  var listContainer =undefined;
  var listContainerFirstCol =undefined;


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
          if (!editItemMode && !singleElement) {
            refreshList()
          }else {
            currentSearchValue =""
            sourceEl.remove()
            render()
          }
        }
        if (event.target.classList.contains("action_list_add_from_popup_item")) {
          onAddFromPopup({selectDiv:sourceEl, select:self, target:event.target})
          if (!editItemMode && !singleElement) {
            refreshList()
          }else {
            currentSearchValue =""
            sourceEl.remove()
            render()
          }
        }
        if (event.target.classList.contains("action_list_toogle_sort_by_prop")) {
          if (event.target.dataset.prop) {
            //check if the current prop is the same to reset
            if (currentSortProp ==event.target.dataset.prop) {
              currentSortProp = undefined; //Then reset
              refreshList()
            }else {
              currentSortProp =event.target.dataset.prop
              refreshList()
            }

          }
        }
        if (event.target.classList.contains("action_list_add_from_extra_field")) {
          if (onAddFromExtraField) {
            onAddFromExtraField({selectDiv:sourceEl, select:self, target:event.target})
          }
          if (!editItemMode && !singleElement) {
            refreshList()
          }else {
            currentSearchValue =""
            sourceEl.remove()
            render()
          }
        }
        if (event.target.classList.contains("action_menu_select_option")) {
          onClick({selectDiv:sourceEl, select:self, target:event.target})
          console.log(event.target);
        }
        if (event.target.classList.contains("action_list_click_label")) {
          onLabelClick({selectDiv:sourceEl, select:self, target:event.target})
          console.log(event.target);
        }
        if (event.target.classList.contains("action_list_remove_item") && onRemove) {
          onRemove({select:self,selectDiv:sourceEl, target:event.target})
          console.log(event.target);
          refreshList()
        }
        if (event.target.classList.contains("action_list_remove_item_from_selection")) {
          multipleSelection = multipleSelection.filter(i => i != event.target.dataset.id)
          onChangeSelect({select:self,selectDiv:sourceEl, target:event.target})
          refreshList()
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
            ismovingExtraItems = []
          }else {
            ismoving = event.target
          }
          refreshList()

        }
        if (event.target.classList.contains("action_list_end_add_to_move_item_toogle")) {
          if (ismoving) {
            if (ismovingExtraItems.find(i=>i.dataset.id == event.target.dataset.id )) {
              console.log("remove from selection");
              ismovingExtraItems = ismovingExtraItems.filter(i=>!(i.dataset.id==event.target.dataset.id))
            }else {
              ismovingExtraItems.push(event.target)
            }
            console.log(ismovingExtraItems);
          }
          refreshList()

        }
        if (event.target.classList.contains("action_list_end_move_item") ) {
          if (ismoving) {
            console.log(event.target.dataset.id,ismoving.dataset.id, event.target.dataset.parentid);
            onMove({select:self,selectDiv:sourceEl, originTarget:ismoving, target:event.target, targetParentId:event.target.dataset.parentid})
            ismoving = false
          }
          if (ismovingExtraItems[0]) {//if other items are selected
            for (var i = 0; i < ismovingExtraItems.length; i++) {
              ismovingExtraItems[i]
              onMove({select:self,selectDiv:sourceEl, originTarget:ismovingExtraItems[i], target:event.target, targetParentId:event.target.dataset.parentid})
            }
            ismovingExtraItems=[]
          }
          refreshList()

        }
        if (event.target.classList.contains("action_list_edit_item")) {
          onEditItem({select:self, selectDiv:sourceEl, target:event.target})
          if (!editItemMode && !singleElement) {
            refreshList()
          }else {
            sourceEl.remove()
            render()
          }
        }
        if (event.target.classList.contains("action_list_edit_choice_item")) {
          onEditChoiceItem({select:self, selectDiv:sourceEl, target:event.target})
          //TODO this should be updated here with a promise
          // console.log(event.target);
          // if (!editItemMode && !singleElement) {
          //   refreshList()
          // }else {
          //   sourceEl.remove()
          //   render()
          // }
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
        if (event.target.classList.contains("action_list_toogle_expand")) {
          listIsExpanded = !listIsExpanded
          sourceEl.remove()
          render()
        }
    }

    //handle case if extra button are specified
    if (extraButtons) {
      for (action of extraButtons) {
        sourceEl.addEventListener("click",function () {
          if (event.target.classList.contains("action_extra_"+action.class)) {
            action.action(event.target)
            refreshList()
            if (action.closeAfter) {
              sourceEl.remove()//TODO find a beter way, very hacky
            }
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
        mainEl.style.padding = "4em"
        mainEl.style.paddingTop = "1em"
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
           toNode(theme.button(action.name, 'basic', "action_extra_"+actionClass)),
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
        currentSearchValue = value
        filterDataWithValue(value)
        // var filteredData = sourceData.filter((item) => {
        //   for (rule of display) {
        //     //TODO allow array search
        //     if (fuzzysearch (value, item[rule.prop]) && item[rule.prop] && !Array.isArray(item[rule.prop])) {
        //       return true
        //     }else if (item[rule.prop] && !Array.isArray(item[rule.prop]) && fuzzysearch (value, item[rule.prop].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")) ) {
        //       return true
        //     }
        //   }
        //   return false
        // })
        // var filteredIds = filteredData.map(x => x.uuid);
        // var searchedItems = sourceEl.querySelectorAll(".searchable")
        // for (item of searchedItems) {
        //   if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "flex"}else{item.style.display = "none"}
        // }
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
    let items = props.map( p => {
      if (p.extraField) {
        return theme.listItemExtraField(p.displayAs)
      }else{
        if (p.sortable || p.prop == "name") {
          return theme.listItem(p.displayAs, p.prop)
        }else {
          return theme.listItem(p.displayAs)
        }
      }
    }).join("")

    if (showColoredIcons) {
      items = theme.listItemIcon() + items //add a pading when icon is used
    }

    let row = theme.topRow(items)

    let wrapper = theme.listWrapper(row)
    return wrapper
  }

  //MAIN function to build list
  function buildSingle(sourceData, sourceLinks, rootNodes, level, parentId, greyed, firstOnly) {
    var source = undefined
    var targets = undefined
    var rootNodes = rootNodes || deepCopy(sourceData)
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
      data = deepCopy(sourceData)
    }
    //only treat the first col
    if (firstOnly) {
      rules = [rules[0]]
    }

    //Check if sorting is necessary
    if (currentSortProp) {
      data = data.sort(function(a, b) {
        if (a[currentSortProp] && b[currentSortProp]) {
          var nameA = a[currentSortProp].toUpperCase(); // ignore upper and lowercase
          var nameB = b[currentSortProp].toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {return -1;}
          if (nameA > nameB) {return 1;}
        }
        return 0;})
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
      if (onRemove && !singleItem && !ismoving) {
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
        if (ismoving && ismoving.dataset.id != item[idProp] && sourceLinks && !ismovingExtraItems.find(i=>i.dataset.id == item[idProp] )) {
          move =`
            <div class="right floated content">
              <div class="ui mini buttons">
                <button data-id="${item[idProp]}" data-parentid="${parentId}" class="ui button action_list_end_add_to_move_item_toogle">select</button>
                <button data-id="${item[idProp]}" data-parentid="${parentId}" class="ui button action_list_end_move_item">Move next</button>
                <div class="ou"></div>
                <button data-id="${item[idProp]}" data-grandparentid="${parentId}" data-parentid="${item[idProp]}" class="ui positive button action_list_end_move_item">Link</button>
              </div>
            </div>
          `
        }else if (ismoving && ismovingExtraItems.find(i=>i.dataset.id == item[idProp] )) {
          move =`
            <div class="right floated content">
              <div class="ui mini buttons">
                <button data-id="${item[idProp]}" data-parentid="${parentId}" class="ui button basic green action_list_end_add_to_move_item_toogle">selected</button>              </div>
            </div>
          `
        }else if (ismoving && ismoving.dataset.id != item[idProp]) {
          move =`
            <div class="right floated content">
              <div class="ui mini buttons">
                <button data-id="${item[idProp]}" data-parentid="${parentId}" class="ui button action_list_end_move_item">Move next</button>
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
        extraStyle = 'style="background-color= lightgrey; opacity= 0.5;"'
      }
      if (multipleSelection &&  multipleSelection.includes(item[idProp])) {
        extraStyle = "background-color: #DAF7A6; opacity: 0.8;"
      }
      //define row elemet
      html += `<div ${extraStyle}' data-id='${item[idProp]}' class='searchable ${theme.nestedListClass}'>`//Start of Searchable item
      //add list add helpers
      if (onAddFromPopup) {
        html += `<div data-id='${item[idProp]}' class='addMagnet'>
          <div data-id='${item[idProp]}' class='addPopup action_list_add_from_popup_item'>+</div>
        </div>`
      }
      if (true) {//Display if is list

        var nestedHtml = ""
        if (singleItem) {
          html += `<h2>${item[rules[0].prop]}</h2>`
          nestedHtml = "<div class='ui container segment'>"
        }
        let firstItemStyle = `style='padding-left: ${25*level}px;'`

        if (showColoredIcons) {

          let letters = showColoredIcons(item)
          let colStyle = 'style ="flex-grow: 0;flex-basis: 50px;"'
          let style = 'style="background-color: '+colorFromLetters(letters)+';width: 32px;height: 32px;border-radius: 100%;padding: 5px;font-size: 18px;color: white;"'
          nestedHtml +=`
          <div  ${colStyle} data-id="${item[idProp]}" class="column">
            <div ${style} data-id="${item[idProp]}" class="content">
              ${letters}
            </div>
          </div>
          `
        }
        for (rule of rules) {
          var propName = rule.prop
          var dispName = rule.displayAs
          var isEditable = rule.edit
          var isTime = rule.time
          var isFullText = rule.fullText
          var isMeta = rule.meta //get the metaFunction
          var isTarget = rule.isTarget //met is target
          var editHtml = ""
          var propDisplay = item[propName]
          //force edit mode if in editItemMode
          if (editItemMode) {
            isEditable = true
          }
          if (isMeta) {
            if (isTarget) {
              item[propName] = isMeta().filter(e => (e.type == propName && e.target == item[idProp] )).map(e => e.source)
            }else {
              item[propName] = isMeta().filter(e => (e.type == propName && e.source == item[idProp] )).map(e => e.target)
            }
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
                var newItemId = foudItem.uuid
                if(formatedNewItem.length > 25) {
                    formatedNewItem = newItem.substring(0,10)+".. ";
                }
                var htmlNewItem = `<div style="cursor:pointer;" data-inverted="" data-id="${newItemId}" data-tooltip="${newItem}" class="ui mini teal label action_list_click_label">${formatedNewItem}</div>`
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
                ${propDisplay||""}
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
                ${propDisplay||""}
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
            html += "</div><h3>Linked Elements</h3>"
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
            isGreyed = (ismoving && ismoving.dataset.id == item[idProp]) || (ismoving && ismovingExtraItems.find(i=>i.dataset.id == item[idProp] ))//check if the current object is the one moving
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

    if (extraFields && !extraValuesAdded) {
      extraFields.forEach(r=> r.extraField = true)//mark extra field to render the title row correctly

      if (rulesToDisplaySingleElement) {
        rulesToDisplaySingleElement = rulesToDisplaySingleElement.concat(extraFields)
      }else {
        display = display.concat(extraFields)
      }
      extraValuesAdded = true
    }

    //add area between menu and list
    var containerTopArea = document.createElement('div');
    containerTopArea.style.overflow = "auto"
    containerTopArea.style.flexShrink = "0"
    //item list (global var)
    listContainer = document.createElement('div');
    listContainer.classList = "table"

    listContainerFirstCol = document.createElement('div');
    listContainerFirstCol.classList = "table-first-col"
    // listContainer.style.overflow = "auto"
    //item list (global var)
    let globalContainer = document.createElement('div');
    globalContainer.style.overflow = "auto"
    globalContainer.classList = "flexTable"

    if (listIsExpanded) {
      globalContainer.classList.add("expanded")
    }

    //build contente
    if (singleElement) {
      listContainer.innerHTML =theme.listWrapper("<div class='"+ theme.singleElementsListClass + "'>"+ buildSingle(sourceData, sourceLinks, singleElement)+"</div>")
      globalContainer.appendChild(listContainer)
    }else if (editItemMode){
      listContainer.innerHTML =theme.listWrapper(buildSingle(sourceData, sourceLinks, editItemMode.item))
      globalContainer.appendChild(listContainer)
    }else {
      //build top row
      let titleLineHtml = buildTitleLine(display, extraButtons)
      //build all list

      let listContainerTop = document.createElement('div');
      listContainerTop.classList = "top-line"
      listContainerTop.style.position = "sticky"
      listContainerTop.style.background = "white"
      listContainerTop.style.opacity = "0.9"
      listContainerTop.style.zIndex = "5"
      listContainerTop.style.top = "0"

      listContainerTop.appendChild(toNode(titleLineHtml));

      if (listIsExpanded) {
        // let firstColData = buildSingle(sourceData, sourceLinks, undefined, undefined, undefined, undefined, true)
        listContainerFirstCol.innerHTML= theme.listFirstColWrapper(buildSingle(sourceData, sourceLinks))
        listContainer.innerHTML= theme.listWrapper(buildSingle(sourceData, sourceLinks))
      }else {
        listContainer.innerHTML= theme.listWrapper(buildSingle(sourceData, sourceLinks))
      }

      globalContainer.appendChild(listContainerTop)
      globalContainer.appendChild(listContainerFirstCol)
      globalContainer.appendChild(listContainer)

      mainEl.appendChild(toNode(theme.listExpander()))//add expander only in big lists
    }
    // mainEl.appendChild(containerTopArea)
    mainEl.appendChild(globalContainer)


    //inject document framgent in DOM
    if (!targetDomContainer) {
      document.querySelector('body').appendChild(mainFragment);
    }else if (targetDomContainer) {
      document.querySelector(targetDomContainer).appendChild(mainFragment);
    }
    //focus on search
    if (focusSearchOnRender) {
      let listInput = sourceEl.querySelector(".list-search-input")
      if (listInput) {
        listInput.focus()
      }
    }
    //searchItems if current search value
    if (currentSearchValue != "") {
       filterDataWithValue(currentSearchValue)
    }
  }

  function filterDataWithValue(value) {
    var filteredData = sourceData.filter((item) => {
      for (rule of display) {
        //TODO allow array search
        if (fuzzysearch (value, item[rule.prop]) && item[rule.prop] && !Array.isArray(item[rule.prop])) {
          return true
        }else if (item[rule.prop] && !Array.isArray(item[rule.prop]) && fuzzysearch (value, item[rule.prop].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")) ) {
          return true
        }else if (item[rule.prop] && !Array.isArray(item[rule.prop]) && fuzzysearch (value, item[rule.prop].toLowerCase()) ) {
          return true
        }
      }
      return false
    })
    var filteredIds = filteredData.map(x => x.uuid);
    var searchedItems = sourceEl.querySelectorAll(".searchable")
    for (item of searchedItems) {
      if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "flex"}else{item.style.display = "none"}
    }
  }

  function colorFromLetters(letters) {
    const alphaVal = (s) => s.toLowerCase().charCodeAt(0) - 97 + 1
    // let veryDifferentColors = ["#000000","#00FF00","#0000FF","#FF0000","#01FFFE","#FFA6FE","#FFDB66","#006401","#010067","#95003A","#007DB5","#FF00F6","#FFEEE8","#774D00","#90FB92","#0076FF","#D5FF00","#FF937E","#6A826C","#FF029D","#FE8900","#7A4782","#7E2DD2","#85A900","#FF0056","#A42400","#00AE7E","#683D3B","#BDC6FF","#263400","#BDD393","#00B917","#9E008E","#001544","#C28C9F","#FF74A3","#01D0FF","#004754","#E56FFE","#788231","#0E4CA1","#91D0CB","#BE9970","#968AE8","#BB8800","#43002C","#DEFF74","#00FFC6","#FFE502","#620E00","#008F9C","#98FF52","#7544B1","#B500FF","#00FF78","#FF6E41","#005F39","#6B6882","#5FAD4E","#A75740","#A5FFD2","#FFB167","#009BFF","#E85EBE"];
    let colorNbr = Math.round(( alphaVal(letters[0])+alphaVal(letters[1]) )/78*360)
    // let color = veryDifferentColors[colorNbr]
    let color = "hsl("+colorNbr+", 34%, 50%)"
    return color
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
    if (listIsExpanded) {
      listContainerFirstCol.innerHTML= theme.listFirstColWrapper(buildSingle(sourceData, sourceLinks))
    }
    listContainer.innerHTML = theme.listWrapper(buildSingle(sourceData, sourceLinks))
    //focus on search
    if (focusSearchOnRender) {
      let listInput = sourceEl.querySelector(".list-search-input")
      if (listInput) {
        listInput.focus()
      }
    }
    //searchItems if current search value
    if (currentSearchValue != "") {
       filterDataWithValue(currentSearchValue)
    }
  }
  function update() {
    if (sourceEl) {
      sourceEl.remove()
    }
    render()
  }
  function removeList() {
    sourceEl.remove()
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
  self.remove = removeList
  self.update = update
  return self
}
