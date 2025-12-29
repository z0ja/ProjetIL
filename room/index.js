import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

import PlayerState from "../model/PlayerState.mjs";
import * as broadcast from "./broadcast.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'room.html'));
});

// test
var playerState = new PlayerState("played",300,"M7lc1UVf-VE");


io.on('connection', (socket) => {
	console.log('a user connected');

	broadcast.sendPlayerState(playerState,socket);

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3001, () => {
	console.log('server running at http://localhost:3001');
});

