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

chatSocket.on("chat message", ({username, message}) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${username}</strong> : ${message}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
});

chatSocket.on("connect_error", (err) => {
    console.error("Chat socket error", err.message);
});