/**
 * Usa las tres piezas SVG originales sin cambiar paths ni dimensiones raíz.
 * @returns {import('react').ReactElement} Ilustración decorativa de saludo.
 */
export function ModuleIllustration() {
  return (
    <div className="student-module-art relative h-28 w-full" aria-hidden="true">
      <span className="student-circle-large" />
      <span className="student-circle-small" />
      <span className="student-hand" />
    </div>
  );
}
