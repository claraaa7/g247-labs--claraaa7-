import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function getUsers() {
  const response = await api.get("/users");
  return response.data;
}

export async function getPosts() {
  const response = await api.get("/posts");
  return response.data;
}