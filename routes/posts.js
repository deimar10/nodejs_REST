const express = require('express');
const router = express.Router();
const posts = require('../services/posts');
const postSequelize = require('../services/post.sequelize');
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
            id: fields[3],
            method: fields[2],
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

    let token = req.headers.authorization;
    let [header, payload, signature] = token.split(".");

    let compare;
    if(req.method === 'PUT'){
         //compare = JSON.stringify(diff(req.body,(await posts.getOnePost(req.params.id)))).replace(/[{\"\",}]+/g, " ");
        compare = JSON.stringify(diff(req.body,(await postSequelize.getOnePost(req.params.id, res)))).replace(/[{\"\",}]+/g, " ");
    } else {
         compare = " ";
    }

    fs.appendFile('log.txt', timeStamp + ',' + req.originalUrl + ',' + req.method  + ',' + signature  + ',' + compare + '\r\n', function(err) {
        if (err) throw err;
    });
    next();
}

function diff(obj1, obj2) {

    function getUniqueKeys(obj1, obj2) {
        let keys = Object.keys(obj1).concat(Object.keys(obj2));
        return keys.filter(function (item, pos) {
            return keys.indexOf(item) === pos;
        });
    }

    let initial = {state: "Old"};
    let result = {state: "New"};

    let reference = [];
    for (let k of getUniqueKeys(obj1, obj2)) {
        if (obj1[k] !== obj2[k]) {
            initial[k] = obj2[k]
            result[k] = obj1[k]
        }
    }
    reference.push(initial, result)
    return reference;
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

    if (req.headers.authorization ) {
        let token = req.headers.authorization.split(" ")[1];

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
        //res.json(await posts.getMultiple());
        res.json(await postSequelize.getMultiple(req, res));
    } catch (err) {
        console.error(`Error while getting programming languages`, err.message);
        next(err);
    }
});

/* POST posts */
router.post('/',authenticateToken, log , async function(req, res, next) {
    try {
        //res.status(201).json(await posts.create(req.body));
        res.json(await postSequelize.create(req, res));
    } catch (err) {
        console.error(`Error while creating posts`, err.message);
        next(err);
    }
});


/* PUT posts */
router.put('/:id',authenticateToken, log, async function(req, res, next) {
    try {
       // res.json(await posts.update(req.params.id, req.body, res, req));
        res.json(await postSequelize.update(req, res));
    } catch (err) {
        // res.status(404).send({message:"Post not found"});
        console.error(`Error while updating posts`, err.message);
        next(err);
    }
});

/* DELETE posts */
router.delete('/:id', log, authenticateToken, async function(req, res, next) {
    try {
        // res.status(204).json(await posts.remove(req.params.id, res, req));
        res.status(204).json(await postSequelize.remove(req, res));
    } catch (err) {
      //  res.status(404).send({message:"Post not found"});
        console.error(`Error while deleting posts`, err.message);
        next(err);
    }
});

module.exports = router;
