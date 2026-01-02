import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const SECRET_KEY = "mon_secret_super_securise_watch2gether"

const app = express();
const server = createServer(app);
// const io = new Server(server);

// Configuration de Socket.io avec CORS
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3002",
        methods: ["GET", "POST"]
    }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'index.html'));
});

// Middleware pour Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Authentication error"));
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.username = decoded.username;
        next();
    } catch (err) {
        return next(new Error("Invalid token"));
    }
});

io.on('connection', (socket) => {
	console.log("a user connected:", socket.username);

	socket.on("disconnect", () => {
		console.log("user disconnected:", socket.username);
	});
	socket.on("chat message", (msg) => {
		io.emit("chat message", { 
			username: socket.username, 
			message: msg 
		});
	});
});

// io.on('connection', (socket) => {
// 	connectionStateRecovery: {}
// 	console.log('a user connected');
// 	socket.on('disconnect', () => {
// 		console.log('user disconnected');
// 	});
// 	socket.on('chat message', (msg) => {
// 		console.log('message: ' + msg);
// 		io.emit('chat message', msg);
// 	});
	
// });

server.listen(3000, () => {
	console.log('server running at http://localhost:3000');
});
