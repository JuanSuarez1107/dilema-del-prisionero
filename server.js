const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const puerto = 3000;

app.use(express.static('public'));

let players = {};
let choices = {};
let spectators = [];

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('player-joined', (data) => {
    const playerRole = data.role;
    
    if (playerRole === 'espectador') {
      spectators.push(socket.id);
      io.emit('message', 'Un espectador se ha unido al juego');
    } else {
      if (players[playerRole]) {
        socket.emit('error', 'Ese jugador ya está en el juego.');
      } else {
        players[playerRole] = { role: playerRole, socketId: socket.id };
        console.log(`Jugador ${playerRole} agregado`);
        io.emit('message', `Jugador ${playerRole} se ha unido al juego`);
        io.emit('playerAssignment', { playerRole });

        if (players['jugador1'] && players['jugador2']) {
          io.emit('startGame');
        }
      }
    }
  });

  socket.on('makeChoice', (data) => {
    choices[data.role] = data.choice;

    if (Object.keys(choices).length === 2) {
      const result = calculateResult();
      io.emit('gameResult', result);  // Emitir el resultado a todos
      choices = {};
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);

    if (players['jugador1'] && players['jugador1'].socketId === socket.id) {
      delete players['jugador1'];
    } else if (players['jugador2'] && players['jugador2'].socketId === socket.id) {
      delete players['jugador2'];
    }

    const index = spectators.indexOf(socket.id);
    if (index !== -1) {
      spectators.splice(index, 1);
    }

    io.emit('playerDisconnected');
  });
});

function calculateResult() {
  const player1Choice = choices['jugador1'];
  const player2Choice = choices['jugador2'];

  if (player1Choice === 'cooperate' && player2Choice === 'cooperate') {
    return `Jugador 1 y Jugador 2 cooperaron: 1 año de prisión para ambos.`;
  } else if (player1Choice === 'cooperate' && player2Choice === 'defect') {
    return `Jugador 1 cooperó, Jugador 2 traicionó: 3 años para Jugador 1, 0 años para Jugador 2.`;
  } else if (player1Choice === 'defect' && player2Choice === 'cooperate') {
    return `Jugador 1 traicionó, Jugador 2 cooperó: 0 años para Jugador 1, 3 años para Jugador 2.`;
  } else {
    return `Jugador 1 y Jugador 2 traicionaron: 2 años de prisión para ambos.`;
  }
}

server.listen(puerto, () => {
  console.log(`Servidor escuchando en el puerto ${puerto}`);
});
