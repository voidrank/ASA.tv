// dom_id = 'upload-avatar'
$(function(){
  document.getElementById('upload-avatar').innerHTML =
  '<div id="preview"></div>'
  +'<div id="preview1" style="width:30px;height:30px;overflow:hidden;"></div>'
  +'<div id="preview2" style="width:80px;height:80px;overflow:hidden;"></div>'
  +'<div id="preview3" style="width:150px;height:150px;overflow:hidden;"></div>'
  +'<input type="file" onchange="preview(this)" name="up_img"/>'
  +'<input type="hidden" id="x" name="x" />'
  +'<input type="hidden" id="y" name="y" />'
  +'<input type="hidden" id="w" name="w" />'
  +'<input type="hidden" id="h" name="h" />'
  +'<input type="button" value="confirm uploading avatar" onclick="submitAvatar()"/>';
  //+'<div id="ccc"></div>';
  });

function submitAvatar()
{
    var files = $('input[name="up_img"]').prop('files');
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
        if (checkCoords() == false) return false;
        
        var xhr = new XMLHttpRequest();
        var x1 =parseInt(jQuery('#x').val());
        var y1 =parseInt(jQuery('#y').val());
        var x2 =(parseInt(jQuery('#x').val())+parseInt(jQuery('#w').val()));
        var y2 =(parseInt(jQuery('#y').val())+parseInt(jQuery('#h').val()));
        xhr.open("patch", "/homepage/avatar/?"+"x1="+x1.toString()+"&y1="+y1.toString()+"&x2="+x2.toString()+"&y2="+y2.toString(), true);
        xhr.send(data);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                    alert("Upload successfully");
                else
                    //document.getElementById("ccc").innerHTML = xhr.response;
                    alert(xhr.response.reason);
            }
        }
    }
}

function updateCoords(c) {
    jQuery('#x').val(c.x);
    jQuery('#y').val(c.y);
    jQuery('#w').val(c.w);
    jQuery('#h').val(c.h);
    if (parseInt(c.w) > 0)
    {
        var rx = 30 / c.w;
        var ry = 30 / c.h;
        
        $('#preimg1').css({
                          width: Math.round(rx * $('#jcrop_target').width()) + 'px',
                          height: Math.round(ry * $('#jcrop_target').height()) + 'px',
                          marginLeft: '-' + Math.round(rx * c.x) + 'px',
                          marginTop: '-' + Math.round(ry * c.y) + 'px'
                          }).show();
        
        var rx = 80 / c.w;
        var ry = 80 / c.h;
        
        $('#preimg2').css({
                          width: Math.round(rx * $('#jcrop_target').width()) + 'px',
                          height: Math.round(ry * $('#jcrop_target').height()) + 'px',
                          marginLeft: '-' + Math.round(rx * c.x) + 'px',
                          marginTop: '-' + Math.round(ry * c.y) + 'px'
                          }).show();
        
        var rx = 150 / c.w;
        var ry = 150 / c.h;
        
        $('#preimg3').css({
                          width: Math.round(rx * $('#jcrop_target').width()) + 'px',
                          height: Math.round(ry * $('#jcrop_target').height()) + 'px',
                          marginLeft: '-' + Math.round(rx * c.x) + 'px',
                          marginTop: '-' + Math.round(ry * c.y) + 'px'
                          }).show();
    }
};

function hidePreview()
{
    $('#preimg1').stop().fadeOut('fast');
    $('#preimg2').stop().fadeOut('fast');
    $('#preimg3').stop().fadeOut('fast');
};

function checkCoords()
{
    if (parseInt(jQuery('#w').val())>0) return true;
    alert('Please select a crop region then press submit.');
    return false;
};

function preview(file)
{
    var prevDiv = document.getElementById('preview');
    var prevDiv1 = document.getElementById('preview1');
    var prevDiv2 = document.getElementById('preview2');
    var prevDiv3 = document.getElementById('preview3');
    if (file.files && file.files[0])
    {
        var reader = new FileReader();
        reader.onload = function(evt){
            prevDiv.innerHTML = '<img src="' + evt.target.result + '" id="jcrop_target"/>';
            prevDiv1.innerHTML = '<img src="' + evt.target.result + '" id="preimg1"/>';
            prevDiv2.innerHTML = '<img src="' + evt.target.result + '" id="preimg2"/>';
            prevDiv3.innerHTML = '<img src="' + evt.target.result + '" id="preimg3"/>';
            $(function(){
              jQuery('#jcrop_target').Jcrop({
                                            onChange: updateCoords,
                                            onSelect: updateCoords,
                                            onRelease: hidePreview,
                                            boxWidth: 320,
                                            boxHeight: 320,
                                            aspectRatio: 1
                                            });
              
              });
        }
        reader.readAsDataURL(file.files[0]);
    }else
    {
        prevDiv.innerHTML = '<div class="img" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' + file.value + '\'" id="jcrop_target"></div>';
        prevDiv1.innerHTML = '<div class="img" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' + file.value + '\'" id="preimg1"></div>';
        prevDiv2.innerHTML = '<div class="img" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' + file.value + '\'" id="preimg2"></div>';
        prevDiv3.innerHTML = '<div class="img" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' + file.value + '\'" id="preimg3"></div>';
    }
    
}
