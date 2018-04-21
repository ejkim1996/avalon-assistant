const socket = io();

socket.on('showQuests', (quests) => {
    console.log(quests[0]);
    const cardBody = document.querySelector('.quests-parent');
    let questsDiv = document.querySelector('.quests');
    questsDiv.remove();
    questsDiv = document.createElement('div'); 
    questsDiv.classList.add('quests');
    const completedQuests = document.createElement('div');
    // completedQuests.classList.add('completed-quests');
    const emptyQuests = document.createElement('div');
    // emptyQuests.classList.add('.empty-quests');
    for (let i = 0; i < 5; i++) {
        console.log('for loop');
        
        const questContainer = document.createElement('i');
        questContainer.classList.add('hovicon', 'effect-9', 'd-block', 'mx-auto', 'my-0', 'mb-3');
        if (quests[i]) {
            console.log('quest exists');
            
            if (quests[i].success) {
                console.log('quest success');
                
                questContainer.classList.add('sub-a');
                questContainer.textContent = 'S';
                completedQuests.append(questContainer);
                // <i class="hovicon effect-9 sub-a d-block mb-3" style="margin: 0 auto;">S</i>                
            } else {
                console.log('quest fail');
                
                questContainer.classList.add('sub-b');                
                questContainer.textContent = 'F';
                completedQuests.append(questContainer);                
            }
        } else {
            emptyQuests.append(questContainer);
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
