const checkAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Non authentifié." });
    }

    if (req.user.isAdmin === true) {
        next(); // C'est un chef, on le laisse passer !
    } else {
        res.status(403).json({ error: "Accès INTERDIT : Réservé aux administrateurs." });
    }
};

module.exports = checkAdmin;