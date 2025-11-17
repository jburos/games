# Soccer Rocker 2P - Multiplayer Setup

This is a two-player multiplayer version of Soccer Rocker that allows players to play on different devices using WebSocket connections.

## Setup Instructions

### 1. Install Dependencies

First, make sure you have Node.js installed (version 14 or higher). Then install the required dependencies:

```bash
npm install
```

This will install the `ws` (WebSocket) package needed for the server.

### 2. Start the Server

Run the WebSocket server:

```bash
npm start
```

Or directly:

```bash
node soccer-server.js
```

The server will start on port 3001 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 node soccer-server.js
```

### 3. Open the Game

1. Open `soccer-rocker-2p.html` in a web browser (or serve it through a web server)
2. Click "Create Room" to create a new game room
3. Share the 6-character room code with the second player
4. The second player opens `soccer-rocker-2p.html` and clicks "Join Room", then enters the room code
5. Once both players are connected, the game will start!

## How to Play

### Player 1 (Blue Team)
- **Arrow Keys**: Move your player
- **A**: Pass (with ball) or Switch player (defense)
- **S**: Shoot
- **D**: Steal ball from opponent
- **W**: Activate speed-up (when available)

### Player 2 (Red Team)
- **WASD**: Move your player
- **Q**: Pass (with ball) or Switch player (defense)
- **E**: Shoot
- **F**: Steal ball from opponent
- **R**: Activate speed-up (when available)

## Network Configuration

### Local Development
- The client automatically connects to `ws://localhost:8080` when running locally
- Both players can be on the same network

### Production Deployment
- Update the `WS_URL` in `soccer-rocker-2p.html` to point to your server
- For HTTPS sites, use `wss://` (secure WebSocket)
- Make sure your server has WebSocket support enabled

## Troubleshooting

### Connection Issues
- Make sure the server is running before opening the game
- Check that port 8080 (or your custom port) is not blocked by a firewall
- Verify both players are using the same server URL

### Game Not Starting
- Ensure both players have successfully joined the room
- Check the browser console for any error messages
- Refresh both browsers and try again

## Server Features

- Room-based matchmaking (6-character room codes)
- Authoritative server (prevents cheating)
- Real-time state synchronization (~60 FPS)
- Automatic cleanup of empty rooms

## Notes

- The server handles all game logic to ensure fair play
- Game state is synchronized between both clients
- Players can disconnect and reconnect (though rooms are cleaned up when empty)

