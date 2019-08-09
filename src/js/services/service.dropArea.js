var createDropAreaService = function () {
  var self ={};
  var objectIsActive = false;

  var init = function () {


  }
  var connections =function () {

  }

  var setDropZone = function (target, callback) {

    //Same as $(document).ready();
      function ready(fn) {
        if (document.readyState != 'loading'){
          fn();
        } else {
          document.addEventListener('DOMContentLoaded', fn);
        }
      }

      //When the page has loaded, run this code
      ready(function(){
        console.log('Start setting dropzone');
        // prevent default behavior from changing page on dropped file
        window.ondragover = function(e) { e.preventDefault(); return false };
        // NOTE: ondrop events WILL NOT WORK if you do not "preventDefault" in the ondragover event!!
        window.ondrop = function(e) { e.preventDefault(); return false };

        const holder = document.querySelector(target);
        // holder.ondragover = function () { this.className = 'hover'; return false; };
        // holder.ondragleave = function () { this.className = ''; return false; };
        holder.ondrop = function (e) {
          e.preventDefault();

          for (let i = 0; i < e.dataTransfer.files.length; ++i) {
            console.log(e.dataTransfer.files[i]);
            console.log(e.dataTransfer.files[i].path);
           alert(e.dataTransfer.files[i].path);
           nwMoveFilesToAppFolder(e.dataTransfer.files[i].name,e.dataTransfer.files[i].path, callback)
          }
          return false;
        };
      });
  }

  var nwMoveFilesToAppFolder = function (sourceName,sourcePath, callback) {
    const fs = require('fs');
    const path = require('path');
    let currentCallback = callback

    let filename = sourceName;
    let src = sourcePath;
    let destDir = path.join(nw.App.dataPath, 'storage_'+query.currentProject().uuid);

    fs.access(destDir, (err) => {
      if(err){
        console.log(err)
        fs.mkdirSync(destDir);
        }

      //check if file exists
       fs.exists(path.join(destDir, filename), function(exists) {
         if (exists && confirm("File already exist. Overwrite?")) {
           // filename = filename +" " + Date.now()
           copyFile(src, path.join(destDir, filename), currentCallback);
         }else if (!exists){
           copyFile(src, path.join(destDir, filename), currentCallback);
         }else {
           alert("Operation Canceled")
         }
      });


    });


    function copyFile(src, dest, callback) {
      let currentCallback = callback

      let readStream = fs.createReadStream(src);

      readStream.once('error', (err) => {
        console.log(err);
        alert(err);
      });

      readStream.once('end', () => {
        alert('file Added');
        push(act.add("documents",{uuid:genuuid(), name:filename, osPath:dest}))

        if (currentCallback) {
          currentCallback()
        }
      });

      readStream.pipe(fs.createWriteStream(dest));
    }
  }



  var setActive =function () {
    objectIsActive = true;
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.setDropZone = setDropZone
  self.setInactive = setInactive
  self.init = init

  return self
}

var dropAreaService = createDropAreaService()
dropAreaService.init()
