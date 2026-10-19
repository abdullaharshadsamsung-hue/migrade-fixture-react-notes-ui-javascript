<script setup>
import { ref, shallowRef } from 'vue';
import { addNote, initialNotes, removeNote } from './notes.js';
import NoteItem from './NoteItem.vue';

// Notes are replaced wholesale by the pure helpers, so a shallowRef is enough.
const notes = shallowRef(initialNotes);
const title = ref('');

function submit() {
  // `.prevent` on the form handles event.preventDefault().
  notes.value = addNote(notes.value, title.value);
  // Always clear the input, even when addNote ignored a blank title.
  title.value = '';
}

function remove(id) {
  notes.value = removeNote(notes.value, id);
}
</script>

<template>
  <main>
    <h1>Notes</h1>
    <form @submit.prevent="submit">
      <input v-model="title" placeholder="New note" />
      <button type="submit">Add</button>
    </form>
    <ul>
      <NoteItem v-for="note in notes" :key="note.id" :note="note" @delete="remove(note.id)" />
    </ul>
    <p>{{ notes.length }} notes</p>
  </main>
</template>
