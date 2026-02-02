const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// CONFIGURATION CHANGE: Look for views in the current directory (Root)
app.set('views', __dirname);
app.set('view engine', 'ejs');

// Helper: Read notes
function getNotes() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Helper: Save note
function addNote(text) {
    const notes = getNotes();
    notes.push({ text: text, date: new Date() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes));
}

// Route: Home
app.get('/', (req, res) => {
    const notes = getNotes();
    const count = notes.length;
    
    // Dynamic Color Logic
    const saturation = Math.min(count * 2, 80); 
    const lightness = 90 - Math.min(count * 0.5, 40);

    res.render('index', { 
        count: count,
        colorString: `hsl(35, ${saturation}%, ${lightness}%)` 
    });
});

// Route: Add Note
app.post('/add', (req, res) => {
    if(req.body.note && req.body.note.trim().length > 0) {
        addNote(req.body.note.substring(0, 140)); 
    }
    res.redirect('/');
});

// Route: Get Random Note
app.get('/random', (req, res) => {
    const notes = getNotes();
    if (notes.length === 0) return res.json({ text: "The jar is empty. Be the first!" });
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    res.json(randomNote);
});

// HOSTINGER PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
