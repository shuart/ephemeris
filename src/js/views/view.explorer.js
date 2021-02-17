var createExplorerView = function ({
  originalData = "",
  container=".center-container",
  onClick = undefined,
  searchForAllItemsNames = false,
  maxElements = undefined
  }={}) {
  var self ={};
  var objectIsActive = false;
  var table = undefined
  var currentData = undefined

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
    connections()
    // render()
  }
  var connections =function () {
    document.addEventListener("storeUpdated", async function () {
      if (objectIsActive && currentData) {
        update(currentData)
      }
    })
  }

  var render =async function ({
    type = "Network",
    typeId = undefined
    }={}) {
      let cat = type
      var store = await query.currentProject()
      console.log(store);
      console.log(store.categories);
      console.log(typeId);
      let typeToDisplay = typeId
      if (!typeToDisplay) {
        let catObject = store.categories.find(c=>c.name==type)
        typeToDisplay = catObject.uuid
      }
      let relatedNodes = store.metaLinks.filter(m=>m.target==typeToDisplay)
      let relatedNodesId = relatedNodes.map(rn=>rn.source)
      console.log(relatedNodesId);
      let nodes =  store.currentPbs.filter(n=>relatedNodesId.includes(n.uuid))
      console.log(nodes);


      let data = nodes.map(n=>{
        return n
        // return {id:1, uuid:n.uuid, name:n.name, progress:12, gender:"male", rating:1, col:"red", dob:"19/02/1984", car:1}
      })
      console.log(data);
      let columns = [
        {formatter:'action', formatterParams:{name:"test"}, width:40, hozAlign:"center", cellClick:function(e, cell){alert("Printing row data for: " + cell.getRow().getData().name)}},
        {title:"Name", field:"name", editor:"modalInput"}
        // {title:"Name", field:"name", editor:"input"}
      ]

      //extraFields
      let fields = store.extraFields.filter(i=>i.target == typeToDisplay).map(e=> {
          return {title:e.name, field:e.uuid, editor:"modalInput"}
      })
      fields.forEach((item, i) => {
        columns.push(item)
      });

      let onUpdate  =function () {
        //alert("fesfef")
        //update({type,typeId, onUpdate:onUpdate})
      }

      //
      table = tableComp.create({data:data, columns:columns, onUpdate:onUpdate})
  }





  var update = function (data) {
    render(data)
  }

  // var setData =function ({
  //   data = [],
  //   columns=undefined
  //   }={}) {
  //     tabledata = data;
  //     tableCols = columns;
  //
  //   update()
  // }


  var setActive =function (data) {
    currentData = data||{}
    objectIsActive = true;
    update(data)
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
var explorerView = createExplorerView();
explorerView.init();
