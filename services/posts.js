const db = require('./db');
const helper = require('../helper');

async function getMultiple() {
    const rows = await db.query(
        `SELECT id, title, body FROM posts`
    );

    return helper.emptyOrRows(rows);
}

async function create(posts){
    let title = posts.title;
    let body = posts.body;
    let token = posts.token;

    const result = await db.query("INSERT INTO `posts` (`title`, `body`, `token`) VALUES ('"+title+"', '"+body+"', '"+token+"')");

    let message = 'Error in creating posts';

    if (result.affectedRows) {
        return {
            id: result.insertId,
            title: title,
            body: body,
            token: token
        }
    }
    return {message};
}

async function update(id, posts, res, req) {
    await userAuthorize(req, res)
    const result = await db.query(
        `UPDATE posts SET title='${posts.title}', body='${posts.body}' WHERE id=${id}`
    );

    if (result.affectedRows) {
        return {
            id: parseInt(id, 10),
            title: posts.title,
            body: posts.body
        }
    }
    return res.status(400).send({message: 'Error in updating posts'})
}


async function remove(id, res, req) {
    await userAuthorize(req, res)
    const result = await db.query(
        `DELETE FROM posts WHERE id=${id}`
    );

    if (result.affectedRows) {
        return {}
    }
    let message = 'Error in deleting posts';
    return res.status(404).send({message});
}

async function userAuthorize(req, res) {
    const tokens = req.headers.authorization.split(" ")[1];
    const id = req.params.id;
    const post = await db.query(`SELECT token FROM posts WHERE id=${id}`);
    const authError = "Authorization error"

    if(tokens !== post[0].token) {
        throw new Error(authError);
    }
}

module.exports = {
    getMultiple,
    create,
    update,
    remove,
}
