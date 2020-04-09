function recordChangeInStore(type,store, group, pl){
  let record = false;
  if (record != false) {
    let uuid = pl.uuid
    let projectUuid = app.state.currentProject
    if (type == "addItem") { //ADD ITEM

      dbConnector.addProjectItem(projectUuid, "history",{
        uuid:genuuid(),
        id:uuid,
        storeGroup:group,
        prop:pl.prop,
        type:type,
        timestamp: Date.now(),
        change:pl
      })
    }
    if (type == "removeItem") { //REMOVE ITEM
      dbConnector.addProjectItem(projectUuid, "history",{
        uuid:genuuid(),
        id:uuid,
        storeGroup:group,
        prop:pl.prop,
        type:type,
        timestamp: Date.now(),
        change:pl
      })
    }
    if (type == "modifyItem") { //MODIFY ITEM
      dbConnector.addProjectItem(projectUuid, "history",{
        uuid:genuuid(),
        id:uuid,
        storeGroup:group,
        prop:pl.prop,
        type:type,
        timestamp: Date.now(),
        change:pl
      })
    }
    // if (type == "removeLink") { //REMOVE LINK
    //   let storeGroup = undefined
    //   if (typeof group == "string") {
    //     storeGroup = store[group];
    //   }else if (Array.isArray(group)) {
    //     storeGroup = store
    //     for (prop of group) {
    //       console.log(store);
    //       storeGroup = storeGroup[prop]
    //       console.log(storeGroup);
    //     }
    //   }
    //   let linksToRemove = []
    //   console.log(storeGroup);
    //   if (pl.source && !pl.target) {
    //     linksToRemove =storeGroup.links.filter(i=> i.source == pl.source)
    //   }else if (pl.target && !pl.source) {
    //     linksToRemove =storeGroup.links.filter(i=> i.target == pl.target)
    //   }else if (pl.target && pl.source) {
    //     linksToRemove =storeGroup.links.filter(i=> (i.target == pl.target && i.source == pl.source))
    //   }
    //
    //   for (var i = 0; i < linksToRemove.length; i++) {
    //     linksToRemove[i]
    //     dbConnector.addProjectItem(projectUuid, "history",{
    //       uuid:genuuid(),
    //       id:linksToRemove[i].uuid,
    //       storeGroup:group,
    //       prop:pl.prop,
    //       type:type,
    //       timestamp: Date.now(),
    //       change:pl
    //     })
    //   }
    // } DBCHANGE
    if (type == "addLink") { //ADD Link
      dbConnector.addProjectItem(projectUuid, "history",{
        uuid:genuuid(),
        id:uuid,
        storeGroup:group,
        prop:pl.prop,
        type:type,
        timestamp: Date.now(),
        change:pl
      })
    }
  }

}
