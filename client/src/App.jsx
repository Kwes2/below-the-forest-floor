import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to the server (use localhost for now, later the Render URL)
const socket = io.connect('http://localhost:3001');

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on('room_data', (data) => {
      setPlayers(data.players);
    });

    socket.on('error_message', (msg) => {
      alert(msg);
    });
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { roomId: room, username });
      setJoined(true);
    }
  };

  if (!joined) {
    return (
      <div className="setup-container">
        <h1>Below the Forest Floor</h1>
        <input 
          placeholder="Name..." 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          placeholder="Room ID..." 
          onChange={(e) => setRoom(e.target.value)} 
        />
        <button onClick={joinRoom}>Enter the Network</button>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <h2>Room: {room}</h2>
      <h3>Connected Saplings:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.username}</li>
        ))}
      </ul>
      {players.length < 5 && <p>Waiting for more players... ({players.length}/5)</p>}
      {players.length >= 2 && <button>Start Age 1</button>}
    </div>
  );
}

export default App;