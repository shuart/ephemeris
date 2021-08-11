var createLocalPlanningView = function () {
  var self ={};
  var objectIsActive = false;
  var currentVisibleList= undefined;
  let table=undefined
  let parentItemId = undefined

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
      table.getTableCustomAreaElem().innerHTML="fesfses"
      renderGantt(table.getTableCustomAreaElem(), data)
    }, 1200);
  }

  var render = async function () {
    var store = await query.currentProject()
    renderTable(store)
  }

  var prepareData = function (store) {
    let dic = {}
    let data = []
    for (var i = 0; i < store.actions.length; i++) {
      let act = store.actions[i]
      dic[act.uuid] = act
      if (act.parentItem ==  parentItemId) {
        data.push(act)
      }

    }
    // for (var i = 0; i < store.actions.length; i++) {
    //   let cat = store.actions[i]
    //   if (cat.parentCat) {
    //     cat.parentCatName = [ dic[cat.parentCat] ]
    //     if (!dic[cat.parentCat]._children) {dic[cat.parentCat]._children =[]}
    //     dic[cat.parentCat]._children.push(cat)
    //   }else {
    //     cat.parentCatName = [ ]//needed so tag formater can go trough the empty array
    //     data.push(cat)
    //   }
    // }
    return data
  }

  var renderGantt = function (domElement, data) {
    var formattedData = []
    for (var i = 0; i < data.length; i++) {
      let action = {id: i+1, content: data[i].name, start: data[i].startTime|| Date.now(), end:data[i].endTime}
      formattedData.push(action)
    }
    console.log(formattedData);
    domElement.innerHTML=""
    //Create a DataSet (allows two way data-binding)
    // let dataTemp =[
    //   {id: 1, content: 'item 1', start: '2014-04-20'},
    //   {id: 2, content: 'item 2', start: '2014-04-14'},
    //   {id: 3, content: 'item 3', start: '2014-04-18'},
    //   {id: 4, content: 'item 4', start: '2014-04-16', end: '2014-04-19'},
    //   {id: 5, content: 'item 5', start: '2014-04-25'},
    //   {id: 6, content: 'item 6', start: '2014-04-27', type: 'point'}
    // ]
    var items = new vis.DataSet(formattedData);
    // Configuration for the Timeline
    var options = {};
    // Create a Timeline
    timeline = new vis.Timeline(domElement, items, options);
    // timeline.setItems(dataTemp)
  }

  var renderTable = function (store) {
    let defaultIcon = "M294.2 277.7c18 5 34.7 13.4 49.5 24.7l161.5-53.8c8.4-2.8 12.9-11.9 10.1-20.2L454.9 47.2c-2.8-8.4-11.9-12.9-20.2-10.1l-61.1 20.4 33.1 99.4L346 177l-33.1-99.4-61.6 20.5c-8.4 2.8-12.9 11.9-10.1 20.2l53 159.4zm281 48.7L565 296c-2.8-8.4-11.9-12.9-20.2-10.1l-213.5 71.2c-17.2-22-43.6-36.4-73.5-37L158.4 21.9C154 8.8 141.8 0 128 0H16C7.2 0 0 7.2 0 16v32c0 8.8 7.2 16 16 16h88.9l92.2 276.7c-26.1 20.4-41.7 53.6-36 90.5 6.1 39.4 37.9 72.3 77.3 79.2 60.2 10.7 112.3-34.8 113.4-92.6l213.3-71.2c8.3-2.8 12.9-11.8 10.1-20.2zM256 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"

    let data= prepareData(store)
    let columns = [
      // {formatter:'action', formatterParams:{name:"Edit"}, width:40, hozAlign:"center", cellClick:function(e, cell){categoryEditorView.update(cell.getRow().getData().uuid)}},
      {title:"Name", field:"name", editor:"modalInput",
        editorParams:{
          onChange:function (target, value) {
            push(act.edit("actions", {uuid:target, prop:"name", value:value}))
          }
        }
      },
      {title:"Start Date", field:"startTime", editor:"timePicker", formatter:'time',
        editorParams:{
          onChange:function (uuid, prop, value) {
            push(act.edit("actions", {uuid:uuid, prop:prop, value:value}))
          }
        }
      },
      {title:"End Date", field:"endTime", editor:"timePicker", formatter:'time',
        editorParams:{
          onChange:function (uuid, prop, value) {
            push(act.edit("actions", {uuid:uuid, prop:prop, value:value}))
          }
        }
      },
      {title:"Value", field:"charge", editor:"modalInput",
        editorParams:{
          onChange:function (target, value) {
            push(act.edit("actions", {uuid:target, prop:"charge", value:value}))
          }
        }
      },
      // {
      //   title:"Color",
      //   field:"color",
      //   formatter:"colorTag",
      //   editor:"colorPicker",
      //   editorParams:{
      //     onChange:function (target, color) {
      //       push(act.edit("categories", {uuid:target, prop:"color", value:(color.hex+"").slice(0,-2)}))
      //     }
      //   }
      // },
      // {title:"Parent", field:"parentCatName",  formatter:"tags", cellClick:function (e,cell) {
      //     console.log(cell);
      //     let selectOptions = store.categories.map(c=> ({name:c.name, value:c.uuid}))
      //     var popup=  createPromptPopup({
      //       title:"Parent",
      //       callback :function (res) {
      //         console.log(res);
      //         if (res.result == "") {
      //         }else {
      //           push(act.edit("categories", {uuid:cell.getRow().getData().uuid, prop:"parentCat", value:res.result}))
      //           updateList()
      //         }
      //       },
      //       fields:[
      //         { type:"selection",id:"targetIcon",preSelected:[],maxSelectable:1, selectOptions:selectOptions, label:"Select an Parent", placeholder:"Set linkable categories" },
      //       ]
      //     })
      //   }
      // },
      {
        formatter:'remove',
        cellClick:function(e, cell){
          console.log(e.target.dataset.id);
          if (confirm("remove item ?")) {
            push(act.remove("actions",{uuid:e.target.dataset.id}))
          }
        }
      },
    ]

    let addAction = function () {
      let catName = prompt("New Action")
      push(act.add("actions",{uuid:genuuid(), name:catName, parentItem:parentItemId}))
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

  var update = function (parent) {
    parentItemId = parent
    //alert(parent)
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

var localPlanningView = createLocalPlanningView()
localPlanningView.init()
