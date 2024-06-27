const express = require('express');
// const { getWhoAmI } = require('./whoamiModule'); // Replace with correct path
const fs = require('fs');
const path = require('path');
const app = express();
const { CandidLexer, CandidParser } = require("../node_modules/candid-js/src/parser");

const lexer = new CandidLexer();
const parser = new CandidParser();

const port = 3000;
const { exec } = require('child_process');
const candid = require('candid-js');

// function ress (error, result)  {
//     if (error) {
//         res.status(500).send('Error retrieving whoami data');
//         return;
//     }
//     res.send(result)
// }

app.get('/getName', (req, res) => {
    exec('dfx canister call alex reboot_getName --ic', (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }
        res.send(stdout.trim())
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.post('/dailyCheck', (req, res) => {

    var mood = req.body.mood;
    var command = 'dfx canister call alex reboot_dailyCheck \'("' + mood + '")\' --ic';
    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }
        res.send(candid.transpile(stdout.trim(), "json"))
    });
});

app.get('/isAlive', (req, res) => {
    exec('dfx canister call alex reboot_isAlive --ic', (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }

        res.send(candid.transpile(stdout.trim(), "json").stringify())
    });
});

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '../public', 'index.html');
    console.log(filePath)
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading index.html');
            return;
        }
        res.send(data);
    });
});

app.get('/getFriends', (req, res) => {
    exec('dfx canister call alex reboot_friends_getFriends --ic --output json', (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }
        stdout = stdout.trim();
        res.send(stdout);
    });
});

app.get('/getFriendRequests', (req, res) => {
    exec('dfx canister call alex reboot_friends_getFriendRequests --ic --output json', (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }
        res.send(stdout.trim())
    });
});

app.post('/handleFriendRequest', (req, res) => {

    var id = req.body.id;
    var accept = req.body.accept;

    exec(`dfx canister call alex reboot_friends_handleFriendRequest '(${id}, ${accept})' --ic`, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }
        res.send(stdout.trim())
    });
});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});