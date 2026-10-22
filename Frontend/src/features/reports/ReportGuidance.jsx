/**
 * Orientación original de Figma, independiente del envío y de la evidencia seleccionada.
 * @returns {import('react').ReactElement} Tres consejos de redacción.
 */
export function ReportGuidance() {
  return (
    <aside className="report-guidance">
      <h2>Un buen reporte nos acerca a la solución.</h2>
      <ol>
        {[
          'Indica dónde apareció el problema.',
          'Cuenta qué esperabas que ocurriera.',
          'Explica lo que sucedió en su lugar.',
        ].map((tip, index) => (
          <li key={tip}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {tip}
          </li>
        ))}
      </ol>
    </aside>
  );
}
