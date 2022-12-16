const secposts = require("../models/posts");

async function getMultiple (req, res) {
    try {
        const post = await secposts.findAll();
        return res.status(200).json(post);
    } catch (error) {
        res.status(400).send();
    }
}

 async function create (req, res) {
   try {
       let data = {
           title: req.body.title,
           body: req.body.body,
           token: req.body.token
       }
       const post = await secposts.create(data)
       res.status(201).json({
           id: post.id,
           title: post.title,
           body: post.body,
           token: post.token
       });
   } catch (error) {
       res.status(400).send();
   }
}

async function update (req, res) {
    try {
        await userAuthorize(req);
        let data = {
            title: req.body.title,
            body: req.body.body,
        }
        await secposts.update((data), {
            where: {
                id: req.params.id
            },
        });
        const post = await secposts.findOne({
            where: {
                id: req.params.id
            },
        })
        res.json({
            id: post.id,
            title: post.title,
            body: post.body,
        });
    } catch (error) {
        if (error.message === 'auth error') {return res.status(403).send()}
        return res.status(400).send();
    }
}

async function remove (req, res) {
    try {
         await userAuthorize(req);
         await secposts.destroy({
            where: {
                id: req.params.id
            }
        });
    } catch (error) {
        if(error.message === 'auth error') {return res.status(403).send()}
        return res.status(404).send();
    }
}

async function getOnePost (id, res) {
    try {
        const post = await secposts.findOne({
            where: {
                id: id
            },
        });
        return { title: post.title, body: post.body }
    } catch (error) {
        return res.status(400).send();
    }
}

async function userAuthorize(req) {
    const tokens = req.headers.authorization.split(" ")[1];

    const userObj = await secposts.findOne({
        where: {
            id: req.params.id
        }
    });
    if (userObj.token !== tokens) {throw new Error("auth error")}
}

module.exports = {
    create,
    getMultiple,
    remove,
    update,
    getOnePost
}

