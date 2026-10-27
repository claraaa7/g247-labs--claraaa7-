-- queries.sql — Laboratorio 6: SQL y la capa models/
-- Ejecutar después de schema.sql, por ejemplo en psql:  \i queries.sql

-- (a) ¿Cuántas tareas tiene cada usuario?
-- LEFT JOIN para que un usuario sin tareas aparezca con 0.
-- COUNT(t.id) cuenta solo filas con tarea (COUNT(*) contaría 1 si no tiene).
-- Esperado: ana 4, ben 2, cleo 1.
SELECT u.id,
       u.email,
       COUNT(t.id) AS total_tasks
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id, u.email
ORDER BY total_tasks DESC, u.id;

-- (b) ¿Quién tiene más tareas ABIERTAS (done = FALSE)?
-- WHERE filtra antes de agrupar, así solo se cuentan las abiertas.
-- LIMIT 1 se queda con la primera fila; u.id desempata de forma estable.
-- Esperado: ana, con 3 tareas abiertas.
SELECT u.id,
       u.email,
       COUNT(t.id) AS open_tasks
FROM users u
JOIN tasks t ON t.user_id = u.id
WHERE t.done = FALSE
GROUP BY u.id, u.email
ORDER BY open_tasks DESC, u.id
LIMIT 1;

-- (c) Las cinco tareas más recientes, con el correo del propietario.
-- tasks no tiene created_at, así que t.id (creciente) hace de proxy.
-- Esperado: ids 7, 6, 5, 4, 3.
SELECT t.id,
       t.title,
       t.done,
       u.email AS owner_email
FROM tasks t
JOIN users u ON u.id = t.user_id
ORDER BY t.id DESC
LIMIT 5;

-- (d) Lista paginada de tareas, 10 por página.
-- La misma consulta dos veces, cambiando solo OFFSET.
-- ORDER BY es imprescindible: sin orden, LIMIT/OFFSET no garantiza qué filas
-- caen en cada página.

-- OFFSET 0: empieza en la primera fila. Esperado: ids 1..7.
SELECT t.id, t.user_id, t.title, t.done
FROM tasks t
ORDER BY t.id
LIMIT 10 OFFSET 0;

-- OFFSET 2: salta las dos primeras. Esperado: ids 3..7 (filas distintas).
SELECT t.id, t.user_id, t.title, t.done
FROM tasks t
ORDER BY t.id
LIMIT 10 OFFSET 2;