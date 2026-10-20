/*
  Starter — src/controllers/tasksController.js
  Session 18 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 6 · Session 18 · Practice (AF2) · Pair work

  This file applies the controller pattern introduced in Sessions 16 and 17
  to the Session 15 Tasks API. Paste it into
  src/controllers/tasksController.js and complete the five operations.

  Do NOT rename the exports (listTasks, getTask, createTask, updateTask,
  deleteTask) and do NOT change their (req, res, next) signatures — the
  router and the Jest tests import them by name.

  The in-memory store now lives HERE and is MUTABLE. Lab 6 (Session 22)
  will replace this array with a node-postgres model WITHOUT changing these
  exported function names — that stable public API is the whole point of
  keeping data out of the route file. Task shape stays { id, title, done,
  userId } to match the users + tasks database schema.
*/

// Mutable in-memory store — pretend it is a database table.
let tasks = [
  { id: 1, title: "Write the API skeleton", done: true, userId: 1 },
  { id: 2, title: "Add full CRUD", done: false, userId: 1 },
  { id: 3, title: "Return the right status codes", done: false, userId: 2 },
];
let nextId = 4; // the id the next created task will get


function hasValidTitle(body) {
  return (
    body !== undefined &&
    typeof body.title === "string" &&
    body.title.trim() !== ""
  );
}

// GET /tasks
function listTasks(req, res, next) {
  res.status(200).json(tasks);
}

// GET /tasks/:id
function getTask(req, res, next) {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(200).json(task);
}

// POST /tasks  (create)
function createTask(req, res, next) {
  if (!hasValidTitle(req.body)) {
    return res.status(400).json({ error: "title is required" });
  }
  const { title, done = false, userId = null } = req.body;
  const task = { id: nextId++, title: title.trim(), done, userId };
  tasks.push(task);
  res.status(201).location(`/tasks/${task.id}`).json(task);
}

// PUT /tasks/:id  (full replace)
function updateTask(req, res, next) {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (!hasValidTitle(req.body)) {
    return res.status(400).json({ error: "title is required" });
  }
  const { title, done = false, userId = null } = req.body;
  const replaced = { id: tasks[index].id, title: title.trim(), done, userId };
  tasks[index] = replaced;
  res.status(200).json(replaced);
}
// DELETE /tasks/:id
function deleteTask(req, res, next) {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  tasks.splice(index, 1);
  res.status(204).end();
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };