//requires
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// express routing
app.use(express.static('public'));


// signaling
io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('create or join', function (lift) {
        console.log('create or join to lift ', lift);
        
        var myRoom = io.sockets.adapter.rooms[lift] || { length: 0 };
        var numClients = myRoom.length;

        console.log(lift, ' has ', numClients, ' clients');

        if (numClients == 0) {
            socket.join(lift);
            socket.emit('created', lift);
        } else if (numClients == 1) {
            socket.join(lift);
            socket.emit('joined', lift);
        } else {
            socket.emit('full', lift);
        }
    });

    socket.on('ready', function (lift){
        socket.broadcast.to(lift).emit('ready');
    });

    socket.on('candidate', function (event){
        socket.broadcast.to(event.lift).emit('candidate', event);
    });

    socket.on('offer', function(event){
        socket.broadcast.to(event.lift).emit('offer',event.sdp);
    });

    socket.on('answer', function(event){
        socket.broadcast.to(event.lift).emit('answer',event.sdp);
    });

});

// listener
http.listen(3000, function () {
    console.log('listening on *:3000');
});