var http = require('http');
var fs = require('fs');
var request = require('request');
var cookie_reader = require('cookie');
var querystring = require('querystring');

var io = require('socket.io').listen(4000);

console.log("service start");

io.sockets.on('connection', function (socket) {
    console.log("a client connected");

    // enter channel
    socket.on("enter_channel", function(token){
        socket.join(token, function(err){
            if (err != null)
                console.log(err);
        });
    })

    // client to client
    socket.on("send_danmaku", function(danmaku){
        io.sockets.emit("live_danmaku", danmaku);
        console.log(danmaku);

        // django server
        request.post({url:'http://localhost:8000/danmaku/'+danmaku['owner'], form:danmaku}, function(error, response, body){
            fs.writeFile('log.html', body);
        });
    });
});
