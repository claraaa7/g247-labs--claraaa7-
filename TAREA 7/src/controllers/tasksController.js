/*
  Starter — src/controllers/tasksController.js
  Session 27 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 8 · Session 27 · Practice (AF2) · Pair work

  Paste this file into src/controllers/tasksController.js. This GROWS the
  Session 18 controller: it is backed by Session 22's tasksModel (async DB
  calls, not an array), every handler is owner-checked, and the list route is
  paginated.

  Factory takes the tasksModel so it is easy to test. Do NOT rename
  createTasksController or any of the five handlers.

  NOTE — evolution from Sessions 15/18: we move from free-standing named exports
  to this dependency-injection FACTORY so the model (a fake in tests) can be
  injected and each handler unit-tested. Name map: listTasks -> list,
  getTask -> getOne, createTask -> create, updateTask -> update, deleteTask -> remove.

  toDTO keeps the public API contract identical to Session 18: the database
  row is snake_case (user_id), but responses stay camelCase (userId).
*/

const MAX_PAGE = 100000;
const MAX_LIMIT = 100;

// Convierte un valor de la query en entero seguro, o usa el valor por defecto.
// Solo acepta cadenas de dígitos: "abc", "1.5" o "Infinity" caen al valor por defecto.
function toInt(value, fallback) {
  if (typeof value !== "string" || !/^[+-]?\d+$/.test(value.trim())) return fallback;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : fallback;
}

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function createTasksController({ tasksModel }) {
  // Fila de la BD (user_id) -> contrato de la API (userId)
  const toDTO = (row) => ({
    id: row.id,
    title: row.title,
    done: row.done,
    userId: row.user_id,
  });

  return {
    // GET /tasks?page=&limit=  — solo las tareas del usuario, paginadas
    async list(req, res, next) {
      try {
        const page = clamp(toInt(req.query.page, 1), 1, MAX_PAGE);
        const limit = clamp(toInt(req.query.limit, 20), 1, MAX_LIMIT);
        const offset = (page - 1) * limit;

        const rows = await tasksModel.findByOwner(req.user.sub, { limit, offset });
        res.json({ page, limit, items: rows.map(toDTO) });
      } catch (err) {
        next(err);
      }
    },

    // GET /tasks/:id  — 404 si no existe, 403 si no es suya, 200 si sí
    async getOne(req, res, next) {
      try {
        const task = await tasksModel.findById(Number(req.params.id));
        if (!task) return res.status(404).json({ error: "Task not found" });
        if (Number(task.user_id) !== Number(req.user.sub)) {
          return res.status(403).json({ error: "Forbidden" });
        }
        res.json(toDTO(task));
      } catch (err) {
        next(err);
      }
    },

    // POST /tasks  — el cuerpo ya viene validado por Zod
    async create(req, res, next) {
      try {
        const { title, done } = req.body;
        // El propietario sale del token, NUNCA del cuerpo
        const created = await tasksModel.create({ title, userId: req.user.sub, done });
        res.status(201).location(`/tasks/${created.id}`).json(toDTO(created));
      } catch (err) {
        next(err);
      }
    },

    // PUT /tasks/:id  — reemplazo completo, solo el propietario
    async update(req, res, next) {
      try {
        const id = Number(req.params.id);
        const task = await tasksModel.findById(id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        if (Number(task.user_id) !== Number(req.user.sub)) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const { title, done } = req.body;
        const updated = await tasksModel.update(id, { title, done });
        res.json(toDTO(updated));
      } catch (err) {
        next(err);
      }
    },

    // DELETE /tasks/:id  — solo el propietario
    async remove(req, res, next) {
      try {
        const id = Number(req.params.id);
        const task = await tasksModel.findById(id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        if (Number(task.user_id) !== Number(req.user.sub)) {
          return res.status(403).json({ error: "Forbidden" });
        }
        await tasksModel.remove(id);
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { createTasksController };