import { useEffect, useState } from "react";
import { getUsers } from "./api.js";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      if (err.response) {
        setError(`Error HTTP ${err.response.status}: no se pudieron cargar los usuarios.`);
      } else {
        setError("Error de conexión: no se pudo contactar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  let content;
  if (loading) {
    content = <p>Cargando usuarios...</p>;
  } else if (error) {
    content = <p role="alert">{error}</p>;
  } else {
    content = (
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {content}
      <button onClick={loadUsers} disabled={loading}>
        Refresh
      </button>
    </div>
  );
}
