const express = require('express');
const app = express();
const db = require('./db'); 

// --- IMPORT DES FICHIERS SÉPARÉS ---
const register = require('./register');
const login = require('./login');
const history = require('./history');
const authenticateToken = require('./Middleware'); 
const checkAdmin = require('./adminMiddleware');
const Video = require('./model/Video');

// --- MIDDLEWARE (Indispensable pour lire le JSON) ---
app.use(express.json());
app.use(express.static('public'));


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


app.post('/videos', authenticateToken, async (req, res) => {
    const { title, url } = req.body;

    try {
        //On crée l'objet Video
        //L'ID est null car c'est une nouvelle vidéo
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});