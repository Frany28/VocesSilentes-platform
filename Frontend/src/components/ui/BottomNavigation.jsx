import { Link } from 'react-router';
import { NavigationItem } from './NavigationItem.jsx';

/**
 * @typedef {object} BottomNavigationEntry
 * @property {string} to Ruta interna del destino.
 * @property {string} label Etiqueta visible y nombre accesible.
 * @property {string} [title] Descripción ampliada para el tooltip.
 * @property {import('react').ReactNode} icon Icono decorativo del destino.
 * @property {boolean} active Indica la página actual.
 */

/**
 * Barra inferior móvil compartida por Admin y Estudiante. En pantallas de menos de 600 px queda fija
 * al pie y reserva su alto con un espaciador, para no tapar el final del contenido.
 * No consulta datos ni permisos: el consumidor decide destinos y estado activo.
 * @param {{label: string, items: BottomNavigationEntry[]}} props Nombre del landmark y destinos.
 * @returns {import('react').ReactElement} Espaciador y navegación fija.
 */
export function BottomNavigation({ label, items }) {
  return (
    <>
      <div className="vs-bottom-nav-space" aria-hidden="true" />
      <nav aria-label={label} className="vs-bottom-nav">
        {items.map((item) => (
          <NavigationItem
            key={item.to}
            as={Link}
            to={item.to}
            active={item.active}
            aria-label={item.label}
            title={item.title ?? item.label}
            className="vs-bottom-nav-item"
            icon={item.icon}
          >
            {item.label}
          </NavigationItem>
        ))}
      </nav>
    </>
  );
}
