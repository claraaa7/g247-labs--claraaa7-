process.env.JWT_SECRET = "secreto-solo-para-tests";
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { buildApp } = require("../src/app");

// These first tests do not need PostgreSQL. Extend this suite with a fake
// query(text, params) dependency to test register/login and task ownership.

function createFakeDb() {
  const users = [];
  const tasks = [];
  let userSeq = 1;
  let taskSeq = 1;

  return {
    users,
    tasks,
    async query(text, params = []) {
      const sql = text.replace(/\s+/g, " ").trim();

      if (sql.startsWith("SELECT id, email, password_hash, role FROM users")) {
        const u = users.find((x) => x.email === params[0]);
        return { rows: u ? [u] : [] };
      }
      if (sql.startsWith("INSERT INTO users")) {
        const u = { id: userSeq++, email: params[0], password_hash: params[1], role: params[2] };
        users.push(u);
        return { rows: [{ id: u.id, email: u.email, role: u.role }] };
      }
            if (sql.startsWith("INSERT INTO tasks")) {
        const t = { id: taskSeq++, user_id: Number(params[0]), title: params[1], done: params[2] };
        tasks.push(t);
        return { rows: [t] };
      }
      if (sql.startsWith("SELECT id, user_id, title, done FROM tasks WHERE id")) {
        const t = tasks.find((x) => x.id === params[0]);
        return { rows: t ? [t] : [] };
      }
      if (sql.startsWith("SELECT id, user_id, title, done FROM tasks WHERE user_id")) {
        const [uid, limit, offset] = params;
        const rows = tasks
          .filter((t) => t.user_id === Number(uid))
          .slice(offset, offset + limit);
        return { rows };
      }

      throw new Error(`Consulta no prevista en la BD falsa: ${sql}`);
    },
  };
}

const db = {
  async query() {
    throw new Error("Unexpected database access in an infrastructure test");
  },
};

test("health route is available", async () => {
  const response = await request(buildApp(db)).get("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("task routes require a token", async () => {
  const response = await request(buildApp(db)).get("/tasks").timeout(1000);
  assert.equal(response.status, 401);
});

test("register returns 201 { id, email } and stores only a bcrypt hash", async () => {
  const fakeDb = createFakeDb();
  const api = request(buildApp(fakeDb));

  const res = await api
    .post("/auth/register")
    .send({ email: "ana@example.com", password: "password123" });

  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, email: "ana@example.com" });

  // La contraseña guardada es un hash bcrypt de coste 10, no el texto original
  assert.match(fakeDb.users[0].password_hash, /^\$2[aby]\$10\$/);
  assert.notEqual(fakeDb.users[0].password_hash, "password123");
});

test("register with a duplicate email returns 409", async () => {
  const api = request(buildApp(createFakeDb()));

  await api.post("/auth/register").send({ email: "ana@example.com", password: "password123" });
  const res = await api
    .post("/auth/register")
    .send({ email: "ana@example.com", password: "password123" });

  assert.equal(res.status, 409);
});

test("register rejects passwords shorter than 8 or longer than 72 bytes", async () => {
  const api = request(buildApp(createFakeDb()));

  const short = await api
    .post("/auth/register")
    .send({ email: "ana@example.com", password: "corta" });
  assert.equal(short.status, 400);

  const long = await api
    .post("/auth/register")
    .send({ email: "ana@example.com", password: "a".repeat(73) });
  assert.equal(long.status, 400);

  // 37 caracteres "é" = 37 letras pero 74 bytes en UTF-8: también se rechaza
  const multibyte = await api
    .post("/auth/register")
    .send({ email: "ana@example.com", password: "é".repeat(37) });
  assert.equal(multibyte.status, 400);

  // El límite exacto, 72 bytes, sí es válido
  const edge = await api
    .post("/auth/register")
    .send({ email: "bea@example.com", password: "a".repeat(72) });
  assert.equal(edge.status, 201);
});

// Registra un usuario y hace login; devuelve su id y su token.
async function registerAndLogin(api, email, password = "password123") {
  const reg = await api.post("/auth/register").send({ email, password });
  const login = await api.post("/auth/login").send({ email, password });
  return { id: reg.body.id, token: login.body.token };
}

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

test("login returns 200 with a token", async () => {
  const api = request(buildApp(createFakeDb()));
  await api.post("/auth/register").send({ email: "ana@example.com", password: "password123" });

  const res = await api
    .post("/auth/login")
    .send({ email: "ana@example.com", password: "password123" });

  assert.equal(res.status, 200);
  assert.equal(typeof res.body.token, "string");
});

test("login with wrong password or unknown email returns 401", async () => {
  const api = request(buildApp(createFakeDb()));
  await api.post("/auth/register").send({ email: "ana@example.com", password: "password123" });

  const wrongPassword = await api
    .post("/auth/login")
    .send({ email: "ana@example.com", password: "otra-clave-1" });
  assert.equal(wrongPassword.status, 401);

  const unknownEmail = await api
    .post("/auth/login")
    .send({ email: "nadie@example.com", password: "password123" });
  assert.equal(unknownEmail.status, 401);
});

test("POST /tasks without title returns 400", async () => {
  const fakeDb = createFakeDb();
  const api = request(buildApp(fakeDb));
  const { token } = await registerAndLogin(api, "ana@example.com");

  const res = await api.post("/tasks").set(bearer(token)).send({ done: true });

  assert.equal(res.status, 400);
  // La petición se cortó antes de llegar al modelo: no se guardó nada
  assert.equal(fakeDb.tasks.length, 0);
});

test("accessing another user's task returns 403", async () => {
  const api = request(buildApp(createFakeDb()));
  const ana = await registerAndLogin(api, "ana@example.com");
  const bea = await registerAndLogin(api, "bea@example.com");

  const created = await api
    .post("/tasks")
    .set(bearer(ana.token))
    .send({ title: "tarea de ana" });
  assert.equal(created.status, 201);
  const id = created.body.id;

  // Bea tiene un token válido, pero la tarea no es suya: 403, no 401
  assert.equal((await api.get(`/tasks/${id}`).set(bearer(bea.token))).status, 403);
  assert.equal(
    (await api.put(`/tasks/${id}`).set(bearer(bea.token)).send({ title: "hack" })).status,
    403
  );
  assert.equal((await api.delete(`/tasks/${id}`).set(bearer(bea.token))).status, 403);

  // Ana, la propietaria, sí puede verla
  assert.equal((await api.get(`/tasks/${id}`).set(bearer(ana.token))).status, 200);
});

test("pagination: limit=999 becomes 100, page=0 becomes 1, and the shape is { page, limit, items }", async () => {
  const api = request(buildApp(createFakeDb()));
  const { token } = await registerAndLogin(api, "ana@example.com");

  // Sin parámetros: valores por defecto 1 y 20
  const def = await api.get("/tasks").set(bearer(token));
  assert.equal(def.status, 200);
  assert.deepEqual(def.body, { page: 1, limit: 20, items: [] });

  // limit=999 se limita a 100 y page=0 se corrige a 1
  const clamped = await api.get("/tasks?page=0&limit=999").set(bearer(token));
  assert.equal(clamped.status, 200);
  assert.equal(clamped.body.page, 1);
  assert.equal(clamped.body.limit, 100);
});

test("pagination returns the right slice and only the caller's own tasks", async () => {
  const api = request(buildApp(createFakeDb()));
  const ana = await registerAndLogin(api, "ana@example.com");
  const bea = await registerAndLogin(api, "bea@example.com");

  for (let i = 1; i <= 5; i++) {
    await api.post("/tasks").set(bearer(ana.token)).send({ title: `ana ${i}` });
  }
  await api.post("/tasks").set(bearer(bea.token)).send({ title: "bea 1" });

  // Página 2 con 2 por página: tareas 3 y 4 de Ana
  const res = await api.get("/tasks?page=2&limit=2").set(bearer(ana.token));
  assert.deepEqual(res.body.items.map((t) => t.title), ["ana 3", "ana 4"]);
  assert.ok(res.body.items.every((t) => t.userId === ana.id));
});