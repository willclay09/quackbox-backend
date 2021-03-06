const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const { addUser, removeUser, getTheUser, getUsersInRoom } = require("./users");
const router = require("./router");

const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: [
    `https://quackbox.herokuapp.com`,
    `http://quackbox.herokuapp.com`,
    `http://localhost:3000`,
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Origin", "Content-Type", "Accept", "X-Requested-With"],
};

const expressApp = express();
expressApp.use(router);
expressApp.use(express.json());
expressApp.use(cors(corsOptions));
expressApp.options("*", cors(corsOptions));

const server = http.createServer(expressApp);
const io = socketio(server, {
  // transports: ["websocket"], // Uncomment this on both here and the frontend if you want to restrict the socketio connection to Web Sockets, eliminating HTTP long-polling.
  cors: corsOptions,
});

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
