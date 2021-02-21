const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
var corsOptions = {
    origin: "http://localhost:8081"
};
app.use(cors(corsOptions));

//parse request of content-type -applicaiton/json
app.use(bodyParser.json());

//parse request of the content-type -application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//sequelize
const db = require("./app/models");
db.sequelize.sync();

//simple route
app.get('/', (req, res) => {
    res.json({name: 'welcome arham'});
});
//tutorials routes
require("./app/routes/tutorial.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

let io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    },
    allowEIO3: true
});
const Tutorial = db.tutorials;
io.on('connection', (socket) => {
    // io.emit('connections', Object.keys(io.sockets.connected).length);
    socket.on('disconnect', () => {
        console.log('Disconnected');

    })

    socket.on('Created', (data) => {
        socket.broadcast.emit('Created', (data))
    })
    socket.on('chat-message', async data => {
        console.log(data);
        const body = {
            title: data.message,
            description: data.user
        }
        await Tutorial.create(body)
        socket.broadcast.emit('chat-message', (data))
    })
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', (data))
    })
    socket.on('StopTyping', (data) => {
        socket.broadcast.emit('StopTyping', (data))
    })
    socket.on('joined', (data) => {
        socket.broadcast.emit('joined', (data))
    })
    socket.on('leaved', (data) => {
        socket.broadcast.emit('leaved', (data))
    })
})
