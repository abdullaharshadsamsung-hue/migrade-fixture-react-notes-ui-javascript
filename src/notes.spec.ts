import { describe, it, expect } from "vitest";
// @ts-ignore -- untyped JS module without a declaration file
import * as notesModule from "./notes.js";

type Note = { id: number; title: string; body: string };

const initialNotes: Note[] = (notesModule as any).initialNotes;
const addNote: (notes: Note[], title: string) => Note[] = (notesModule as any).addNote;
const removeNote: (notes: Note[], id: unknown) => Note[] = (notesModule as any).removeNote;

const SEED_SNAPSHOT = JSON.parse(JSON.stringify(initialNotes));

describe("initialNotes", () => {
  it("exports the seed data", () => {
    expect(initialNotes).toEqual([
      { id: 1, title: "Buy milk", body: "Two litres" },
      { id: 2, title: "Call Sam", body: "About the trip" },
    ]);
  });

  it("contains exactly two notes with ids 1 and 2", () => {
    expect(initialNotes).toHaveLength(2);
    expect(initialNotes.map((n: Note) => n.id)).toEqual([1, 2]);
  });

  it("notes have the expected shape", () => {
    for (const n of initialNotes) {
      expect(typeof n.id).toBe("number");
      expect(typeof n.title).toBe("string");
      expect(typeof n.body).toBe("string");
    }
  });
});

describe("addNote", () => {
  it("appends a note with id max+1, trimmed title and empty body", () => {
    const result = addNote(initialNotes, "Pay rent");
    expect(result[result.length - 1]).toEqual({ id: 3, title: "Pay rent", body: "" });
  });

  it("returns the same reference for whitespace-only title", () => {
    expect(addNote(initialNotes, "  ")).toBe(initialNotes);
  });

  it("returns the same reference for empty title", () => {
    expect(addNote(initialNotes, "")).toBe(initialNotes);
  });

  it("trims leading/trailing whitespace from title", () => {
    const result = addNote(initialNotes, "  Pay rent  ");
    expect(result[result.length - 1].title).toBe("Pay rent");
  });

  it("uses id 1 for an empty array", () => {
    const result = addNote([], "First");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 1, title: "First", body: "" });
  });

  it("uses max+1 for non-contiguous ids", () => {
    const notes: Note[] = [
      { id: 5, title: "a", body: "" },
      { id: 2, title: "b", body: "" },
    ];
    const result = addNote(notes, "c");
    expect(result[result.length - 1].id).toBe(6);
  });

  it("does not mutate the input and preserves order and length", () => {
    const notes: Note[] = [
      { id: 5, title: "a", body: "x" },
      { id: 2, title: "b", body: "y" },
    ];
    const snapshot = JSON.parse(JSON.stringify(notes));
    const result = addNote(notes, "c");
    expect(result).not.toBe(notes);
    expect(notes).toEqual(snapshot);
    expect(result).toHaveLength(notes.length + 1);
    expect(result.slice(0, notes.length)).toEqual(notes);
    expect(result[0]).toBe(notes[0]);
    expect(result[1]).toBe(notes[1]);
    for (const n of notes) {
      expect(result[result.length - 1].id).toBeGreaterThan(n.id);
    }
  });

  it("leaves seed data unchanged", () => {
    addNote(initialNotes, "Pay rent");
    addNote(initialNotes, "   ");
    expect(initialNotes).toEqual(SEED_SNAPSHOT);
  });
});

describe("removeNote", () => {
  it("removes the note with the given id", () => {
    expect(removeNote(initialNotes, 1).map((n: Note) => n.id)).toEqual([2]);
  });

  it("returns a new array with same contents when id not present", () => {
    const result = removeNote(initialNotes, 99);
    expect(result).not.toBe(initialNotes);
    expect(result).toEqual(initialNotes);
  });

  it("uses strict comparison (string id removes nothing)", () => {
    const result = removeNote(initialNotes, "1");
    expect(result.map((n: Note) => n.id)).toEqual([1, 2]);
  });

  it("removes every matching note and preserves order", () => {
    const notes: Note[] = [
      { id: 1, title: "a", body: "" },
      { id: 2, title: "b", body: "" },
      { id: 1, title: "c", body: "" },
      { id: 3, title: "d", body: "" },
    ];
    const snapshot = JSON.parse(JSON.stringify(notes));
    const result = removeNote(notes, 1);
    expect(result.map((n: Note) => n.title)).toEqual(["b", "d"]);
    expect(notes).toEqual(snapshot);
  });

  it("leaves seed data unchanged", () => {
    removeNote(initialNotes, 1);
    expect(initialNotes).toEqual(SEED_SNAPSHOT);
  });
});