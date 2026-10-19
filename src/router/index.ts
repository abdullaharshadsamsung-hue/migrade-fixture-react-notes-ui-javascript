import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';

// The migrated application exposes a single notes screen (App.vue), which
// holds the full notes UI and uses NoteItem.vue plus the helpers in notes.js.
// It is registered here as the root route. App.vue has no <RouterView>, so
// this route does not render the screen a second time inside the root
// component mounted by main.ts.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'notes', component: App },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;