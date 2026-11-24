/* Lab 10 — Week 12, Session 39. Individual or pair work. */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // TODO: initialize token from localStorage.getItem("token").
  // TODO: async signIn(email, password) rejects empty fields, stores
  // a simulated token in localStorage and state. No real server call.
  // TODO: signOut removes the token from localStorage and state.
  // TODO: expose { isLoggedIn: Boolean(token), signIn, signOut }.
  const value = null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
