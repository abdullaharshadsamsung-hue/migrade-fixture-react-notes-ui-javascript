export const initialNotes = [
  { id: 1, title: "Buy milk", body: "Two litres" },
  { id: 2, title: "Call Sam", body: "About the trip" },
];

export function addNote(notes, title) {
  const trimmed = title.trim();
  if (!trimmed) return notes;
  const id = Math.max(0, ...notes.map((n) => n.id)) + 1;
  return [...notes, { id, title: trimmed, body: "" }];
}

export function removeNote(notes, id) {
  return notes.filter((n) => n.id !== id);
}
