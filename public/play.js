const socket = io();

function handleQuestCircleClick(gameSlug, questNum) {
    if (questNum === undefined) {
        return function() {
            window.location.href = '/quest/add/' + gameSlug;
        };
    } else {
        return function () {
            window.location.href = '/quest/' + gameSlug + '/quest' + questNum;
        };
    }
}

function handleRestartBtnClick(restartBtn, gameSlug) {
    return function () {
        restartBtn.textContent = '';
        restartBtn.classList.toggle('d-none');        
        socket.emit('restartGame', gameSlug);
    };
}

socket.on('startNewGame', (gameSlug) => {
    window.location.href = '/game/play/' + gameSlug;
});

socket.on('showQuests', (questsAndGameID) => {
    const quests = questsAndGameID.quests;
    const gameSlug = questsAndGameID.gameSlug;
    // console.log(quests[0]);
    const cardBody = document.querySelector('.quests-parent');
    let questsDiv = document.querySelector('.quests');
    questsDiv.remove();
    questsDiv = document.createElement('div'); 
    questsDiv.classList.add('quests');
    const completedQuests = document.createElement('div');
    // completedQuests.classList.add('completed-quests');
    const emptyQuests = document.createElement('div');
    // emptyQuests.classList.add('.empty-quests');
    let numSuccesses = 0;
    let numFails = 0;
    for (let i = 0; i < 5; i++) {
        const questContainer = document.createElement('i');
        questContainer.classList.add('hovicon', 'effect-9', 'd-block', 'mx-auto', 'my-0', 'mb-3');
        if (quests[i]) {
            if (quests[i].success) {
                numSuccesses++;
                
                questContainer.classList.add('sub-a');
                questContainer.textContent = 'S';
                questContainer.addEventListener('click', handleQuestCircleClick(gameSlug, i+1));
                completedQuests.append(questContainer);
            } else {
                numFails++;
                
                questContainer.classList.add('sub-b');                
                questContainer.textContent = 'F';
                questContainer.addEventListener('click', handleQuestCircleClick(gameSlug, i+1));                
                completedQuests.append(questContainer);                
            }
            
        } else if (numSuccesses === 3 || numFails === 3) { // add results and restart
            const success = numSuccesses > numFails ? true : false;
            const resultSpan = document.querySelector('.result');
            if (success) {
                resultSpan.textContent = 'The Side of Good Won!';
            } else {
                resultSpan.textContent = 'The Side of Evil Won!';
            }
            const restartBtn = document.querySelector('.restart');
            restartBtn.classList.toggle('d-none');
            restartBtn.textContent = 'Start New Game';
            restartBtn.addEventListener('click', handleRestartBtnClick(restartBtn, gameSlug));
        } else {
            const plusContainer = document.createElement('div');
            plusContainer.classList.add('hovicon', 'effect-9', 'd-block', 'mx-auto', 'my-0', 'mb-3', 'font-weight-bold');
            plusContainer.addEventListener('click', handleQuestCircleClick(gameSlug));            
            plusContainer.textContent = '+'; 
            plusContainer.style.lineHeight = 110 + 'px';         
            emptyQuests.append(plusContainer);
            break;
        }
    }
    questsDiv.append(completedQuests);
    questsDiv.append(emptyQuests);
    cardBody.append(questsDiv);
});

// socket.on('startGame', (data) => {
//     window.location.href = '/game/play/' + data;
// });

// function handlePlayBtnClick(evt) {
//     evt.preventDefault();
//     const gameID = document.querySelector('.gameID');
//     socket.emit('playBtnPressed', gameID.textContent);
// }

function main() {
    const gameID = document.querySelector('.gameID');    
    socket.emit('playScreenLoaded', gameID.textContent);

    // const playBtn = document.querySelector('button');
    // playBtn.addEventListener('click', handlePlayBtnClick);
}

document.addEventListener("DOMContentLoaded", main);
