var reparse = false;


//INIT menu
// $('.ui.dropdown')
//   .dropdown()
// ;


  //CHECK if reparsing is needed

  if (reparse) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            // The request is done; did it work?
            if (xhr.status == 200) {
              console.log(xhr.responseText);
                // ***Yes, use `xhr.responseText` here***
            } else {
                // ***No, tell the callback the call failed***
                console.log('failed');
                console.log(xhr.responseText);
                var fragment = document.createDocumentFragment()
                var div = document.createElement("div")
                div.classList ="original"
                div.innerHTML = xhr.responseText.replace(/<\/?span[^>]*>/g,"");
                //div.innerHTML = xhr.responseText.replace(/(<[^>]+) style=".*?"/i,"");
                fragment.appendChild(div)
                // fragment.querySelector('span').forEach(spanElmt => {
                //   spanElmt.outerHTML = spanElmt.innerHTML;
                // });
                loopParser(fragment.querySelector(".original"));
                console.log(fragment);
              }
        }
    };
    xhr.open("GET", "./csc.txt");
    xhr.send();
    //var fragment = document.createDocumentFragment()
    //loopParser(document.querySelector(".original"));
  }else {
    //console.log(textDB);
    //app.cscDB.db = textDB
  }

  //Set up page Manager

  pageManager.addComponent({name:"projects",object:projectsView,haveSideBar:false})
  pageManager.addComponent({name:"csc",object:cscViewer})
  pageManager.addComponent({name:"overview",object:overview,haveSideBar:false})
  pageManager.addComponent({name:"requirements",object:requirementsView, haveSideBar:false})
  pageManager.addComponent({name:"functions",object:functionsView, haveSideBar:false})
  pageManager.addComponent({name:"planning",object:planningView, haveSideBar:false})
  pageManager.addComponent({name:"pbs",object:pbsView, haveSideBar:false})
  pageManager.addComponent({name:"interfaces",object:interfacesView, haveSideBar:false})
  pageManager.addComponent({name:"relations",object:relationsView, haveSideBar:false})
  pageManager.addComponent({name:"unified",object:unifiedView, haveSideBar:false})
  pageManager.addComponent({name:"externalUsersManagement",object:externalUsersManagement, haveSideBar:false})
  pageManager.addComponent({name:"exportProjectInfo",object:exportProjectInfoView, haveSideBar:false})

  function renderCDC(db, filter) {
    leftMenu.update() //TODO remove and centralize
    cscViewer.update() //TODO remove and centralize

  }


  //==========CONNECT

  connect(".action_toogle_projects","click",(e)=>{
    pageManager.setActivePage("projects")
  })
  connect(".action_toogle_overview","click",(e)=>{
    pageManager.setActivePage("overview")
  })
  connect(".action_toogle_csc","click",(e)=>{
    pageManager.setActivePage("csc")
  })
  connect(".action_toogle_requirements_view","click",(e)=>{
    pageManager.setActivePage("requirements")
  })
  connect(".action_toogle_functions_view","click",(e)=>{
    pageManager.setActivePage("functions")
  })
  connect(".action_toogle_planning_view","click",(e)=>{
    pageManager.setActivePage("planning")
  })
  connect(".action_toogle_tree_pbs","click",(e)=>{
    pageManager.setActivePage("pbs")
  })
  connect(".action_toogle_diag_interfaces","click",(e)=>{
    pageManager.setActivePage("interfaces")
  })
  connect(".action_toogle_diag_relations","click",(e)=>{
    pageManager.setActivePage("relations")
  })
  connect(".action_toogle_unified","click",(e)=>{
    pageManager.setActivePage("unified")
  })
  connect(".action_toogle_external_users_management","click",(e)=>{
    pageManager.setActivePage("externalUsersManagement")
  })
  connect(".action_toogle_export_Project_informations","click",(e)=>{
    pageManager.setActivePage("exportProjectInfo")
  })


  connect(".action_toogle_stakeholders","click",(e)=>{
    //e.target.dataset.id
    var store = query.currentProject()
    ShowSelectMenu({
      sourceData:store.stakeholders.items,
      displayProp:"name",
      display:[
        {prop:"name", displayAs:"Prénom", edit:"true"},
        {prop:"lastName", displayAs:"Nom", edit:"true"},
        {prop:"org", displayAs:"Entreprise", edit:"true"},
        {prop:"role", displayAs:"Fonction", edit:"true"},
        {prop:"mail", displayAs:"E-mail", edit:"true"}
      ],
      idProp:"uuid",
      onEditItem: (ev)=>{
        console.log("Edit");
        console.log(ev.target.dataset.id);
        var newValue = prompt("Edit Item",ev.target.dataset.value)
        if (newValue) {
          var item = store.stakeholders.items.filter((item)=>item.uuid == ev.target.dataset.id)
          console.log(item);
          console.log(item[0][ev.target.dataset.prop]);
          item[0][ev.target.dataset.prop] = newValue
        }

      },
      onRemove: (ev)=>{
        console.log("remove");
        if (confirm("remove item ?")) {
          push(act.remove("stakeholders",{uuid:ev.target.dataset.id}))
          ev.select.updateData(store.stakeholders.items)
        }
      },
      onAdd: (ev)=>{
        var newReq = prompt("Nouveau Participant")
        push(act.add("stakeholders",{uuid:genuuid(), name:newReq}))
      },
      onClick: (ev)=>{
        //mutations
        // store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        // console.log(ev.target);
        // store.metaLinks.push({source:ev.target.dataset.id , target:e.target.dataset.id})
        // ev.selectDiv.remove()
        // renderCDC(store.db, searchFilter)
      },
      onClear: (ev)=>{
        //mutations
        //store.metaLinks = store.metaLinks.filter((i)=>i.target != e.target.dataset.id)
        //ev.selectDiv.remove()
        renderCDC()
      }
    })
  })


  connect(".action_toogle_tree","click",(e)=>{
    //var tree = renderDTree(store.db)
    //console.log(tree);
    displayThree({data:renderDTree(app.cscDB.db), startCollapsed:true})

  })

  function loadTree(itemsSource, callback) {
      if (document.querySelector("#pbs-container").style.display == "none") {
        document.querySelector("#pbs-container").innerHTML =""
        var placeholder = false
        var data =undefined
        if (itemsSource.items[0]) {
          var targets = itemsSource.links.map(item => item.target)
          var roots = itemsSource.items.filter(item => !targets.includes(item.uuid))
          if (roots && roots[1]) {//if more than one root node
            placeholder = true
            var newData = itemsSource.items.slice()
            var newLinks = itemsSource.links.slice()
            newData.push({uuid:"placeholder", name:"placeholder"})
            for (root of roots) {
              newLinks.push({source:"placeholder", target:root.uuid})
            }
            data = hierarchiesList(newData, newLinks)[0]
          }else {
            data = hierarchiesList(itemsSource.items, itemsSource.links)[0]
          }
          console.log(data);
        }
        displayThree({
          data:data,
          edit:true,
          onClose:(e)=>{
            console.log("beau tree", e.data);
            var flat = flattenChildArray([e.data], "children")
            console.log(flat);
            if (placeholder) {
              flat.items = flat.items.filter(i=>i.uuid != "placeholder")
              flat.links = flat.links.filter(i=>i.source != "placeholder")
            }
            itemsSource = flat
            callback(flat)
            renderCDC()
          }
        })
        //displayThree(flare.json)
        document.querySelector("#pbs-container").style.display = "block"

      }else {
        document.querySelector("#pbs-container").style.display = "none"
      }
  }
