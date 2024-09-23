const socket = io();
const playerRoleSelect = document.getElementById('player-role');
const joinGameBtn = document.getElementById('join-game');
const gameAreaContainer = document.getElementById('game-area');
const cooperateBtn = document.getElementById('cooperate-btn');
const defectBtn = document.getElementById('defect-btn');
const gameStatus = document.getElementById('game-status');
const gameResultElement = document.getElementById('game-result');

let playerRole = '';

joinGameBtn.addEventListener('click', () => {
  playerRole = playerRoleSelect.value;

  if (playerRole === 'espectador') {
    socket.emit('joinAsSpectator');
  } else {
    socket.emit('player-joined', { role: playerRole });
    gameAreaContainer.style.display = 'block';
  }
  
  // Mostrar la sección de estado del juego a todos
  document.getElementById('name-input').style.display = 'none';
  gameStatus.style.display = 'block';
});

cooperateBtn.addEventListener('click', () => {
  socket.emit('makeChoice', { role: playerRole, choice: 'cooperate' });
});

defectBtn.addEventListener('click', () => {
  socket.emit('makeChoice', { role: playerRole, choice: 'defect' });
});

socket.on('gameResult', (result) => {
  gameResultElement.textContent = result;  // Mostrar el resultado a todos
});
