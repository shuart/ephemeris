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
