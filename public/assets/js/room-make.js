require("../../../model/Room");
document.getElementById('create-room-form').addEventListener('submit', function(e) {
	e.preventDefault();

	const roomName = document.getElementById('room-name').value;

	const user = JSON.parse(localStorage.getItem("user"));
	const admin = user.username;

	// crée la room en local (temporaire)
	//const room = {
	//	name: roomName,
	//	admin: [admin], 
	//	participants: [],
	//	id: Math.floor(Math.random() * 100000)
	//};
	const room = new Room(roomName, admin);

	// stock les infos de la room en local
	localStorage.setItem('currentRoom', JSON.stringify(room));

	window.location.href = '../../pages/room.html';
});
