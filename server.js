const express = require('express');
const app = express();
const db = require('./db'); 

// --- IMPORT DES FICHIERS SÉPARÉS ---
const register = require('./register');
const login = require('./login');
const history = require('./history');
const authenticateToken = require('./Middleware'); 
const checkAdmin = require('./adminMiddleware');

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


const PORT = 3000;

app.delete('/admin/delete-video', authenticateToken, checkAdmin, (req, res) => {
    res.json({ message: "SUPPRESSION RÉUSSIE ! (Seul un admin peut voir ça)" });
});
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});