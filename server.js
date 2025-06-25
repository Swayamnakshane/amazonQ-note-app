const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const NOTES_FILE = path.join(__dirname, 'data', 'notes.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize notes file if it doesn't exist
if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

// Helper functions
const readNotes = () => {
    try {
        const data = fs.readFileSync(NOTES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading notes:', error);
        return [];
    }
};

const writeNotes = (notes) => {
    try {
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing notes:', error);
        return false;
    }
};

// Routes
// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all notes
app.get('/api/notes', (req, res) => {
    const notes = readNotes();
    res.json(notes);
});

// Get a specific note
app.get('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const note = notes.find(n => n.id === req.params.id);
    
    if (!note) {
        return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
});

// Create a new note
app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const notes = readNotes();
    const newNote = {
        id: uuidv4(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    
    if (writeNotes(notes)) {
        res.status(201).json(newNote);
    } else {
        res.status(500).json({ error: 'Failed to save note' });
    }
});

// Update a note
app.put('/api/notes/:id', (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const notes = readNotes();
    const noteIndex = notes.findIndex(n => n.id === req.params.id);
    
    if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found' });
    }
    
    notes[noteIndex] = {
        ...notes[noteIndex],
        title: title.trim(),
        content: content.trim(),
        updatedAt: new Date().toISOString()
    };
    
    if (writeNotes(notes)) {
        res.json(notes[noteIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const noteIndex = notes.findIndex(n => n.id === req.params.id);
    
    if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found' });
    }
    
    notes.splice(noteIndex, 1);
    
    if (writeNotes(notes)) {
        res.json({ message: 'Note deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Note app server running on http://localhost:${PORT}`);
});
