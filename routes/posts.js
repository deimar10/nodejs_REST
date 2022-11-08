const express = require('express');
const router = express.Router();
const posts = require('../services/posts');

/* GET posts. */
router.get('/', async  function(req, res, next){
    try {
        res.json(await posts.getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting programming languages`, err.message);
        next(err);
    }
});

/* POST posts */
router.post('/', async function(req, res, next) {
    try {
        res.json(await posts.create(req.body));
    } catch (err) {
        console.error(`Error while creating posts`, err.message);
        next(err);
    }
});

/* PUT posts */
router.put('/:id', async function(req, res, next) {
    try {
        res.json(await posts.update(req.params.id, req.body));
    } catch (err) {
        console.error(`Error while updating posts`, err.message);
        next(err);
    }
});

/* DELETE posts */
router.delete('/:id', async function(req, res, next) {
    try {
        res.json(await posts.remove(req.params.id));
    } catch (err) {
        console.error(`Error while deleting posts`, err.message);
        next(err);
    }
});

module.exports = router;