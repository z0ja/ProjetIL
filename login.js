const User = require('./model/Users'); 
const jwt = require('jsonwebtoken'); 

const SECRET_KEY = 'mon_secret_super_securise_watch2gether'; 

const login = async (req, res) => {
    const { email, password } = req.body;

    const userAttempt = new User(email, password);

    try {
        const isValid = await userAttempt.login();

        if (isValid) {            
            const token = jwt.sign(
                { 
                    id: userAttempt.getUserId(), 
                    username: userAttempt.getUsername(),
                    isAdmin: userAttempt.isAdmin 
                },
                SECRET_KEY,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 86400000 
            });

            res.json({
                message: "Connexion réussie !",
                token: token,
                user: {
                    id: userAttempt.getUserId(),
                    username: userAttempt.getUsername()
                }
            });

        } else {
            res.status(401).json({ error: "Email ou mot de passe incorrect." });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};

module.exports = login;