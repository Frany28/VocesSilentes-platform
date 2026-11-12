import alphabet from '../../../assets/module-previews/alfabeto-dactilologico.webp';
import numbers from '../../../assets/module-previews/numeros-cantidades.webp';
import colors from '../../../assets/module-previews/colores-objetos.webp';
import greetings from '../../../assets/module-previews/saludos-presentacion.webp';

const covers = [
  { source: alphabet, title: 'Abecedario LSV' },
  { source: greetings, title: 'Cortesía y saludos' },
  { source: numbers, title: 'Números' },
  { source: colors, title: 'Colores' },
];

/**
 * Presenta las portadas originales como muestra ilustrativa, sin prometer disponibilidad curricular.
 * @returns {import('react').ReactElement} Bienvenida visual; no consulta datos ni modifica la sesión.
 */
export function LoginVisual() {
  return (
    <>
      <aside className="login-visual" aria-label="Bienvenida">
        <div className="login-visual-heading">
          <h2>Conecta con un mundo nuevo.</h2>
          <p>Cada seña es un puente. Empieza a construir el tuyo.</p>
        </div>
        <div
          className="login-cover-grid"
          aria-label="Vista previa ilustrativa del contenido previsto"
        >
          {covers.map(({ source, title }) => (
            <figure key={title}>
              <img src={source} alt="" width="1448" height="1086" decoding="async" />
              <figcaption>{title}</figcaption>
            </figure>
          ))}
        </div>
        <div className="login-education">
          <h3>Aprende a tu ritmo.</h3>
          <p>Contenido visual, ejercicios y progreso en un solo lugar.</p>
        </div>
      </aside>
      <aside className="login-compact" aria-label="Bienvenida">
        <h2>Más señas, menos barreras.</h2>
        <p>Aprende a tu ritmo. Cada seña abre una conversación.</p>
      </aside>
    </>
  );
}
