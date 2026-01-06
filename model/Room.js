require("./Participant.js");
// const room = require("../room/index.js"); // Pas utile pour le moment
// const broadcast = require("../room/broadcast.js"); // Pas utile pour le moment
const playlist = require("./Playlist.js");
const db = require('../db');

class Room {
    // Variable statique pour garder en mémoire les IDs utilisés (attention, ça se vide si le serveur redémarre)
    static listId = new Set();

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

    // Ces méthodes ne servent plus trop si tu utilises la classe Participant pour gérer la BDD
    // Mais tu peux les garder pour de la logique interne si besoin
    join(participant){
        // this.listeParticipants.add(participant);
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