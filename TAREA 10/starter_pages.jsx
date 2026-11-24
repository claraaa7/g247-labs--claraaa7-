/*
  Starter file for Session 39 Lab — Part 1 (Guided Routing + State)
  Web Application Programming (G247) · CUNEF Escuela Politécnica Superior

  Week 12 · Session 39 · Practice (AF2) · Individual or pair work

  Do NOT rename the page components — starter_App.jsx imports them by
  name. In a real project each would live in its own file under
  src/pages/; they are bundled here so the scaffold stays readable.
*/

import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useAuth } from "./AuthContext.jsx";

// ---------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------
export function Home() {
  return (
    <section>
      <h1>Home</h1>
      <p>Click the nav links above to explore the app.</p>
    </section>
  );
}

// ---------------------------------------------------------------------
// Login — simulated sign-in with email and password.
export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    // TODO: clear error, await signIn(email, password), navigate on success
    // and display the error in catch.
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Login</h1>
      <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <button type="submit">Entrar</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

// ---------------------------------------------------------------------
// UsersList — Part 1: lifted filter state, filtered <ul>.
// ---------------------------------------------------------------------
const USERS = [
  { id: 1, name: "Ada Lovelace" },
  { id: 2, name: "Alan Turing" },
  { id: 3, name: "Grace Hopper" },
  { id: 4, name: "Edsger Dijkstra" },
  { id: 5, name: "Barbara Liskov" },
];

export function UsersList() {
  // TODO: lift the filter state HERE (in UsersList).
  // const [q, setQ] = useState("");
  // const filtered = USERS.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <section>
      <h1>Users</h1>
      {/* TODO: <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" /> */}
      <ul>
        {/* TODO: render filtered.map((u) => (
              <li key={u.id}>
                <Link to={`/users/${u.id}`}>{u.name}</Link>
              </li>
            )) */}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------
// UserDetail
//   Part 1: display the :id from useParams().
//   Part 2: request /users/${id} with Axios
//           with the Session 34 three-state pattern, deps = [id].
// ---------------------------------------------------------------------
export function UserDetail() {
  const { id } = useParams();

  // TODO (Part 1): render <h1>User {id}</h1>. Nothing else needed yet.

  // TODO (Part 2): add the three-state pattern from Session 34.
  //   const [user, setUser] = useState(null);
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState(null);
  //   useEffect(() => { /* request the user with Axios */ }, [id]);
  //   ...render one of loading / error / <h1>{user.name}</h1>.

  return <h1>User {id}</h1>;
}

// ---------------------------------------------------------------------
// Settings — shows who's logged in and offers a Logout.
// ---------------------------------------------------------------------
export function Settings() {
  const { isLoggedIn } = useAuth();
  return <section><h1>Settings</h1><p>{isLoggedIn ? "Session active" : "No session"}</p></section>;
}
