import { Button } from '../../../components/ui/Button.jsx';
import { ManualReference } from '../recognition/ManualReference.jsx';

/**
 * Presenta hasta dos letras escritas por paso sin simular sus señas; conserva pistas y créditos editoriales.
 * @param {{cards: object[], onPractice: Function}} props Grupo y entrada explícita a cámara.
 * @returns {import('react').ReactElement} Letras protagonistas y referencias consultables.
 */
export function AlphabetCards({ cards, onPractice }) {
  return (
    <section className="journey-copy education-card" aria-labelledby="alphabet-cards">
      <p className="journey-eyebrow text-muted">Tu alfabeto, paso a paso</p>
      <h2 id="alphabet-cards">{cards.map((card) => card.letter).join(' · ')}</h2>
      <div className="journey-letters">
        {cards.map((card) => (
          <article key={card.letter} data-letter={card.letter} aria-label={`Letra ${card.letter}`}>
            <ManualReference letter={card.letter} compact />
            <Button density="compact" icon={null} onClick={() => onPractice(card.letter)}>
              Practicar {card.letter} con cámara
            </Button>
          </article>
        ))}
      </div>
      <p>
        Referencias del manual proporcionado para uso educativo. Los vídeos y la revisión
        lingüística siguen pendientes.
      </p>
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
