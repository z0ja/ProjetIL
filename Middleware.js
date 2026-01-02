const jwt = require('jsonwebtoken');

const SECRET_KEY = 'mon_secret_super_securise_watch2gether';

const authenticateToken = (req, res, next) => {
    // On cherche le token dans les Cookies OU dans le Header Authorization
    const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (token == null) {
        return res.status(401).json({ error: "Accès refusé : Token manquant." });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token invalide ou expiré." });
        }

        req.user = user; 
        next(); 
    });
};

module.exports = authenticateToken;