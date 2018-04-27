const socket = io();
let numCharsRemaining = 0;

socket.on('showPlayers', (data) => {
    const players = data.players;
    const lobbyParent = document.querySelector('.lobby-parent');
    const oldLobby = document.querySelector('.lobby');
    oldLobby.remove();
    const lobby = document.createElement('p');
    lobby.classList.add('lead', 'text-center', 'lobby');
    lobbyParent.append(lobby);
    players.forEach(player => {
        const h3 = document.createElement('h3');
        h3.classList.add('d-inline-block', 'm-1');
        
        const span = document.createElement('span');
        span.classList.add('badge', 'badge-light', 'font-weight-light', 'p-2');
        span.textContent = player.name;
        h3.append(span);
        lobby.append(h3);
    });
    
    numCharsRemaining = data.numChars;
    const waiting = document.querySelector('.waitingMessage');
    waiting.style.color = 'aquamarine';
    waiting.textContent = 'Waiting for ' + numCharsRemaining + ' more player(s)';
});

socket.on('startGame', (data) => {
    window.location.href = '/game/play/' + data;
});

function handlePlayBtnClick(evt) {
    evt.preventDefault();
    const gameID = document.querySelector('.gameID');
    if (numCharsRemaining === 0) {
        socket.emit('playBtnPressed', gameID.textContent.replace(/\s+/g, '-').toLowerCase());
    }
}

function main() {
    const gameID = document.querySelector('.gameID');
    socket.emit('newPlayerConnected', gameID.textContent);

    const playBtn = document.querySelector('button');
    playBtn.addEventListener('click', handlePlayBtnClick);
}

document.addEventListener("DOMContentLoaded", main);
