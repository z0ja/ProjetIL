const db = require('../db');

class Participant {
    constructor(userId, roomId, isAdmin = false) {
        this.userId = userId;
        this.roomId = roomId;
        this.isAdmin = isAdmin;
    }

    //REJOINDRE UNE ROOM (Join)
    async join() {
        try {
            await db.query(
                `INSERT INTO participants (user_id, room_id, is_admin) 
                 VALUES ($1, $2, $3)`,
                [this.userId, this.roomId, this.isAdmin]
            );
            console.log(`User ${this.userId} a rejoint la Room ${this.roomId}`);
            return true;
        } catch (err) {
            console.error("Erreur dans join():", err);
            throw err;
        }
    }

    //QUITTER UNE ROOM (Leave) 
    static async leave(userId, roomId) {
        try {
            const result = await db.query(
                `DELETE FROM participants WHERE user_id = $1 AND room_id = $2`,
                [userId, roomId]
            );

            if (result.rowCount === 0) {
                // Si c'est 0, c'est que l'utilisateur n'y était pas !
                throw new Error("NOT_IN_ROOM");
            }

            console.log(`User ${userId} a quitté la Room ${roomId}`);
            return true;
        } catch (err) {
            throw err;
        }
    }

    //LISTER LES PARTICIPANTS D'UNE ROOM 
    static async getByRoom(roomId) {
        try {
            const result = await db.query(
                `SELECT users.id, users.username, participants.is_admin 
                 FROM participants 
                 JOIN users ON participants.user_id = users.id 
                 WHERE participants.room_id = $1`,
                [roomId]
            );
            return result.rows;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async isRoomAdmin(userId, roomId) {
    const query = `
        SELECT is_admin 
        FROM participants 
        WHERE user_id = $1 AND room_id = $2
    `;
    const result = await db.query(query, [userId, roomId]);

    // Si on trouve que is_admin est true
    if (result.rows.length > 0 && result.rows[0].is_admin === true) {
        return true;
    }
    return false;
}
}

module.exports = Participant;

