"use strict"

import express from "express";
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/css', express.static(path.join(process.cwd(), '../chess-game/assets/css')));
app.use('/js', express.static(path.join(process.cwd(), '../chess-game/assets/js')));
app.use('/images', express.static(path.join(process.cwd(), '../Imagenes')));

app.use(express.static(path.join(process.cwd(), '../chess-game')));

app.get('/', (req, res) => {
    const indexPath = path.join(process.cwd(), '../chess-game/assets/html/index.html');
    fs.readFile(indexPath, 'utf8', 
        (err, html) => {
            if(err) {
                console.error('Error reading index.html', err);
                res.status(500).send('There was an error: ' + err)
                return
            }
            console.log('Sending page...')
            res.send(html);
            console.log('Page sent!')
        })
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
})
