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
        origin: "http://localhost:3002",
        methods: ["GET", "POST"]
    }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

let roomId;
let roomName;
const participant = [];

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'room.html'));
});

// test
var playerState = new PlayerState("played",0,"M7lc1UVf-VE");
var lastUser = null;


io.on('connection', (socket) => {
	// lors de la connexion d'un utilisateur
	console.log('a user connected');

	socket.on('getState', (data) => {
		console.log("reçu : ")
		console.log(data); 
		// a faire verifier si l'utilisateur est un admin
		// a faire mettre a jour l'attribut de type playerstate de la classe Room
		playerState= new PlayerState(data["status"] ,parseInt(data["time"]), data["videoId"]);
		broadcast.broadcastPlayerState(playerState, lastUser, io);
	});

	socket.on('setState', (data) => {
		console.log("setState");
		
		if(lastUser){
			io.emit("getState",lastUser);
		}
	});


	if(lastUser){
		io.emit("getState",lastUser);
	}

	broadcast.sendPlayerState(playerState,socket);

	socket.on('changeState', (data) => {
    	console.log(data); 
		// a faire verifier si l'utilisateur est un admin
		// a faire mettre a jour l'attribut de type playerstate de la classe Room
		playerState= new PlayerState(data["status"] ,parseInt(data["time"]), data["videoId"]);
		lastUser = data["user"];
		broadcast.broadcastPlayerState(playerState, data["user"], io);
  	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3003, () => {
	console.log('server running at http://localhost:3003');
});

