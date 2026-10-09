/**
 * Ordena ejemplos claros y oscuros con la geometría del component set original.
 * @param {object} props Configuración exclusiva de la galería.
 * @param {string} props.title Nombre de Figma.
 * @param {string[]} props.states Estados en orden de la referencia.
 * @param {number} props.width Ancho de cada componente.
 * @param {Function} props.render Crea ejemplos de la biblioteca con (estado, tema).
 * @returns {import('react').ReactElement} Sección adaptable con ambos temas.
 */
export function GallerySection({ title, states, width, render }) {
  return (
    <section className="gallery-section" aria-label={title}>
      <h2>{title}</h2>
      <p className="gallery-description">
        Fila superior: claro · Fila inferior: oscuro
        <br />
        Estados de izquierda a derecha: {states.join(' / ')}
      </p>
      <div
        className="gallery-grid"
        style={{ '--example-width': `${width}px`, '--columns': states.length }}
      >
        {['light', 'dark'].map((theme) =>
          states.map((state) => (
            <div
              data-theme={theme}
              key={`${theme}-${state}`}
              className="gallery-example"
              data-state={state}
            >
              {render(state, theme)}
            </div>
          )),
        )}
      </div>
    </section>
  );
}
