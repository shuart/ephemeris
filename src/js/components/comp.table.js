var createTableComp = function ({
  originalData = "",
  // container=".center-container",
  onClick = undefined,
  searchForAllItemsNames = false,
  maxElements = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  let container = undefined;
  let targetClassId = undefined;

  var tabledata = [
    {id:1, name:"Oli Bob", progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1},
    {id:2, name:"Mary May", progress:1, gender:"female", rating:2, col:"blue", dob:"14/05/1982", car:true},
    {id:3, name:"Christine Lobowski", progress:42, gender:"female", rating:0, col:"green", dob:"22/05/1982", car:"true"},
    {id:4, name:"Brendon Philips", progress:100, gender:"male", rating:1, col:"orange", dob:"01/08/1980"},
    {id:5, name:"Margret Marmajuke", progress:16, gender:"female", rating:5, col:"yellow", dob:"31/01/1999"},
    {id:6, name:"Frank Harbours", progress:38, gender:"male", rating:4, col:"red", dob:"12/05/1966", car:1},
  ];
  var tableCols = [                 //define the table columns
      {title:"Name", field:"name", editor:"input"},
      {title:"Task Progress", field:"progress", hozAlign:"left", formatter:"progress", editor:true},
      {title:"Gender", field:"gender", width:95, editor:"select", editorParams:{values:["male", "female"]}},
      {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100, editor:true},
      {title:"Color", field:"col", width:130, editor:"input"},
      {title:"Date Of Birth", field:"dob", width:130, sorter:"date", hozAlign:"center"},
      {title:"Driver", field:"car", width:90,  hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true},
  ]

  var tableOnUpdate = undefined
  var tableMenu = undefined
  var currentTable = undefined

  var theme={
    table:function () {
      return `
      <div class="ephemeris-table">
        <div class="ephemeris-table-menu${targetClassId}"></div>
        <div class="example-table${targetClassId}"></div>
      </div>`
    },
    button:function (name, color) {
      return `
      <div style="display:inline-block;padding:0.2em 1.45em;margin:0.1em;border:0.15em solid #CCCCCC;box-sizing: border-box;text-decoration:none;
       font-family:'Segoe UI','Roboto',sans-serif;font-weight:400;color:#000000;background-color:#CCCCCC;text-align:center; position:relative;" class="tableListButton">
      ${name}
      </div>`
    },
    tag:function (name,id, color) {
      return `
      <div style="margin-bottom: 2px;cursor:pointer;" data-inverted="" data-id="${id}" data-tooltip="${name}   " class="ui mini teal label action_list_click_label">
      ${name}
      </div>`
    },
    menu:function () {
      return `
      <div style="margin-bottom: 8px;display: flex; align-items: center;width: 100%;background: #eee; padding: 10px;" class="bar">
        <div style="display:flex;" class="table_action_area"></div>
        <div style="width:300px" class="table_searchArea">
        </div>
      </div>`
    },
    search:function () {
      return `
        <div style="width:300px;" class="search">
          <input style="width: 100%; border: none;height:28px;" type="search" placeholder="search..." />
        </div>`
    }
  }


  var customFields = {}
  customFields.action = function(cell, formatterParams){ //plain text value
    // return "<i class='fa fa-print'></i>";
    return theme.button(formatterParams.name|| "action");
};

  customFields.relation = function(cell, formatterParams, onRendered ){ //plain text value
    // return "<i class='fa fa-print'></i>";
    // let list = formatterParams.relationList.map(r=>r.target).join(",")
    console.log(formatterParams.relationList);
    console.log(cell.getData());
    let listTarget = formatterParams.relationList.filter(r=>r.source==cell.getData().uuid).map(r=>r.target)
    console.log(cell.getRow());
    console.log(listTarget);
    console.log(formatterParams.relationTargets);
    let listObject = formatterParams.relationTargets.filter(t=>listTarget.includes(t.uuid))
    let html =''
    listObject.forEach((item, i) => {
      html+=theme.tag(item.name, item.uuid);
    });
    onRendered(function(){
      cell.getElement().style.whiteSpace='initial'
      console.log(cell.getElement());
    });

    return html;
  };

  var init = function () {
    // connections()
    // render()
  }
  var connections =function () {
    bind(".action_event_feed_click_content","click",(e)=>{
      console.log(e.target);
      if (onClick) {
        console.log('launchAction');
        onClick(e)
      }
    }, document.querySelector(container))
  }

  var updateData = function (data) {
    currentTable.replaceData(data)
  }

  var renderModalContainer =function () {
    let style=`
    position: fixed;left: 0;right: 0;background-color: #fafafa;padding: 0;max-height: 70%;width: 55%;margin: auto;overflow-y: auto;border-radius: 4px;box-shadow: 0 2px 4px 0 rgb(34 36 38 / 12%), 0 2px 10px 0 rgb(34 36 38 / 15%);
    `
    let htmlBlackBow =`
     <div style="opacity:0.5;position: fixed;z-index: 899;top: -25%;left: 0;bottom: 0;right: 0;height: 125%;width: 100%;background: #000;will-change: opacity;"></div>
    `
    let html = `
     <div id="modal1" class="" style="${style} z-index: 999; display: block; opacity: 1; top: 10%; transform: scaleX(1) scaleY(1);">
         <div style="padding:10px;" class="modalTableContent"></div>
         <div class="modal-footer">
           <a href="#!" class="action-modalTableContentClose">Disagree</a>
           <a href="#!" class="modal-close waves-effect waves-green btn-flat">Agree</a>
     </div>
    `
    let black = document.createElement("div");
    let modal = document.createElement("div");
    black.style.position="absolute";black.style.top=0;black.style.left=0;black.innerHTML=htmlBlackBow
    modal.style.position="absolute";modal.style.top=0;modal.style.left=0;modal.innerHTML=html
    modal.querySelector('.action-modalTableContentClose').addEventListener('click', function () {
      black.remove()
      modal.remove()
    })
    document.body.appendChild(black)
    document.body.appendChild(modal)
    return [black, modal]
  }

  var render = async function () {
    if (container) {
      let html = theme.table()
      console.log(container);
      // let html = await renderFeed(originalData)
      // console.log(html);
      // console.log(container);
      document.querySelector(container).innerHTML=html
      // let data = await generateDataset()
      // console.log(store.currentPbs);
      tableCols = addCustomformatters(tableCols)
      if (tableMenu) {
        generateMenu(tableMenu)
      }
      generateTable({data:tabledata ,columns:tableCols})
    }else {

    }
    updateStyle()//update table style

  }

  var addCustomformatters = function (cols) {
    cols.forEach((item, i) => {
      if (item.formatter) {
        if (item.formatter == "action") {
          item.formatter = customFields.action
          item.width= 100
        }
        if (item.formatter == "relation") {
          item.formatter = customFields.relation
          item.width= 100
        }

      }


      //editor
      if (item.editor) {
        if (item.editor == "modalInput") {
          item.cellClick = async function (e, cell) {
            var popup= await createPromptPopup({
              title:"Edit",
              iconHeader:"dolly",
              fields:{ type:"input",id:"producttName" ,label:"Product name", placeholder:"Set a name for the new product" }
            })
            var id = genuuid()
            var newReq = popup.result
            console.log(popup);
            if (newReq) {
              let target = cell.getRow().getData()
              push(act.edit("currentPbs", {uuid:target.uuid, prop:item.field,  value:newReq}))
              if (tableOnUpdate) {
                tableOnUpdate()
              }

            }
          }
        }
        if (item.editor == "modalRelation") {
          // item.cellClick = async function (e, cell) {
          //   var popup= await createPromptPopup({
          //     title:"Add Relation",
          //     iconHeader:"dolly",
          //     fields:{ type:"input",id:"producttName" ,label:"Product name", placeholder:"Set a name for the new product" }
          //   })
          //   var id = genuuid()
          //   var newReq = popup.result
          //   console.log(popup);
          //   if (newReq) {
          //     // let target = cell.getRow().getData()
          //     // push(act.edit("currentPbs", {uuid:target.uuid, prop:item.field,  value:newReq}))
          //     // if (tableOnUpdate) {
          //     //   tableOnUpdate()
          //     // }
          //
          //   }
          // }
        }

      }
    });

    return cols
  }

  // var generateDataset = async function () {
  //   var store = await query.currentProject()
  //   let entities = store.currentPbs;
  //
  //   let data = []
  //   for (var i = 0; i < entities.length; i++) {
  //     let e = entities[i]
  //     let row = {id:e.uuid, name:e.name, progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1}
  //     data.push(row)
  //   }
  //   return data
  // }

  var generateMenu =function (menu) {
    let target = document.querySelector('.ephemeris-table-menu'+targetClassId);
    target.innerHTML = theme.menu()
    let targetMenuAction = target.querySelector('.table_action_area');
    menu.forEach((item, i) => {
      if (item.type=="search") {
        targetMenuAction = target.querySelector('.table_searchArea');
        let element = document.createElement('div')
        element.innerHTML=theme.search()
        element.querySelector("input").addEventListener("keyup", function(e) {
          if (e.target.value!="") {
            getTable().setFilter([
                {field:"name", type:"like", value:e.target.value}
            ]);
          }else {
            getTable().clearFilter();
          }

        }, false);
        targetMenuAction.appendChild(element)
      }else if (item.type=="action") {
        let element = document.createElement('div')
        element.addEventListener("click", function(e) {
            item.onClick();
        }, false);
        element.style.width='100px'
        element.style.height='20px'
        element.innerHTML=item.name
        element.style.backgroundColor=item.color ||"red"
        targetMenuAction.appendChild(element)
      }

    });

  }

  var generateTable = function ({
    data = [],
    columns=undefined
    }={}) {
      initData = data;
      initCols = columns;
    currentTable = new Tabulator(".example-table"+targetClassId, {
      data:initData,           //load row data from array
      height:"811px",
      virtualDom:true,
      layout:"fitColumns",      //fit columns to width of table
      responsiveLayout:"hide",  //hide columns that dont fit on the table
      tooltips:true,            //show tool tips on cells
      addRowPos:"top",          //when adding a new row, add it to the top of the table
      history:true,             //allow undo and redo actions on the table
      movableColumns:true,      //allow column order to be changed
      resizableRows:true,       //allow row order to be changed
      initialSort:[             //set the initial sort order of the data
          {column:"name", dir:"asc"},
      ],
      columns:initCols,
    });
    // var table = new Tabulator(".example-table", {
    //   data:initData,           //load row data from array
    //   layout:"fitColumns",      //fit columns to width of table
    //   responsiveLayout:"hide",  //hide columns that dont fit on the table
    //   tooltips:true,            //show tool tips on cells
    //   addRowPos:"top",          //when adding a new row, add it to the top of the table
    //   history:true,             //allow undo and redo actions on the table
    //   pagination:"local",       //paginate the data
    //   paginationSize:50,         //allow 7 rows per page of data
    //   movableColumns:true,      //allow column order to be changed
    //   resizableRows:true,       //allow row order to be changed
    //   initialSort:[             //set the initial sort order of the data
    //       {column:"name", dir:"asc"},
    //   ],
    //   columns:[                 //define the table columns
    //       {title:"Name", field:"name", editor:"input"},
    //       {title:"Task Progress", field:"progress", hozAlign:"left", formatter:"progress", editor:true},
    //       {title:"Gender", field:"gender", width:95, editor:"select", editorParams:{values:["male", "female"]}},
    //       {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100, editor:true},
    //       {title:"Color", field:"col", width:130, editor:"input"},
    //       {title:"Date Of Birth", field:"dob", width:130, sorter:"date", hozAlign:"center"},
    //       {title:"Driver", field:"car", width:90,  hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true},
    //   ],
    // });
  }
  var updateStyle =function () {
    let elem = document.querySelector(".example-table"+targetClassId);
    elem.style.border ="1px solid rgb(241 241 241)"
  }
  var getTable = function () {
    return currentTable
  }


  var update = function () {
    render()
  }

  var create =function ({
    data = [],
    columns=undefined,
    onUpdate=undefined,
    menu=false,
    domElement=".center-container"
    }={}) {
      targetClassId = Date.now()
      tabledata = data;
      tableCols = columns;
      tableOnUpdate = onUpdate;
      tableMenu = menu;
      container = domElement;
      if (domElement=="modal") {
        let blackbox = renderModalContainer()
        container = '.modalTableContent'
      }

    update()
    return self
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  // self.setActive = setActive
  // self.setInactive = setInactive
  self.create = create
  self.update = update
  self.updateData = updateData
  self.init = init

  return self
}
var tableComp = createTableComp();
tableComp.init();
