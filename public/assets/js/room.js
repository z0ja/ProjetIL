import { VideoPlayer } from "./model/VideoPlayer.js";
import { Video } from "./model/Video.js";
import { PlayerState } from "./model/PlayerState.js";

// Vérification de l'authentification
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// ==============================
// Video SOCKET (port 3004)
// ==============================

window.player = new VideoPlayer();

window.socket = io("http://localhost:3004");

let roomid = JSON.parse(localStorage.getItem("roomObject")).id;

socket.on('changeState', function(data){
    console.log(data);
    console.log(data["status"]);
    console.log(data["room"]);

    if(data["room"] == roomid && data["user"] !== window.player.getUser()){
        let state = new PlayerState(data["videoId"], data["status"] ,parseInt(data["time"]));
        //window.player.setAdmin(false);//temporaire
        window.player.setState(state);
    }
});

socket.on('getState',function(data){
    console.log(data);
    if(data == window.player.getUser()){
        window.player.sendState("getState");
    }
});

socket.emit("joinVideo",roomid);

// Boutons suivi
document.getElementById("playBtn").addEventListener("click", () => {
    window.player.play();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
    window.player.pause();
});

document.getElementById("syncBtn").addEventListener("click", () => {
    window.player.sendState("getState");
});


// Charger une nouvelle vidéo
document.getElementById("loadVideoBtn").addEventListener("click", () => {
    const url = document.getElementById("videoUrl").value.trim();
    if (!url) return;

    const videoId = extractVideoId(url);
    if (!videoId) {
        alert("URL YouTube invalide");
        return;
    }

    const video = new Video(videoId);
    window.player.loadVideo(video);
    window.player.sendState("changeState");
});

function extractVideoId(url) {
    try {
        const u = new URL(url);
        return u.searchParams.get("v");
    } catch {
        return null;
    }
}

// ==============================
// CHAT SOCKET (port 3000)
// ==============================

const chatSocket = io("http://localhost:3000", {
    auth: {
        token: localStorage.getItem("token")
    }
});

chatSocket.on("connect", () => {
    console.log("Chat socket connected", chatSocket.id);
});

// DOM Chat
const chatForm = document.getElementById("form");
const chatInput = document.getElementById("input");
const chatMessages = document.getElementById("messages");

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!chatInput.value.trim()) return;

    chatSocket.emit("chat message", chatInput.value);
    chatInput.value = "";
});

chatSocket.on("chat message", ({username, msg}) => {
    const item = document.createElement("li");
    item.textContent = msg;
    item.style.padding = "0.5rem";
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatSocket.on("connect_error", (err) => {
    console.error("Chat socket error", err.message);
});

// ==============================
// ROOM SOCKET (port 3004)
// ==============================

//const roomSocket = io("http://localhost:3004", {
//    auth: {
//        token: localStorage.getItem("token")
//    }
//});
//
//roomSocket.on("room creation", (roomName, user) =>{
//	console.log("test");
//	console.log(roomName, user);
//});
