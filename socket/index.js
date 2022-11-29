const { getAllUsers, createUser, updateUser, deleteUser } = require('../services/socket');

module.exports = (io) => {
    io.on('connect', socket => {
        console.log(socket.id);

        socket.on('get/users', () => getAllUsers(io));

        socket.on('create/user', (data) => createUser(io, data));

        socket.on('update/user', (data) => updateUser(io, data));

        socket.on('delete/user', (id) => deleteUser(io, id));

        socket.on('disconnect', () => console.log('disconnected'))
    })
}
