const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const database = require("./database.js");

const connectedUsers = {};

const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET","POST"]
        }
    });

    io.on('connection', async (socket) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            //no token so we disconnect the user
            socket.disconnect(true);
            return;
        }

        try {
            //checks if jwt is valid and if yes sends list of all users
            const decoded = await jwt.verify(token, secret);

            connectedUsers[decoded.userId] = socket; //we keep the correspondence between each userId and the associated socket

            socket.emit('allUsers', await database.getAllUsers());

            socket.on('message', async (data) => {
                //on message, we build the new message from the requests, save it to the database and send it to the user if online
                const sender = decoded.userId;
                const { receiver, content } = data;
                const date = new Date();
                const message = await database.addMessage(sender, receiver, content, date);

                const recipientSocket = connectedUsers[receiver];
                if (recipientSocket) {
                    recipientSocket.emit('message', message);
                }
            });

            socket.on('fetchMessages', async (data) => {
                //returns all the messages between 2 specific users
                const user1 = decoded.userId;
                const user2 = data.id;
                const messages = await database.getMessagesByUsers(user1, user2);

                socket.emit('messages', messages);
            });

            socket.on('allUsers', async () =>{
                //on allUsers we send the users list
                socket.emit('allUsers', await database.getAllUsers());
            });

            socket.on('disconnect', () => {
                delete connectedUsers[decoded.userId];
            });
        }
        catch (error) {
            //if token check fails, we disconnect the user
            socket.disconnect(true);
        }
    });
    return io;
};

module.exports = initSocketServer;
