/**
 * Información en columnas que pasa a una columna en móvil, sin valores inventados.
 * @param {{items: Array<Array<string>>, tone?: string}} props Pares etiqueta/valor.
 * @returns {import('react').ReactElement} Lista de definición del diseño.
 */
export function AdminFacts({ items, tone = 'neutral' }) {
  return (
    <dl className="admin-facts" data-tone={tone}>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
