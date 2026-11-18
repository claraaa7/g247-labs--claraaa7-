/* Lab 9 — guided practice. Week 11, Session 36. Individual or pair work. */
import { useEffect, useState } from "react";
import { getUsers } from "./api.js";

export default function UserList() {
  // TODO: create users ([]), loading (true), and error (null) state.

  async function loadUsers() {
    // TODO: enable loading, clear the error, call await getUsers(),
    // and save the users. Handle errors in catch and finish in finally.
  }

  useEffect(() => {
    // TODO: call loadUsers() once when the component mounts.
  }, []);

  // TODO: show loading, error, or the list of users.
  // Keep Refresh available after success and error; disable it while loading.
  return null;
}
