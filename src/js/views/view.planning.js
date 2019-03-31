var createPlanningView = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {
    //  ganttView= createGanttView({
    //   targetSelector:".center-container",
    //   onConnect:(data)=>{
    //     push(addPlanningLink({source:data.origin, target:data.target}))
    //   }
    // });
    // ganttView.init();

    connections()
    //update()

  }
  var connections =function () {

  }

  var render = function () {
      ShowSelectMenu({
        sourceData:store.plannings.items[0].items,
        sourceLinks:store.plannings.items[0].links,
        targetDomContainer:".center-container",
        fullScreen:true,
        displayProp:"name",
        display:[
          {prop:"name", displayAs:"name", edit:"true"},
          {prop:"desc", displayAs:"Description", edit:"true"},
          {prop:"start", displayAs:"Début", edit:"true", time:true},
          {prop:"duration", displayAs:"Durée", edit:"true"}
        ],
        idProp:"uuid",
        onEditItem: (ev)=>{
          console.log("Edit");
          var newValue = prompt("Edit Item",ev.target.dataset.value)
          if (newValue) {
            push(editPlanning({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:newValue}))
          }

        },
        onEditItemTime: (ev)=>{
          push(editPlanning({uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.valueAsDate}))
          console.log(ev.target.valueAsDate);
        },
        onRemove: (ev)=>{
          console.log("remove");
          if (confirm("remove item ?")) {
            push(removePlanningItem({uuid:ev.target.dataset.id}))
            ev.select.updateData(store.plannings.items[0].items)
          }
        },
        onMove: (ev)=>{
          console.log("move");
          if (confirm("move item ?")) {
            push(movePlanning({origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
            //update links if needed
            push(removePlanningLink({target:ev.originTarget.dataset.id}))
            if (ev.targetParentId && ev.targetParentId != "undefined") {
              push(addPlanningLink({source:ev.targetParentId, target:ev.originTarget.dataset.id}))
            }
            ev.select.updateData(store.plannings.items[0].items)
            ev.select.updateLinks(store.plannings.items[0].links)
          }
        },
        onAdd: (ev)=>{
          var newReq = prompt("Nouveau Besoin")
          push(addPlanningItem({name:newReq, duration:1}))
        },
        onClick: (ev)=>{
        },
        onClear: (ev)=>{
          renderCDC()
        },
        extraActions:[
          {
            name:"Diagramme",
            action:(ev)=>{
              loadTree(store.plannings.items[0],(flat) => {
                console.log(ev);
                console.log(store.plannings.items[0].items);
                store.plannings.items[0] = flat
                ev.select.updateData(store.plannings.items[0].items)
                ev.select.updateLinks(store.plannings.items[0].links)
                ev.select.update()
              })
            }
          },
          {
            name:"Gantt",
            action:(ev)=>{
              ganttView.show({
                items:store.plannings.items[0].items,
                links:store.plannings.items[0].links,
                onConnect: (e)=>{
                  push(addPlanningLink({source:e.origin, target:e.target}))
                  ev.select.updateData(store.plannings.items[0].items)
                  ev.select.updateLinks(store.plannings.items[0].links)
                  ganttView.updateCurrentData(store.plannings.items[0].items,store.plannings.items[0].links)
                  ev.select.update()
                },
                onLinkClickedAction: (e)=>{
                  push(removePlanningLink({source:e.origin, target:e.target}))
                  ev.select.updateData(store.plannings.items[0].items)
                  ev.select.updateLinks(store.plannings.items[0].links)
                  ganttView.updateCurrentData(store.plannings.items[0].items,store.plannings.items[0].links)
                  ev.select.update()
                },
                onChangeLengthAction: (e)=>{
                  var citem = store.plannings.items[0].items.filter(el=>el.uuid == e.target)
                  var startDate = citem.startDate || moment().toDate();
                  var a = moment(e.endDate);
                  var b = moment(startDate);
                  var dayDiff = a.diff(b, 'days')
                  console.log({uuid:e.target, prop:"duration", value:dayDiff});
                  push(editPlanning({uuid:e.target, prop:"duration", value:dayDiff}))
                  ev.select.updateData(store.plannings.items[0].items)
                  ev.select.updateLinks(store.plannings.items[0].links)
                  ganttView.updateCurrentData(store.plannings.items[0].items,store.plannings.items[0].links)
                  ev.select.update()
                }
              })
            }
          }
        ]
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

var planningView = createPlanningView()
planningView.init()
