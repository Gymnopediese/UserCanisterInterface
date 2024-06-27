const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const port = 3000;
const { exec } = require('child_process');
const candid = require('candid-js');

get_routes = [
    {
        route: '/getName',
        command: 'reboot_getName',
    },
    {
        route: '/isAlive',
        command: 'reboot_isAlive',
    },
    {
        route: '/getFriends',
        command: 'reboot_user_getFriends',
    },
    {
        route: '/getFriendRequests',
        command: 'reboot_user_getFriendRequests',
    },
]


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function dfx(command, func, args= "")
{
    if (args != "")
        args = `'(${args})'`
    command = `dfx canister call alex ${command} ${args} --ic --output json`
    console.log(command);
    exec(command, func);
}

for (const route of get_routes) {
    app.get(route.route, (req, res) => {
        dfx(route.command, (error, stdout, stderr) => {
            if (error) {
                res.status(500).send('Error retrieving data');
                return;
            }
            res.send(stdout.trim())
        });
    });
}


app.post('/dailyCheck', (req, res) => {
    dfx("reboot_user_dailyCheck", (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }
        res.send(stdout.trim());
    }, `"${req.body.mood}"`);
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

app.get('/chat', (req, res) => {
    console.log(req.query)
    const filePath = path.join(__dirname, '../public', 'chat.html');
    console.log(filePath)
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading index.html');
            return;
        }
        res.send(data);
    });
});

app.post('/handleFriendRequest', (req, res) => {
    var id = req.body.id;
    var accept = req.body.accept;
    dfx(`reboot_user_handleFriendRequest`, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Error retrieving whoami data');
            return;
        }
        res.send(stdout.trim())
    },  `${id}, ${accept}`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});