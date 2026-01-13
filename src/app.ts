import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const messages: any[] = [
    {message: "Hello, Dmitry", id: "vrz123z", user: {id: "1221rt", name: "Viktor"}},
    {message: "Hello, Viktor", id: "vrz112t", user: {id: "1214rt", name: "Dmitry"}},
    {message: "How are you", id: "vrz145z", user: {id: "1221rt", name: "Viktor"}}
]

const usersState = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.get('/', (_req, res) => {
    res.send('<h1>Socket.IO Server</h1>');
});

io.on('connection', (socketChannel) => {
    console.log('New client connected:', socketChannel.id);
    socketChannel.emit('init-messages-published', messages)

    socketChannel.on('disconnect', () => {
        usersState.delete(socketChannel.id);
    });

    usersState.set(socketChannel.id, {id: new Date().getTime().toString(), name: 'anonymous'});

    socketChannel.on('client-name-sent', (name: string) => {
        if (typeof name !== 'string') {
            return;
        }
        const user = usersState.get(socketChannel.id);
        user.name = name;
    });
    socketChannel.on('client-typed', () => {
        io.emit('user-typing',usersState.get(socketChannel.id));
    });

    socketChannel.on('client-message-sent', (message: string) => {
        if (typeof message !== 'string') {
        return;
        }
        const user = usersState.get(socketChannel.id);
        let newMessage = {
            message: message, id: new Date().getTime(),
            user: {id: user.id, name: user.name}};
        messages.push(newMessage);
        io.emit('new-message-sent', newMessage);
    });

});

const PORT = 3009;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});