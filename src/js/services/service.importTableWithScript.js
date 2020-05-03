var createImportTableWithScriptService = function (collectionName) {
  importCSVfromFileSelector(async function(results) {
    let startImport = true
    if (startImport) {

      // if (confirm("Use a custom importFuntion?")) {
      if (true) {
        let defaultFunc = `
        //This script will import the first column of each row as the name of an item, and the second as the description. Press ok or customize the import function.

        let rows = api.getImportedData();

        rows.forEach(function(r, index){

          let id= api.getId();
          let item = {uuid:id,name:r[0], desc:r[1]};
          if (item.name !=""){
            api.addItem(item);
          }
        });
        api.addToEphemeris()
        `
        // let importFunction = prompt("import function")
        var popup= await createPromptPopup({
          title:"Import "+results.data.length+" elements",
          iconHeader:"file download",
          fields:{ type:"textArea",id:"customFunc" ,label:"Function", value:defaultFunc, placeholder:"Write your custom function" }
        })
        let importFunction = popup.result
        console.log(importFunction);
        var preview = {items:[],links:[]}

        function addItem (data) {
          var id = genuuid()
          // push(act.add("currentPbs", {uuid:data.uuid,name:data.name,desc:data.desc}))
          // push(addPbsLink({source:store.currentPbs.items[0].uuid, target:id}))
          preview.items.push({uuid:data.uuid,name:data.name,desc:data.desc})
          return id
        }
        var addLink = function (data) {
          var id = genuuid()
          // push(addPbsLink({source:data.source, target:data.target}))
          preview.links.push({source:data.source, target:data.target})
          return id
        }
        var message = function (data) {
          alert(data.message)
        }
        var getImportedData = function () {
          return results.data
        }
        var getId = function () {
          return genuuid()
        }

        var showPreview = function () {
          currentVisibleList = showListMenu({
            sourceData:preview.items,
            sourceLinks:preview.links,
            displayProp:"name",
            display: [{prop:"name", displayAs:"Name", edit:"true"}],
            idProp:"uuid"
          })
        }

        var addToEphemeris = async function (inputOptions) {
          let options = inputOptions || {}
          let addMode = options.mode || "batch"

          if (addMode == "batch") {
            var store = await query.currentProject()

            // if (collectionName =="currentPbs") {
            //   //find all object
            // }
            let i = store[collectionName].items.concat(preview.items)
            let l = store[collectionName].links.concat(preview.links)
            let newCollection= {items:i, links:l}

            push(act.replaceCollection(collectionName, newCollection))


            // push(act.replaceCollectionLinks("currentPbs", l))
          }else {
            var store = await query.currentProject()
            preview.items.forEach(i=>{
              push(act.add(collectionName, i))
            })
            preview.links.forEach(l=>{
              push(addPbsLink(l))
            })
          }

        }

        let localApi ={
          preview,
          addItem,
          addLink,
          message,
          getId,
          getImportedData,
          showPreview,
          addToEphemeris
        }

        let importer = new Function('api', '"use strict";' + importFunction);

        console.log(importer(localApi));
        // var looseJsonParse = function(obj){
        //     // return Function('"use strict";return (' + obj + ')')()(getImportedData,addItem,addLink,message);
        //     return Function('api','"use strict";return (' + obj + ')')();
        // }
        // console.log(
        //   looseJsonParse(
        //    // "{a:(4-1), b:function(){}, c:new Date()}"
        //    importFunction
        //   )
        // )

      }else {
        for (importedElement of results.data) {
          var id = genuuid()
          push(act.add(collectionName, {uuid:id,name:importedElement[0],desc:importedElement[1]}))
          push(addPbsLink({source:store.currentPbs.items[0].uuid, target:id}))
        }
      }
      // alert("Close and re-open the view to complete the import")
    }
  })

}
