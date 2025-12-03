const db = require('./db');

const addToHistory = async (req, res) => {
// On prend l'ID depuis le Token
    const userId = req.user.id; 
    // On ne récupère que les infos de la vidéo dans le body
    const { videoUrl, videoTitle } = req.body;
    try {
        let videoId;
 
        const checkVideo = await db.query('SELECT id FROM videos WHERE url = $1', [videoUrl]);

        if (checkVideo.rows.length > 0) {
            videoId = checkVideo.rows[0].id;
        } else {
            const newVideo = await db.query(
                'INSERT INTO videos (url, title) VALUES ($1, $2) RETURNING id',
                [videoUrl, videoTitle]
            );
            videoId = newVideo.rows[0].id;
        }

        await db.query(
            'INSERT INTO user_history (user_id, video_id) VALUES ($1, $2)',
            [userId, videoId]
        );

        res.json({ message: "Vidéo ajoutée à l'historique pour l'utlisateur ID !"+ userId });

    } catch (err) {
        console.error("ERREUR DANS HISTORY.JS :", err); 
        res.status(500).json({ error: "Erreur lors de l'ajout." });
    }
};

// --- FONCTION 2 : LIRE L'HISTORIQUE ---
const getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            `SELECT videos.title, videos.url, user_history.watched_at 
             FROM user_history 
             JOIN videos ON user_history.video_id = videos.id 
             WHERE user_history.user_id = $1
             ORDER BY user_history.watched_at DESC`,
            [userId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lecture historique." });
    }
};

module.exports = { addToHistory, getHistory };