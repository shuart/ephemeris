var createTableView = function ({
  originalData = "",
  container=".center-container",
  onClick = undefined,
  searchForAllItemsNames = false,
  maxElements = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;

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

  var theme={
    table:function () {
      return `
      <div class="example-table">
      </div>`
    },
    feed:function (events) {
      return `
      <div class="ui small feed">
        ${events}
      </div>`
    },
    event:function(event) {
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${(event.name && event.name!= "Missing item")? ("Item \'"+event.name + "\'" ): ("An item")} ${event.prop? (", property \'"+event.prop + "\', " ): ""} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${event.user?"by "+event.user+",":""} ${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>`
    },
    actionEvent:function(event) {//todo add separate theme for actions
      return `
      <div data-id="${event.id}" style='cursor:pointer' class="event action_event_feed_click_content">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div data-id="${event.id}" class="summary action_event_feed_click_content">
            ${event.name? ("Item \'"+event.name + "\'" ): ("An item")} in ${event.storeGroupTxt} has been ${event.typeTxt}.
            <div class="date">${event.user?"by "+event.user+",":""} ${moment(event.timestamp).fromNow()}</div>
          </div>
        </div>
      </div>`
    },
    noEvent:function() {
      return `
      <div class="event">
        <div class="label">
          <i class="small bullhorn icon"></i>
        </div>
        <div class="content">
          <div class="summary">
            No events or activity yet
          </div>
        </div>
      </div>`
    }
  }

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

  var render = async function () {
    if (container) {
      let html = theme.table()
      // let html = await renderFeed(originalData)
      // console.log(html);
      // console.log(container);
      document.querySelector(container).innerHTML=html
      // let data = await generateDataset()
      // console.log(store.currentPbs);
      generateTable({data:tabledata ,columns:tableCols})
    }else {

    }

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

  var generateTable = function ({
    data = [],
    columns=undefined
    }={}) {
      initData = data;
      initCols = columns;
    var table = new Tabulator(".example-table", {
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


  var update = function () {
    render()
  }

  var setData =function ({
    data = [],
    columns=undefined
    }={}) {
      tabledata = data;
      tableCols = columns;

    update()
  }
  var setActive =async function ({
    type = "Network"
    }={}) {
      let cat = type
      var store = await query.currentProject()
      console.log(store);
      console.log(store.categories);
      let catObject = store.categories.find(c=>c.name==type)
      console.log(catObject);
      let relatedNodes = store.metaLinks.filter(m=>m.target==catObject.uuid)
      let relatedNodesId = relatedNodes.map(rn=>rn.source)
      console.log(relatedNodesId);
      let nodes =  store.currentPbs.filter(n=>relatedNodesId.includes(n.uuid))
      console.log(nodes);
      let data = nodes.map(n=>{
        return {id:1, name:n.name, progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1}
      })
      console.log(data);
      let columns = [{title:"Name", field:"name", editor:"input"}]
      setData({data:data, columns:columns})
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}
var tableView = createTableView();
tableView.init();
