/*
  Starter — src/routes/tasks.js
  Session 18 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 6 · Session 18 · Practice (AF2) · Pair work

  Paste this file into src/routes/tasks.js. It applies the thin-router pattern
  introduced in Sessions 16 and 17 to the five CRUD routes.

  Keep this file THIN — it only maps HTTP verb + path to a controller
  function; all the logic lives in the controller. Do NOT change the export.

  This router is mounted at "/tasks" in app.js, so "/" means "/tasks" and
  "/:id" means "/tasks/:id".
*/

const express = require("express");
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController");

const router = express.Router();

router.get("/", listTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;