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

    const result = await db.query("INSERT INTO `posts` (`title`, `body`) VALUES ('"+title+"', '"+body+"')");

    let message = 'Error in creating posts';

    if (result.affectedRows) {
        return {
            id: result.insertId,
            title: title,
            body: body
        }
    }
    return {message};
}

async function update(id, posts) {
    const result = await db.query(
        `UPDATE posts SET title="${posts.title}", body="${posts.body}" WHERE id=${id}`
    );
    let message = 'Error in updating posts';

    if (result.affectedRows) {
        return {
            id: id,
            title: posts.title,
            body: posts.body
        }
    }
    return {message};
}

async function remove(id) {
    const result = await db.query(
        `DELETE FROM posts WHERE id=${id}`
    );

    let message = 'Error in deleting posts';

    if (result.affectedRows) {
        return {}
    }

    return {message};
}

module.exports = {
    getMultiple,
    create,
    update,
    remove,
}