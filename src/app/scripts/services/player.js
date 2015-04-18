define('player', ['ABPlayer'], function(ABPlayer){
  function render(resourceUrl, sendDanmakuUrl, callbacks){ 
    // construct player
    var inst = ABPlayer.create(document.getElementById("player"),{
      "src":{
        "playlist":[
        {
          "sources":{"video/mp4": resourceUrl},
        },
        ],
      },
      "width":1280,
      "height":640
    });
    inst.disableTime = 4;
    var cm = inst.cmManager;
    // load danmaku
    $.get(sendDanmakuUrl, function(data, status) {
      if (status!="success") {
        console.log("Network Error: "+status);
        return;
      }
      var res = eval(data);
      for (var i=0;i<res.length;++i) {
        if (typeof res[i].date == "undefined") res[i].date=parseInt(new Date(0).getTime()/1000);
        inst.dminsert(res[i]);
      }
    });

    inst.addListener("senddanmaku", function(dm){
      inst.dmsend(dm);
      $.post(sendDanmakuUrl, dm);
    });
    //inst.scripting = true;


    if (callbacks != null)
      callbacks()
  }
  return render;
});
