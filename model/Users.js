const db = require('../db');
const bcrypt = require('bcrypt');

class Users {
    // Constructeur On accepte username (pour register) mais il est optionnel (pour login)
    constructor(email, password, username = null) {
        this.userId = null;
        this.email = email;
        this.password = password;
        this.username = username;
        this.friends = [];
    }

    async login() {
        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [this.email]);

            // Si l'utilisateur n'existe pas
            if (result.rows.length === 0) {
                console.log("Email inconnu!");
                return false;
            }

            const userFromDb = result.rows[0];

            const validPassword = await bcrypt.compare(this.password, userFromDb.password_hash);

            if (validPassword) {
                console.log("Connexion réussie !");
                this.userId = userFromDb.id;
                this.username = userFromDb.username;
                this.isAdmin = userFromDb.is_admin; 
                return true;
            } else {
                console.log("Mot de passe incorrect.");
                return false;
            }

        } catch (err) {
            console.error("ERREUR DANS LOGIN :", err);
            throw err; // Ça renverra l'erreur au fichier login.js
        }
    }

    async register() {
        if (!this.username || !this.email || !this.password) {
            throw new Error("Tous les champs sont obligatoires !");
        }

        try {
            const check = await db.query('SELECT id FROM users WHERE email = $1', [this.email]);
            if (check.rows.length > 0) throw new Error("Email déjà utilisé.");

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(this.password, saltRounds);

            const result = await db.query(
                `INSERT INTO users (username, email, password_hash, is_admin) 
                 VALUES ($1, $2, $3, FALSE) 
                 RETURNING id`,
                [this.username, this.email, hashedPassword]
            );

            this.userId = result.rows[0].id;
            return this.userId;

        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async addToHistory(videoId) {
        try {
            await db.query(
                `INSERT INTO user_history (user_id, video_id) VALUES ($1, $2)`,
                [this.userId, videoId]
            );
            console.log(` Vidéo ${videoId} ajoutée à user_history pour l'user ${this.userId}`);
            return true;
        } catch (err) {
            console.error("Erreur addToHistory:", err);
            throw err;
        }
    }

    //Récupérer tout l'historique
    async getHistory() {
        try {
            const result = await db.query(
                `SELECT videos.id, videos.title, videos.url, user_history.watched_at 
                 FROM user_history 
                 JOIN videos ON user_history.video_id = videos.id 
                 WHERE user_history.user_id = $1 
                 ORDER BY user_history.watched_at DESC`,
                [this.userId]
            );
            return result.rows;
        } catch (err) {
            console.error("Erreur getHistory:", err);
            throw err;
        }
    }



    async addFriend(friendId) {
        try {
            // On s'empêche de s'ajouter soi-même
            if (this.userId == friendId) {
                throw new Error("Tu ne peux pas t'ajouter toi-même !");
            }

            await db.query(
                `INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)`,
                [this.userId, friendId]
            );
            console.log(`User ${this.userId} a ajouté l'ami ${friendId}`);
            return true;
        } catch (err) {
            console.error("Erreur addFriend:", err);
            throw err;
        }
    }

    async getFriends() {
        try {
            // On récupère les infos (pseudo, email) de l'ami grâce à une jointure
            const result = await db.query(
                `SELECT users.id, users.username, users.email, friends.added_at 
                 FROM friends 
                 JOIN users ON friends.friend_id = users.id 
                 WHERE friends.user_id = $1`,
                [this.userId]
            );
            return result.rows;
        } catch (err) {
            console.error("Erreur getFriends:", err);
            throw err;
        }
    }

    async removeFriend(friendId) {
        try {
            const result = await db.query(
                `DELETE FROM friends WHERE user_id = $1 AND friend_id = $2`,
                [this.userId, friendId]
            );

            if (result.rowCount === 0) {
                throw new Error("NOT_FRIENDS");
            }
            
            console.log(`User ${this.userId} a retiré l'ami ${friendId}`);
            return true;
        } catch (err) {
            throw err;
        }
    }

    //Suppression DE L'HISTORIQUE
    async clearHistory() {
        try {
            const result = await db.query(
                `DELETE FROM user_history WHERE user_id = $1`,
                [this.userId]
            );
            console.log(`Historique effacé pour l'user ${this.userId}`);
            return result.rowCount; // Renvoie le nombre de vidéos supprimées
        } catch (err) {
            console.error("Erreur clearHistory:", err);
            throw err;
        }
    }
    getUserId() { return this.userId; }
    getUsername() { return this.username; }
    getEmail() { return this.email; }
}

module.exports = Users;