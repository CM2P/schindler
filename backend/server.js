//requires
const express = require("express");
const app = express();
const uuid = require("uuid");

var http = require("http").Server(app);
var io = require("socket.io")(http);

// cache
const games = new Map();

// express routing
app.use(express.static("public"));

const cors = require("cors");
const corsOption = {
  origin: [
    "http://localhost:8080",
    "https://dev.level-up.app",
    "https://prod.level-up.app",
    "https://level-up.app",
  ],
};
app.use(cors(corsOption));

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
// http://localhost:3000/queue/?liftId=A
// return a new game room with game status
app.get("/queue", async function (req, res) {
  const liftId = req.query.liftId;

  // pairing to another random user in queue but never in the same room
   const iterator1 = games[Symbol.iterator]();

   for (const game of iterator1) {
    var aGame = game[1]; // first one game[0] is roomUuid
    var roomUuid = game[0];
    // we don't by design assign user from the same liftId in the same game room
    if (aGame.player1LiftId == null && aGame.player2LiftId != liftId) {
      aGame.player1LiftId = liftId;
      console.log("assign player1LiftId = " + liftId, game);
      res.send(roomUuid);
      return;
    }

    // we don't by design assign user from the dsame liftId in the same game room
    if (aGame.player2LiftId == null && aGame.player1LiftId != liftId) {
      aGame.player2LiftId = liftId;
      console.log("assign player2LiftId = " + liftId, game);
      res.send(roomUuid);
      return;
    }
  }

  var newGame = await createGame(
    uuid.v4(),
    liftId,
    null,
    null,
    null
  );
  console.log(
    "found no room with a player1/2 slot empty, create a new game and room",
    newGame
  );

  games.set(newGame.roomUuid, newGame);

  res.send(newGame.roomUuid);
});

function getGameByRoomUuid(roomUuid) {
  var game = games.get(roomUuid);
  console.log("getGameByRoomUuid ", game);

  // we don't by design assign user from the dsame liftId in the same game room
  return game;
}

// testing
// http://localhost:3000/game/?roomUuid=50656362-ccbf-44e8-81f0-91acbbfe36b4
app.get("/game", async function (req, res) {
  const roomUuid = req.query.roomUuid;
  var game = getGameByRoomUuid(roomUuid);
  res.send(JSON.stringify(game));
});


// testing
// http://localhost:3000/player/?liftId=A&playerGesture=rock&roomUuid=a98416b4-139f-4455-b093-677ef246e216
// http://localhost:3000/player/?liftId=B&playerGesture=rock&roomUuid=a98416b4-139f-4455-b093-677ef246e216
app.get("/player", async function (req, res) {
  const roomUuid = req.query.roomUuid;
  const liftId = req.query.liftId;
  const playerGesture = req.query.playerGesture;

  console.log(
    roomUuid + " liftId " + liftId + " player played " + playerGesture
  );

  var results = null;
  var game = getGameByRoomUuid(roomUuid);
  if (game != null) {
    //console.log("found game", game);

    if (game.player1LiftId == liftId) {
      game.player1Gesture = playerGesture;
      console.log("was player 1 playing " + playerGesture + " in game", game);
    } else {
      game.player2Gesture = playerGesture;
      console.log("was player 2 playing " + playerGesture + " in game", game);
    }

    if (game.player1Gesture != null && game.player2Gesture != null) {
      var results = createGame(
        roomUuid,
        game.player1LiftId,
        game.player2LiftId,
        game.player1Gesture,
        game.player2Gesture
      );
      console.log(roomUuid + " both player played, checking result", results);

      games.delete(`${roomUuid}`);
    }
  }
  res.send(JSON.stringify(results));
});

function createGame(
  roomUuid,
  player1LiftId,
  player2LiftId,
  player1Gesture,
  player2Gesture
) {
  let statusText = null;
  let player1Wins = false;
  let player2Wins = false;
  var player1Score = 0;
  var player2Score = 0;

  if (
    player1Gesture == player2Gesture &&
    player1Gesture != null &&
    player2Gesture != null
  ) {
    // draw
    statusText = "It's a draw!";
  } else {
    // check whinner
    if (player1Gesture == "rock") {
      if (player2Gesture == "scissors") {
        player1Wins = true;
        statusText = "Rock beats scissors";
      } else {
        player2Wins = true;
        statusText = "Paper beats rock";
      }
    } else if (player1Gesture == "paper") {
      if (player2Gesture == "rock") {
        player1Wins = true;
        statusText = "Paper beats rock";
      } else {
        player2Wins = true;
        statusText = "Scissors beat paper";
      }
    } else if (player1Gesture == "scissors") {
      if (player2Gesture == "paper") {
        player1Wins = true;
        statusText = "Scissors beat paper";
      } else {
        player2Wins = true;
        statusText = "Rock beats scissors";
      }
    }
  }

  if (player1Wins) {
    player1Score++;
    statusText += " - You win!";
  } else if (player2Wins) {
    player2Score++;
    statusText += " - The other wins!";
  }

  return {
    roomUuid,
    player1LiftId,
    player2LiftId,
    player1Wins,
    player2Wins,
    statusText,
    player1Gesture,
    player2Gesture,
    player1Score,
    player2Score,
  };
}

app.get("/lift", async function (req, res) {
  var liftId = req.query.liftId;
  console.log("liftId '" + liftId + "' in request");

  var request = require("request");
  var options = {
    method: "GET",
    url: "https://hack.myport.guide/lift/",
    headers: {
      Accept: "application/json",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var json = JSON.parse(response.body);
    for (var attributename in json) {
      var name = json[attributename].name;
      console.log("Lift name '" + name + "' found");
      if (name == liftId) {
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
