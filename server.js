const express = require('express');
const app = express();
const db = require('./db'); // Import de la connexion BDD

// --- 1. IMPORT DES FICHIERS SÉPARÉS ---
// Vérifie bien que tu as créé register.js et login.js dans le même dossier !
const register = require('./register');
const login = require('./login');

// --- 2. MIDDLEWARE (Indispensable pour lire le JSON) ---
app.use(express.json());
app.use(express.static('public'));


// --- 3. ROUTE DE TEST ---
app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ message: 'Connexion réussie !', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }
});

// --- 4. ROUTES D'AUTHENTIFICATION ---
// C'est ici qu'on active tes fichiers !
app.post('/register', register);
app.post('/login', login);

// --- 5. DÉMARRAGE ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});