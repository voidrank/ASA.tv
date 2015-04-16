/**
 * @video-cover upload
 * @author InfiniteZe
**/
define('UploadVideoCover', [], function(){
  var UploadVideoCover;
  (function(){
    UploadVideoCover = function(input, videoCoverPreview, config){
      /*
       *  config = {
       *    'url': '/api/video_cover/$rec', //upload url
       *  }
       */
      input.onchange = function(){
        if (input.files.length > 0){
          var reader = new FileReader();
          reader.onload = function(event){
            videoCoverPreview.setAttribute('src', event.target.result);
          }
          reader.readAsDataURL(input.files[0]);
        }
      }

      this.startUpload = function(rec){
        console.log(input.files);
        var files = input.files;
        if (files.length == 0) {
          alert("Please choose an image");
          return false;
        }
        var file = files[0];
        if(!/image\/\w+/.test(file.type)){
          alert("The file should be an image");
          return false;
        }
        var reader = new FileReader();
        var data;
        reader.readAsArrayBuffer(file);
        reader.onload = function(e){
          data = e.target.result;
          var xhr = new XMLHttpRequest();
          xhr.open("POST", config.url + rec, true);
          xhr.onreadystatechange = function(){
            if (xhr.readyState == 4){
              if (xhr.status == 200)
                console.log(xhr)
              else
                //document.getElementById("ccc").innerHTML = xhr.response;
                console.log(xhr);
            }
          }
          xhr.send(data);
        }
      }
    }
  })();
  return UploadVideoCover;
})
