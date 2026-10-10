/**
 * Cabecera Practice/Brief inspeccionada en Figma, con el gradiente y tipografía existentes.
 * @returns {import('react').ReactElement} Introducción de práctica guiada.
 */
export function PracticeBrief() {
  return (
    <section className="student-hero practice-brief flex flex-col gap-4 rounded-3xl p-6">
      <p className="text-muted [font:var(--type-label)]">TU ESPACIO PARA PRACTICAR</p>
      <h2 className="text-[30px]/[38px] font-bold">Una seña. Un nuevo puente.</h2>
      <p className="text-muted">
        Practica las señas de tu módulo y recibe una orientación clara en cada intento.
      </p>
    </section>
  );
}
