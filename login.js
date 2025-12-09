const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// La clé secrète doit être la même partout !
const SECRET_KEY = 'mon_secret_super_securise_watch2gether';

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
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

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                isAdmin: user.is_admin 
            },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Connexion réussie !",
            token: token,
            user: { 
                id: user.id, 
                username: user.username, 
                isAdmin: user.is_admin
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};

module.exports = login;