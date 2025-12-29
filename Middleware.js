const jwt = require('jsonwebtoken');

const SECRET_KEY = 'mon_secret_super_securise_watch2gether';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: "Accès refusé : Token manquant." });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token invalide ou expiré." });
        }

        // On attache l'utilisateur à la requête
        req.user = user; 
        next(); // On passe à la suite (la fonction d'historique)
    });
};

module.exports = authenticateToken;