const db = require('./db');      
const bcrypt = require('bcrypt'); // On a besoin de bcrypt pour hasher

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Hash du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Insertion BDD
        const query = `
            INSERT INTO users (username, email, password_hash) 
            VALUES ($1, $2, $3) 
            RETURNING id, username, email, created_at
        `;
        
        const result = await db.query(query, [username, email, hashedPassword]);

        // 3. Réponse succès
        res.status(201).json({ 
            message: "Utilisateur inscrit !", 
            user: result.rows[0] 
        });

    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ error: "Ce pseudo ou cet email est déjà pris." });
        }
        res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
};

// TRES IMPORTANT : On exporte la fonction pour que server.js puisse l'utiliser
module.exports = register;