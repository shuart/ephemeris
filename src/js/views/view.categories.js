var createCategoriesView = function () {
  var self ={};
  var objectIsActive = false;
  var currentVisibleList= undefined;
  let table=undefined

  var init = function () {
    connections()

  }
  var connections =function () {

  }

  var updateList =  function () {
    setTimeout(async function () {
      var store = await query.currentProject()
      table.updateData(store.categories)
    }, 1200);
  }

  var render = async function () {
    var store = await query.currentProject()
    renderTable(store)
  }

  var renderTable = function (store) {
    let defaultIcon = "M294.2 277.7c18 5 34.7 13.4 49.5 24.7l161.5-53.8c8.4-2.8 12.9-11.9 10.1-20.2L454.9 47.2c-2.8-8.4-11.9-12.9-20.2-10.1l-61.1 20.4 33.1 99.4L346 177l-33.1-99.4-61.6 20.5c-8.4 2.8-12.9 11.9-10.1 20.2l53 159.4zm281 48.7L565 296c-2.8-8.4-11.9-12.9-20.2-10.1l-213.5 71.2c-17.2-22-43.6-36.4-73.5-37L158.4 21.9C154 8.8 141.8 0 128 0H16C7.2 0 0 7.2 0 16v32c0 8.8 7.2 16 16 16h88.9l92.2 276.7c-26.1 20.4-41.7 53.6-36 90.5 6.1 39.4 37.9 72.3 77.3 79.2 60.2 10.7 112.3-34.8 113.4-92.6l213.3-71.2c8.3-2.8 12.9-11.8 10.1-20.2zM256 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"

    let data= store.categories
    let columns = [
      // {formatter:'action', formatterParams:{name:"test"}, width:40, hozAlign:"center", cellClick:function(e, cell){alert("Printing row data for: " + cell.getRow().getData().name)}},
      {title:"Name", field:"name", editor:"modalInput"},
      {
        title:"Color",
        field:"color",
        formatter:"colorTag",
        editor:"colorPicker",
        editorParams:{
          onChange:function (target, color) {
            push(act.edit("categories", {uuid:target, prop:"color", value:(color.hex+"").slice(0,-2)}))
          }
        }
      },
      {title:"SVG", field:"svgPath", editor:"modalInput"},
      {
        formatter:'remove',
        cellClick:function(e, cell){
          console.log(e.target.dataset.id);
          if (confirm("remove item ?")) {
            push(act.remove("categories",{uuid:e.target.dataset.id}))
          }
        }
      },
    ]

    let addAction = function () {
      let catName = prompt("New Category")
      push(act.add("categories",{uuid:genuuid(), name:catName, svgPath:defaultIcon}))
    }
    let menutest = [
      {type:'action', name:"Add", color:"grey", onClick:e=>{addAction()}},
      {type:'action', name:"Add", color:"grey"},
      {type:'search', name:"Add", color:"grey"}
    ]
    table = tableComp.create({onUpdate:e=>{updateList()},domElement:"modal", data:data, columns:columns, menu:menutest})

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
