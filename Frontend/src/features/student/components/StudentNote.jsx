/**
 * Nota informativa de Figma sin XP, rachas ni insignias.
 * @param {{catalog?: boolean, demo?: boolean}} props Contexto de la nota.
 * @returns {import('react').ReactElement} Mensaje educativo estático.
 */
export function StudentNote({ catalog = false, demo = false }) {
  return (
    <section className={`flex flex-col gap-2 rounded-3xl bg-secondary ${catalog ? 'p-6' : 'p-4'}`}>
      <h2 className="[font:var(--type-subtitle)]">
        {catalog
          ? 'Un paso claro. Una nueva conversación.'
          : 'Aprende mirando. Conecta practicando.'}
      </h2>
      <p className="text-muted">
        {catalog
          ? demo
            ? 'Este catálogo muestra estados de Figma. Los bloqueos son ejemplos de diseño.'
            : 'Puedes volver a repasar cuando quieras.'
          : 'Videos, ejemplos visuales y ejercicios a tu ritmo.'}
      </p>
    </section>
  );
}
