import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

import PlayerState from "../model/PlayerState.mjs";

import Room from '../model/Room.js';
import Participant from "../model/Participant.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3002",
        methods: ["GET", "POST"]
    }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

//let roomId;
//let roomName;
//const participant = [];

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, '../public/pages/room-make.html'));
});

function broadcastPlayerState(state,user,io){
    let json = state.toJson();
    json['user'] = user; // ajouter l'utilisateur qui a fait l'action pour faire en sorte de ne pas changer son 'PlayerState'

    io.emit('changeState',json)
}

function sendPlayerState(state,socket){
    console.log("envoie de state");
    let json = state.toJson();
    json['user'] = "";
    
    socket.emit('changeState',json);
}

// test
var playerState = new PlayerState("played",0,"M7lc1UVf-VE");
var lastUser = null;
const mapRoom = new Map(); // dictionnaire des room (temporaire ?)

io.on('connection', (socket) => {
	console.log('a user connected');

	// lors de la création de la room
	// TODO: changer les username en user id et aller chercher les infos dans la bdd
	socket.on('room creation', (roomName, userId) => {
		const room = new Room(roomName, userId);
		//console.log(userId, room.id);
		const admin = new Participant(userId, String(room.id), true);
		room.join(admin);
		mapRoom.set(String(room.id), room);

		socket.emit('room object', room, room.listeParticipants); // liste participants sera vide
		console.log('=== NEW ROOM ===');
		console.log(roomName, room.id);
	});
	
	socket.on('user connect', (roomId, userId) => {
		//console.log(mapRoom);
		roomId = String(roomId);
		if(!mapRoom.has(roomId)){
			socket.emit('no id', userId);
		}else{
			const newParticipant = new Participant(userId, roomId, false);
			mapRoom.get(roomId).join(newParticipant);
			console.log(mapRoom.get(roomId));
			socket.emit('accepted', mapRoom.get(roomId), userId, JSON.stringify(mapRoom.get(roomId).listeParticipants));
		}
	});

	socket.on('getState', (data) => {
		console.log("reçu : ")
		console.log(data); 
		// a faire verifier si l'utilisateur est un admin
		// a faire mettre a jour l'attribut de type playerstate de la classe Room
		playerState= new PlayerState(data["status"] ,parseInt(data["time"]), data["videoId"]);
		broadcastPlayerState(playerState, lastUser, io);
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

	sendPlayerState(playerState,socket);

	socket.on('changeState', (data) => {
    	console.log(data); 
		// a faire verifier si l'utilisateur est un admin
		// a faire mettre a jour l'attribut de type playerstate de la classe Room
		playerState= new PlayerState(data["status"] ,parseInt(data["time"]), data["videoId"]);
		lastUser = data["user"];
		broadcastPlayerState(playerState, data["user"], io);
  	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3004, () => {
	console.log('server running at http://localhost:3004');
});

