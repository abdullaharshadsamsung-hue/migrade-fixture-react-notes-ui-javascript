<script setup>
// Presentational list item for a single note.
// The source's `onDelete` callback prop is expressed as a `delete` emit;
// parents should listen with `@delete="..."`.
defineProps({
  note: { type: Object, required: true },
});

const emit = defineEmits(['delete']);
</script>

<template>
  <!-- Kept on one line on purpose so the whitespace matches the JSX output exactly:
       title, one space, optional body span, then the button with no space before it. -->
  <li><strong>{{ note.title }}</strong> <span v-if="note.body">— {{ note.body }}</span><button @click="emit('delete')">Delete</button></li>
</template>
