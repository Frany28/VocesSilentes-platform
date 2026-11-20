import { Button } from '../../../components/ui/Button.jsx';
import { ManualReference } from '../recognition/ManualReference.jsx';
import { vowelGuides } from './vowel-lesson.js';
import './vowel-practice-blocks.css';

/**
 * Recupera los cinco bloques con las mismas fichas y explicaciones del recorrido guiado original.
 * @param {{onPractice: Function}} props Selección explícita; mostrar las imágenes no abre la cámara.
 * @returns {import('react').ReactElement} Referencias ordenadas A, E, I, O, U con práctica individual.
 */
export function VowelPracticeBlocks({ onPractice }) {
  return (
    <section className="vowel-practice-blocks" aria-label="Práctica por vocal">
      {vowelGuides.map((guide) => (
        <article
          key={guide.letter}
          className="vowel-practice-block"
          aria-labelledby={`practice-vowel-${guide.letter}`}
          data-letter={guide.letter}
        >
          <h3 id={`practice-vowel-${guide.letter}`}>Vocal {guide.letter}</h3>
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
