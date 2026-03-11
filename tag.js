const express = require('express');
const app = express();
app.use(express.json());


const db = {
  notes: [],
  tags: [] 
};


app.post('/notes', (req, res) => {
  const { content, author } = req.body;
  const noteId = Date.now();

  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const foundTags = content.match(hashtagRegex) || [];
  const normalizedTags = [...new Set(foundTags.map(t => t.slice(1).toLowerCase()))];

  // Insertion "Table Notes"
  db.notes.push({ id: noteId, content, author });

  // Insertion "Table Tags"
  normalizedTags.forEach(tag => {
    db.tags.push({ 
      id: Math.random(), 
      noteId: noteId, 
      name: tag 
    });
  });

  res.status(201).json({ message: "Note et tags créés", noteId });
});


app.get('/search/:tag', (req, res) => {
  const searchTerm = req.params.tag.toLowerCase();

  const matchingNoteIds = db.tags
    .filter(t => t.name === searchTerm)
    .map(t => t.noteId);

  const results = db.notes.filter(note => matchingNoteIds.includes(note.id));

  res.json({
    tag: searchTerm,
    count: results.length,
    results: results
  });
});

app.listen(3000, () => console.log('serveur lancer'));