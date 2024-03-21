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
        console.log('New client connected');

        const token = socket.handshake.auth.token;
        if (!token) {
            console.error('No token provided');
            socket.disconnect(true);
            return;
        }

        try {
            const decoded = await jwt.verify(token, secret);
            console.log('User authenticated:', decoded.userId);

            connectedUsers[decoded.userId] = socket;

            socket.emit('allUsers', await database.getAllUsers());

            socket.on('message', async (data) => {
                console.log('Received message:', data);

                const sender = decoded.userId;
                const { receiver, content } = data;
                const date = new Date();
                const message = await database.addMessage(sender, receiver, content, date);

                const recipientSocket = connectedUsers[receiver];
                if (recipientSocket) {
                    recipientSocket.emit('message', message);
                } else {
                    console.log('Recipient is offline');
                }
            });

            socket.on('fetchMessages', async (data) => {
                console.log('Fetching messages:', data);

                const user1 = decoded.userId;
                const user2 = {id: data.id};
                const messages = await database.getMessagesByUsers(user1, user2);

                socket.emit('messages', messages);
            });


            socket.on('disconnect', () => {
                console.log('Client disconnected');
                delete connectedUsers[decoded.userId];
            });
        }
        catch (error) {
            console.error('Authentication error:', error.message);
            socket.disconnect(true);
        }
    });
    return io;
};

module.exports = initSocketServer;
