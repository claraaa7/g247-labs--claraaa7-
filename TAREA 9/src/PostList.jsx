import { useEffect, useState } from "react";
import { getPosts } from "./api.js";

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts();
      setPosts(data.slice(0, 10));
    } catch (err) {
      if (err.response) {
        setError(`Error HTTP ${err.response.status}: no se pudieron cargar las publicaciones.`);
      } else {
        setError("Error de conexión: no se pudo contactar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  let content;
  if (loading) {
    content = <p>Cargando publicaciones...</p>;
  } else if (error) {
    content = <p role="alert">{error}</p>;
  } else {
    content = (
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <strong>{post.title}</strong>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {content}
      <button onClick={loadPosts} disabled={loading}>
        Refresh
      </button>
    </div>
  );
}