var createMeetingsManager = function (targetSelector) {
  var self ={};
  var objectIsActive = false;
  var container = document.querySelector(targetSelector)
  let easymde = undefined
  let nodeToDisplay = undefined
  let store=undefined

  let currentOpenedMeeting = undefined
  let currentMeetingObject = undefined

  let opacityStyleOfClosedItems = "0.3"

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
     <div style="width:80%; margin-left:10%;" id="meetingAreaEditor" class="meetingAreaEditor">
        <h1 class="ui header">${e.title}
          <button data-name="${e.title}" data-id="${e.uuid}" class="ui basic mini button action_meeting_manager_rename_meeting">Rename</button>
          <button data-name="${e.title}" data-id="${e.uuid}" class="ui basic mini button action_meeting_manager_add_meeting_follow_up">Follow-up</button>
          <button data-name="${e.title}" data-id="${e.uuid}" class="ui basic mini button action_meeting_manager_create_relations_from_meeting">Generate relations</button>
          <button data-name="${e.title}" data-id="${e.uuid}" class="ui basic mini button action_meeting_manager_create_print_view">Print</button>
          <button data-id="${e.uuid}" class="ui basic red mini button action_meeting_manager_remove_meeting">Delete Meeting</button>
        </h1>

        ${theme.meetingInfoArea(e)}
        ${theme.meetingParticipantsArea(e)}
        ${theme.meetingContentArea(e)}
        ${theme.meetingArchived(e)}
     </div>
    `
    return html
  }
  theme.meetingParticipantsArea = function (meeting) {
    console.log(meeting.participants.present);
    html=`
    <h2 class="ui header">Participants</h2>
    <h3 class="ui header">
      Present
      <i data-meeting="${currentOpenedMeeting}" data-prop="present" data-value='${JSON.stringify(meeting.participants.present)}' class="edit icon action_meeting_manager_add_participant" style="opacity:0.2;font-size: 13px;vertical-align: top;"></i>
    </h3>
    <div class="ui mini horizontal list">
      ${generateParticipantHtml(meeting.participants.present)}
    </div>
    <h3 class="ui header">
      Absent
      <i data-meeting="${currentOpenedMeeting}" data-prop="absent" data-value='${JSON.stringify(meeting.participants.absent)}' class="edit icon action_meeting_manager_add_participant" style="opacity:0.2;font-size: 13px;vertical-align: top;"></i>
    </h3>
    <div class="ui mini horizontal list">
      ${generateParticipantHtml(meeting.participants.absent)}
    </div>
    <h3 class="ui header">
      CC
      <i data-meeting="${currentOpenedMeeting}" data-prop="cc" data-value='${JSON.stringify(meeting.participants.cc)}' class="edit icon action_meeting_manager_add_participant" style="opacity:0.2;font-size: 13px;vertical-align: top;"></i>
    </h3>
    <div class="ui mini horizontal list">
      ${generateParticipantHtml(meeting.participants.cc)}
    </div>
    `
    return html
  }
  theme.meetingParticipant= function (participant) {
     html =`
     <div class="item">
       <img class="ui avatar image" src="css/vendor/font-awesome/user-solid.svg">
       <div class="content">
         <div class="header">${participant.name +" "+participant.lastName}</div>
         ${participant.org}
       </div>
     </div>
    `
    return html
  }
  theme.meetingInfoArea= function (meeting) {
    var today = new Date(meeting.createdOn).toISOString().substr(0, 10);
     html =`
     <div class="info_area">
       <h2>
       <span>${meeting.createdOn? new Date(meeting.createdOn).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 10):""}</span>
       <input data-prop="createdOn" data-id="${meeting.uuid}" style="display:none;" type="date" class="dateinput action_list_edit_time_input" name="trip-start" value="${today}">

       <span style="font-size:10px;" data-id="${meeting.uuid}" class="action_meeting_manager_change_date"> <i data-id="${meeting.uuid}" class="manage_tag_button far fa-edit"></i></span>

       </h2>
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
     <button data-id="${currentOpenedMeeting}" class="ui basic mini button action_meeting_manager_add_chapter">Add a Chapter</button>
    `
    return html
  }
  theme.meetingChapter= function (chapter) {

     html =`
     <h3 class="ui header">
      ${chapter.name}
      <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${chapter.name}" data-chapter="${chapter.uuid}" class="edit icon action_meetingmanager_list_edit_chapter" style="display:inline-block; opacity:0.2;font-size: 13px;vertical-align: top;"></i>
      <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${chapter.name}" data-chapter="${chapter.uuid}" class="times icon action_meetingmanager_list_delete_chapter" style="display:inline-block; opacity:0.2;font-size: 13px;vertical-align: top;"></i>
     </h3>
     ${chapter.topics.filter(t=>!t.archived).map(i=>theme.meetingTopicArea(i, chapter)).join(" ")}
     <button data-meeting="${currentOpenedMeeting}" data-chapter="${chapter.uuid}"  class="ui basic mini button action_meeting_manager_add_topic">Add a Topic</button>
    `
    return html
  }

  theme.meetingTopicArea= function (topic, chapter) {
    let colType = undefined
     html =`
     <h4 class="ui header">
     ${topic.name}
     <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${topic.name}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="edit icon action_meetingmanager_list_edit_topic" style="display:inline-block;opacity:0.2;font-size: 13px;vertical-align: top;"></i>
     <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${topic.name}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="archive icon action_meetingmanager_list_archive_topic" style="display:inline-block;opacity:0.2;font-size: 13px;vertical-align: top;"></i>
     <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${topic.name}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="times icon action_meetingmanager_list_delete_topic" style="display:inline-block;opacity:0.2;font-size: 13px;vertical-align: top;"></i>
     </h4>
     <div style="width:90%; margin-left:5%;" class='flexTable'>
       <div class="meeting-table">
       ${topic.items.map(i=>theme.meetingItems(i)).join(" ")}
       </div>
     </div>
     <div style='margin-left: 16px;opacity: 0.5;margin-bottom: 9px;margin-top: 8px;' class="topic-menu">
       <div data-id="" data-type="action" data-meeting="${currentOpenedMeeting}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="ui mini basic circular icon button action_meeting_manager_add_topic_item" data-tooltip="Add an action">
         <i data-id="" data-type="action" data-meeting="${currentOpenedMeeting}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="clipboard icon"></i>
       </div>
       <div data-id="" data-type="info" data-meeting="${currentOpenedMeeting}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="ui mini basic circular icon button action_meeting_manager_add_topic_item" data-tooltip="Add an Info">
         <i data-id="" data-type="info" data-meeting="${currentOpenedMeeting}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="info icon"></i>
       </div>
       <div data-id="" data-type="requirement" data-meeting="${currentOpenedMeeting}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="ui mini basic circular icon button action_meeting_manager_add_topic_item" data-tooltip="Add a requirement">
         <i data-id="" data-type="requirement" data-meeting="${currentOpenedMeeting}" data-chapter="${chapter.uuid}" data-topic="${topic.uuid}" class="comment icon"></i>
        </div>
    </div>
    `
    return html
  }
  theme.meetingArchived= function (meeting) {

     html =`
     <h3 class="ui header">
      Archived
     </h3>
     ${meeting.chapters.map(c=>c.topics.filter(t=>t.archived).map(i=>theme.meetingTopicArea(i, c)).join(" ")).join(" ")}
    `
    return html
  }
  theme.meetingItems= function (item) {
    if (item.type == "action") {
      return theme.meetingItemAction(item)
    }else if (item.type == "info") {
      return theme.meetingItemInfo(item)
    }else if (item.type == "requirement") {
      return theme.meetingItemRequirement(item)
    }
  }
  theme.meetingItemConnection=function (item) {

    let html = ''
    var isObjectMissing = false
    let linkObject = currentMeetingObject.relations.find(r=>r.source == item.uuid)
    if (linkObject) { //check if taget still exist first
      isObjectMissing = !checkIfTargetIsReachable(linkObject.target)
      if (isObjectMissing) {
        if (confirm("One or more items related to this meeting are missing. Remove missing link?")) {
          console.log(currentMeetingObject.relations);
          console.log(item.uuid);
          currentMeetingObject.relations= currentMeetingObject.relations.filter(r=>r.source != item.uuid)
          console.log(currentMeetingObject.relations);
        }
      }
    }

    if (linkObject && !isObjectMissing) {
      let elementName= undefined
      if (item.type == 'action') {
        elementName = query.items("actions", i=>i.uuid == linkObject.target)[0].name
      } else {
        console.log(isObjectMissing);
        console.log(linkObject.target);
        elementName = query.items("requirements", i=>i.uuid == linkObject.target)[0].name
      }

      html= `
      <div data-id="${item.uuid}" class="ui mini basic circular icon button" data-tooltip="Linked to item ${elementName}">
        <i data-id="${item.uuid}" class="linkify icon"></i>
      </div>`
    }else {
      html= `
      <div data-id="${item.uuid}" class="ui mini basic circular icon button action_meeting_manager_create_linked_item" data-tooltip="Click to create a linked element in database">
        <i data-id="${item.uuid}" class="unlink icon"></i>
      </div>`
    }


    return html
  }
  theme.meetingItemResolved=function (item) {
    let html = ''
    if (!item.resolved) {
      let linkObject = currentMeetingObject.relations.find(r=>r.source == item.uuid)
      if (linkObject && !query.items("actions", i=>i.uuid == linkObject.target)[0].open) {
        html= `
        <div data-id="${item.uuid}" class="ui mini basic circular icon button action_meeting_manager_set_resolved_partial" data-tooltip="The linked item has been resolved. Click to mark the item resolved here">
          <i data-id="${item.uuid}" class="flag checkered icon"></i>
        </div>`
      }else {
        html= `
        <div data-id="${item.uuid}" class="ui mini basic circular icon button action_meeting_manager_set_resolved" data-tooltip="This item has note yet been resolved. Click to resolve">
          <i data-id="${item.uuid}" class="flag outline icon"></i>
        </div>`
      }
    }else if (item.resolved) {
      html= `
      <div data-id="${item.uuid}" class="ui mini basic circular icon button action_meeting_manager_set_unresolved" data-tooltip="Click to cancel resolution">
        <i data-id="${item.uuid}" class="check icon"></i>
      </div>`
    }
    return html
  }
  theme.meetingItemAction= function (item) {
    let colType=undefined
    let isEditable = !item.freeze
     html =`
     <div class='row ${item.freeze? "old-meeting-item": "new-meeting-item"}' style="position: relative; opacity: ${(item.freeze && item.resolved)? opacityStyleOfClosedItems: "1"};">

       <div style="
          position: absolute;
          left: -33px;
          background: ${item.freeze? "grey": "#02b5ab"};
          color: white;
          width: 2em;
          height: 2em;
          padding-left: 0.6em;
          font-size: 20px;
          padding-top: 0.5em;
          border-radius: 50%;
          z-index:1;
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
         <div style="width: 90px;" class='orange-column'>
           ${item.createdOn? new Date(item.createdOn).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 10):""}
           ${theme.meetingItemResolved(item)}
           ${theme.meetingItemConnection(item)}
           <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${item.name}" data-id="${item.uuid}" class="times icon action_meetingmanager_list_delete_item" style="display:inline-block;opacity:0.2;font-size: 13px;vertical-align: top; position: absolute;left: -10px;top: 36px;"></i>

         </div>
       </div>
       <div data-id='${item.uuid}' class='${colType||"column"}  '>
         <div data-id='${item.uuid}' class='orange-column action_meeting_manager_edit_item'>
           ${item.content}
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 150px;margin:3px;" class='orange-column'>

            ${theme.dateElement("eta", item.uuid, item.eta, isEditable)}
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 130px;margin:3px;" class='orange-column'>
           Cc: ${generateListeFromParticipantId(item.uuid, isEditable)}
         </div>
       </div>

     </div>
    `
    return html
  }
  theme.meetingItemInfo= function (item) {
    let colType=undefined
    let isEditable = !item.freeze
     html =`
     <div class='row  ${item.freeze? "old-meeting-item": "new-meeting-item"}' style="position: relative; opacity: ${item.freeze? opacityStyleOfClosedItems: "1"};">
     <div style="
         position: absolute;
         left: -33px;
         background: ${item.freeze? "grey": "#02b5ab"};
         color: white;
         width: 2em;
         height: 2em;
         padding-left: 0.8em;
         font-size: 20px;
         padding-top: 0.5em;
         border-radius: 50%;
         z-index:1;
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
         <div style="width: 90px;" class='orange-column'>
         ${item.createdOn? new Date(item.createdOn).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 10):""}
         <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${item.name}" data-id="${item.uuid}" class="times icon action_meetingmanager_list_delete_item" style="display:inline-block;opacity:0.2;font-size: 13px;vertical-align: top; position: absolute;left: -10px;top: 36px;"></i>

         </div>
       </div>
       <div data-id='${item.uuid}' class='${colType||"column"}  '>
         <div data-id='${item.uuid}' class='orange-column action_meeting_manager_edit_item'>
           ${item.content}
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 130px;margin:3px;" class='orange-column'>
           Cc: ${generateListeFromParticipantId(item.uuid, isEditable)}
         </div>
       </div>

     </div>
    `
    return html
  }
  theme.meetingItemRequirement= function (item) {
    let colType=undefined
    let isEditable = !item.freeze
     html =`
     <div class='row ${item.freeze? "old-meeting-item": "new-meeting-item"}' style="position: relative;opacity: ${item.freeze? opacityStyleOfClosedItems: "1"};">
     <div style="
         position: absolute;
         left: -33px;
         background: ${item.freeze? "grey": "#02b5ab"};
         color: white;
         width: 2em;
         height: 2em;
         padding-left: 0.5em;
         font-size: 20px;
         padding-top: 0.5em;
         border-radius: 50%;
         z-index:1;
     " class='meeting-type info'>
       <i class="far fa-comment"></i>
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
         <div style="width: 90px;" class='orange-column'>
         ${item.createdOn? new Date(item.createdOn).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 10):""}
         ${theme.meetingItemConnection(item)}
         <i data-meeting="${currentOpenedMeeting}" data-prop="name" data-value="${item.name}" data-id="${item.uuid}" class="times icon action_meetingmanager_list_delete_item" style="display:inline-block;opacity:0.2;font-size: 13px;vertical-align: top; position: absolute;left: -10px;top: 36px;"></i>

         </div>
       </div>
       <div data-id='${item.uuid}' class='${colType||"column"}  '>
         <div data-id='${item.uuid}' class='orange-column action_meeting_manager_edit_item'>
           ${item.content}
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 130px;margin:3px;" class='orange-column'>
           By ${generateListeFromParticipantId(item.uuid, isEditable)}
         </div>
       </div>
       <div style="flex-grow: 0;" class='${colType||"column"}'>
         <div style="width: 130px;margin:3px;" class='orange-column'>
           Re: ${generateListeFromProductsId(item.uuid, isEditable)}
         </div>
       </div>

     </div>
    `
    return html
  }
  theme.dateElement= function (propName, sourceId, value, isEditable) {
    let today
    let propDisplay ="No due Date";
    let labelColor = ""
    if (value) {
      today = new Date(value).toISOString().substr(0, 10);
      propDisplay = moment(value).format("MMMM Do YY");
      console.log(new Date(value));
      if (lessThanInSomeDays(new Date(value),10 )) {
        labelColor = "orange"
      }
    }else {
      today = new Date().toISOString().substr(0, 10);
    }
    var mainText = `<div class="ui mini ${labelColor} label">${propDisplay}</div>`
    var editHtml=`
    <input data-prop="${propName}" data-id="${sourceId}" style="display:none;" type="date" class="dateinput ${sourceId} action_list_edit_time_input" name="trip-start" value="${today}">
    <i data-prop="${propName}" data-value='${JSON.stringify(value)}' data-id="${sourceId}" class="edit icon action_meeting_manager_list_edit_time_item" style="opacity:0.2">
    </i>`

    if (isEditable) {
      return mainText + editHtml
    }else {
      return mainText
    }

  }
  theme.noteTag= function (tagName, tagId) {
     html =`
      <div data-id="" class="eph teal tag">${tagName}</div>
    `
    return html
  }
  theme.notePreviewItem = function (i) {
     html =`
     <div data-id="${i.uuid}" class="searchable_note list-item action_meeting_manager_load_meeting">
       <div class="relaxed" data-id="${i.uuid}" >
        <strong data-id="${i.uuid}" >${i.title}</strong>
        <div data-id="${i.uuid}" >${i.createdOn? new Date(i.createdOn).toLocaleString('en-GB', { timeZone: 'UTC' }).substr(0, 10):""}</div>
       </div>
       <i class="far fa-file-alt"></i>
     </div>`

    return html
  }
  theme.notePreviewTitle= function (html) {
     html =`
        Meetings
        <span class="action_meeting_manager_add_meeting small button"> Add</span>
    `
    return html
  }
  theme.noteSearchArea= function () {
     html =`
        <input class="meeting_search_input search_input" type="text" placeholder="Search..">
        <span class=""> <i class="fas fa-search"></i></span>
    `
    return html
  }


  var init = function () {
    connections()

  }
  var connections =function () {
    connect(".action_meeting_manager_load_meeting", "click", (e)=>{
      console.log(e.target.dataset.id);
      let meetingId = e.target.dataset.id
      loadMeetingByUuid(meetingId)
    })
    connect(".action_meeting_manager_remove_meeting", "click", (e)=>{
      console.log(e.target.dataset.id);
      if (confirm("This meeting will be deleted")) {
        let meetingId = e.target.dataset.id
        //TODO This has to be removed and routes must be used
        store.meetings.items= store.meetings.items.filter(n=>n.uuid != meetingId)
        update()
      }
    })
    connect(".action_meeting_manager_rename_meeting", "click", (e)=>{
      console.log(e.target.dataset.id);
      let newName = prompt("Enter a new name", e.target.dataset.name)
      if (newName) {
        let meetingId = e.target.dataset.id
        //TODO This has to be removed and routes must be used
        let meeting = store.meetings.items.filter(n=>n.uuid == meetingId)[0]
        if (meeting) {
          meeting.title = newName
          update()
          renderMeeting(meeting)
        }
      }
    })
    connect(".action_meeting_manager_add_chapter", "click", (e)=>{
      let newName = prompt("Enter a new Chapter name", e.target.dataset.name)
      if (newName) {//TODO This has to be removed and routes must be used
        let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.id)[0]
        if (meeting) {
          meeting.chapters.push({uuid:uuid(),name:newName,topics:[]})
          update()
          renderMeeting(meeting)
        }
      }
    })
    connect(".action_meeting_manager_add_topic", "click", (e)=>{
      let newName = prompt("Enter a new Topic name")
      if (newName) {//TODO This has to be removed and routes must be used
        let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.meeting)[0]
        let chapter = meeting.chapters.filter(n=>n.uuid == e.target.dataset.chapter)[0]
        if (chapter) {
          chapter.topics.push({uuid:uuid(),name:newName,items:[]})
          update()
          renderMeeting   (meeting)
        }
      }
    })
    connect(".action_meeting_manager_add_topic_item", "click", (e)=>{
      let newName = prompt("Enter a item name")
      let type = e.target.dataset.type
      if (newName) {//TODO This has to be removed and routes must be used
        let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.meeting)[0]
        let chapter = meeting.chapters.filter(n=>n.uuid == e.target.dataset.chapter)[0]
        let topic = chapter.topics.filter(n=>n.uuid == e.target.dataset.topic)[0]
        if (topic) {
          topic.items.push({uuid:uuid(),createdOn: new Date(), type:type, date:new Date(), content:newName})
          update()
          renderMeeting(meeting)
        }
      }
    })
    connect(".action_meeting_manager_list_select_item_assigned","click",(e)=>{
      var sourceTriggerId = e.target.dataset.id;
      var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)
      showListMenu({
        sourceData:store.stakeholders.items,
        parentSelectMenu:e.select ,
        multipleSelection:currentLinksUuidFromDS,
        displayProp:"name",
        searchable : true,
        display:[
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"lastName", displayAs:"Last Name", edit:false},
          {prop:"org", displayAs:"Organisation", edit:false}
        ],
        idProp:"uuid",
        showColoredIcons: lettersFromNames,
        onCloseMenu: (ev)=>{
          update()
          // renderMeeting(currentOpenedMeeting)
        },
        onChangeSelect: (ev)=>{
          getTopicItemByUuid(sourceTriggerId).assignedTo = ev.select.getSelected()
          console.log(ev.select.getSelected());
          update()
        },
        onClick: (ev)=>{
          console.log("select");
        }
      })
    })
    connect(".action_meeting_manager_list_select_pbs_related","click",(e)=>{
      var sourceTriggerId = e.target.dataset.id;
      var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)
      showListMenu({
        sourceData:store.currentPbs.items,
        parentSelectMenu:e.select ,
        multipleSelection:currentLinksUuidFromDS,
        displayProp:"name",
        searchable : true,
        display:[
          {prop:"name", displayAs:"Name", edit:false},
          {prop:"desc", displayAs:"Description", edit:false}
        ],
        idProp:"uuid",
        onCloseMenu: (ev)=>{
          update()
          // renderMeeting(currentOpenedMeeting)
        },
        onChangeSelect: (ev)=>{
          getTopicItemByUuid(sourceTriggerId).relatedTo = ev.select.getSelected()
          console.log(ev.select.getSelected());
          update()
        },
        onClick: (ev)=>{
          console.log("select");
        }
      })
    })
    connect(".action_meeting_manager_add_participant","click",(e)=>{
      var meetingId = e.target.dataset.meeting;
      var meetingProp = e.target.dataset.prop;
      console.log(e.target.dataset.value);
      var currentLinksUuidFromDS = JSON.parse(e.target.dataset.value)
      showListMenu({
        sourceData:store.stakeholders.items,
        parentSelectMenu:e.select ,
        multipleSelection:currentLinksUuidFromDS,
        displayProp:"name",
        searchable : true,
        display:[
          {prop:"name", displayAs:"First name", edit:false},
          {prop:"lastName", displayAs:"Last Name", edit:false},
          {prop:"role", displayAs:"Role", edit:false}
        ],
        idProp:"uuid",
        showColoredIcons: lettersFromNames,
        onCloseMenu: (ev)=>{
          update()
          // renderMeeting(currentOpenedMeeting)
        },
        onChangeSelect: (ev)=>{
          store.meetings.items.find(m=>m.uuid == meetingId).participants[meetingProp] = ev.select.getSelected()
          console.log(ev.select.getSelected());
          update()
        },
        onClick: (ev)=>{
          console.log("select");
        }
      })
    })
    connect(".action_meeting_manager_list_edit_time_item","click",(e)=>{
      console.log(event.target.parentElement.querySelector("input"));
      event.target.parentElement.querySelector("input").style.display ="inline-block"
      event.target.parentElement.querySelector("input").style.borderRadius ="8px"
      event.target.parentElement.querySelector("input").style.borderStyle ="dashed"
      event.target.parentElement.querySelector("input").style.borderColor ="#9ed2ce"
      event.target.parentElement.querySelector("input").style.borderColor ="#e8e8e8"
      event.target.parentElement.querySelector("input").style.backgroundColor= "#e8e8e8"
      event.target.parentElement.querySelector("input").previousSibling.previousSibling.remove()
      event.target.style.display ="none"
      event.target.parentElement.querySelector("input").onchange = function (ev) {
        //onEditItemTime({select:self, selectDiv:sourceEl, target:ev.target})
        let targetItem = getTopicItemByUuid(e.target.dataset.id)//TODO move to reducer
        targetItem[ev.target.dataset.prop] = ev.target.valueAsDate
        // push(act.edit("actions",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.valueAsDate, project:ev.target.dataset.project}))
        update()
        renderMeeting(meeting)
      }
      //sourceEl.remove()
    })
    connect(".action_meeting_manager_change_date","click",(e)=>{
      var baseElem = event.target.parentElement.parentElement.querySelector("input");
      baseElem.style.display ="inline-block"
      baseElem.style.borderRadius ="8px"
      baseElem.style.borderStyle ="dashed"
      baseElem.style.borderColor ="#9ed2ce"
      baseElem.style.borderColor ="#e8e8e8"
      baseElem.style.backgroundColor= "#e8e8e8"
      console.log(baseElem.previousSibling);
      baseElem.previousSibling.previousSibling.remove()
      event.target.style.display ="none"
      baseElem.onchange = function (ev) {
        //onEditItemTime({select:self, selectDiv:sourceEl, target:ev.target})
        let meeting = store.meetings.items.filter(n=>n.uuid == currentOpenedMeeting)[0]//TODO move to reducer
        meeting.createdOn = ev.target.valueAsDate
        // push(act.edit("actions",{uuid:ev.target.dataset.id, prop:ev.target.dataset.prop, value:ev.target.valueAsDate, project:ev.target.dataset.project}))
        update()
        renderMeeting(meeting)
      }
      //sourceEl.remove()
    })
    connect(".action_meetingmanager_list_edit_chapter","click",(e)=>{
      let newName = prompt("Enter a item name",e.target.dataset.value)
      if (newName) {
        let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.meeting)[0]
        let chapter = meeting.chapters.filter(n=>n.uuid == e.target.dataset.chapter)[0]
        chapter.name = newName;
        update()
        renderMeeting(meeting)
      }
    })
    connect(".action_meetingmanager_list_delete_chapter","click",(e)=>{
        let newName = confirm("Delete this chapter definitely")
        if (newName) {
          let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.meeting)[0]
          meeting.chapters = meeting.chapters.filter(n=>n.uuid != e.target.dataset.chapter)
          update()
          renderMeeting(meeting)
        }
      })
    connect(".action_meetingmanager_list_edit_topic","click",(e)=>{
      let newName = prompt("Enter a item name",e.target.dataset.value)
      if (newName) {
        let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.meeting)[0]
        let chapter = meeting.chapters.filter(n=>n.uuid == e.target.dataset.chapter)[0]
        let targetItem = chapter.topics.filter(n=>n.uuid == e.target.dataset.topic)[0]
        if (targetItem) {
          targetItem.name = newName;
          update()
          renderMeeting(meeting)
        }
      }
    })
    connect(".action_meetingmanager_list_archive_topic","click",(e)=>{
      let newName = confirm("Archive this topic")
      if (newName) {
        let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.meeting)[0]
        let chapter = meeting.chapters.filter(n=>n.uuid == e.target.dataset.chapter)[0]
        let targetItem = chapter.topics.filter(n=>n.uuid == e.target.dataset.topic)[0]
        if (targetItem) {
          if (!targetItem.archived) {//toogle the status
            targetItem.archived = true;
          }else if (targetItem.archived) {
            targetItem.archived = false;
          }
          update()
          renderMeeting(meeting)
        }
      }
    })
    connect(".action_meetingmanager_list_delete_topic","click",(e)=>{
      let newName = confirm("This topic will be deleted definitely!")
      if (newName) {
        let meeting = store.meetings.items.filter(n=>n.uuid == e.target.dataset.meeting)[0]
        let chapter = meeting.chapters.filter(n=>n.uuid == e.target.dataset.chapter)[0]
        chapter.topics = chapter.topics.filter(n=>n.uuid != e.target.dataset.topic) //TODO use reducer

      }
      update()
      renderMeeting(meeting)
    })
    connect(".action_meeting_manager_edit_item", "click", (e)=>{
      let targetItem = getTopicItemByUuid(e.target.dataset.id)
      console.log(targetItem);
      console.log(e.target);
      e.target.parentElement.innerHTML=`
      <textarea class='meeting_mde_input'></textarea>
      <button class="ui basic mini red button action_meeting_manager_close_edit">Close</button>
      `
      let easyMDE = new EasyMDE({
        element: document.querySelector(".meeting_mde_input"),
        autoDownloadFontAwesome:false,
        spellChecker:false,
        initialValue : targetItem.content
      });

      easyMDE.codemirror.on("change", function(){
      	console.log(easyMDE.value());
        if (targetItem) {
          targetItem.content = easyMDE.value()//TODO use routes. UGLY
        }
        // e.content = easyMDE.value()//TODO use routes. UGLY
      });
      // let type = e.target.dataset.type
      if (false) {//TODO This has to be removed and routes must be used
        let meeting = store.meetings.items.filter(n=>n.uuid == currentOpenedMeeting)[0]
        // let chapter = meeting.chapters.filter(n=>n.uuid == e.target.dataset.chapter)[0]
        // let topic = chapter.topics.filter(n=>n.uuid == e.target.dataset.topic)[0]
        if (topic) {
          topic.items.push({uuid:uuid(),type:type, date:new Date(), content:"un exemple"})
          update()
          renderMeeting(meeting)
        }
      }
    })
    connect(".action_meetingmanager_list_delete_item", "click", (e)=>{
      let targetItem = getTopicItemByUuid(e.target.dataset.id)
      console.log(e.target.dataset.id);
      console.log(getTopicItemParentsByUuid(e.target.dataset.id));
      let topic = getTopicItemParentsByUuid(e.target.dataset.id).topic
      if (confirm(targetItem.content+" will be removed")) {
        topic.items = topic.items.filter(n=>n.uuid != e.target.dataset.id) //TODO use reducer
        update()
      }

    })
    connect(".action_meeting_manager_set_resolved", "click", (e)=>{
      let targetItem = getTopicItemByUuid(e.target.dataset.id)
      console.log(targetItem);
      targetItem.resolved = true
      let linkObject = currentMeetingObject.relations.find(r=>r.source == targetItem.uuid)
      if (linkObject) {//see if there is a linked action
        if (targetItem.type == 'action' && confirm('Close related action in database?')) {
          push(act.edit("actions",{uuid:linkObject.target,prop:"open", value:false, project:store.uuid}))
          push(act.edit("actions",{uuid:linkObject.target,prop:"closedOn", value:Date.now(), project:store.uuid}))
        }
      }
      update()
    })
    connect(".action_meeting_manager_set_resolved_partial", "click", (e)=>{
      let targetItem = getTopicItemByUuid(e.target.dataset.id)
      targetItem.resolved = true
      update()
    })
    connect(".action_meeting_manager_set_unresolved", "click", (e)=>{
      let targetItem = getTopicItemByUuid(e.target.dataset.id)
      console.log(targetItem);
      targetItem.resolved = false
      let linkObject = currentMeetingObject.relations.find(r=>r.source == targetItem.uuid)
      if (linkObject) {//see if there is a linked action
        if (targetItem.type == 'action' && confirm('Re-Open related action in database?')) {
          push(act.edit("actions",{uuid:linkObject.target,prop:"open", value:true, project:store.uuid}))
          push(act.edit("actions",{uuid:linkObject.target,prop:"closedOn", value:"", project:store.uuid}))
        }
      }
      update()
    })
    connect(".action_meeting_manager_close_edit", "click", (e)=>{
      let meeting = store.meetings.items.filter(n=>n.uuid == currentOpenedMeeting)[0]
      if (meeting) {
        update()
        renderMeeting(meeting)
      }
    })
    connect(".action_meeting_manager_add_meeting", "click", (e)=>{
      store.meetings.items.push({//TODO create a reducer
        uuid:uuid(),
        relations:[],
        title:"Meeting exemple",
        createdOn:new Date(),
        content:"Use Markdown",
        participants:{
          present:[],
          absent:[],
          cc:[]
        },
        chapters:[
          {
            uuid:uuid(),
            name:"Chapitre",
            topics:[
              {
                uuid:uuid(),
                name:"Topic",
                items:[
                  {uuid:uuid(),type:"action", date:new Date(), content:"An exemple"}
                ]
              }
            ]
          }
        ]
      })
      update()
    })
    connect(".action_meeting_manager_add_meeting_follow_up", "click", (e)=>{

      let meeting = store.meetings.items.find(m=>m.uuid == currentOpenedMeeting)
      if (meeting) {
        let newMeeting = deepCopy(meeting)
        newMeeting.uuid = uuid()
        newMeeting.createdOn=new Date()
        newMeeting.chapters.forEach(function (c) {
          c.topics.forEach(function (t) {
            t.items.forEach(function (i) {
              i.freeze = true
            })
          })
        })
        store.meetings.items.push(newMeeting)//TODO add reducer
        update()
      }
      update()
    })
    connect(".action_meeting_manager_create_print_view", "click", (e)=>{
          // remove unused elements
          document.querySelector('.side-left-menu').style.display = "none"
          document.querySelector('.main-menu').style.display = "none"
          document.querySelector('.center-container').style.height = "auto"
          document.querySelector('.main-container').style.height = "auto"
          document.querySelector('.main-container').style.paddingLeft= "0px"
          document.querySelector('.meetingAreaEditor').style.width= "100%"
          document.querySelector('.meetingAreaEditor').style.marginLeft="26px"
          document.querySelector('.new-meeting-item').style.fontWeight="bold"

          //clean for prints
          let meetingContainer = document.querySelector('.meetingAreaEditor')
          meetingContainer.querySelectorAll('.button').forEach(function(a){
          a.remove()
          })
          meetingContainer.querySelectorAll('.edit').forEach(function(a){
          a.remove()
          })
          meetingContainer.querySelectorAll('.manage_tag_button').forEach(function(a){
          a.remove()
          })
          meetingContainer.querySelectorAll('.action_meetingmanager_list_delete_chapter').forEach(function(a){
          a.remove()
          })
          meetingContainer.querySelectorAll('.action_meetingmanager_list_archive_topic').forEach(function(a){
          a.remove()
          })
          meetingContainer.querySelectorAll('.action_meetingmanager_list_delete_topic').forEach(function(a){
          a.remove()
          })
          meetingContainer.querySelectorAll('.action_meetingmanager_list_delete_item').forEach(function(a){
          a.remove()
          })

          setTimeout(function () {
            window.print();
          }, 1000);

          document.querySelector('.meetingAreaEditor').addEventListener('click',function (e) {
            document.querySelector('.side-left-menu').style.display = "block"
            document.querySelector('.main-menu').style.display = "block"
            document.querySelector('.center-container').style.height = "100%"
            document.querySelector('.main-container').style.height = "100%"
            document.querySelector('.main-container').style.paddingLeft= "50px"

            let meeting = store.meetings.items.filter(n=>n.uuid == currentOpenedMeeting)[0]
            if (meeting) {
              update()
              renderMeeting(meeting)
            }
          })



    })
    connect(".action_meeting_manager_create_relations_from_meeting", "click", (e)=>{
      let actionPool=[]
      function addRelationToMeetingData(sourceTopicId, targetId,type) {
        let actionObject = {source:sourceTopicId, target:targetId, type:type}
        meeting.relations.push(actionObject)
      }

      let meeting = store.meetings.items.find(m=>m.uuid == currentOpenedMeeting)
      if (meeting) {
        meeting.chapters.forEach(function (c) {
          c.topics.forEach(function (t) {
            t.items.forEach(function (i) {
              if (!i.freeze && !meeting.relations.find(r=>r.source ==i.uuid)) {//not frozen and does not exist already
                if (i.type == "requirement") {
                  let targetId = uuid()
                  push(addRequirement({uuid:targetId,name:i.content}))
                  if (i.assignedTo) {
                    for (newSelected of i.assignedTo) {
                      push(act.add("metaLinks",{type:"origin", source:targetId, target:newSelected}))
                    }
                  }
                  confirm("Requirement "+i.content+" will be created")
                  addRelationToMeetingData(i.uuid,targetId,i.type)
                }else if (i.type == "action") {
                  let targetId = uuid()
                  confirm("action "+i.content+" will be created")
                  var newAction ={uuid:targetId, project:store.uuid, open:true, name:i.content, des:undefined, dueDate:i.eta, created:Date.now()}
                  push(act.add("actions",newAction))
                  if (i.assignedTo) {
                    for (newSelected of i.assignedTo) {
                      store.metaLinks.items.push({type:"assignedTo", source:targetId, target:newSelected})//TODO remove this side effect
                    }
                  }
                  addRelationToMeetingData(i.uuid,targetId,i.type)
                }
              }
            })
          })
        })
        console.log(actionPool);
        update()
      }
      update()
    })
    connect(".action_meeting_manager_create_linked_item", "click", (e)=>{
      let actionPool=[]
      function addRelationToMeetingData(sourceTopicId, targetId,type) {
        let actionObject = {source:sourceTopicId, target:targetId, type:type}
        meeting.relations.push(actionObject)
      }

      let meeting = store.meetings.items.find(m=>m.uuid == currentOpenedMeeting)
      let targetItem = getTopicItemByUuid(e.target.dataset.id)
      if (targetItem && meeting) {
        let i = targetItem //todo create a function for to resolve this and previous connection
        if (!i.freeze && !meeting.relations.find(r=>r.source ==i.uuid)) {//not frozen and does not exist already
          if (i.type == "requirement" && confirm("Requirement "+i.content+" will be created")) {
            let targetId = uuid()
            push(addRequirement({uuid:targetId,name:i.content}))
            if (i.assignedTo) {
              for (newSelected of i.assignedTo) {
                push(act.add("metaLinks",{type:"origin", source:targetId, target:newSelected}))
              }
            }
            if (i.relatedTo) {
              for (newSelected of i.relatedTo) {
                push(act.add("metaLinks",{type:"originNeed", source:newSelected, target:targetId}))
              }
            }
            addRelationToMeetingData(i.uuid,targetId,i.type)
          }else if (i.type == "action" && confirm("Action "+i.content+" will be created")) {
            let targetId = uuid()
            var newAction ={uuid:targetId, project:store.uuid, open:true, name:i.content, des:undefined, dueDate:i.eta, created:Date.now()}
            push(act.add("actions",newAction))
            if (i.assignedTo) {
              for (newSelected of i.assignedTo) {
                store.metaLinks.items.push({type:"assignedTo", source:targetId, target:newSelected})//TODO remove this side effect
              }
            }
            addRelationToMeetingData(i.uuid,targetId,i.type)
          }
        }
      }
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
    setUpSearch(document.querySelector(".meeting_search_input"), store.meetings.items)
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
    //   element: document.querySelector('.inputmeetingAreaEditor'),
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
      var value = document.querySelector(".meeting_search_input").value
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
      currentMeetingObject = meeting
      renderMeeting(meeting)
    }
  }

  var getTopicItemByUuid = function (uuid) {
    console.log(uuid);
    let item = undefined
    let meeting = store.meetings.items.filter(n=>n.uuid == currentOpenedMeeting)[0]
    meeting.chapters.forEach(function (c) {
      c.topics.forEach(function (t) {
        if (!item) {
          item = t.items.find(i => i.uuid== uuid)
          console.log(item);
        }else {
          return item
        }

      })
    })
    return item
  }
  var getTopicItemParentsByUuid = function (uuid) {
    console.log(uuid);
    let item = undefined
    let info = {}
    let meeting = store.meetings.items.filter(n=>n.uuid == currentOpenedMeeting)[0]
    info.meeting=meeting
    meeting.chapters.forEach(function (c) {
      c.topics.forEach(function (t) {
        if (!item) {
          item = t.items.find(i => i.uuid== uuid)
          if (item) {
            info.topic=t
          }
          console.log(item);
        }else {
        }

      })
    })
    return info
  }
  var generateListeFromParticipantId = function (topicItemId, isEditable) {

    let names = getTopicItemByUuid(topicItemId).assignedTo

    var editHtml = `<i data-item="${topicItemId}" data-value='${names? JSON.stringify(names):JSON.stringify([])}' data-id="${topicItemId}"  class="edit icon action_meeting_manager_list_select_item_assigned" style="opacity:0.2"></i>`

    function reduceChoices(acc, e) {
      console.log(e);
      var foudItem = store.stakeholders.items.find(i=>i.uuid == e)
      var newItem = foudItem.name + " "+ (foudItem.lastName+" " || " ")+(foudItem.org || "")+" "
      var formatedNewItem = newItem
      if(formatedNewItem.length > 25) {
          formatedNewItem = newItem.substring(0,10)+".. ";
      }
      var htmlNewItem = `<div data-inverted="" data-tooltip="${newItem}" class="ui mini teal label">${formatedNewItem}</div>`
      return acc += htmlNewItem
    }

    var mainText = `<div class="ui mini label">All</div>`
    if (names && names[0]) {
      mainText = names.reduce(reduceChoices,"")
    }
    if (isEditable) {
      return mainText + editHtml
    }else {
      return mainText
    }
  }
  var generateListeFromProductsId = function (topicItemId, isEditable) {

    let names = getTopicItemByUuid(topicItemId).relatedTo

    var editHtml = `<i data-item="${topicItemId}" data-value='${names? JSON.stringify(names):JSON.stringify([])}' data-id="${topicItemId}"  class="edit icon action_meeting_manager_list_select_pbs_related" style="opacity:0.2"></i>`

    function reduceChoices(acc, e) {
      console.log(e);
      var foudItem = store.currentPbs.items.find(i=>i.uuid == e)
      var newItem = foudItem.name
      var formatedNewItem = newItem
      if(formatedNewItem.length > 25) {
          formatedNewItem = newItem.substring(0,10)+".. ";
      }
      var htmlNewItem = `<div data-inverted="" data-tooltip="${newItem}" class="ui mini teal label">${formatedNewItem}</div>`
      return acc += htmlNewItem
    }

    var mainText = `<div class="ui mini label">None</div>`
    if (names && names[0]) {
      mainText = names.reduce(reduceChoices,"")
    }
    if (isEditable) {
      return mainText + editHtml
    }else {
      return mainText
    }
  }

  var generateParticipantHtml= function (participants) {
    let html = ""
    participants.forEach(function (p) {
      let stakeholder = store.stakeholders.items.find(s=>s.uuid == p)
      if (stakeholder) {
        html += theme.meetingParticipant(stakeholder)
      }
    })
    return html
  }

  function checkIfTargetIsReachable(uuid){
    var store = query.currentProject()
    if (store.actions.items.find(i=>i.uuid == uuid)) {return true }
    else if (store.requirements.items.find(i=>i.uuid == uuid)) {return true }
    // else if (store.functions.items.find(i=>i.uuid == uuid)) { return true}
    // else if (store.stakeholders.items.find(i=>i.uuid == uuid)) {return true }
    // else if (store.physicalSpaces.items.find(i=>i.uuid == uuid)) {return true }
    else {
      return false
    }
  }

  var update = function () {
    saveDB() //TODO move all to actions!
    render()
    if (currentOpenedMeeting) {
      loadMeetingByUuid(currentOpenedMeeting)
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
