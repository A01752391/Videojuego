"use strict"

import express from "express";
import fs from 'fs';

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static('./chess-game/assets'));

app.get('/', (req, res) => {
    fs.readFile('../chess-game/assets/html/index.html', 'utf8', 
        (err, html) => {
            if(err) {
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
