const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, we will limit this to your Render URL
        methods: ["GET", "POST"]
    }
});

// This object will store all active rooms
// Structure: { "room123": { players: [{ id: '...', name: '...', color: '...' }], gameStarted: false } }
const rooms = {};

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (data) => {
        const { roomId, username } = data;

        // Create room if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], gameStarted: false };
        }

        // Prevent joining if game started or room full
        if (rooms[roomId].players.length >= 5) {
            socket.emit('error_message', 'Room is full');
            return;
        }

        // Add player to the room data
        const newUser = { id: socket.id, username, color: null };
        rooms[roomId].players.push(newUser);

        socket.join(roomId);
        
        // Tell everyone in the room to update their player list
        io.to(roomId).emit('room_data', rooms[roomId]);
        console.log(`${username} joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
        // Handle logic to remove player from rooms object on disconnect
        console.log("User Disconnected", socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});