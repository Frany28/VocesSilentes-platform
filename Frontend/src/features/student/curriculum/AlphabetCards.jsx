import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Muestra las tarjetas de estudio entregadas por la API sin copiar ni simular ilustraciones de señas.
 * @param {{cards: object[]}} props Letras, referencias editoriales y materiales pendientes.
 * @returns {import('react').ReactElement | null} Tarjetas accesibles de letras escritas, sin recursos no aprobados.
 */
export function AlphabetCards({ cards }) {
  if (!cards.length) return null;
  return (
    <section className="flex flex-col gap-4" aria-labelledby="alphabet-cards">
      <h2 id="alphabet-cards" className="[font:var(--type-h3)]">
        Tarjetas de letras
      </h2>
      <div className="alphabet-card-grid">
        {cards.map((card) => (
          <article key={card.letter} className="education-card" aria-label={`Letra ${card.letter}`}>
            <h3 className="text-3xl font-bold">{card.letter}</h3>
            <div className="alphabet-image-placeholder flex flex-col items-center justify-center gap-3 rounded-control bg-neutral p-4">
              <Icon name="student-book" size={32} />
              <p>Imagen original o autorizada pendiente</p>
            </div>
            <p className="text-muted">Video pendiente de validación LSV.</p>
            <p>{card.studyHint}</p>
            {card.sourceIllustrationShowsMotionArrow && (
              <p className="text-warning">
                La fuente incluye una flecha; se necesita una demostración validada.
              </p>
            )}
            <p className="text-muted [font:var(--type-label)]">
              Referencia editorial: {card.source.file}, página {card.source.pdfPage}.{' '}
              {card.source.credit}.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
