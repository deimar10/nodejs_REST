const db = require("./db");

const getAllUsers = async (io) => {
    const rows = await db.query(
        `SELECT id, title, body
         FROM posts`
    );
    io.emit('get/users', rows);
}

const createUser = async (io, data) => {
    let title = data.title;
    let body = data.body;

    const result = await db.query("INSERT INTO `posts` (`title`, `body`) VALUES ('"+title+"', '"+body+"')");
    getAllUsers(io);
}

const updateUser = async (io, data) => {
    const result = await db.query(
        `UPDATE posts SET title="${data.user.title}", body="${data.user.body}" WHERE id=${data.id}`
   );
    getAllUsers(io);
}

const deleteUser = async (io, id) => {
    const result = await db.query (
        `DELETE FROM posts WHERE id=${id}`
    );
    getAllUsers(io);
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}
