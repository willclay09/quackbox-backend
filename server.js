const createServer = require("http").createServer;
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const { addUser, removeUser, getTheUser, getUsersInRoom } = require("./users");
const router = require("./router");

const PORT = process.env.PORT || 3001;
const corsOptions = {
  // origins: ["*"],
  // [
  //   `https://quackbox.herokuapp.com`,
  //   `http://quackbox.herokuapp.com`,
  //   `http://localhost:3000`,
  // ],
  // allowedHeaders: [
  //   "Origin",
  //   "X-Requested-With",
  //   "Content-Type",
  //   "Accept",
  //   "content-type",
  //   "application/json",
  // ],
};

const app = express();
const server = createServer(app);
const io = socketio(server, {
  transports: ["websocket"],
  // cors: corsOptions
});

// app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

// app.options('/socket.io', cors())

io.on("connect", (socket) => {
  console.log("We have a new connection");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}.`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getTheUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});
// from Adrian Hajdin - JavaScript Mastery https://github.com/adrianhajdin/project_chat_application

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
