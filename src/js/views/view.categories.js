var createCategoriesView = function () {
  var self ={};
  var objectIsActive = false;
  var currentVisibleList= undefined;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var updateList =  function () {
    setTimeout(async function () {
      var store = await query.currentProject()
      ephHelpers.updateListElements(currentVisibleList,{
        items:store.categories
      })
    }, 1500);
  }

  var render = async function () {
    var store = await query.currentProject()
    currentVisibleList= showListMenu({
      sourceData:store.categories,
      displayProp:"name",
      // targetDomContainer:".center-container",
      // fullScreen:true,// TODO: perhaps not full screen?
      display:[
        {prop:"name", displayAs:"Name", edit:"true"},
        {prop:"color", displayAs:"Color", color:true, edit:true},
        {prop:"svgPath", displayAs:"Path", fullText:true,edit:"true"}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        let edit = true;
        if (ev.target.dataset.prop=="svgPath") {
          edit = confirm('Categories icons are SVG path. You can edit theme with an SVG editor, or add new one. Modifying the existing paths without replacing theme with a proper new one could make your icon to disapear in the relations view. Do you want to edit the category path?')
        }
        if (edit) {
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            push(act.edit("categories", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          }
        }
        updateList()

      },
      onEditColorItem: (ev)=>{
        if (ev.color && ev.color.hex) {
          push(act.edit("categories", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:(ev.color.hex+"").slice(0,-2)}))
        }
        updateList()
      },
      onRemoveColorItem: (ev)=>{
          push(act.edit("categories", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:undefined}))
          updateList()
      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("categories",{uuid:ev.target.dataset.id}))
          updateList()
        }
      },
      onAdd: (ev)=>{
        let catName = prompt("New Category")
        push(act.add("categories",{uuid:genuuid(), name:catName, svgPath:undefined}))
        updateList()
      },
      onClick: (ev)=>{
        //mutations
        pageManager.setActivePage("explorerView", {typeId:ev.target.dataset.id})
        categoryEditorView.update(ev.target.dataset.id)
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      }
    })
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    currentVisibleList = undefined
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var categoriesView = createCategoriesView()
categoriesView.init()
