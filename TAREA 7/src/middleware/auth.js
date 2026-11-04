/*
  Starter — src/middleware/auth.js
  Session 27 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 8 · Session 27 · Practice (AF2) · Pair work

  Paste this file into src/middleware/auth.js.

  This is AUTHENTICATION: prove WHO the caller is. It runs in front of the
  protected routes (app.use("/tasks", auth, tasksRouter)), verifies the JWT,
  and attaches the decoded payload to req.user. It does NOT decide what the
  caller is allowed to do — that is AUTHORIZATION, and it lives in the
  controllers (the ownership 403 check). auth != authorization.

  Do NOT rename `auth` and do NOT change its (req, res, next) signature.

  JWT_SECRET comes from the environment. Set it before starting the app;
  src/server.js checks that it is present. Never commit a real secret.
*/

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
    // 1. Leer la cabecera (cadena vacía si no existe)
  const header = req.headers.authorization || "";

  // 2. Extraer el token solo si empieza por "Bearer "
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  // 3. Sin token -> 401
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  // 4. Verificar el JWT
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { auth };
