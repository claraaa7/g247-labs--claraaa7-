/* Lab 10 — Week 12, Session 39. Complete the routes and protection. */
import { Routes, Route, Link, Navigate } from "react-router";
import { useAuth } from "./AuthContext.jsx";
import { Home, Login, UsersList, UserDetail, Settings } from "./pages.jsx";

function Protected({ children }) {
  // TODO: use isLoggedIn. Redirect to /login with replace if false.
  return children;
}

export default function App() {
  // TODO: read isLoggedIn and signOut from useAuth().
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
        <Link to="/settings">Settings</Link>
        {/* TODO: show Entrar when logged out or Salir when logged in. */}
      </nav>
      <Routes>
        {/* TODO: / → Home, /login → Login, /users → UsersList,
            /users/:id → UserDetail (protected in part 2),
            /settings → Settings (protected). */}
      </Routes>
    </>
  );
}
