var createCscViewer = function () {
  var self ={};
  var objectIsActive = false;

  //variables
  var searchFilter = ""
  var displayCurrentCDCSource = false
  var lastCDCInnerHtml =""


  var init = function () {
    connections()
  }
  var connections =function () {
    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();
    connect(".action_search","keyup",(e)=>{
      var callback = function () {
        searchFilter= e.target.value
        update()
      }
      delay(callback,1000)
    })
    connect(".action_toogle_download","click",(e)=>{
      if (!displayCurrentCDCSource) {
        displayCurrentCDCSource = true;
      }else {
        displayCurrentCDCSource = false;
      }
      update()
    })
    connect(".action_toogle_add","click",(e)=>{
      var store = query.currentProject()
      console.log(e.target.dataset.id);
      if (!store.currentCDC.items.includes(e.target.dataset.id)) {
        store.currentCDC.items.push(e.target.dataset.id)
      }else {
        store.currentCDC.items = store.currentCDC.items.filter((item)=>item != e.target.dataset.id)
      }
      renderCDC()
      //update() TODO change methode

    })

  }

  var render = function () {
    renderAllCDC(app.cscDB.db, searchFilter)
  }

  var update = function () {
    if (objectIsActive) {
      render()
    }
  }

  var setActive =function () {
    objectIsActive = true;
    setLoading()
    setTimeout(function () {
      update()
    }, 10);


  }

  var setInactive = function () {
    objectIsActive = false;
    lastCDCInnerHtml =""
    document.querySelector(".toc-area").innerHTML = ""
    document.querySelector(".center-container").innerHTML = ""
  }
  //GENERAL FUNCTIONS
  function setLoading() {
    document.querySelector(".center-container").innerHTML = `
    <div class="ui placeholder">
      <div class="header">
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>
    <div id="newcdc" class="ui raised padded loading  justified container segment">
      <div class="ui fluid placeholder">
        <div class="image header">
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="paragraph">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="image header">
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="paragraph">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="image header">
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="paragraph">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
      </div>
    </div>
    `
  }
  function renderAllCDC(db, filter) {
    var lastTopCat ={ name:undefined};
    var lastMiddleCat = { name:undefined};
    var lastSubCat= { name:undefined};
    // Render the CDC to the page
    function renderHTML(accu, item) {
      var executionIsDisplayed = false
      var html = ""
      //add title and subtitle
      console.log(lastTopCat);
      console.log(item.topCat);
      console.log(lastTopCat.name != item.topCat.name);
      if (lastTopCat != item.topCat) {
        lastTopCat = item.topCat
        html += `<h1 class="ui header">${item.topCat.name}</h1>`
        if (item.topCat.general != "") {
          html += `<div class="">${item.topCat.general}</div>`
        }
      }
      if (lastMiddleCat.name  != item.middleCat.name ) {
        lastMiddleCat = item.middleCat
        html += `<h2 class="ui header">${item.middleCat.name}</h2>`
        if (item.middleCat.general != "") {
          html += `<div class="">${item.middleCat.general}</div>`
        }
      }
      if (lastSubCat.name  != item.subCat.name ) {
        lastSubCat = item.subCat
        html += `<h3 class="ui header">${item.subCat.name}</h3>`
        if (item.subCat.general != "") {
          html += `<div class="">${item.subCat.general}</div>`
        }
      }
      //add item
      html += `<h4 id="${item.uuid}" " class="ui blue header">${item.name}</h4>`
      for (prop of itemPropList) {
        if (item[prop[1]]) { //check if prop exist
          if (prop[1] == "execution" && !executionIsDisplayed) {
            executionIsDisplayed = true
            html += `<h5 class="ui grey header">${prop[1]}</h5>`
            html += item[prop[1]]
          }else if(prop[1] != "execution"){
            html += `<h5 class="ui grey header">${prop[1]}</h5>`
            html += item[prop[1]]
          }
        }
      }
      return accu + html
    }
    function renderDownloadHTML(accu, item) {
      var store = query.currentProject() //TODO tor remove
      var executionIsDisplayed = false
      var html = ""
      //add title and subtitle
      if (lastTopCat.name  != item.topCat.name ) {
        lastTopCat = item.topCat
        html += `<h1 class="ui header">${item.topCat.name}</h1>`
        if (item.topCat.general != "") {
          html += `<div class="">${item.topCat.general}</div>`
        }
      }
      if (lastMiddleCat.name  != item.middleCat.name ) {
        lastMiddleCat = item.middleCat
        html += `<h2 class="ui header">${item.middleCat.name}</h2>`
        if (item.middleCat.general != "") {
          html += `<div class="">${item.middleCat.general}</div>`
        }
      }
      if (lastSubCat.name  != item.subCat.name ) {
        lastSubCat = item.subCat
        html += `<h3 class="ui header">${item.subCat.name}</h3>`
        if (item.subCat.general != "") {
          html += `<div class="">${item.subCat.general}</div>`
        }
      }
      //add item

      html += `<h4 id="${item.uuid}" " class="ui blue header">${item.name}</h4>`
      var metalink = store.metaLinks.filter((i)=>i.target == item.uuid)
      if (metalink[0]) {
        var linkedItem = getItemsFromPropValue(store.currentPbs.items, "uuid", metalink[0].source)
        html +=`<h5 class="ui grey header">S'applique à ${linkedItem[0].name}</h5>`
      }
      for (prop of itemPropList) {
        if (item[prop[1]]) { //check if prop exist
          if (prop[1] == "execution" && !executionIsDisplayed) {
            executionIsDisplayed = true
            html += `<h5 class="ui grey header">${prop[1]}</h5>`
            html += item[prop[1]]
          }else if(prop[1] != "execution"){
            html += `<h5 class="ui grey header">${prop[1]}</h5>`
            html += item[prop[1]]
          }
        }
      }
      return accu + html
    }

    function renderDownloadHTMLTable(accu, item) {
      var executionIsDisplayed = false
      var html = ""
      //add title and subtitle
      if (lastTopCat.name  != item.topCat.name ) {
        lastTopCat = item.topCat
        html += `<tr>
          <td data-label="Desc">${item.topCat.name}</td>
          <td data-label="Type"></td>
          <td data-label="Qt"></td>
          <td data-label="Unité"></td>
          <td data-label="prix"></td>
        </tr>`
      }
      if (lastMiddleCat.name  != item.middleCat.name ) {
        lastMiddleCat = item.middleCat
        html += `<tr>
          <td data-label="Desc">${item.middleCat.name}</td>
          <td data-label="Type"></td>
          <td data-label="Qt"></td>
          <td data-label="Unité"></td>
          <td data-label="prix"></td>
        </tr>`
      }
      if (lastSubCat.name  != item.subCat.name ) {
        lastSubCat = item.subCat
        html += `<tr>
          <td data-label="Desc">${item.subCat.name}</td>
          <td data-label="Type"></td>
          <td data-label="Qt"></td>
          <td data-label="Unité"></td>
          <td data-label="prix"></td>
        </tr>`
      }
      //add item
      html += `<tr>
        <td data-label="Desc">${item.name}</td>
        <td data-label="Type">Qp</td>
        <td data-label="Qt">200</td>
        <td data-label="Unité">m²</td>
        <td data-label="prix"></td>
      </tr>`
      // var metalink = store.metaLinks.filter((i)=>i.target == item.uuid)
      // if (metalink[0]) {
      //   var linkedItem = getItemsFromPropValue(store.currentPbs.items, "uuid", metalink[0].source)
      //   html +=`<h5 class="ui grey header">S'applique à ${linkedItem[0].name}</h5>`
      // }
      return accu + html
    }

    function renderTocHTML(accu, item) {
      var store = query.currentProject() //TODO tor remove
      var executionIsDisplayed = false
      var html = ""
      //add title and subtitle
      if (lastTopCat.name  != item.topCat.name ) {
        lastTopCat = item.topCat
        html += `<a class="active teal item">
          ${item.topCat.name}
        </a>`
      }
      if (lastMiddleCat.name  != item.middleCat.name ) {
        lastMiddleCat = item.middleCat
        html += `<a class="active teal item">
          ${item.middleCat.name}
        </a>`
      }
      if (lastSubCat.name  != item.subCat.name ) {
        lastSubCat = item.subCat
        html += `<a class="active teal item">
          ${item.subCat.name}
        </a>`
      }
      //add item
      var actionToogleCurrentHTML = `<i data-id="${item.uuid}"  class="action_toogle_add copy outline icon"></i>`
      if (store.currentCDC.items.includes(item.uuid)) {
        actionToogleCurrentHTML = `<i data-id="${item.uuid}"  class="action_toogle_add minus circle icon"></i>`
      }
      html += `<a href="#${item.uuid}" class="item">
        ${item.name} ${actionToogleCurrentHTML}
      </a>`
      return accu + html
    }


    function createWordFilter(filter) {
      var filterFunc = function (item) {
        if (filter && filter != "") {

          return fuzzysearch(filter, item.name) ||fuzzysearch(filter, item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
        }else {
          return true
        }
      }
      return filterFunc
    }
    function createListIDFilter(filterArray) {
      var filterFunc = function (item) {
        if (filterArray && filterArray[0]) {
          return filterArray.includes(item.uuid)
        }else {
          return true
        }
      }
      return filterFunc
    }

    var newHTML = db.items.filter(createWordFilter(filter)).reduce(renderHTML,"")
    var tocHTML = db.items.filter(createWordFilter(filter)).reduce(renderTocHTML,"")
    // var searchHTML = `<div class="item">
    //   <div class="ui transparent icon input">
    //     <input class="action_search"placeholder="Chercher dans le CDC..." type="text">
    //     <i class="search icon"></i>
    //   </div>
    // </div>`




    if (displayCurrentCDCSource) {
      var store = query.currentProject() //TODO tor remove
      resetGlobals()
      document.querySelector(".download-area-menu").style.display = "block"
      var fullCurrentHTML = db.items.filter(createListIDFilter(store.currentCDC.items)).reduce(renderDownloadHTML,"")
      document.querySelector(".text-dl-area").innerHTML = fullCurrentHTML
      selectText("dl_area")
      var lastTopCat = "plouffsefsefes"; //TODO Pq faut t'il mettre n'importe queoi
      var lastMiddleCat= "plouffsefsefes";
      var lastSubCat= "plouffsefsefes";
      var fullCurrentHTMLTable = db.items.filter(createListIDFilter(store.currentCDC.items)).reduce(renderDownloadHTMLTable,"")
      document.querySelector(".boq-dl-area-target").innerHTML = fullCurrentHTMLTable



    }else {
      document.querySelector(".download-area-menu").style.display = "none"
    }

    //perf test

    function asyncInnerHTML(HTML, callback) {
        var temp = document.createElement('div'),
            frag = document.createDocumentFragment();
        temp.innerHTML = HTML;
        (function(){
            if(temp.firstChild){
                frag.appendChild(temp.firstChild);
                setTimeout(arguments.callee, 0);
            } else {
                callback(frag);
            }
        })();
    }

    // var allTheHTML = '<div><a href="#">.............</div>';
    // asyncInnerHTML(newHTML, function(fragment){
    //     document.getElementById("newcdc").appendChild(fragment); // myTarget should be an element node.
    // });

    function replaceHtml(el, html) {
      var oldEl =  document.querySelector(el);
      /*@cc_on // Pure innerHTML is slightly faster in IE
        oldEl.innerHTML = html;
        return oldEl;
      @*/
      var newEl = oldEl.cloneNode(false);
      newEl.innerHTML = html;
      oldEl.parentNode.replaceChild(newEl, oldEl);
      /* Since we just removed the old element from the DOM, return a reference
      to the new element, which can be used to restore variable references. */
      return newEl;
    };

    //var el = replaceHtml("#newcdc", newHTML)
    // var fragment = document.createDocumentFragment();
    // el = document.createElement('div');
    // el.innerHTML = tocHTML;
    // fragment.appendChild(el);
    // document.querySelector(".toc-area").appendChild(fragment)
    //
    // var fragment = document.createDocumentFragment();
    // el = document.createElement('div');
    // el.innerHTML = newHTML;
    // fragment.appendChild(el);
    // document.getElementById("newcdc").appendChild(fragment)

    //original methods
    if (lastCDCInnerHtml != newHTML ) {//repaint only if needed
      var outerContainer = `<h1 class="ui grey header">CCB - Cahier des charges Accord-Cadre</h1>
      <div id="newcdc" class="ui raised padded  justified container segment">
      `
      document.querySelector(".center-container").innerHTML = outerContainer+ newHTML +'</div>'
    }
    lastCDCInnerHtml = newHTML
    document.querySelector(".toc-area").innerHTML = tocHTML

    // var el = replaceHtml("#newcdc", newHTML)
    // var el = replaceHtml(".toc-area", tocHTML)

  }

  var resetGlobals =function () {
    lastTopCat = undefined
    lastMiddleCat = undefined
    lastSubCat = undefined
    itemContentAggregator = undefined
    lastItem = {};
    aggregate = false
    isInItem = false
  }

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

var cscViewer = createCscViewer();
cscViewer.init()
