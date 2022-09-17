//requires
const express = require("express");
const app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

// variables
const queue = [];

// express routing
app.use(express.static("public"));

// signaling
io.on("connection", function (socket) {
  console.log("a user connected");

  socket.on("create or join", function (room) {
    console.log("create or join to room ", room);

    var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
    var numClients = myRoom.length;

    console.log(room, " has ", numClients, " clients");

    if (numClients == 0) {
      socket.join(room);
      socket.emit("created", room);
    } else if (numClients == 1) {
      socket.join(room);
      socket.emit("joined", room);
    } else {
      socket.emit("full", room);
    }
  });

  socket.on("ready", function (room) {
    socket.broadcast.to(room).emit("ready");
  });

  socket.on("candidate", function (event) {
    socket.broadcast.to(event.room).emit("candidate", event);
  });

  socket.on("offer", function (event) {
    socket.broadcast.to(event.room).emit("offer", event.sdp);
  });

  socket.on("answer", function (event) {
    socket.broadcast.to(event.room).emit("answer", event.sdp);
  });
});

// queue user
app.get("/queue", (req, res) => {
  const liftId = req.params["liftId"];
  res.send("1");
});

app.get('/lift', async function(req, res) {
    var liftId = req.query.liftId;
    console.log("liftId '" + liftId + "' in request");

    var request = require('request');
    var options = {
      'method': 'GET',
      'url': 'https://hack.myport.guide/lift/',
      'headers': {
          'Accept': 'application/json'
        }
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
       var json = JSON.parse(response.body);
       for(var attributename in json){
          var name =  json[attributename].name;
          console.log("Lift name '" + name + "' found");
          if (name == liftId)  {
            console.log("Lift Id '" + liftId + "' match name '" + name + "'");
            return res.send(json[attributename]);
          }
       }
       return res.send("Did not found lift by Id" + liftId);
    });
});

// listener
http.listen(3000, function () {
  console.log("listening on *:3000");
});
