/*
  Starter — src/controllers/authController.js
  Session 27 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 8 · Session 27 · Practice (AF2) · Pair work

  Paste this file into src/controllers/authController.js.

  Two handlers: register (sign-up) and login. Factory takes the usersModel so
  it is easy to test. Do NOT rename createAuthController, register, or login.

  bcryptjs provides the bcrypt hash/compare API without a native compiler.
  Reject passwords longer than 72 UTF-8 bytes to avoid silent truncation.
*/

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function createAuthController({ usersModel }) {
  return {
        async register(req, res, next) {
      try {
        const { email, password } = req.body ?? {};

        // 1. Validación básica -> 400
        if (
          typeof email !== "string" ||
          email.trim() === "" ||
          typeof password !== "string" ||
          password.length < 8 ||
          Buffer.byteLength(password, "utf8") > 72
        ) {
          return res.status(400).json({
            error: "email is required and password must be 8 to 72 bytes",
          });
        }

        // 2. Correo duplicado -> 409
        const existing = await usersModel.findByEmail(email);
        if (existing) {
          return res.status(409).json({ error: "Email already registered" });
        }

        // 3. Hash con bcrypt, coste 10
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Guardar y responder 201 SOLO con id y email
        const created = await usersModel.create({ email, passwordHash });
        return res.status(201).json({ id: created.id, email: created.email });
      } catch (err) {
        return next(err);
      }
    },

        async login(req, res, next) {
      try {
        const { email, password } = req.body ?? {};

        // Entrada inválida: mismo 401 que unas credenciales erróneas, para no
        // revelar qué correos existen. Una contraseña de más de 72 bytes nunca
        // puede coincidir con un hash guardado.
        if (
          typeof email !== "string" ||
          typeof password !== "string" ||
          Buffer.byteLength(password, "utf8") > 72
        ) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // 1. Buscar al usuario
        const user = await usersModel.findByEmail(email);
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // 2. Comparar con bcrypt (nunca con ===)
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // 3. Firmar el token: { sub, role }, caduca en 1 hora
        const token = jwt.sign(
          { sub: user.id, role: user.role },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res.status(200).json({ token });
      } catch (err) {
        return next(err);
      }
    },
  };
}

module.exports = { createAuthController };