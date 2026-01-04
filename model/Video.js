const db = require('../db'); 

class Video {
    /**
     * @param {string} title
     * @param {string} url 
     * @param {number|null} id 
     */

    constructor(videoId="",title="",url="") {
        this.videoId = videoId;
        this.title = title;
        this.url = url;

        if(typeof this.videoId !== "string" || typeof this.title !== "string" || typeof this.url !== "string"){
            throw new Error("Constructor arguments types not corresponding with the given ones");
        }
    }

    extractVideoID(url) {
        try {
            // Cette formule magique trouve l'ID peu importe le format du lien
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        } catch (e) {
            return null;
        }
    }

    async save() {
        try {

            const youtubeId = this.extractVideoID(this.url);
            //On insère dans la table 'videos'
            const result = await db.query(
                `INSERT INTO videos (title, url, youtube_id) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                [this.title, this.url, youtubeId] 
            );

            //On met à jour l'ID de l'objet avec celui généré par la BDD
            this.id = result.rows[0].id;
            console.log(` Vidéo "${this.title}" sauvegardée avec l'ID ${this.id}`);
            return this.id;

        } catch (err) {
            console.error("Erreur lors de la sauvegarde de la vidéo :", err);
            throw err;
        }
    }

    //on n'a pas besoin de créer un objet Video pour supprimer par ID
    static async delete(id) {
        try {
            const result = await db.query('DELETE FROM videos WHERE id = $1', [id]);
            
            if (result.rowCount === 0) {
                throw new Error("Aucune vidéo trouvée avec cet ID.");
            }
            
            console.log(` Vidéo ${id} supprimée.`);
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async findAll() {
        const result = await db.query('SELECT * FROM videos');
        //On transforme les résultats bruts en objets de la classe Video
        return result.rows.map(row => new Video(row.title, row.url, row.id));
    }

    getId() { return this.id; }
    getTitle() { return this.title; }
    getUrl() { return this.url; }
}

module.exports = Video;
