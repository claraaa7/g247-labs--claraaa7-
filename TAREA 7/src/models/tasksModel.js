function createTasksModel(db) {
  return {
    // Todas las tareas, con orden estable.
    async findAll() {
      const { rows } = await db.query(
        "SELECT id, user_id, title, done FROM tasks ORDER BY id",
        []
      );
      return rows;
    },

    // Una tarea por id: la fila, o null si no existe.
    async findById(id) {
      const { rows } = await db.query(
        "SELECT id, user_id, title, done FROM tasks WHERE id = $1",
        [id]
      );
      return rows[0] ?? null;
    },

    // Crea una tarea. RETURNING devuelve la fila guardada, con su id.
    async create({ title, userId, done = false }) {
      const { rows } = await db.query(
        `INSERT INTO tasks (user_id, title, done)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, title, done`,
        [userId, title, done]
      );
      return rows[0];
    },

    // Actualiza solo los campos recibidos. ?? convierte undefined en null y
    // COALESCE mantiene entonces el valor actual. Con ?? (no ||), false es
    // un valor válido.
    async update(id, fields = {}) {
      const { rows } = await db.query(
        `UPDATE tasks
         SET title   = COALESCE($2, title),
             done    = COALESCE($3, done),
             user_id = COALESCE($4, user_id)
         WHERE id = $1
         RETURNING id, user_id, title, done`,
        [id, fields.title ?? null, fields.done ?? null, fields.userId ?? null]
      );
      return rows[0] ?? null;
    },

    // true si se borró una fila, false si el id no existía.
    async remove(id) {
      const result = await db.query(
        "DELETE FROM tasks WHERE id = $1 RETURNING id",
        [id]
      );
      return result.rowCount > 0;
    },

    // Tareas de un propietario, paginadas. ORDER BY mantiene las páginas estables.
    async findByOwner(userId, { limit = 10, offset = 0 } = {}) {
      const { rows } = await db.query(
        `SELECT id, user_id, title, done FROM tasks
         WHERE user_id = $1
         ORDER BY id
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return rows;
    },
  };
}

module.exports = { createTasksModel };