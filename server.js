const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

let userCount = 0;

io.on('connection', socket => {
  let newUser = false;

  socket.on('new message', data => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', username => {
    if (newUser) return;

    socket.username = username;
    userCount++;
    newUser = true;
    socket.emit('login', {
      userCount: userCount
    });
    socket.broadcast.emit('user joined', {
      username: socket.username,
      userCount: userCount
    });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', () => {
    if (newUser) {
      userCount++;

      socket.broadcast.emit('user left', {
        username: socket.username,
        userCount: userCount
      });
    }
  });
});
