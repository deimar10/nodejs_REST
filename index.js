const express = require("express");
const app = express();
const port = 3001;
const postsRouter = require("./routes/posts");
const cors = require("cors");
const http = require("http");
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const server = http.createServer(app)

app.use(cors());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
})

require('./socket')(io)

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.get("/", (req, res) => {
    res.json({message: "ok"});
});
app.use("/posts", postsRouter);
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({message: err.message });
    return;
});

server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
})
