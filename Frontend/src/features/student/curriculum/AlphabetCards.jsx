import { Button } from '../../../components/ui/Button.jsx';
import { ManualReference } from '../recognition/ManualReference.jsx';
import { recognitionSupports } from '../recognition/recognition-support.js';
import '../recognition/letter-badge.css';

/**
 * Presenta una o dos letras lado a lado para compararlas, con su referencia y una práctica opcional.
 * No simula señas: sin ilustración autorizada se muestra la letra escrita y el estado pendiente.
 * @param {{cards: object[], onPractice: Function}} props Grupo y entrada explícita a cámara.
 * @returns {import('react').ReactElement} Comparación visual con créditos editoriales.
 */
export function AlphabetCards({ cards, onPractice }) {
  const pair = cards.length > 1;
  return (
    <section className="journey-copy education-card" aria-labelledby="alphabet-cards">
      <p className="journey-eyebrow text-muted">
        {pair ? 'Compara las dos letras' : 'Conoce la letra'}
      </p>
      <h2 id="alphabet-cards">{cards.map((card) => card.letter).join(' · ')}</h2>
      {pair && (
        <p className="text-muted">
          Observa una referencia y luego la otra. Fíjate en qué dedos cambian entre ambas.
        </p>
      )}
      <div className="letter-compare">
        {cards.map((card) => {
          const recognized = recognitionSupports(card.letter);
          return (
            <article
              key={card.letter}
              className="letter-card"
              data-letter={card.letter}
              aria-label={`Letra ${card.letter}`}
            >
              <div className="letter-card-head">
                <span className="letter-glyph" aria-hidden="true">
                  {card.letter}
                </span>
                <span className="letter-badge" data-tone={recognized ? 'ready' : undefined}>
                  {recognized ? 'Reconocimiento experimental' : 'Sin reconocimiento todavía'}
                </span>
              </div>
              <ManualReference letter={card.letter} compact />
              <Button density="compact" icon={null} onClick={() => onPractice(card.letter)}>
                {recognized
                  ? `Practicar ${card.letter} con cámara`
                  : `Practicar ${card.letter} frente a la cámara`}
              </Button>
            </article>
          );
        })}
      </div>
      {[...new Set(cards.map((card) => card.studyHint))].map((hint) => (
        <p key={hint} className="text-muted">
          {hint}
        </p>
      ))}
      {cards.some((card) => card.sourceIllustrationShowsMotionArrow) && (
        <p className="text-muted">
          La fuente incluye una flecha; se necesita una demostración validada antes de reproducir el
          movimiento.
        </p>
      )}
      <details className="journey-references text-muted">
        <summary>Consultar referencias del material</summary>
        {cards.map((card) => (
          <p key={card.letter}>
            {card.letter}: {card.source.file}, página {card.source.pdfPage}. {card.source.credit}.
          </p>
        ))}
      </details>
    </section>
  );
}
