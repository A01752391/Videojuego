const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

// Serve CSS files from chess-game/assets/css
app.use('/css', express.static(path.join(__dirname, '../chess-game/assets/css')));

// Serve JS files from chess-game/assets/js  
app.use('/js', express.static(path.join(__dirname, '../chess-game/assets/js')));

// Serve images from Imagenes folder
app.use('/images', express.static(path.join(__dirname, '../Imagenes')));

// Serve static files from chess-game directory
app.use(express.static(path.join(__dirname, '../chess-game')));

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../chess-game/assets/html/index.html');
    fs.readFile(indexPath, 'utf8', 
        (err, html) => {
            if(err) {
                console.error('Error reading index.html', err);
                res.status(500).send('There was an error: ' + err);
                return;
            }
            console.log('Sending page...');
            res.send(html);
            console.log('Page sent!');
        });
});

// Serve the game page
app.get('/game', (req, res) => {
    const gamePath = path.join(__dirname, '../chess-game/assets/html/game.html');
    fs.readFile(gamePath, 'utf8', 
        (err, html) => {
            if(err) {
                console.error('Error reading game.html', err);
                res.status(500).send('There was an error: ' + err);
                return;
            }
            res.send(html);
        });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
