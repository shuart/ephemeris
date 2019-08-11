function recordChangeInStore(type,store, group, pl){
  let uuid = pl.uuid
  if (type == "addItem") { //ADD ITEM
    store.history.items.push({
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
    store.history.items.push({
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
    store.history.items.push({
      uuid:genuuid(),
      id:uuid,
      storeGroup:group,
      prop:pl.prop,
      type:type,
      timestamp: Date.now(),
      change:pl
    })
  }
  if (type == "removeLink") { //REMOVE LINK
    let linksToRemove = []
    console.log(store[group]);
    if (pl.source && !pl.target) {
      linksToRemove =store[group].links.filter(i=> i.source == pl.source)
    }else if (pl.target && !pl.source) {
      linksToRemove =store[group].links.filter(i=> i.target == pl.target)
    }else if (pl.target && pl.source) {
      linksToRemove =store[group].links.filter(i=> (i.target == pl.target && i.source == pl.source))
    }

    for (var i = 0; i < linksToRemove.length; i++) {
      linksToRemove[i]
      store.history.items.push({
        uuid:genuuid(),
        id:linksToRemove[i].uuid,
        storeGroup:group,
        prop:pl.prop,
        type:type,
        timestamp: Date.now(),
        change:pl
      })
    }
  }
  if (type == "addLink") { //ADD Link
    store.history.items.push({
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
