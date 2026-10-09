// Entrada HTML independiente; Vite solo construye index.html en producción.
if (import.meta.env.DEV) {
  await import('./mount-gallery.jsx');
}
