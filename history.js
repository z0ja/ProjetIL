const User = require('./model/Users'); 

//AJOUTER À L'HISTORIQUE
exports.addToHistory = async (req, res) => { 
    const { videoId } = req.body; 
    const userId = req.user.id;   

    try {
        const currentUser = new User();
        currentUser.userId = userId;

        await currentUser.addToHistory(videoId);

        res.status(201).json({ message: "Vidéo ajoutée à l'historique !" });

    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: "Erreur lors de l'ajout à l'historique." });
    }
};

//VOIR L'HISTORIQUE
exports.getHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const currentUser = new User();
        currentUser.userId = userId;

        const myHistory = await currentUser.getHistory();

        res.json(myHistory);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
    }
};