const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 

const app = express();
const port = 3000;

app.use(cors()); 
app.use(express.json({ limit: '10mb' })); 

const db = new Pool({
    user: 'uapv2402499',
    host: 'pedago.univ-avignon.fr',
    database: 'etd',
    password: 'tWKO5X',
    port: 5432,
    connectionTimeoutMillis: 5000
});

module.exports = db;

const initDB = async () => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS CoursUsers (id SERIAL PRIMARY KEY, nom VARCHAR(255))`);
        await db.query(`CREATE TABLE IF NOT EXISTS CoursNotes (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES CoursUsers(id), contenu TEXT, timecode VARCHAR(50))`);
        await db.query(`CREATE TABLE IF NOT EXISTS CoursTags (id SERIAL PRIMARY KEY, note_id INTEGER REFERENCES CoursNotes(id), hashtag VARCHAR(100))`);

        await db.query(`ALTER TABLE CoursNotes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        await db.query(`ALTER TABLE CoursNotes ADD COLUMN IF NOT EXISTS image_data TEXT`);

        await db.query(`CREATE INDEX IF NOT EXISTS idx_cours_hashtag ON CoursTags(hashtag)`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_date_creation ON CoursNotes(created_at)`);

        await db.query(`INSERT INTO CoursUsers (id, nom) VALUES (1, 'Wanis') ON CONFLICT (id) DO NOTHING`);
        
        console.log("Nouvelles tables, index et colonne image mis a jour avec succes !");
    } catch (err) {
        console.error("Erreur de creation des tables :", err.message);
    }
};
initDB();

app.post('/api/notes', async (req, res) => {
    const { user_id, contenu, timecode, image_data } = req.body;

    try {
        const resultNote = await db.query(
            `INSERT INTO CoursNotes (user_id, contenu, timecode, image_data) VALUES ($1, $2, $3, $4) RETURNING id`, 
            [user_id, contenu, timecode, image_data]
        );
        const noteId = resultNote.rows[0].id;

        const hashtagsExtraits = contenu ? contenu.match(/#[a-zA-Z0-9_]+/g) : null; 

        if (hashtagsExtraits) {
            for (const tag of hashtagsExtraits) {
                await db.query(
                    `INSERT INTO CoursTags (note_id, hashtag) VALUES ($1, $2)`, 
                    [noteId, tag.toLowerCase()]
                );
            }
        }

        res.json({ success: true, message: "Note, tags et image enregistres sur le serveur de la fac !", noteId: noteId, tags: hashtagsExtraits });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

app.get('/api/search', async (req, res) => {
    let hashtag = req.query.tag;

    if (!hashtag) return res.status(400).json({ erreur: "Il manque le parametre ?tag" });
    if (!hashtag.startsWith('#')) hashtag = '#' + hashtag;

    try {
        const requeteSQL = `
            SELECT CoursUsers.nom, CoursNotes.timecode, CoursNotes.contenu 
            FROM CoursNotes 
            INNER JOIN CoursTags ON CoursNotes.id = CoursTags.note_id 
            INNER JOIN CoursUsers ON CoursNotes.user_id = CoursUsers.id
            WHERE CoursTags.hashtag = $1
        `;

        const result = await db.query(requeteSQL, [hashtag.toLowerCase()]);
        res.json(result.rows); 
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

app.get('/api/search-dates', async (req, res) => {
    let { tag, start, end } = req.query;

    if (!tag || !start || !end) {
        return res.status(400).json({ erreur: "Il manque le parametre ?tag, ?start ou ?end" });
    }
    
    if (!tag.startsWith('#')) tag = '#' + tag;

    try {
        const dateFinComplete = end + ' 23:59:59';

        // AJOUT DE L'IMAGE DANS LE SELECT ICI
        const requeteSQL = `
            SELECT CoursNotes.contenu, CoursNotes.created_at, CoursNotes.image_data
            FROM CoursNotes
            INNER JOIN CoursTags ON CoursNotes.id = CoursTags.note_id
            WHERE CoursTags.hashtag = $1 
            AND CoursNotes.created_at BETWEEN $2 AND $3
        `;

        const result = await db.query(requeteSQL, [tag.toLowerCase(), start, dateFinComplete]);
        res.json(result.rows); 
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

app.get('/api/voir-tout', async (req, res) => {
    try {
        const users = await db.query('SELECT * FROM CoursUsers');
        const notes = await db.query('SELECT * FROM CoursNotes');
        const tags = await db.query('SELECT * FROM CoursTags');

        res.json({
            utilisateurs: users.rows,
            toutes_les_notes: notes.rows,
            tous_les_tags: tags.rows
        });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

app.listen(port, () => {
    console.log(`API connectee a PostgreSQL lancee sur http://localhost:${port}`);
});

module.exports = {
    query: (text, params) => db.query(text, params),
};