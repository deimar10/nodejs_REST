const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1) {
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
        `SELECT id, title, body FROM posts LIMIT ${offset}, ${config.listPerPage}`
    );

    const data = helper.emptyOrRows(rows);
    const meta = {page};

    return {
        data,
        meta
    }
}


async function create(posts){
     let title = posts.title;
     let body = posts.body;
    const result = await db.query("INSERT INTO `posts` (`title`, `body`) VALUES ('"+title+"', '"+body+"')");

    let message = 'Error in creating posts';

    if (result.affectedRows) {
        message = 'Posts created successfully';
    }

    return {message};
}

async function update(id, posts) {
    const result = await db.query(
        `UPDATE posts SET title="${posts.title}", body="${posts.body}" WHERE id=${id}`
    );
    let message = 'Error in updating posts';

    if (result.affectedRows) {
        message = 'Posts updated successfully';
    }
    return {message};
}

async function remove(id) {
    const result = await db.query(
        `DELETE FROM posts WHERE id=${id}`
    );

    let message = 'Error in deleting posts';

    if (result.affectedRows) {
        message = 'post deleted successfully'
    }

    return {message};
}

module.exports = {
    getMultiple,
    create,
    update,
    remove,
}