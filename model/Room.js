require("./Participant.js");
const room = require("../room/index.js");
const broadcast = require("../room/broadcast.js");
const playlist = require("./Playlist.js");
const db = require('../db');

class Room {
	static listId = new Set();
	constructor(name, admin){
		// génère une id random pour la room
		do{
			this.id = Math.random()*100000;
		} while(this.listId.includes());
		Room.listId.add(this.id);

		this.name = name;
		this.listeParticipants = new Set();
		this.listeParticipants.add(admin);
		this.admin = new Set();
		this.admin.add(admin);
	}
	
	async create(admin){
		try {
            const check = await db.query('SELECT id FROM rooms WHERE id = $1', [this.id]);
            if (check.rows.length > 0) throw new Error("L'id de la room est déjà en usage");

			const result = await db.query(
				`INSERT INTO rooms (id, name, admin_id)
				 VALUES ($1, $2, $3)`,
				[this.id, this.name, admin]
			);
		} catch (err) {
            console.error(err);
            throw err;
        }
	}

	join(participant){
		this.listeParticipants.add(participant);
	}

	leave(participant){
		this.listeParticipants.delete(participant);
	}

	//broadcastPlayerState(state){
	//	this.broadcastPlayerState()
	//}

	setAdmin(participant){
		participant.isAdmin = true;
		this.admin.add(participant);
	}

	getNextVideo(){
		playlist.getNextVideo();
	}

}

module.exports = Room;
