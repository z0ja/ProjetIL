const User = require('./model/Users');

const register = async (req, res) => {
    // On récupère les infos envoyées par Postman
    const { username, email, password } = req.body;

    // On prépare un nouvel utilisateur
    const newUser = new User(email, password, username);

    try {
        // On lance l'inscription via la Classe
        await newUser.register();
        res.status(201).json({
            message: "Utilisateur inscrit avec succès !",
            user: {
                id: newUser.getUserId(),
                username: newUser.getUsername(),
                email: newUser.getEmail()
            }
        });

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = register;