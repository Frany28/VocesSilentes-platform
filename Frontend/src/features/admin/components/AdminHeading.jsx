/**
 * Introducción común de las siete pantallas administrativas, según la composición de Figma.
 * @param {{title: string, children: import('react').ReactNode}} props Título y descripción.
 * @returns {import('react').ReactElement} Encabezado semántico.
 */
export function AdminHeading({ title, children }) {
  return (
    <header className="admin-heading">
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  );
}
