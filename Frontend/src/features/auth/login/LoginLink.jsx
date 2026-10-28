import { Link } from 'react-router';

/**
 * Enlace de Auth con el color semántico y foco de teclado compartidos.
 * @param {object} props Destino y contenido del enlace.
 * @param {string} props.to Ruta interna disponible.
 * @param {import('react').ReactNode} props.children Nombre visible.
 * @returns {import('react').ReactElement} Enlace con área de interacción de 44 px.
 */
export function LoginLink({ to, children }) {
  return (
    <Link
      to={to}
      className="login-link inline-flex min-h-11 items-center justify-center p-2 text-center text-info
        [font:var(--type-button)] underline-offset-[7px]
        focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {children}
    </Link>
  );
}
