// Fichier : login.js
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// La clé secrète doit être la même partout !
const SECRET_KEY = 'mon_secret_super_securise_watch2gether';

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Recherche de l'utilisateur
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        const user = result.rows[0];

        // 2. Vérification du mot de passe
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

        // 3. Création du Token (Badge)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        // 4. Envoi de la réponse
        res.json({
            message: "Connexion réussie (via login.js) !",
            token: token,
            user: { id: user.id, username: user.username }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};

module.exports = login;