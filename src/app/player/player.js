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
    var owner = token;
    var cm = inst.cmManager;
	// load danmaku
	$.get("/danmaku/"+token, function(data, status) {
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


	if (typeof io != "undefined") {
		// websocket
		var socket = new io.connect("http:\/\/" + window.location.hostname + ":4000/");

		// enter channel
		socket.emit("enter_channel", token);
		//subscribe live danmaku
		socket.on("live_danmaku", function(danmaku){
				console.log(danmaku);
				inst.dminsert(danmaku);
		});
		inst.addListener("senddanmaku",function(dm){
			dm.owner=token;
			if (inst.playing) {
				inst.dmsend(dm);
				setTimeout(function(){socket.emit("send_danmaku", dm);}, 1000);
			} else {
				dm.stime+=500;
				socket.emit("send_danmaku", dm);
			}
		});
	}
    
    
    

    //inst.scripting = true;
    

    if (callbacks != null)
        callbacks()
}

