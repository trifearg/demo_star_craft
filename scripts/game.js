const countCrystals = document.querySelector("#crystals");
const countWarriors = document.querySelector("#warriors");
const countWorkers = document.querySelector("#workers");
const overlay = document.querySelector(".game_overlay");
const textOverlay = document.querySelector(".game_overlay__text");
const skip = document.querySelector("#skip");
const fight = document.querySelector("#fight");
const buyWorkers = document.querySelector("#buyWorkers");
const buyWarriors = document.querySelector("#buyWarriors");
const namePlayer = document.querySelector(".player > span");

let player = {
    id: Number,
    crystals: Number,
    workers: Number,
    warriors: Number,
    turn: Boolean
};
let socket = io();

socket.on('player data', (data) => {
    player = data;
    namePlayer.innerHTML = "Player" + (player.id + 1);
    countCrystals.innerHTML = player.crystals;
    countWarriors.innerHTML = player.warriors;
    countWorkers.innerHTML = player.workers;
});

socket.on('update turn', (turn) => {
    if (!turn) {
        console.log("я зашел в фолс")
        player.turn = turn;
        textOverlay.innerHTML = `Player${player.id === 0 ? 2 : 1} turn`;
        overlay.style.display = 'block';
    } else {
        console.log("я зашел в тру")
        player.turn = turn;
        textOverlay.innerHTML = "";
        overlay.style.display = 'none';
    }
})

socket.on('check', (countPlayers) => {
    if (countPlayers === 2) {
        textOverlay.classList.remove('loading');
        overlay.style.display = 'none';
    } else {
        textOverlay.innerHTML = "Waiting for player";
        textOverlay.classList.add("loading");
        overlay.style.display = 'block';
    }
})

socket.on('server is full', (msg) => {
    textOverlay.innerHTML = msg;
    overlay.style.display = "block";
});

socket.on('result', (msg) => {
    textOverlay.innerHTML = msg;
    overlay.style.display = "block";
})

skip.addEventListener("click", (event) => {
    event.preventDefault();
    socket.emit("skip", player);
    socket.emit('turn', player);
});

fight.addEventListener("click", (event) => {
    event.preventDefault();
    socket.emit("fight", player);
});

buyWorkers.addEventListener("click", (event) => {
    event.preventDefault();
    if (player.crystals >= 5) {
        player.workers += 1;
        player.crystals -= 5;
        let tempCrystals = Number(countCrystals.textContent);
        let tempWorkers = Number(countWorkers.textContent);
        tempCrystals -= 5;
        tempWorkers += 1;
        countCrystals.innerHTML = tempCrystals;
        countWorkers.innerHTML = tempWorkers;
        socket.emit("update socket", player);
        socket.emit('turn', player);
    } else {
        $.notify("Not enough crystals for buy workers!", "error");
    }
});

buyWarriors.addEventListener("click", (event) => {
    event.preventDefault();
    if (player.crystals >= 10) {
        player.warriors += 1;
        player.crystals -= 10;
        let tempCrystals = Number(countCrystals.textContent);
        let tempWarriors = Number(countWarriors.textContent);
        tempCrystals -= 10;
        tempWarriors += 1;
        countCrystals.innerHTML = tempCrystals;
        countWarriors.innerHTML = tempWarriors;
        socket.emit("update", player);
        socket.emit('turn', player);
    } else {
        $.notify("Not enough crystals for buy warriors!", "error");
    }
});