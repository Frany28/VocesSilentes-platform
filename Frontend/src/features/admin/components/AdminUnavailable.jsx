/**
 * Dependencia real de integración; nunca representa ausencia de datos como una lista vacía confirmada.
 * @param {{title: string, children: import('react').ReactNode}} props Capacidad pendiente y explicación.
 * @returns {import('react').ReactElement} Aviso persistente para una acción sin contrato disponible.
 */
export function AdminUnavailable({ title, children }) {
  return (
    <section className="admin-unavailable" role="status">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}
