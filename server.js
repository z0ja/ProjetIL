const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const db = require('./db'); 
const path = require('path');

// --- IMPORT DES FICHIERS SÉPARÉS ---
const register = require('./register');
const login = require('./login');
const history = require('./history');
const authenticateToken = require('./Middleware'); 
const checkAdmin = require('./adminMiddleware');
const Video = require('./model/Video');
const User = require('./model/Users');
const Participant = require('./model/Participant');

// --- MIDDLEWARE (Indispensable pour lire le JSON) ---
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
//app.use(express.static("assets"));

//app.use("/tchat", express.static(path.join(__dirname, "tchat")));

app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ message: 'Connexion réussie !', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
});

//C'est ici qu'on active les fichiers 
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

        res.json({ message: "Votre historique a été effacé." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de vider l'historique." });
    }
});

app.post('/videos', authenticateToken, async (req, res) => {
    const { title, url } = req.body;

    try {
        //On crée l'objet Video et l'ID est null car c'est une nouvelle vidéo
        const newVideo = new Video(title, url);
        
        //On sauvegarde dans la BDD
        await newVideo.save();

        res.status(201).json({ message: "Vidéo ajoutée !", video: newVideo });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//J'ai changé l'URL pour être plus standard (/video/:id)
app.delete('/admin/video/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const videoId = req.params.id;
        
        await Video.delete(videoId);
        
        res.json({ message: "SUPPRESSION RÉUSSIE !" });
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: "Erreur ou vidéo introuvable." });
    }
});

app.post('/friends', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.body; 
        const userId = req.user.id;    

        const currentUser = new User();
        currentUser.userId = userId;

        await currentUser.addFriend(friendId);

        res.status(201).json({ message: "Ami ajouté avec succès !" });
    } catch (err) {
        //Si déjà amis
        if (err.code === '23505') {
            return res.status(409).json({ error: "Vous êtes déjà amis." });
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
        res.status(500).json({ error: "Impossible de récupérer les amis." });
    }
});


app.delete('/friends/:friendId', authenticateToken, async (req, res) => {
    try {
        const friendId = req.params.friendId;
        const userId = req.user.id;

        const currentUser = new User();
        currentUser.userId = userId;

        await currentUser.removeFriend(friendId);

        res.json({ message: "Ami supprimé de votre liste." });
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
             return res.status(409).json({ error: "Vous êtes déjà dans cette room." });
        }
        res.status(500).json({ error: "Erreur impossible de rejoindre la room." });
    }
});


app.delete('/rooms/:roomId/leave', authenticateToken, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const userId = req.user.id;

        await Participant.leave(userId, roomId);

        res.json({ message: "Vous avez quitté la room." });

    } catch (err) {
        //Si le modèle nous dit que l'utilisateur n'y était pas
        if (err.message === "NOT_IN_ROOM") {
            return res.status(404).json({ error: "Vous n'êtes pas dans cette room." });
        }
        
        console.error(err);
        res.status(500).json({ error: "Erreur lors du départ." });
    }
});


app.get('/rooms/:roomId/participants', authenticateToken, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const list = await Participant.getByRoom(roomId);
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Erreur récupération participants." });
    }
});

app.delete('/admin/delete-video', authenticateToken, checkAdmin, (req, res) => {
    res.json({ message: "SUPPRESSION RÉUSSIE ! (Seul un admin peut voir ça)" });
});


const PORT = 3002; 
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});