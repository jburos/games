const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3001;

// Game constants
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const GOAL_WIDTH = 80;
const GOAL_DEPTH = 20;
const PLAYER_RADIUS = 12;
const BALL_RADIUS = 8;
const PLAYER_SPEED = 2;
const FRICTION = 0.98;
const PASS_POWER = 4;
const SHOOT_POWER = 6;
const STEAL_RANGE = 30;
const SPEED_UP_MULTIPLIER = 2.0;
const SPEED_UP_DURATION = 45;
const SPEED_UP_AVAILABILITY_CHANCE = 0.001;

// Game rooms
const rooms = new Map();

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Initialize a new game
function initGame(room) {
  room.gameState = {
    player1Score: 0,
    player2Score: 0,
    ball: {
      x: FIELD_WIDTH / 2,
      y: FIELD_HEIGHT / 2,
      vx: 0,
      vy: 0
    },
    player1Team: [
      { x: FIELD_WIDTH * 0.2, y: FIELD_HEIGHT * 0.3, vx: 0, vy: 0, hasBall: false, role: 'striker', speed: PLAYER_SPEED * 1.15, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.2, y: FIELD_HEIGHT * 0.5, vx: 0, vy: 0, hasBall: false, role: 'midfielder', speed: PLAYER_SPEED, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.2, y: FIELD_HEIGHT * 0.7, vx: 0, vy: 0, hasBall: false, role: 'striker', speed: PLAYER_SPEED * 1.15, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.15, y: FIELD_HEIGHT * 0.4, vx: 0, vy: 0, hasBall: false, role: 'defender', speed: PLAYER_SPEED, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.15, y: FIELD_HEIGHT * 0.6, vx: 0, vy: 0, hasBall: false, role: 'defender', speed: PLAYER_SPEED, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 }
    ],
    player2Team: [
      { x: FIELD_WIDTH * 0.8, y: FIELD_HEIGHT * 0.3, vx: 0, vy: 0, hasBall: false, role: 'striker', speed: PLAYER_SPEED * 1.15, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.8, y: FIELD_HEIGHT * 0.5, vx: 0, vy: 0, hasBall: false, role: 'midfielder', speed: PLAYER_SPEED, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.8, y: FIELD_HEIGHT * 0.7, vx: 0, vy: 0, hasBall: false, role: 'striker', speed: PLAYER_SPEED * 1.15, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.85, y: FIELD_HEIGHT * 0.4, vx: 0, vy: 0, hasBall: false, role: 'defender', speed: PLAYER_SPEED, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 },
      { x: FIELD_WIDTH * 0.85, y: FIELD_HEIGHT * 0.6, vx: 0, vy: 0, hasBall: false, role: 'defender', speed: PLAYER_SPEED, speedUpAvailable: false, speedUpActive: false, speedUpTimer: 0 }
    ],
    player1Controlled: null,
    player2Controlled: null,
    gameStarted: false
  };

  // Give ball to random player
  const randomPlayer = room.gameState.player1Team[Math.floor(Math.random() * room.gameState.player1Team.length)];
  room.gameState.ball.x = randomPlayer.x;
  room.gameState.ball.y = randomPlayer.y;
  updateControlledPlayer(room.gameState.player1Team, room.gameState.ball, 'player1');
}

// Update controlled player
function updateControlledPlayer(team, ball, playerKey) {
  let closestPlayer = null;
  let minDist = Infinity;

  team.forEach(player => {
    const dx = player.x - ball.x;
    const dy = player.y - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      closestPlayer = player;
    }
  });

  if (playerKey === 'player1') {
    return closestPlayer;
  } else {
    return closestPlayer;
  }
}

// Check if player has ball
function playerHasBall(player, ball) {
  const dx = player.x - ball.x;
  const dy = player.y - ball.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < PLAYER_RADIUS + BALL_RADIUS + 8;
}

// Distance helper
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Update game state
function updateGame(room) {
  if (!room.gameState.gameStarted) return;

  const state = room.gameState;

  // Update speed-up timers
  [...state.player1Team, ...state.player2Team].forEach(player => {
    if (player.speedUpActive && player.speedUpTimer > 0) {
      player.speedUpTimer--;
      if (player.speedUpTimer === 0) {
        player.speedUpActive = false;
        player.speedUpAvailable = false;
      }
    }
    if (!player.speedUpAvailable && !player.speedUpActive) {
      if (Math.random() < SPEED_UP_AVAILABILITY_CHANCE) {
        player.speedUpAvailable = true;
      }
    }
  });

  // Update player movements from input queues
  if (room.player1Input && state.player1Controlled) {
    const player = state.player1Controlled;
    const input = room.player1Input;
    
    if (input.move) {
      let moveX = input.move.x;
      let moveY = input.move.y;
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      if (len > 0) {
        let playerSpeed = player.speed || PLAYER_SPEED;
        if (player.speedUpActive) {
          playerSpeed *= SPEED_UP_MULTIPLIER;
        }
        moveX = (moveX / len) * playerSpeed;
        moveY = (moveY / len) * playerSpeed;
        
        player.x += moveX;
        player.y += moveY;
        player.x = Math.max(PLAYER_RADIUS, Math.min(FIELD_WIDTH - PLAYER_RADIUS, player.x));
        player.y = Math.max(PLAYER_RADIUS, Math.min(FIELD_HEIGHT - PLAYER_RADIUS, player.y));

        if (player.hasBall) {
          const targetX = player.x + moveX * 8;
          const targetY = player.y + moveY * 8;
          const dx = targetX - state.ball.x;
          const dy = targetY - state.ball.y;
          state.ball.x += dx * 0.3;
          state.ball.y += dy * 0.3;
          const distToPlayer = Math.sqrt((state.ball.x - player.x) ** 2 + (state.ball.y - player.y) ** 2);
          if (distToPlayer > PLAYER_RADIUS + BALL_RADIUS + 5) {
            const angle = Math.atan2(player.y - state.ball.y, player.x - state.ball.x);
            state.ball.x = player.x - Math.cos(angle) * (PLAYER_RADIUS + BALL_RADIUS + 3);
            state.ball.y = player.y - Math.sin(angle) * (PLAYER_RADIUS + BALL_RADIUS + 3);
          }
          state.ball.vx = 0;
          state.ball.vy = 0;
        }
      }
    }
  }

  if (room.player2Input && state.player2Controlled) {
    const player = state.player2Controlled;
    const input = room.player2Input;
    
    if (input.move) {
      let moveX = input.move.x;
      let moveY = input.move.y;
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      if (len > 0) {
        let playerSpeed = player.speed || PLAYER_SPEED;
        if (player.speedUpActive) {
          playerSpeed *= SPEED_UP_MULTIPLIER;
        }
        moveX = (moveX / len) * playerSpeed;
        moveY = (moveY / len) * playerSpeed;
        
        player.x += moveX;
        player.y += moveY;
        player.x = Math.max(PLAYER_RADIUS, Math.min(FIELD_WIDTH - PLAYER_RADIUS, player.x));
        player.y = Math.max(PLAYER_RADIUS, Math.min(FIELD_HEIGHT - PLAYER_RADIUS, player.y));

        if (player.hasBall) {
          const targetX = player.x + moveX * 8;
          const targetY = player.y + moveY * 8;
          const dx = targetX - state.ball.x;
          const dy = targetY - state.ball.y;
          state.ball.x += dx * 0.3;
          state.ball.y += dy * 0.3;
          const distToPlayer = Math.sqrt((state.ball.x - player.x) ** 2 + (state.ball.y - player.y) ** 2);
          if (distToPlayer > PLAYER_RADIUS + BALL_RADIUS + 5) {
            const angle = Math.atan2(player.y - state.ball.y, player.x - state.ball.x);
            state.ball.x = player.x - Math.cos(angle) * (PLAYER_RADIUS + BALL_RADIUS + 3);
            state.ball.y = player.y - Math.sin(angle) * (PLAYER_RADIUS + BALL_RADIUS + 3);
          }
          state.ball.vx = 0;
          state.ball.vy = 0;
        }
      }
    }
  }

  // Update ball physics
  if (!state.player1Controlled?.hasBall && !state.player2Controlled?.hasBall) {
    state.ball.x += state.ball.vx;
    state.ball.y += state.ball.vy;
    state.ball.vx *= FRICTION;
    state.ball.vy *= FRICTION;

    if (state.ball.x < BALL_RADIUS) {
      state.ball.x = BALL_RADIUS;
      state.ball.vx *= -0.8;
    }
    if (state.ball.x > FIELD_WIDTH - BALL_RADIUS) {
      state.ball.x = FIELD_WIDTH - BALL_RADIUS;
      state.ball.vx *= -0.8;
    }
    if (state.ball.y < BALL_RADIUS) {
      state.ball.y = BALL_RADIUS;
      state.ball.vy *= -0.8;
    }
    if (state.ball.y > FIELD_HEIGHT - BALL_RADIUS) {
      state.ball.y = FIELD_HEIGHT - BALL_RADIUS;
      state.ball.vy *= -0.8;
    }
  }

  // Check ball possession
  const allPlayers = [...state.player1Team, ...state.player2Team];
  let ballPossession = null;
  let minDistToBall = Infinity;
  const possessionDistSq = (PLAYER_RADIUS + BALL_RADIUS + 8) ** 2;
  const ballSpeedSq = state.ball.vx * state.ball.vx + state.ball.vy * state.ball.vy;
  const maxBallSpeedForPossession = 2.0;

  allPlayers.forEach(player => {
    const dx = player.x - state.ball.x;
    const dy = player.y - state.ball.y;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < possessionDistSq && ballSpeedSq < maxBallSpeedForPossession * maxBallSpeedForPossession) {
      const dist = Math.sqrt(distSq);
      if (dist < minDistToBall) {
        minDistToBall = dist;
        ballPossession = player;
      }
    }
  });

  allPlayers.forEach(player => {
    player.hasBall = (player === ballPossession);
  });

  // Update controlled players
  state.player1Controlled = updateControlledPlayer(state.player1Team, state.ball, 'player1');
  state.player2Controlled = updateControlledPlayer(state.player2Team, state.ball, 'player2');

  // Check goals
  if (state.ball.x < GOAL_DEPTH && 
      state.ball.y > (FIELD_HEIGHT - GOAL_WIDTH) / 2 && 
      state.ball.y < (FIELD_HEIGHT + GOAL_WIDTH) / 2) {
    state.player2Score++;
    resetAfterGoal(state);
  }
  
  if (state.ball.x > FIELD_WIDTH - GOAL_DEPTH && 
      state.ball.y > (FIELD_HEIGHT - GOAL_WIDTH) / 2 && 
      state.ball.y < (FIELD_HEIGHT + GOAL_WIDTH) / 2) {
    state.player1Score++;
    resetAfterGoal(state);
  }
}

// Reset after goal
function resetAfterGoal(state) {
  state.ball.x = FIELD_WIDTH / 2;
  state.ball.y = FIELD_HEIGHT / 2;
  state.ball.vx = 0;
  state.ball.vy = 0;
  
  // Reset positions
  state.player1Team.forEach((player, i) => {
    const positions = [
      { x: FIELD_WIDTH * 0.2, y: FIELD_HEIGHT * 0.3 },
      { x: FIELD_WIDTH * 0.2, y: FIELD_HEIGHT * 0.5 },
      { x: FIELD_WIDTH * 0.2, y: FIELD_HEIGHT * 0.7 },
      { x: FIELD_WIDTH * 0.15, y: FIELD_HEIGHT * 0.4 },
      { x: FIELD_WIDTH * 0.15, y: FIELD_HEIGHT * 0.6 }
    ];
    player.x = positions[i].x;
    player.y = positions[i].y;
    player.hasBall = false;
  });
  
  state.player2Team.forEach((player, i) => {
    const positions = [
      { x: FIELD_WIDTH * 0.8, y: FIELD_HEIGHT * 0.3 },
      { x: FIELD_WIDTH * 0.8, y: FIELD_HEIGHT * 0.5 },
      { x: FIELD_WIDTH * 0.8, y: FIELD_HEIGHT * 0.7 },
      { x: FIELD_WIDTH * 0.85, y: FIELD_HEIGHT * 0.4 },
      { x: FIELD_WIDTH * 0.85, y: FIELD_HEIGHT * 0.6 }
    ];
    player.x = positions[i].x;
    player.y = positions[i].y;
    player.hasBall = false;
  });
}

// Handle player actions
function handleAction(room, playerId, action) {
  const state = room.gameState;
  const isPlayer1 = playerId === room.player1Id;
  const controlledPlayer = isPlayer1 ? state.player1Controlled : state.player2Controlled;
  const myTeam = isPlayer1 ? state.player1Team : state.player2Team;
  const opponentTeam = isPlayer1 ? state.player2Team : state.player1Team;

  if (!controlledPlayer) return;

  switch (action.action) {
    case 'pass':
      if (playerHasBall(controlledPlayer, state.ball)) {
        // Find closest teammate
        let targetTeammate = null;
        let minDist = Infinity;
        myTeam.forEach(teammate => {
          if (teammate === controlledPlayer) return;
          const dist = distance(controlledPlayer.x, controlledPlayer.y, teammate.x, teammate.y);
          if (dist < minDist) {
            minDist = dist;
            targetTeammate = teammate;
          }
        });
        
        let passAngle;
        if (targetTeammate) {
          const dx = targetTeammate.x - state.ball.x;
          const dy = targetTeammate.y - state.ball.y;
          passAngle = Math.atan2(dy, dx);
        } else {
          // Pass forward
          passAngle = isPlayer1 ? Math.atan2(0, 1) : Math.atan2(0, -1);
        }
        
        const pushDistance = PLAYER_RADIUS + BALL_RADIUS + 15;
        state.ball.x = controlledPlayer.x + Math.cos(passAngle) * pushDistance;
        state.ball.y = controlledPlayer.y + Math.sin(passAngle) * pushDistance;
        state.ball.vx = Math.cos(passAngle) * PASS_POWER;
        state.ball.vy = Math.sin(passAngle) * PASS_POWER;
        controlledPlayer.hasBall = false;
      }
      break;
    
    case 'shoot':
      if (playerHasBall(controlledPlayer, state.ball)) {
        const goalX = isPlayer1 ? FIELD_WIDTH : 0;
        const goalY = FIELD_HEIGHT / 2;
        const dx = goalX - state.ball.x;
        const dy = goalY - state.ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const randomAngle = angle + (Math.random() - 0.5) * 0.3;
        
        const pushDistance = PLAYER_RADIUS + BALL_RADIUS + 15;
        state.ball.x = controlledPlayer.x + Math.cos(randomAngle) * pushDistance;
        state.ball.y = controlledPlayer.y + Math.sin(randomAngle) * pushDistance;
        state.ball.vx = Math.cos(randomAngle) * SHOOT_POWER;
        state.ball.vy = Math.sin(randomAngle) * SHOOT_POWER;
        controlledPlayer.hasBall = false;
      }
      break;
    
    case 'steal':
      if (!playerHasBall(controlledPlayer, state.ball)) {
        let targetOpponent = null;
        let minDist = Infinity;
        opponentTeam.forEach(opponent => {
          if (opponent.hasBall || playerHasBall(opponent, state.ball)) {
            const dist = distance(controlledPlayer.x, controlledPlayer.y, opponent.x, opponent.y);
            if (dist < STEAL_RANGE && dist < minDist) {
              minDist = dist;
              targetOpponent = opponent;
            }
          }
        });
        
        if (targetOpponent) {
          const dx = controlledPlayer.x - targetOpponent.x;
          const dy = controlledPlayer.y - targetOpponent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          const pushDistance = PLAYER_RADIUS + BALL_RADIUS + 10;
          state.ball.x = targetOpponent.x + Math.cos(angle) * pushDistance;
          state.ball.y = targetOpponent.y + Math.sin(angle) * pushDistance;
          state.ball.vx = Math.cos(angle) * 4;
          state.ball.vy = Math.sin(angle) * 4;
          targetOpponent.hasBall = false;
        }
      }
      break;
    
    case 'speedup':
      if (controlledPlayer.speedUpAvailable && !controlledPlayer.speedUpActive) {
        controlledPlayer.speedUpActive = true;
        controlledPlayer.speedUpAvailable = false;
        controlledPlayer.speedUpTimer = SPEED_UP_DURATION;
      }
      break;
  }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  let playerId = null;
  let roomCode = null;
  let room = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data.type, 'from player:', playerId || 'unknown');

      if (data.type === 'create') {
        // Normalize room code: lowercase, trim
        roomCode = (data.roomCode || '').toLowerCase().trim();
        if (!roomCode || !/^[a-z]+-[a-z]+$/.test(roomCode)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid room code format. Must be two words separated by hyphen (e.g., happy-cat)'
          }));
          return;
        }
        playerId = 'player1';
        
        room = {
          code: roomCode,
          player1Id: playerId,
          player2Id: null,
          player1: ws,
          player2: null,
          gameState: null,
          player1Input: null,
          player2Input: null
        };
        
        rooms.set(roomCode, room);
        initGame(room);
        
        ws.send(JSON.stringify({
          type: 'roomCreated',
          roomCode: roomCode,
          playerId: playerId
        }));
      } else if (data.type === 'join') {
        // Normalize room code: lowercase, trim
        roomCode = (data.roomCode || '').toLowerCase().trim();
        if (!roomCode || !/^[a-z]+-[a-z]+$/.test(roomCode)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid room code format. Must be two words separated by hyphen (e.g., happy-cat)'
          }));
          return;
        }
        room = rooms.get(roomCode);
        
        if (!room) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Room not found'
          }));
          return;
        }
        
        if (room.player2) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Room is full'
          }));
          return;
        }
        
        playerId = 'player2';
        room.player2Id = playerId;
        room.player2 = ws;
        room.gameState.gameStarted = true;
        
        ws.send(JSON.stringify({
          type: 'roomJoined',
          playerId: playerId
        }));
        
        // Notify both players
        room.player1.send(JSON.stringify({ type: 'gameStart' }));
        room.player2.send(JSON.stringify({ type: 'gameStart' }));
      } else if (data.type === 'input') {
        if (!room || !room.gameState.gameStarted) return;
        
        if (data.playerId === room.player1Id) {
          if (data.inputType === 'move') {
            room.player1Input = { move: { x: data.x, y: data.y } };
          } else if (data.inputType === 'action') {
            handleAction(room, data.playerId, data);
            room.player1Input = null;
          } else if (data.inputType === 'stopMove') {
            room.player1Input = null;
          }
        } else if (data.playerId === room.player2Id) {
          if (data.inputType === 'move') {
            room.player2Input = { move: { x: data.x, y: data.y } };
          } else if (data.inputType === 'action') {
            handleAction(room, data.playerId, data);
            room.player2Input = null;
          } else if (data.inputType === 'stopMove') {
            room.player2Input = null;
          }
        }
      } else {
        console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      console.error('Message was:', message.toString());
    }
  });

  ws.on('close', () => {
    if (room) {
      if (ws === room.player1) {
        room.player1 = null;
      } else if (ws === room.player2) {
        room.player2 = null;
        room.gameState.gameStarted = false;
      }
      
      // Clean up empty rooms
      if (!room.player1 && !room.player2) {
        rooms.delete(roomCode);
      }
    }
  });
});

// Game update loop (60 FPS)
setInterval(() => {
  rooms.forEach((room) => {
    if (room.gameState && room.gameState.gameStarted) {
      updateGame(room);
      
      // Broadcast state to both players
      const stateMessage = JSON.stringify({
        type: 'gameState',
        state: room.gameState
      });
      
      if (room.player1) {
        room.player1.send(stateMessage);
      }
      if (room.player2) {
        room.player2.send(stateMessage);
      }
    }
  });
}, 1000 / 60); // ~60 FPS

// Start server - listen on all interfaces (0.0.0.0) to allow external connections
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Soccer Rocker server running on port ${PORT}`);
  console.log(`WebSocket URL: ws://localhost:${PORT}`);
  console.log(`\nFor local network access, use your local IP address:`);
  console.log(`  ws://YOUR_LOCAL_IP:${PORT}`);
  console.log(`\nTo find your local IP: ifconfig | grep "inet " | grep -v 127.0.0.1`);
  console.log(`\nTo use a different port, set PORT environment variable:`);
  console.log(`  PORT=8080 npm start\n`);
});

