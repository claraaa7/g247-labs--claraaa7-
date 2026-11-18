import { useState } from "react";
import List from "./List.jsx";

export default function App() {
  const items = [
    { id: 1, title: "Croquetas de jamón", prepMinutes: 45, category: "tapas" },
    { id: 2, title: "Patatas bravas", prepMinutes: 30, category: "tapas" },
    { id: 3, title: "Potaje de garbanzos y espinacas", prepMinutes: 70, category: "cuchara" },
    { id: 4, title: "Cocido madrileño", prepMinutes: 170, category: "cuchara" },
    { id: 5, title: "Gazpacho andaluz", prepMinutes: 15, category: "frios" },
  ];

  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Recetas Caseras</h1>
      <List items={items} />
      <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
    </main>
  );
}