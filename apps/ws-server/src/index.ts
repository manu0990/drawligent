import {WebSocketServer} from 'ws';

const port = process.env.WS_PORT;

const ws = new WebSocketServer({ port: port ? Number(port) : 8080 });

ws.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');