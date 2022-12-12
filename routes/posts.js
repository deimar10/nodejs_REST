const express = require('express');
const router = express.Router();
const posts = require('../services/posts');
const fs = require('fs');
const readline = require('readline');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* Endpoint for seeing logs */
router.get('/logs', async (req, res) => {
    const lines = [];
    const lineReader = readline.createInterface({
        input: fs.createReadStream('log.txt'),
        crlfDelay: Infinity
    });

    for await (const line of lineReader) {
        const fields = line.match(/(\\.|[^,])+/g);

        lines.push({
            timeStamp: fields[0],
            originalUrl: fields[1],
            method: fields[2],
            id: fields[3],
            new: fields[4],
            original: fields[5]
        });
    }
    return res.send(lines);
})

/* function for logs */
async function log(req, res, next) {

    const currentDate = new Date().toISOString();
    let dateObject = new Date(currentDate);

    let dateDay = dateObject.getDate();
    let dateMonth = dateObject.getMonth() + 1;
    let dateYear = dateObject.getFullYear();
    let time = dateObject.getHours().toString().padStart(2,0) + ":" + dateObject.getMinutes().toString().padStart(2,0) + ":" + dateObject.getSeconds().toString().padStart(2,0);

    const timeStamp = dateDay + "-" + dateMonth + "-" + dateYear + " " + time;

    token = req.headers.authorization;
    let [header, payload, signature] = token.split(".");

    const data = JSON.stringify(req.body);
    let extraData = data.replace(/[{\"\",}]+/g, " ");

    let originalState;
    if (req.method === 'PUT') {
         originalState = JSON.stringify((await posts.getOnePost(req.params.id))).replace(/[{\"\",}]+/g, " ");
    } else {
         originalState = " ";
    }

    fs.appendFile('log.txt', timeStamp + ',' + req.originalUrl + ',' + req.method + ',' + signature + ',' + 'New:' + extraData + ',' + 'Previous:' + originalState + '\r\n', function(err) {
        if (err) throw err;
    });
    next();
}

/* Endpoint for geting token */
router.get('/token', (req, res) => {
    // Authenticate
    let privateKey = process.env.JWT_SECRET_KEY;
    let token = jwt.sign({ "body" : "secret" },
        privateKey, { algorithm: 'HS256'});
    res.send(token);
})

/* Middleware */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (typeof token !== "undefined") {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err) => {
            if (err) {res.status(401).json({ error: "Not authorized" });
                throw new Error("Not authorized");
            }
            return next();
        });
    } else {
        res.status(401).json({ error: "Please include a token in request header"});
         throw new Error("Not authorized");
    }
}

/* GET posts. */
router.get('/', async function(req, res, next){
    try {
        res.json(await posts.getMultiple());
    } catch (err) {
        console.error(`Error while getting programming languages`, err.message);
        next(err);
    }
});

/* POST posts */
router.post('/', log, authenticateToken, async function(req, res, next) {
    try {
        res.status(201).json(await posts.create(req.body));
    } catch (err) {
        console.error(`Error while creating posts`, err.message);
        next(err);
    }
});


/* PUT posts */
router.put('/:id', log, authenticateToken, async function(req, res, next) {
    try {
        res.json(await posts.update(req.params.id, req.body, res, req));
    } catch (err) {
        res.status(404).send({message:"Post not found"});
        console.error(`Error while updating posts`, err.message);
        next(err);
    }
});

/* DELETE posts */
router.delete('/:id', log, authenticateToken, async function(req, res, next) {
    try {
        res.status(204).json(await posts.remove(req.params.id, res, req));
    } catch (err) {
        res.status(404).send({message:"Post not found"});
        console.error(`Error while deleting posts`, err.message);
        next(err);
    }
});

module.exports = router;
