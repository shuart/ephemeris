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
  if (type == "removeItem") { //ADD ITEM
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
  if (type == "modifyItem") { //ADD ITEM
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
