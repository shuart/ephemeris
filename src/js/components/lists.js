function ShowSelectMenu({
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
  onClear = (e)=>{console.log("Clear select")},
  extraActions = undefined,
  extraButtons = []
  }={}) {
  var data = undefined
  var ismoving = false
  var sourceEl = undefined

  var self={}

  render()

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
  function update() {
    if (sourceEl) {
      sourceEl.remove()
    }
    render()
  }

  function render() {
    sourceEl = document.createElement('div');
    sourceEl.style.height = "100%"



    sourceEl.onclick = function(event) {
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
          sourceEl.remove()
          render()
          //sourceEl.remove()
        }
        if (event.target.classList.contains("action_list_move_item")) {
          //onsole.log(event.target);
          //sourceEl.remove()
          if (ismoving) {
            ismoving = false
          }else {
            ismoving = event.target
          }
          sourceEl.remove()
          render()

        }
        if (event.target.classList.contains("action_list_end_move_item") ) {
          if (ismoving) {
            console.log(event.target.dataset.id,ismoving.dataset.id, event.target.dataset.parentid);
            onMove({select:self,selectDiv:sourceEl, originTarget:ismoving, target:event.target, targetParentId:event.target.dataset.parentid})
            ismoving = false
          }
          sourceEl.remove()
          render()

        }
        if (event.target.classList.contains("action_list_edit_item")) {
          onEditItem({select:self, selectDiv:sourceEl, target:event.target})
          console.log(event.target);
          sourceEl.remove()
          render()
          //sourceEl.remove()
        }
        if (event.target.classList.contains("action_list_edit_choice_item")) {
          onEditChoiceItem({select:self, selectDiv:sourceEl, target:event.target})
          console.log(event.target);
          //sourceEl.remove()
          //render()
          //sourceEl.remove()
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

    if (extraButtons) {
      for (action of extraButtons) {
        sourceEl.addEventListener("click",function () {
          if (event.target.classList.contains("action_extra_"+action.class)) {
            action.action(event.target)
            sourceEl.remove()
            render()
          }
        }, false)
      }
    }


    if (!targetDomContainer) {
      document.querySelector('body').appendChild(sourceEl);
    }else if (targetDomContainer) {
      document.querySelector(targetDomContainer).appendChild(sourceEl);
    }



    var dimmer = document.createElement('div');
    dimmer.classList="dimmer"
    var mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "99999"
    mainEl.style.backgroundColor = "white"

    if (!fullScreen) {
      //mainEl.classList ="ui raised very padded text container segment"
      mainEl.classList ="ui raised padded container segment"
      mainEl.style.width = "50%"
      mainEl.style.maxHeight = "90%"
      mainEl.style.left= "25%";
    }else if(targetDomContainer){
      mainEl.classList ="ui container"
      mainEl.style.position = "relative"
      mainEl.style.zIndex = "1"
        mainEl.style.padding = "5em"
        mainEl.style.width = "100%"
        mainEl.style.height = "100%"
        mainEl.style.left= "0px";
    }else {
      mainEl.classList ="ui container"
        mainEl.style.padding = "5em"
        mainEl.style.width = "100%"
        mainEl.style.height = "100%"
        mainEl.style.left= "0px";
    }





    //mainEl.style.margin = "auto"

    // mainEl.style.top= "50%";
    // mainEl.style.transform= "translate(-50%, -50%);"

    if (!targetDomContainer) {//TODO check if fullscreen check needed
      sourceEl.appendChild(dimmer)
    }
    sourceEl.appendChild(mainEl)

    //create the inside of the list
    //menu
    createMenu()


    //item list
    var container = document.createElement('div');
    container.style.overflow = "auto"
    if (singleElement) {
      container.innerHTML ="<div class='ui middle aligned divided list'>"+ buildSingle(sourceData, sourceLinks, singleElement)+"</div>"
    }else {
      container.innerHTML ="<div class='ui middle aligned divided list'>"+ buildSingle(sourceData, sourceLinks)+"</div>"
    }

    mainEl.appendChild(container)

    function createMenu() {
      var menuArea = document.createElement('div');
      menuArea.classList = "ui small pointing menu"
      //menuArea.style.minHeight = "65px"
      mainEl.appendChild(menuArea)



      // clear button
      var actions = document.createElement('div');
      actions.innerHTML =`
        <div class="item">
          <button class="ui secondary button">
            Clear
          </button>
        </div>
        `
      actions.addEventListener('click', function(e){
        e.stopPropagation()
        onClear({selectDiv:sourceEl, target:undefined})
      });

      menuArea.appendChild(actions)

      //add button
      if (onAdd) {
        var addActions = document.createElement('div');
        addActions.innerHTML =`
          <div class="item">
            <button class="ui green button">
              Add
            </button>
          </div>
          `
        addActions.addEventListener('click', function(e){
          e.stopPropagation()
          onAdd({selectDiv:sourceEl, target:undefined})
          sourceEl.remove()
          render()
        });
        menuArea.appendChild(addActions)
      }
      //display extra action buttons
      if (extraActions) {
        for (action of extraActions) {
          var addAction = document.createElement('div');
          var actionClass="action_extra_"+action.name;
          addAction.innerHTML =`
            <div class="item">
              <button class="ui button action_extra_${actionClass}">
                ${action.name}
              </button>
            </div>`
            menuArea.appendChild(addAction);
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

            addAction.addEventListener('click', addEventL(action),false);
        }
      }

      //right part
      var rightMenuArea = document.createElement('div');
      rightMenuArea.classList = "right menu"
      menuArea.appendChild(rightMenuArea)

      //search menu
      if (searchable) {
        var addSearch = document.createElement('div');
        addSearch.classList="ui item"
        addSearch.innerHTML =`
          <div class="ui transparent icon input">
              <input class="list-search-input" type="text" placeholder="Search list...">
              <i class="search icon"></i>
          </div>
          `
        rightMenuArea.appendChild(addSearch)

        addSearch.addEventListener('keyup', function(e){
          //e.stopPropagation()
          var value = sourceEl.querySelector(".list-search-input").value
          var filteredData = sourceData.filter((item) => {
            console.log(display, item);
            for (rule of display) {
              console.log(item[rule.prop], value);
              console.log(fuzzysearch (value, item[rule.prop]));
              if (fuzzysearch (value, item[rule.prop])) { return true }
            }
            return false
          })
          var filteredIds = filteredData.map(x => x.uuid);
          var searchedItems = sourceEl.querySelectorAll(".searchable")
          for (item of searchedItems) {
            if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "block"}else{item.style.display = "none"}
          }
          //onAdd({selectDiv:sourceEl, target:undefined})
          //sourceEl.remove()
          //render()
        });
      }
      //close button
      if (!targetDomContainer) {
        var close = document.createElement('div');
        close.innerHTML =`
          <div class="item">
            <button class="ui red button action_list_close">
              Close
            </button>
          </div>
          `
        rightMenuArea.appendChild(close)
      }
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
      console.log("ezf",rootNodes, level );
      console.log("ezf",rootNodes.length == 1 );
      var singleItem = (!Array.isArray(rootNodes))

      if (sourceLinks) { //filter list to display a hierarchy. Continued at the end
        source = links.map(item => item.source)
        targets = links.map(item => item.target)
        console.log(data);
        console.log(sourceData);
      }
      //define what is the data source
      if (sourceLinks && !singleItem) {
        rules = display
        data = rootNodes.filter(item => !targets.includes(item.uuid))
      }else if (singleItem) {
        rules = rulesToDisplaySingleElement
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

      for (item of data) {
        var remove =""
        var move =""
        var multipleSelect =""
        var extraButtonsHtml =""
        if (onRemove) {
          remove = `<div class="right floated content">
              <div data-id="${item[idProp]}" class="ui tiny basic red button action_list_remove_item">remove</div>
            </div>`
        }
        if (extraButtons) {
          for (action of extraButtons) {
            extraButtonsHtml = `<div class="right floated content">
                <div data-extra="${item[action.prop]}" data-id="${item[idProp]}" class="ui tiny basic teal button action_extra_${action.class}">${action.name}</div>
              </div>`
          }
        }
        if (multipleSelection) {
          if (multipleSelection.includes(item[idProp])) {
            multipleSelect = `<div class="right floated content">
                <div data-id="${item[idProp]}" class="ui tiny green button action_list_remove_item_from_selection">unselect</div>
              </div>`
          }else{
            multipleSelect = `<div class="right floated content">
                <div data-id="${item[idProp]}" class="ui tiny basic green button action_list_add_item_to_selection">Select</div>
              </div>`
          }
        }
        if (onMove && !greyed) {
          move = `<div class="right floated content">
              <div data-parentid="${parentId}" data-id="${item[idProp]}" class="ui tiny basic blue button action_list_move_item">move</div>
            </div>`
          if (ismoving && ismoving.dataset.id != item[idProp]) {
            move =`
              <div class="right floated content">
                <div class="ui tiny buttons">
                  <button data-id="${item[idProp]}" data-parentid="${parentId}" class="ui button action_list_end_move_item">Déplacer en dessous</button>
                  <div class="ou"></div>
                  <button data-id="${item[idProp]}" data-grandparentid="${parentId}" data-parentid="${item[idProp]}" class="ui positive button action_list_end_move_item">Lier</button>
                </div>
              </div>
            `
          }else if (ismoving) {
            move = `<div class="right floated content">
                <div data-id="${item[idProp]}" class="ui tiny blue button action_list_move_item">Annuler</div>
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
        html += `<div style='padding-left: ${25*level}px; ${extraStyle}' data-id='${item[idProp]}' class='searchable item'>`//Start of Searchable item
        if (!singleItem) {//Display if is list
          //add action button
          html += remove
          html += move
          html += multipleSelect
          html += extraButtonsHtml
          var nestedHtml = "<div class='ui relaxed horizontal list'>"
          for (rule of rules) {
            var propName = rule.prop
            var dispName = rule.displayAs
            var isEditable = rule.edit
            var isTime = rule.time
            var isFullText = rule.fullText
            var isMeta = rule.meta
            var editHtml = ""
            var propDisplay = item[propName]
            if (isMeta) {
              item[propName] = metaLinks.filter(e => (e.type == propName && e.source == item[idProp] )).map(e => e.target)
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
                console.log(rule.choices);
                var foudItem = rule.choices.find(i=>i.uuid == e)
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
            }else if(isFullText){
              if(propDisplay && propDisplay.length > 35) {propDisplay = propDisplay.substring(0,35)+".. ";}
            }
            nestedHtml +=`
            <div data-id="${item[idProp]}" class="item">
              <div data-id="${item[idProp]}" class="content action_menu_select_option">
                <div class="header">${dispName}</div>
                ${propDisplay}
                ${editHtml}
              </div>
            </div>
            `
          }
          nestedHtml += "</div>"
          html += nestedHtml
        }else {
          html += `<h2>${item[rules[0].prop]}</h2>`
          var nestedHtml = "<div class='ui container segment'>"
          for (rule of rules) {
            var propName = rule.prop
            var dispName = rule.displayAs
            var isEditable = rule.edit
            var isMeta = rule.meta
            var isTime = rule.time
            var isFullText = rule.fullText
            var editHtml = ""
            var mainText = ""
            if (isMeta) {
              item[propName] = metaLinks.filter(e => (e.type == propName && e.source == item[idProp] )).map(e => e.target)
            }
            if (isEditable && !isMeta && !isTime && !isFullText) {
              editHtml+=`
              <i data-prop="${propName}" data-value="${item[propName]}" data-id="${item[idProp]}" class="edit icon action_list_edit_item" style="opacity:0.2"></i>`
            }else if (isEditable && isMeta) {
              editHtml+=`
              <i data-prop="${propName}" data-value='${JSON.stringify(item[propName])}' data-id="${item[idProp]}" class="edit icon action_list_edit_choice_item" style="opacity:0.2"></i>`

            }else if (isEditable && isTime) {
              alert(zd)
                let today = new Date().toISOString().substr(0, 10);
                //.valueAsDate
                editHtml+=`
                <input type="date" class="dateinput ${item[idProp]}" name="trip-start" value="${today}"><i data-prop="${propName}" data-value='${JSON.stringify(item[propName])}' data-id="${item[idProp]}" class="edit icon action_list_edit_choice_item" style="opacity:0.2">
                </i>`
            }else if (isEditable && isFullText) {
                editHtml+=`
                <textarea data-prop="${propName}" data-id="${item[idProp]}" style="display:none;" id="story" name="story" rows="5" cols="33">${item[propName]}</textarea>
                <i data-prop="${propName}" data-value='${JSON.stringify(item[propName])}' data-id="${item[idProp]}" class="edit icon action_list_edit_text_item" style="opacity:0.2"></i>`
              }
            if (rule.choices) {
              function reduceChoices(acc, e) {
                console.log(e);
                console.log(rule.choices);
                var foudItem = rule.choices.find(i=>i.uuid == e)
                var newItem = foudItem.name + " "+ (foudItem.lastName || " ")+" "
                var formatedNewItem = newItem
                if(formatedNewItem.length > 25) {
                    formatedNewItem = newItem.substring(0,10)+".. ";
                }
                var htmlNewItem = `<div data-inverted="" data-tooltip="${newItem}" class="ui mini teal label">${formatedNewItem}</div>`
                return acc += htmlNewItem
              }
              mainText = item[propName].reduce(reduceChoices,"")
            }else{
              mainText = item[propName]
            }

            nestedHtml +=`
            <div data-id="${item[idProp]}" class="">
              <h3 data-id="${item[idProp]}" class="ui header">
                <span class="">${dispName}</span>
              </h3>
              <div data-id="${item[idProp]}" class="">
                ${mainText}
                ${editHtml}
              </div>
            </div>
            <div class="ui divider"></div>
            `
          }
          nestedHtml += "</div>"
          html += nestedHtml
          if (sourceLinks && source.includes(item.uuid)) {
            html += "<h3>Eléments Liés</h3>"
          }
        }
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

  }
  self.setSelected = setSelected
  self.getSelected = getSelected
  self.getParent = getParent
  self.updateData = updateData
  self.updateLinks = updateLinks
  self.updateMetaLinks = updateMetaLinks
  self.update = update
  return self
}
