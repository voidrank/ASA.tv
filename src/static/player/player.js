function render_player(token, callbacks){ 
  // construct player
  var inst = ABP.create(document.getElementById("player"),{
    "src":{
      "playlist":[
      {
        "sources":{"video/mp4":"/download/"+token},
      },
      ],
    },
    "width":1280,
    "height":640
  });
  inst.disableTime = 4;
  var owner = token;
  var cm = inst.cmManager;
  // load danmaku
  $.get("/api/danmaku/"+token, function(data, status) {
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
    dm.owner=token;
    inst.dmsend(dm);
    $.post("/api/danmaku/" + token, dm);
  });
  //inst.scripting = true;


  if (callbacks != null)
    callbacks()
}
