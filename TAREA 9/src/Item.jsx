export default function Item({ item }) {
  return (
    <li>
      <strong>{item.title}</strong> — {item.prepMinutes} min ({item.category})
    </li>
  );
}