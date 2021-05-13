const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { json } = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.header("username");

  const userExists = users.find(
    (currentUser) => currentUser.username === username
  );

  if (!userExists) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = userExists;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(
    (currentUser) => currentUser.username === username
  );

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json([...user.todos]);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { deadline, title } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const userIndex = users.findIndex(
    (currentUser) => currentUser.username === user.username
  );

  users[userIndex].todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { deadline, title } = request.body;

  const userIndex = users.findIndex(
    (currentUser) => currentUser.username === user.username
  );

  const todoIndex = users[userIndex].todos.findIndex(
    (currentTodo) => currentTodo.id === id
  );

  if (todoIndex === -1)
    return response.status(404).json({
      error: "Todo not found",
    });

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = deadline;

  return response.json(users[userIndex].todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userIndex = users.findIndex(
    (currentUser) => currentUser.username === user.username
  );

  const todoIndex = users[userIndex].todos.findIndex(
    (currentTodo) => currentTodo.id === id
  );

  if (todoIndex === -1)
    return response.status(404).json({
      error: "Todo not found",
    });

  users[userIndex].todos[todoIndex].done = true;

  return response.json(users[userIndex].todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userIndex = users.findIndex(
    (currentUser) => currentUser.username === user.username
  );

  const todoIndex = users[userIndex].todos.findIndex(
    (currentTodo) => currentTodo.id === id
  );

  if (todoIndex === -1)
    return response.status(404).json({
      error: "Todo not found",
    });

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).end();
});

module.exports = app;