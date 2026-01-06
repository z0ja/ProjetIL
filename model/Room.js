
//const playlist = require("./Playlist.js");
const db = require('../db');

class Room {
	static listId = new Set();
	constructor(name, admin){
		if(!admin){ // il faut être login
			throw new Error("il faut être login pour pouvoir créer une room");
		}

		// génère une id random pour la room
		do{
			this.id = Math.floor(Math.random()*100000);
		} while(Room.listId.has(this.id));
		Room.listId.add(this.id);

    constructor(name) { 
        // 1. Génération d'ID corrigée
        do {
            // On met Math.floor pour avoir un nombre entier (pas de virgule pour la BDD)
            this.id = Math.floor(Math.random() * 100000); 
        } while (Room.listId.has(this.id)); // CORRECTION : Room.listId.has(...)

        Room.listId.add(this.id);

        this.name = name;
        
        // On n'a plus besoin de gérer les listes ici car tout est en base de données maintenant
        // this.listeParticipants = new Set(); 
        // this.admin = new Set();
    }
    
    // J'ai renommé create -> save pour correspondre à ton server.js
    async save(adminId) {
        try {
            // Vérification de sécurité BDD
            const check = await db.query('SELECT id FROM rooms WHERE id = $1', [this.id]);
            if (check.rows.length > 0) throw new Error("L'id de la room est déjà en usage");

            const result = await db.query(
                `INSERT INTO rooms (id, name, admin_id)
                 VALUES ($1, $2, $3) RETURNING *`,
                [this.id, this.name, adminId]
            );
            
            console.log("Room sauvegardée en BDD :", this.id);
            return this;

        } catch (err) {
            console.error(err);
            throw err;
        }
    }


	join(participant){
		if(!this.listeParticipants.has(participant)){
			this.listeParticipants.add(participant);
		}
	}

    leave(participant){
        // this.listeParticipants.delete(participant);
    }

    setAdmin(participant){
        // participant.isAdmin = true;
        // this.admin.add(participant);
    }

    getNextVideo(){
        playlist.getNextVideo();
    }
}

module.exports = Room;