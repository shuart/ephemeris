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
      let data = prepareData(store)
      table.updateData(data)
    }, 1200);
  }

  var render = async function () {
    var store = await query.currentProject()
    renderTable(store)
  }

  var prepareData = function (store) {
    let dic = {}
    let data = []
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      dic[cat.uuid] = cat

    }
    for (var i = 0; i < store.categories.length; i++) {
      let cat = store.categories[i]
      if (cat.parentCat) {
        cat.parentCatName = [ dic[cat.parentCat] ]
        if (!dic[cat.parentCat]._children) {dic[cat.parentCat]._children =[]}
        dic[cat.parentCat]._children.push(cat)
      }else {
        cat.parentCatName = [ ]//needed so tag formater can go trough the empty array
        data.push(cat)
      }
    }
    return data
  }

  var renderTable = function (store) {
    let defaultIcon = "M294.2 277.7c18 5 34.7 13.4 49.5 24.7l161.5-53.8c8.4-2.8 12.9-11.9 10.1-20.2L454.9 47.2c-2.8-8.4-11.9-12.9-20.2-10.1l-61.1 20.4 33.1 99.4L346 177l-33.1-99.4-61.6 20.5c-8.4 2.8-12.9 11.9-10.1 20.2l53 159.4zm281 48.7L565 296c-2.8-8.4-11.9-12.9-20.2-10.1l-213.5 71.2c-17.2-22-43.6-36.4-73.5-37L158.4 21.9C154 8.8 141.8 0 128 0H16C7.2 0 0 7.2 0 16v32c0 8.8 7.2 16 16 16h88.9l92.2 276.7c-26.1 20.4-41.7 53.6-36 90.5 6.1 39.4 37.9 72.3 77.3 79.2 60.2 10.7 112.3-34.8 113.4-92.6l213.3-71.2c8.3-2.8 12.9-11.8 10.1-20.2zM256 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"

    let data= prepareData(store)
    let columns = [
      {formatter:'action', formatterParams:{name:"Edit"}, width:40, hozAlign:"center", cellClick:function(e, cell){categoryEditorView.update(cell.getRow().getData().uuid)}},
      {title:"Name", field:"name", editor:"modalInput",
        editorParams:{
          onChange:function (target, value) {
            push(act.edit("categories", {uuid:target, prop:"name", value:value}))
          }
        }
      },
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
      {
        title:"SVG",
        formatter:"svgPath",
        field:"svgPath",
        cellClick:function (e,cell) {
            let selectOptions = []
            let svgListKeys = Object.keys(listOptionsSVG)
            for (var i = 0; i < svgListKeys.length; i++) {
              selectOptions.push(  {name:svgListKeys[i], svgPath:listOptionsSVG[svgListKeys[i]], value:listOptionsSVG[svgListKeys[i]]})
            }
            var popup=  createPromptPopup({
              title:"Select an Icon",
              callback :function (res) {
                console.log(res);
                if (res.result == "") {
                }else {
                  push(act.edit("categories", {uuid:e.target.dataset.id, prop:"svgPath", value:res.result}))
                  updateList()
                }
              },
              fields:[
                { type:"selection",id:"targetIcon",preSelected:[],selectOptions:selectOptions, label:"Select an Icon", placeholder:"Set linkable categories" }
              ]
            })
        }
      },
      {title:"Parent", field:"parentCatName",  formatter:"tags", cellClick:function (e,cell) {
          console.log(cell);
          let selectOptions = store.categories.map(c=> ({name:c.name, value:c.uuid}))
          var popup=  createPromptPopup({
            title:"Parent",
            callback :function (res) {
              console.log(res);
              if (res.result == "") {
              }else {
                push(act.edit("categories", {uuid:cell.getRow().getData().uuid, prop:"parentCat", value:res.result}))
                updateList()
              }
            },
            fields:[
              { type:"selection",id:"targetIcon",preSelected:[],maxSelectable:1, selectOptions:selectOptions, label:"Select an Parent", placeholder:"Set linkable categories" },
            ]
          })
        }
      },
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
    let editAction = function () {
      categoryEditorView.update(ev.target.dataset.id)
    }
    let menutest = [
      {type:'action', name:"Add", color:"#29b5ad", onClick:e=>{addAction()}},
      {type:'action', name:"Add", color:"grey"},
      {type:'search', name:"Add", color:"grey"}
    ]
    tableComp = createTableComp()
    table = tableComp.create({onUpdate:e=>{updateList()},dataTree:true,domElement:"modal", data:data, columns:columns, menu:menutest})

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
