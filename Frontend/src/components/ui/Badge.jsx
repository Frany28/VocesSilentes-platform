/**
 * Etiqueta semántica; el texto transmite el estado además del color.
 * @param {object} props Atributos de span, ref y contenido.
 * @param {'info'|'success'|'warning'|'error'} [props.tone] Variante justificada por Figma.
 * @param {import('react').ReactNode} [props.children] Texto que describe el estado.
 * @param {string} [props.className] Clases del contenedor.
 * @returns {import('react').ReactElement} Badge adaptable.
 */
export function Badge({ tone = 'info', children, className = '', ...attributes }) {
  return (
    <span
      {...attributes}
      className={`vs-ui vs-badge inline-flex max-w-full items-center gap-2 ${className}`}
      data-tone={tone}
    >
      <span className="vs-badge-dot" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}
