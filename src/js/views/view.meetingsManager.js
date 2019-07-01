var createMeetingsManager = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  let easymde = undefined
  let nodeToDisplay = undefined
  let store=undefined

  let currentOpenedNote = undefined

  let theme = {}
  theme.noMeeting = function () {
    return `
    <div class="ui placeholder segment">
      <div class="ui icon header">
        <i class="file alternate outline icon"></i>
        Select a meeting to display
      </div>
    </div>`
  }
  theme.editor = function (e) {//editor start point
     html =`
     <div style="width:80%; margin-left:10%;" id="noteAreaEditor" class="noteAreaEditor">
        <h1 class="ui header">${e.title}
          <button data-name="${e.title}" data-id="${e.uuid}" class="ui basic mini button action_note_manager_rename_note">Rename</button>
          <button data-id="${e.uuid}" class="ui basic red mini button action_note_manager_remove_note">Delete Note</button>
        </h1>
        ${theme.meetingTagArea(e)}
        ${theme.meetingParticipantsArea(e)}
        <h2 class="ui header">Content</h2>
        ${theme.meetingContentArea(e)}
       <textarea class="inputNoteAreaEditor"></textarea>
       <button type="button" onclick="printJS('noteAreaEditor', 'html')">
         Print Form
      </button>
     </div>
    `
    return html
  }
  theme.meetingParticipantsArea = function (meeting) {
    console.log(meeting.participants.present);
    html=`
    <h2 class="ui header">Participants</h2>
    <h3 class="ui header">Present</h3>
    <div class="ui mini horizontal list">
      ${meeting.participants.present.map(i=>theme.meetingParticipant(i)).join(" ")}
    </div>
    <h3 class="ui header">Absent</h3>
    <div class="ui mini horizontal list">
      ${meeting.participants.absent.map(i=>theme.meetingParticipant(i)).join(" ")}
    </div>
    `
    return html
  }
  theme.meetingParticipant= function (participant) {
     html =`
     <div class="item">
       <img class="ui avatar image" src="css/vendor/font-awesome/user-solid.svg">
       <div class="content">
         <div class="header">${participant}</div>
         Top Contributor
       </div>
     </div>
    `
    return html
  }
  theme.meetingTagArea= function (note) {
     html =`
     <div class="tag_area">
       <div class="tag_list">
       </div>
       <span data-id="${note.uuid}" class="action_note_manager_add_tag"> <i data-id="${note.uuid}" class="manage_tag_button far fa-edit"></i></span>
     </div>
    `
    return html
  }
  theme.meetingContentArea= function (meeting) {

     html =`
     <h2 class="ui header">Content</h2>
     ${meeting.chapters.map(i=>theme.meetingChapter(i)).join(" ")}
    `
    return html
  }
  theme.meetingChapter= function (chapter) {

     html =`
     <h3 class="ui header">${chapter.name}</h3>
     ${chapter.topics.map(i=>theme.meetingTopicArea(i)).join(" ")}
    `
    return html
  }

  theme.meetingTopicArea= function (topic) {
    let colType = undefined
     html =`
     <h4 class="ui header">${topic.name}</h4>
     <div style="width:90%; margin-left:5%;" class='flexTable'>
       <div class="table">
       ${topic.items.map(i=>theme.meetingItems(i)).join(" ")}
       </div>
     </div>
    `
    return html
  }
  theme.meetingItems= function (item) {
    if (item.type == "action") {
      return theme.meetingItemAction(item)
    }else if (item.type == "info") {
      return theme.meetingItemInfo(item)
    }
  }
  theme.meetingItemAction= function (item) {
    let colType=undefined
     html =`
     <div class='row'>

       <div style="
          position: absolute;
          left: -33px;
          background: #02b5ab;
          color: white;
          width: 2em;
          height: 2em;
          padding-left: 0.6em;
          font-size: 20px;
          padding-top: 0.5em;
          border-radius: 50%;
          z-index:100;
       " class='meeting-type action'>
         <i class="fas fa-clipboard-list"></i>
       </div>
       <div style="
       position: absolute;
        left: -14px;
        background: grey;
        width: 3px;
        height: 100%;
       " class='meeting-timeline'>
       </div>


       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 80px;" class='orange-column'>
           12/08/19
         </div>
       </div>
       <div class='${colType||"column"}'>
         <div class='orange-column'>
           qzfzqzqzqfqzfzqffzqzqf fes zqfzqz fqzq  qzzqfzqfzqf fesfesf
           zqfzqzfqzqqzzqfzqfzqf fesfesf
           fes zqfzqz fqzq  qzzqfzqfzqf fesfesf
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 90px;margin:3px;" class='orange-column'>
           Eta: <span style="background: gray;color: white;border-radius: 10%;padding-left: 3px;padding-right: 3px;">20/08/19</span>
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 90px;margin:3px;" class='orange-column'>
           Concerne: <span style="background: gray;color: white;border-radius: 10%;padding-left: 3px;padding-right: 3px;">Admin</span>
         </div>
       </div>

     </div>
    `
    return html
  }
  theme.meetingItemInfo= function (item) {
    let colType=undefined
     html =`
     <div class='row'>
     <div style="
         position: absolute;
         left: -33px;
         background: #02b5ab;
         color: white;
         width: 2em;
         height: 2em;
         padding-left: 0.8em;
         font-size: 20px;
         padding-top: 0.5em;
         border-radius: 50%;
         z-index:100;
     " class='meeting-type info'>
       <i class="fas fa-info"></i>
       </div>
       <div style="
        position: absolute;
        left: -14px;
        background: grey;
        width: 3px;
        height: 100%;
       " class='meeting-timeline'>
       </div>

       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 80px;" class='orange-column'>
           14/08/19
         </div>
       </div>
       <div class='${colType||"column"}'>
         <div class='orange-column'>
           qzfzqzqzqfqzfzqffzqzqf
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 90px;margin:3px;" class='orange-column'>
           Concerne:
           <span style="background: gray;color: white;border-radius: 10%;padding-left: 3px;padding-right: 3px;">Admin</span>
           <span style="background: gray;color: white;border-radius: 10%;padding-left: 3px;padding-right: 3px;">Top Contributor </span>
         </div>
       </div>

     </div>
    `
    return html
  }
  theme.noteTag= function (tagName, tagId) {
     html =`
      <div data-id="" class="eph teal tag">${tagName}</div>
    `
    return html
  }
  theme.notePreviewItem = function (i) {
     html =`
     <div data-id="${i.uuid}" class="searchable_note list-item action_note_manager_load_note">
       <div class="relaxed" data-id="${i.uuid}" >
        <strong data-id="${i.uuid}" >${i.title}</strong>
        <div data-id="${i.uuid}" >${i.content.substring(0,135)+".. "}</div>
       </div>
       <i class="far fa-file-alt"></i>
     </div>`

    return html
  }
  theme.notePreviewTitle= function (html) {
     html =`
        Meetings
        <span class="action_note_manager_add_note small button"> Add</span>
    `
    return html
  }
  theme.noteSearchArea= function () {
     html =`
        <input class="note_search_input search_input" type="text" placeholder="Search..">
        <span class=""> <i class="fas fa-search"></i></span>
    `
    return html
  }


  var init = function () {
    connections()

  }
  var connections =function () {
    connect(".action_note_manager_load_note", "click", (e)=>{
      console.log(e.target.dataset.id);
      let noteId = e.target.dataset.id
      loadMeetingByUuid(noteId)
    })
    connect(".action_note_manager_remove_note", "click", (e)=>{
      console.log(e.target.dataset.id);
      if (confirm("This not will be deleted")) {
        let noteId = e.target.dataset.id
        //TODO This has to be removed and routes must be used
        app.store.userData.notes.items = app.store.userData.notes.items.filter(n=>n.uuid != noteId)
        update()
      }
    })
    connect(".action_note_manager_rename_note", "click", (e)=>{
      console.log(e.target.dataset.id);
      let newName = prompt("Enter a new name", e.target.dataset.name)
      if (newName) {
        let noteId = e.target.dataset.id
        //TODO This has to be removed and routes must be used
        let note = app.store.userData.notes.items.filter(n=>n.uuid == noteId)[0]
        if (note) {
          note.title = newName
          renderMeeting(note)
        }
        update()
      }
    })
    connect(".action_note_manager_add_note", "click", (e)=>{
      app.store.userData.notes.items.push({
        uuid:genuuid(),
        title:"A new Note",
        content:"Click to edit the note"
      })
      update()
    })
    connect(".action_note_manager_add_tag", "click", (e)=>{
      let noteUuid = e.target.dataset.id
      let linkedTag = app.store.userData.tags.items.filter((t) => {
        return t.targets.includes(noteUuid)
      })
      let linkedTagUuid = linkedTag.map((t)=>t.uuid)
      showListMenu({
        sourceData:app.store.userData.tags.items,
        multipleSelection:linkedTagUuid,
        displayProp:"name",
        searchable : true,
        display:[
          {prop:"name", displayAs:"Name", edit:false}
        ],
        idProp:"uuid",
        onCloseMenu: (ev)=>{
          update()
        },
        onAdd:(ev)=>{
          let newTagName = prompt('Add a Tag')
          if (newTagName) {
            app.store.userData.tags.items.push({
              uuid:genuuid(),
              name:newTagName,
              targets:[]
            })
          }
        },
        onRemove:(ev)=>{
          let tagToRemoveName = ev.target.dataset.id
          if (tagToRemoveName) {
            app.store.userData.tags.items= app.store.userData.tags.items.filter((i) => {
              return !(i.uuid==tagToRemoveName)
            })
            console.log(ev);
            ev.select.updateData(app.store.userData.tags.items)
          }
        },
        onChangeSelect: (ev)=>{//TODO all ugly change
          console.log(ev.select.getSelected());
          let selectedTags = ev.select.getSelected()
          app.store.userData.tags.items.forEach((item) => {
            if (selectedTags.includes(item.uuid)) {//if one of selected
              var index = item.targets.indexOf(noteUuid);
              if (index < 0) {
                item.targets.push(noteUuid)
              }
            }else {
              var index = item.targets.indexOf(noteUuid);
              if (index > -1) {
                item.targets.splice(index, 1);
              }
            }
          })

        },
        onClick: (ev)=>{
          console.log("select");
        }
      })
      // app.store.userData.notes.items.push({
      //   uuid:genuuid(),
      //   title:"A new Note",
      //   content:"Click to edit the note"
      // })

    })
  }

  var render = function () {
    container.innerHTML = theme.noMeeting()
    let treeContainer = document.querySelector(".left-menu-area")
    let noteTitleArea = document.querySelector(".left-menu-area .title")
    let notePreviewArea = treeContainer.querySelector('.left-list')
    let searchArea = treeContainer.querySelector('.side_searchArea')
    if (notePreviewArea && searchArea) { //reuse what is already setup
      noteTitleArea.innerHTML = theme.notePreviewTitle()
      searchArea.innerHTML=theme.noteSearchArea()
      updateMeetingTree(notePreviewArea)
    //update search event
    setUpSearch(document.querySelector(".note_search_input"), app.store.userData.notes.items)
  }else {
    alert("elemet missing")
  }
  }

  function renderSearchArea() {
    return theme.noteSearchArea()
  }

  function renderMeetingTree() {

    let html = ""
    store.meetings.items.forEach(function (e) {//todo add proper routes
      html += theme.notePreviewItem(e)
    })
    return theme.meetingPreviewList(html)
  }
  function updateMeetingTree(container) {
    let html = ""
    store.meetings.items.forEach(function (e) {//todo add proper routes
      html += theme.notePreviewItem(e)
    })
    container.innerHTML = html
  }

  function renderMeeting(e) {
    container.innerHTML = theme.editor(e)
    // container.querySelector(".tag_list").innerHTML= renderTagList(e)
    console.log(e.content);
    // easyMDE = new EasyMDE({
    //   element: document.querySelector('.inputNoteAreaEditor'),
    //   autoDownloadFontAwesome:false,
    //   spellChecker:false,
    //   initialValue : e.content
    // });
    //
    // easyMDE.codemirror.on("change", function(){
    // 	console.log(easyMDE.value());
    //   e.content = easyMDE.value()//TODO use routes. UGLY
    // });
  }
  function renderTagList(note) {
    let linkedTag = app.store.userData.tags.items.filter((t) => {
      console.log(t.targets);
      return t.targets.includes(note.uuid)
    })
    let linkedTagHtml = linkedTag.map((t)=>theme.noteTag(t.name,t.id))
    return linkedTagHtml.join("")
    // let tagedNoteList = app.store.userData.notes.items.map((i) => {})
  }
  function setUpSearch(searchElement, sourceData) {
    searchElement.addEventListener('keyup', function(e){
      //e.stopPropagation()
      var value = document.querySelector(".note_search_input").value
      console.log("fefsefsef");
      console.log(sourceData);
      var filteredData = sourceData.filter((item) => {
        if (fuzzysearch(value, item.title) || fuzzysearch(value, item.content) || fuzzysearch (value, item.title.toLowerCase()) || fuzzysearch (value, item.content.toLowerCase())) {
          return true
        }
        return false
      })
      var filteredIds = filteredData.map(x => x.uuid);
      var searchedItems = document.querySelectorAll(".searchable_note")
      for (item of searchedItems) {
        if (filteredIds.includes(item.dataset.id) || !value) {item.style.display = "block"}else{item.style.display = "none"}
      }
    });
  }

  function loadMeetingByUuid(meetingId) {
    let meeting = store.meetings.items.filter(n=>n.uuid == meetingId)[0]
    if (meeting) {
      currentOpenedMeeting = meeting.uuid
      renderMeeting(meeting)
    }
  }

  var update = function () {
    saveDB() //TODO move all to actions!
    render()
    if (currentOpenedNote) {
      loadMeetingByUuid(currentOpenedNote)
    }
  }

  var setActive =function () {
    objectIsActive = true;
    store =  query.currentProject()
    update()
  }

  var setInactive = function () {
    document.querySelector('.side_searchArea').innerHTML=""
    document.querySelector('.left-menu-area > .title').innerHTML=""
    objectIsActive = false;
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var meetingsManager = createMeetingsManager(".center-container")
meetingsManager.init()
