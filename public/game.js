
const socket = io();

// let racer1Clicks = 0;
// let racer2Clicks = 0;

// function handleBtn1Click(evt) {
//     evt.preventDefault();

//     // racer1Clicks += 50;
//     // player1.style.left = racer1Clicks + 'px';
//     console.log('btn1clicked');
//     // console.log(racer1Clicks);

//     socket.emit('Btn1Clicked');
// }

// socket.on('player1AddLeft', (data) => {
//     const player1 = document.querySelector('.player1');
//     console.log(data);
//     // racer1Clicks = data;
//     player1.style.left = data + 'px';
// });

// function handleBtn2Click(evt) {
//     evt.preventDefault();

//     // racer2Clicks += 50;
//     // player2.style.left = racer2Clicks + 'px';
//     console.log('btn2clicked');
//     // console.log(racer2Clicks);

//     socket.emit('Btn2Clicked');
// }

// socket.on('player2AddLeft', (data) => {
//     const player2 = document.querySelector('.player2');
//     console.log(data);
//     player2.style.left = data + 'px';
// });

// socket.on('setNewPlayers', (data) => {
//     const player1 = document.querySelector('.player1');
//     const player2 = document.querySelector('.player2');
//     console.log(data);

//     player1.style.left = data.racer1 + 'px';
//     player2.style.left = data.racer2 + 'px';
// });

socket.on('showPlayers', (data) => {
    const lobbyParent = document.querySelector('.lobby-parent');
    const oldLobby = document.querySelector('.lobby');
    oldLobby.remove();
    const lobby = document.createElement('p');
    lobby.classList.add('lead', 'text-center', 'lobby');
    lobbyParent.append(lobby);
    data.forEach(player => {
        const h3 = document.createElement('h3');
        h3.classList.add('float-left', 'm-1');

        const span = document.createElement('span');
        span.classList.add('badge', 'badge-pill', 'badge-primary', 'bg-secondary', 'font-weight-light', 'p-2');
        span.textContent = player.name;
        h3.append(span);
        lobby.append(h3);
    });
    
    // <h3 class="float-left m-1">
    //     <span class="badge badge-pill badge-primary bg-secondary font-weight-light p-2">{{ name }}</span>
    // </h3>

});

socket.on('startGame', (data) => {
    window.location.href = '/game/play/' + data;
});

function handlePlayBtnClick(evt) {
    evt.preventDefault();
    const gameID = document.querySelector('.gameID');    
    socket.emit('playBtnPressed', gameID.textContent);
}

function main() {
    const gameID = document.querySelector('.gameID');
    socket.emit('newPlayerConnected', gameID.textContent);
    // const player1Btn = document.querySelector('.player1Btn');
    // player1Btn.addEventListener('click', handleBtn1Click);
    // const player2Btn = document.querySelector('.player2Btn');
    // player2Btn.addEventListener('click', handleBtn2Click);
    const playBtn = document.querySelector('button');
    playBtn.addEventListener('click', handlePlayBtnClick);
}

document.addEventListener("DOMContentLoaded", main);
