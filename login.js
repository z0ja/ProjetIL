const User = require('./model/Users'); 
const jwt = require('jsonwebtoken'); 

const SECRET_KEY = 'mon_secret_super_securise_watch2gether'; 

const login = async (req, res) => {
    // On récupère les identifiants
    const { email, password } = req.body;

    // On crée un objet User
    const userAttempt = new User(email, password);

    try {
        const isValid = await userAttempt.login();

        if (isValid) {            
            // On génère le Token (Le Badge)
            const token = jwt.sign(
                { 
                    id: userAttempt.getUserId(), 
                    username: userAttempt.getUsername(),
                    isAdmin: userAttempt.isAdmin //pour gérer les admins
                },
                SECRET_KEY,
                { expiresIn: '24h' }
            );

            res.json({
                message: "Connexion réussie !",
                token: token,
                user: {
                    id: userAttempt.getUserId(),
                    username: userAttempt.getUsername()
                }
            });

        } else {
            // C'est perdu (Mot de passe ou email faux)
            res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};

module.exports = login;