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
  pageManager.addComponent({name:"overview",object:overview,linkedComponents:["leftMenuProjectTree"],haveSideBar:false})
  pageManager.addComponent({name:"requirements",object:requirementsView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"functions",object:functionsView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"planning",object:planningView, haveSideBar:false})
  pageManager.addComponent({name:"pbs",object:pbsView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"interfaces",object:interfacesView, haveSideBar:false})
  pageManager.addComponent({name:"relations",object:relationsView, haveSideBar:false})
  pageManager.addComponent({name:"unified",object:unifiedView,linkedComponents:["leftMenuActions"], haveSideBar:false})
  pageManager.addComponent({name:"projectSelection",object:projectSelectionView,linkedComponents:["leftMenuActions"], haveSideBar:false})
  pageManager.addComponent({name:"externalUsersManagement",object:externalUsersManagement, haveSideBar:false})
  pageManager.addComponent({name:"importUsersFromProjects",object:importUsersFromProjects, haveSideBar:false})
  pageManager.addComponent({name:"exportProjectInfo",object:exportProjectInfoView, haveSideBar:false})
  pageManager.addComponent({name:"notesManager",object:notesManager, haveSideBar:false})
  pageManager.addComponent({name:"meetingsManager",object:meetingsManager, haveSideBar:false})
  pageManager.addComponent({name:"tags",object:tagsView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"interfacesTypes",object:interfacesTypesView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"categories",object:categoriesView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"workPackages",object:workPackagesView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"documents",object:documentsView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"physicalSpaces",object:physicalSpacesView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"extraGraphsView",object:extraGraphsView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"interfacesListView",object:interfacesListView,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"singleActionView",object:singleActionView, haveSideBar:false})
  pageManager.addComponent({name:"currentUserView",object:currentUserView, haveSideBar:false})
  pageManager.addComponent({name:"vvManager",object:vvManager,linkedComponents:["leftMenuProjectTree"], haveSideBar:false})
  pageManager.addComponent({name:"vvSet",object:vvSet, haveSideBar:false})
  pageManager.addComponent({name:"vvReport",object:vvReport, haveSideBar:false})
  pageManager.addComponent({name:"history",object:historyView, haveSideBar:false})
  pageManager.addComponent({name:"projectSettings",object:projectSettingsView, haveSideBar:false})
  //side menu component
  pageManager.addComponent({name:"leftMenu",object:leftMenu})
  pageManager.addComponent({name:"leftMenuActions",object:leftMenuActions})
  pageManager.addComponent({name:"leftMenuProjectTree",object:leftMenuProjectTree})



  function renderCDC(db, filter) {
    // cscViewer.update() //TODO remove and centralize
  }


  //==========CONNECT

  connect(".action_toogle_project_selection","click",(e)=>{
    pageManager.setActivePage("projectSelection")
  })
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
  connect(".action_toogle_diag_interfaces_quickstart","click",(e)=>{
    pageManager.setActivePage("interfaces", {param:{context:"quickstart"}})
  })
  connect(".action_toogle_diag_interfaces","click",(e)=>{
    pageManager.setActivePage("interfaces")
  })
  connect(".action_toogle_diag_relations","click",(e)=>{
    pageManager.setActivePage("relations")
  })
  connect(".action_toogle_diag_relations_options","click",(e)=>{
    pageManager.setActivePage("relations", {param:{context:"extract", uuid:e.target.dataset.id}})
  })
  connect(".action_toogle_diag_relations_quickstart","click",(e)=>{
    pageManager.setActivePage("relations", {param:{context:"quickstart"}})
  })
  connect(".action_toogle_unified","click",(e)=>{
    pageManager.setActivePage("unified")
  })
  connect(".action_toogle_external_users_management","click",(e)=>{
    pageManager.setActivePage("externalUsersManagement")
  })
  connect(".action_toogle_import_users_from_projects","click",(e)=>{
    pageManager.setActivePage("importUsersFromProjects")
  })
  connect(".action_toogle_export_Project_informations","click",(e)=>{
    pageManager.setActivePage("exportProjectInfo")
  })
  connect(".action_toogle_notes_manager","click",(e)=>{
    pageManager.setActivePage("notesManager")
  })
  connect(".action_toogle_meetings_manager","click",(e)=>{
    pageManager.setActivePage("meetingsManager")
  })
  connect(".action_toogle_work_packages","click",(e)=>{
    pageManager.setActivePage("workPackages")
  })
  connect(".action_toogle_documents","click",(e)=>{
    pageManager.setActivePage("documents")
  })
  connect(".action_toogle_physical_spaces","click",(e)=>{
    pageManager.setActivePage("physicalSpaces")
  })
  connect(".action_toogle_extra_graphs","click",(e)=>{
    pageManager.setActivePage("extraGraphsView")
  })
  connect(".action_toogle_interfaces_list_view","click",(e)=>{
    pageManager.setActivePage("interfacesListView")
  })
  connect(".action_toogle_vv_manager_view","click",(e)=>{
    pageManager.setActivePage("vvManager")
  })




  connect(".action_toogle_single_action_view","click",(e)=>{
    singleActionView.update(e.target.dataset.id)
  })
  connect(".action_toogle_vv_set_view","click",(e)=>{
    vvSet.update(e.target.dataset.id)
  })
  connect(".action_toogle_vv_report_view","click",(e)=>{
    vvReport.update(e.target.dataset.id)
  })
  connect(".action_toogle_current_user_view","click",(e)=>{
    currentUserView.update()
  })
  connect(".action_toogle_tags_view","click",(e)=>{
    tagsView.update()
  })
  connect(".action_toogle_interfaces_types_view","click",(e)=>{
    interfacesTypesView.update()
  })
  connect(".action_toogle_template_view","click",(e)=>{
    templatesView.update()
  })
  connect(".action_toogle_categories_view","click",(e)=>{
    categoriesView.update()
  })
  connect(".action_toogle_metalinks_view","click",(e)=>{
    metalinksView.update()
  })
  connect(".action_toogle_extraFields_view","click",(e)=>{
    extraFieldsView.update()
  })
  connect(".action_toogle_history_view","click",(e)=>{
    historyView.update()
  })
  connect(".action_toogle_project_settings_view","click",(e)=>{
    projectSettingsView.update()
  })


  connect(".action_toogle_stakeholders","click",(e)=>{
    //e.target.dataset.id
    var store = query.currentProject()
    showListMenu({
      sourceData:store.stakeholders.items,
      sourceLinks:store.stakeholders.links,
      displayProp:"name",
      display:[
        {prop:"name", displayAs:"First name", edit:"true"},
        {prop:"lastName", displayAs:"Last Name", edit:"true"},
        {prop:"org", displayAs:"Org", edit:"true"},
        {prop:"role", displayAs:"Role", edit:"true"},
        {prop:"mail", displayAs:"E-mail", edit:"true"}
      ],
      idProp:"uuid",
      showColoredIcons: lettersFromNames,
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
      onMove: (ev)=>{
        console.log("move");
        if (confirm("move item ?")) {
          push(act.move("stakeholders", {origin:ev.originTarget.dataset.id, target:ev.target.dataset.id}))
          //update links if needed
          push(act.removeLink("stakeholders",{target:ev.originTarget.dataset.id}))
          if (ev.targetParentId && ev.targetParentId != "undefined") {
            push(act.addLink("stakeholders",{source:ev.targetParentId, target:ev.originTarget.dataset.id}))
          }
          ev.select.updateData(store.stakeholders.items)
          ev.select.updateLinks(store.stakeholders.links)
        }
      },
      onAdd: (ev)=>{
        let firstName = prompt("New stakeholder - First name")
        let lastName = prompt("Last name")
        push(act.add("stakeholders",{uuid:genuuid(), name:firstName, lastName:lastName}))
      },
      onAddFromPopup: (ev)=>{
        var uuid = genuuid()
        let firstName = prompt("New stakeholder - First name")
        let lastName = prompt("Last name")
        if (firstName && lastName) {
          push(act.add("stakeholders", {uuid:uuid,name:firstName, lastName:lastName}))
          if (ev.target && ev.target != "undefined") {
            push(act.move("stakeholders", {origin:uuid, target:ev.target.dataset.id}))
            //check for parenting
            let parent = store.stakeholders.links.find(l=>l.target == ev.target.dataset.id)
            if (parent) {
              push(act.addLink("stakeholders",{source:parent.source, target:uuid}))
            }
          }
          ev.select.updateData(store.stakeholders.items)
          ev.select.updateLinks(store.stakeholders.links)
        }
      },
      onClick: (ev)=>{
        showSingleItemService.showById(ev.target.dataset.id, function (e) {
          ev.select.updateData(store.stakeholders.items)
          ev.select.updateLinks(store.stakeholders.links)
          ev.select.refreshList()
        })
      },
      extraActions:[
        {
          name:"WP",
          action:(ev)=>{
            pageManager.setActivePage("workPackages")
            setTimeout(function () {
              ev.select.remove() //TODO UGLY! find a better way. Needed because the list comp wil reload after invoking
            }, 200);
          }
        },
        {
          name:"Import",
          action:(ev)=>{
            importCSVfromFileSelector(function (results) {
              let startImport = confirm(results.data.length+" stakeholders will be imported")
              if (startImport) {
                for (stakeholder of results.data) {
                  push(act.add("stakeholders",{uuid:genuuid(), name:stakeholder[0], lastName:stakeholder[1],org:stakeholder[2], role:stakeholder[3]}))

                }
                alert("Close and restart view to complete import")//todo, not working automaticaly
                ev.select.updateData(query.currentProject().stakeholders.items)
              }
            })

          }
        },
        {
          name:"Diagramme",
          action:(ev)=>{
            setTimeout(function () {
              ev.select.remove() //TODO UGLY! find a better way. Needed because the list comp wil reload after invoking
            }, 200);

            showTreeFromListService.showByStoreGroup("stakeholders", function (e) {
              ev.select.updateData(store.stakeholders.items)
              ev.select.updateLinks(store.stakeholders.links)
              ev.select.update() //TODO find a better way

            })
          }
        }
      ]
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
