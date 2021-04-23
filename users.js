const usersList = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = usersList.find(
    (user) => user.room === room && user.name === name
  );

  if (!name || !room) return { error: "Username and room are required." };
  if (existingUser) return { error: "Username is taken." };

  const user = { id, name, room };

  usersList.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = usersList.findIndex((user) => user.id === id);

  if (index !== -1) return usersList.splice(index, 1)[0];
};

const getTheUser = (id) => usersList.find((user) => user.id === id);

const getUsersInRoom = (room) => usersList.filter((user) => user.room === room);
// from Adrian Hajdin - JavaScript Mastery https://github.com/adrianhajdin/project_chat_application
module.exports = { addUser, removeUser, getTheUser, getUsersInRoom };
