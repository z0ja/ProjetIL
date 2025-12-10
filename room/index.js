import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

let roomId;
let roomName;
const participant = [];

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'room.html'));
});

io.on('connection', (socket) => {
	// lors de la connexion d'un utilisateur
	console.log('a user connected');
	participant.push(socket);
	console.log(participant);
	socket.emit('servertest', 'coucou ^^');
	socket.on('test', (arg) => {
		console.log(arg);
	});
	// lors de la déconnexion d'un utilisateur
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3000, () => {
	console.log('server running at http://localhost:3000');
});

