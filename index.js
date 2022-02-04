const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const connections = {};
const player = {
    id: Number,
    crystals: 0,
    workers: 5,
    warriors: 0,
    turn: true
};

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/scripts'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/game.html');
});

io.on('connection', (socket) => {
    let socketCount = io.engine.clientsCount;
    if (socketCount <= 2) {
        player.id = socketCount - 1;
        connections[player.id] = { user: socket };
        connections[player.id].data = player;
        connections[player.id].id = player.id;
        console.log(`Player${player.id + 1} connected`);
        socket.emit('player data', player);
        io.sockets.emit('check', socketCount);
    } else {
        socket.emit('server is full', "Server is full");
        socket.disconnect(true);
        return
    }

    socket.on('turn', function (player) {
        if (connections[player.id].data.turn) {
            connections[player.id].data.turn = false;
            socket.emit('update turn', false);
        }
        if (!connections[0].data.turn && !connections[1].data.turn) {
            let currentId = player.id === 0 ? 1 : 0;
            connections[currentId].data.turn = true;
            connections[player.id].data.turn = false;
            io.sockets.emit('update turn', true); 
            socket.emit('update turn', false);  
        }
    })

    socket.on('update socket', function (player) {
        connections[player.id].data = player;
    })

    socket.on('skip', function (player) {
        player.crystals += player.workers;
        connections[player.id].data = player;
        socket.emit('player data', player);
    });

    socket.on("fight", function (player) {
        let playerOfAttack = player;
        let playerOfProtect = playerOfAttack.id === 0 ? connections[1] : connections[0];
        if (playerOfAttack.warriors > playerOfProtect.data.warriors) {
            io.sockets.emit('result', `Player${playerOfAttack.id + 1} win`);
        } else {
            io.sockets.emit('result', `Player${playerOfProtect.id + 1} win`);
        }
    });

    socket.on('disconnect', function () {
        console.log(`Player${socketCount} disconnected`);
        delete connections[socketCount - 1];
    });
})

server.listen(3000, () => console.log('Server is started on 3000'));