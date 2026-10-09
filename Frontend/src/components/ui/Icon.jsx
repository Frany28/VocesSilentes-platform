/**
 * Presenta el SVG original a su tamaño nativo; hereda el recurso del tema más cercano.
 * @param {{name: string, tone?: string, size?: 16|20|24, className?: string}} props Icono decorativo.
 * @returns {import('react').ReactElement} Recurso local sin redibujar ni recolorear el SVG.
 */
export function Icon({ name, tone = 'default', size = 24, className = '' }) {
  const asset = size === 20 ? `--icon-${name}-${tone}` : `--icon-${name}-${size}`;
  return (
    <span
      aria-hidden="true"
      className={`vs-icon ${className}`}
      style={{ backgroundImage: `var(${asset})`, width: size, height: size }}
    />
  );
}
