var createCategoriesView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var render = function () {
    var store = query.currentProject()
    showListMenu({
      sourceData:store.categories.items,
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

      },
      onEditColorItem: (ev)=>{
        if (ev.color && ev.color.hex) {
          push(act.edit("categories", {uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:(ev.color.hex+"").slice(0,-2)}))
        }

      },
      onRemove: (ev)=>{
        if (confirm("remove item ?")) {
          push(act.remove("categories",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.categories.items)
        }
      },
      onAdd: (ev)=>{
        let catName = prompt("New Category")
        push(act.add("categories",{uuid:genuuid(), name:catName, svgPath:"M560 448h-16V96H32v352H16.02c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16H176c8.84 0 16-7.16 16-16V320c0-53.02 42.98-96 96-96s96 42.98 96 96l.02 160v16c0 8.84 7.16 16 16 16H560c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm0-448H16C7.16 0 0 7.16 0 16v32c0 8.84 7.16 16 16 16h544c8.84 0 16-7.16 16-16V16c0-8.84-7.16-16-16-16z"}))
      },
      onClick: (ev)=>{
        //mutations
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
