const express = require("express");
const randomBytes = require("crypto").randomBytes;

const router = express.Router();

const generateNewId = () => randomBytes(16).toString("hex");

const users = [];

router.get("/api/users", (req, res) => {
  res.send({ response: users }).status(200);
});

router.get("/api/user/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((user) => user.id === id);

  if (user) {
    res.send({ response: user }).status(200);
  } else {
    res.send({ response: null }).status(200);
  }
});

router.post("/api/user", (req, res) => {
  const newUser = {
    id: generateNewId(),
    ...req.body,
  };

  console.log({ "New User": newUser });

  users.push(newUser);
  res.send({ response: newUser }).status(201);
});
// from Adrian Hajdin - JavaScript Mastery https://github.com/adrianhajdin/project_chat_application

module.exports = router;
