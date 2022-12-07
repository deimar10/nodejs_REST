const express = require('express');
const router = express.Router();
const posts = require('../services/posts');
const fs = require('fs');
const readline = require('readline');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
        });
    }
    return res.send(lines);
})

function log(req, res, next) {
    const currentDate = new Date().toISOString();
    let date_ob = new Date(currentDate);

    let dateDay = date_ob.getDate();
    let dateMonth = date_ob.getMonth() + 1;
    let dateYear = date_ob.getFullYear();
    let time = date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds();

    const timeStamp = dateDay + "-" + dateMonth + "-" + dateYear + " " + time;

    fs.appendFile('log.txt', timeStamp + ',' + req.originalUrl + ',' + req.method + '\r\n', function(err) {
        if (err) throw err;
    });
    next();
}

router.get('/token', (req, res) => {
    // Authenticate
    let privateKey = process.env.JWT_SECRET_KEY;
    let token = jwt.sign({ "body" : "secret" },
        privateKey, { algorithm: 'HS256'});
    res.send(token);
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (typeof token !== "undefined") {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err) => {
            if (err) {res.status(401).json({ error: "Not authorized" });
               // throw new Error("Not authorized");
            }
            return next();
        });
    } else {
        res.status(401).json({ error: "Please include a token in request header"});
       // throw new Error("Not authorized");
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
        res.json(await posts.update(req.params.id, req.body, res));
    } catch (err) {
        res.status(404).send({message:"Post not found"});
        console.error(`Error while updating posts`, err.message);
        next(err);
    }
});

/* DELETE posts */
router.delete('/:id', log, authenticateToken, async function(req, res, next) {
    try {
        res.status(204).json(await posts.remove(req.params.id, res));
    } catch (err) {
        res.status(404).send({message:"Post not found"});
        console.error(`Error while deleting posts`, err.message);
        next(err);
    }
});

module.exports = router;
