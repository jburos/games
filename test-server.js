// Quick test to verify WebSocket server is working
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✓ Successfully connected to server!');
  ws.send(JSON.stringify({
    type: 'create',
    roomCode: 'test-room'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('✓ Received message:', message);
  if (message.type === 'roomCreated') {
    console.log('✓ Server is working correctly!');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (error) => {
  console.error('✗ Connection error:', error.message);
  console.error('Make sure the server is running: npm start');
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('✗ Connection timeout - server may not be running');
  process.exit(1);
}, 5000);

