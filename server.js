const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); 
const app = express();

const db = require('./db'); 
const path = require('path');

require('dotenv').config();

const register = require('./register');
const login = require('./login');
const history = require('./history');
const authenticateToken = require('./Middleware'); 
const checkAdmin = require('./adminMiddleware');
const Video = require('./model/Video');
const User = require('./model/Users');
const Participant = require('./model/Participant');
const VideoSearch = require('./model/VideoSearchService');
const Room = require('./model/Room');

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); // Indispensable pour les images Base64
app.use(cookieParser());
app.use(express.static('public'));

app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ message: 'Connexion reussie !', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur de connexion a la base de donnees' });
    }
});


app.post('/register', register);
app.post('/login', login);

app.post('/history', authenticateToken, history.addToHistory); 
app.get('/history', authenticateToken, history.getHistory);  

app.delete('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; 
        const currentUser = new User();
        currentUser.userId = userId;
        await currentUser.clearHistory();
        res.json({ message: "Votre historique a ete efface." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de vider l'historique." });
    }
});

app.post('/videos', authenticateToken, async (req, res) => {
    const { title, url } = req.body;
    try {
        const newVideo = new Video(title, url);
        await newVideo.save();
        res.status(201).json({ message: "Video ajoutee !", video: newVideo });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/admin/video/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const videoId = req.params.id;
        await Video.delete(videoId);
        res.json({ message: "SUPPRESSION REUSSIE !" });
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: "Erreur ou video introuvable." });
    }
});

app.post('/friends', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.body; 
        const userId = req.user.id;    
        const currentUser = new User();
        currentUser.userId = userId;
        await currentUser.addFriend(friendId);
        res.status(201).json({ message: "Ami ajoute avec succes !" });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: "Vous etes deja amis." });
        }
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'ami." });
    }
});

app.get('/friends', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = new User();
        currentUser.userId = userId;
        const friendsList = await currentUser.getFriends();
        res.json(friendsList);
    } catch (err) {
        res.status(500).json({ error: "Impossible de recuperer les amis." });
    }
});

app.delete('/friends/:friendId', authenticateToken, async (req, res) => {
    try {
        const friendId = req.params.friendId;
        const userId = req.user.id;
        const currentUser = new User();
        currentUser.userId = userId;
        await currentUser.removeFriend(friendId);
        res.json({ message: "Ami supprime de votre liste." });
    } catch (err) {
        if (err.message === "NOT_FRIENDS") {
            return res.status(404).json({ error: "Cet utilisateur n'est pas dans votre liste d'amis." });
        }
        res.status(500).json({ error: "Erreur lors de la suppression." });
    }
});

app.post('/rooms/:roomId/join', authenticateToken, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const userId = req.user.id;
        const participant = new Participant(userId, roomId);
        await participant.join();
        res.json({ message: `Vous avez rejoint la room ${roomId} !` });
    } catch (err) {
        if (err.code === '23505') {
             return res.status(409).json({ error: "Vous etes deja dans cette room." });
        }
        res.status(500).json({ error: "Erreur impossible de rejoindre la room." });
    }
});

app.delete('/rooms/:roomId/leave', authenticateToken, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const userId = req.user.id;
        await Participant.leave(userId, roomId);
        res.json({ message: "Vous avez quitte la room." });
    } catch (err) {
        if (err.message === "NOT_IN_ROOM") {
            return res.status(404).json({ error: "Vous n'etes pas dans cette room." });
        }
        console.error(err);
        res.status(500).json({ error: "Erreur lors du depart." });
    }
});

app.get('/rooms/:roomId/participants', authenticateToken, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const list = await Participant.getByRoom(roomId);
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Erreur recuperation participants." });
    }
});

app.post('/rooms/:roomId/action', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;      
        const roomId = req.params.roomId;
        const action = req.body.action;  
        
        const isAdmin = await Participant.isRoomAdmin(userId, roomId);

        if (!isAdmin) {
            return res.status(403).json({ 
                error: "Seul l'admin peut toucher a la telecommande." 
            });
        }

        console.log(`L'admin ${req.user.username} a fait l'action : ${action}`);
        res.json({ message: "Action validee", action: action });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.post('/rooms', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body; 
        const userId = req.user.id; 
        const newRoom = new Room(name); 
        await newRoom.save(); 
        const adminParticipant = new Participant(userId, newRoom.id, true);
        await adminParticipant.join();
        res.status(201).json({ 
            message: "Room creee avec succes !", 
            room: newRoom 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la creation de la room." });
    }
});

app.delete('/admin/delete-video', authenticateToken, checkAdmin, (req, res) => {
    res.json({ message: "SUPPRESSION REUSSIE ! (Seul un admin peut faire ca)" });
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Le parametre de recherche "q" est manquant.' });
    }
    const apiKey = process.env.YOUTUBE_API_KEY;
    const maxResults = 5;
    const search = new VideoSearch(apiKey);
    const data = await search.searchYoutube(query,maxResults);

    if(data) res.json(data);
    else res.status(500).json({ error: 'Erreur Youtube' })
});



const initDB = async () => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS CoursUsers (id SERIAL PRIMARY KEY, nom VARCHAR(255))`);
        await db.query(`CREATE TABLE IF NOT EXISTS CoursNotes (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES CoursUsers(id), contenu TEXT, timecode VARCHAR(50))`);
        await db.query(`CREATE TABLE IF NOT EXISTS CoursTags (id SERIAL PRIMARY KEY, note_id INTEGER REFERENCES CoursNotes(id), hashtag VARCHAR(100))`);

        await db.query(`ALTER TABLE CoursNotes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        await db.query(`ALTER TABLE CoursNotes ADD COLUMN IF NOT EXISTS image_data TEXT`);

        await db.query(`CREATE INDEX IF NOT EXISTS idx_cours_hashtag ON CoursTags(hashtag)`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_date_creation ON CoursNotes(created_at)`);

        await db.query(`INSERT INTO CoursUsers (id, nom) VALUES (1, 'Wanis') ON CONFLICT (id) DO NOTHING`);
        
        console.log("Nouvelles tables, index et colonne image mis a jour avec succes !");
    } catch (err) {
        console.error("Erreur de creation des tables :", err.message);
    }
};
initDB();

app.post('/api/notes', async (req, res) => {
    const { user_id, contenu, timecode, image_data } = req.body;

    try {
        const resultNote = await db.query(
            `INSERT INTO CoursNotes (user_id, contenu, timecode, image_data) VALUES ($1, $2, $3, $4) RETURNING id`, 
            [user_id, contenu, timecode, image_data]
        );
        const noteId = resultNote.rows[0].id;

        const hashtagsExtraits = contenu ? contenu.match(/#[a-zA-Z0-9_]+/g) : null; 

        if (hashtagsExtraits) {
            for (const tag of hashtagsExtraits) {
                await db.query(
                    `INSERT INTO CoursTags (note_id, hashtag) VALUES ($1, $2)`, 
                    [noteId, tag.toLowerCase()]
                );
            }
        }

        res.json({ success: true, message: "Note, tags et image enregistres sur le serveur de la fac !", noteId: noteId, tags: hashtagsExtraits });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

app.get('/api/search-dates', async (req, res) => {
    let { tag, start, end } = req.query;

    if (!tag || !start || !end) {
        return res.status(400).json({ erreur: "Il manque le parametre ?tag, ?start ou ?end" });
    }
    
    if (!tag.startsWith('#')) tag = '#' + tag;

    try {
        const dateFinComplete = end + ' 23:59:59';

        const requeteSQL = `
            SELECT CoursNotes.contenu, CoursNotes.created_at, CoursNotes.image_data
            FROM CoursNotes
            INNER JOIN CoursTags ON CoursNotes.id = CoursTags.note_id
            WHERE CoursTags.hashtag = $1 
            AND CoursNotes.created_at BETWEEN $2 AND $3
        `;

        const result = await db.query(requeteSQL, [tag.toLowerCase(), start, dateFinComplete]);
        res.json(result.rows); 
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// --- LANCEMENT DU SERVEUR SUR LE PORT 3002 ---
const PORT = 3002; 
app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
});