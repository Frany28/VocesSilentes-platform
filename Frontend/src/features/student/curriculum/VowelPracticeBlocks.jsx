import { Button } from '../../../components/ui/Button.jsx';
import { ManualReference } from '../recognition/ManualReference.jsx';
import '../recognition/letter-badge.css';

/**
 * Recupera las tarjetas de comparación originales para el grupo de una o dos vocales de este paso.
 * @param {{guides: object[], onPractice: Function}} props Explicaciones y selección explícita de cámara.
 * @returns {import('react').ReactElement} Grupo visible con las fichas y estilos compartidos del abecedario.
 */
export function VowelPracticeBlocks({ guides, onPractice }) {
  return (
    <section className="letter-compare vowel-practice-blocks" aria-label="Práctica por vocal">
      {guides.map((guide) => (
        <article
          key={guide.letter}
          className="letter-card vowel-practice-block"
          aria-labelledby={`practice-vowel-${guide.letter}`}
          data-letter={guide.letter}
        >
          <div className="letter-card-head">
            <h3 id={`practice-vowel-${guide.letter}`}>
              <span className="letter-glyph" aria-hidden="true">
                {guide.letter}
              </span>
              <span className="sr-only">Vocal {guide.letter}</span>
            </h3>
            <span className="letter-badge" data-tone="ready">
              Reconocimiento experimental
            </span>
          </div>
          <ManualReference letter={guide.letter} compact educational />
          <p>{guide.description}</p>
          <p className="text-muted">
            <strong>En qué fijarte: </strong>
            {guide.focus}
          </p>
          <Button icon={null} onClick={() => onPractice(guide.letter)}>
            Practicar {guide.letter} con cámara
          </Button>
        </article>
      ))}
    </section>
  );
}
