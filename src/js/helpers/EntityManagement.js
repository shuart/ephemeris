var _entities = {}

_entities.drag = function(ev) {

}

_entities.add = async function ({
  name= undefined,
  categoryId= undefined,
  uuid = genuuid(),
  }={}) {
  
  if (!name) {
    var popup= await createPromptPopup({
      title:"Add a new item",
      iconHeader:"plus",
      fields:{ type:"input",id:"requirementName" ,label:"Item name", placeholder:"Set a name for the new item" }
    })
    var newReq = popup.result
    name = newReq
  }
  
  let id = uuid
  push(act.add("currentPbs",{uuid:id,name:name}))
  if (categoryId) {
    push(act.add("metaLinks",{source:id,target:categoryId,type:"category"}))
  }
  return {uuid:id,name:name}
}