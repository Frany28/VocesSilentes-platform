import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';
import { VowelPracticeBlocks } from './VowelPracticeBlocks.jsx';
import { vowelGuides } from './vowel-lesson.js';

/**
 * Conserva la actividad personal y recupera una referencia y una práctica explícita por vocal.
 * @param {{step: object, onContinue?: Function}} props Texto y siguiente paso opcional.
 * @returns {import('react').ReactElement} Lectura breve o práctica local, sin evaluación académica inventada.
 */
export function PersonalPractice({ step, onContinue }) {
  const [letter, setLetter] = useState(null);
  const title = useRef(null);
  useEffect(() => {
    title.current?.focus();
  }, [letter]);
  const guide = vowelGuides.find((item) => item.letter === letter);
  if (guide)
    return (
      <div className="education-card flex flex-col gap-4">
        <Button variant="secondary" icon={null} onClick={() => setLetter(null)}>
          Volver a los bloques de vocales
        </Button>
        <h2 ref={title} tabIndex={-1} className="[font:var(--type-h3)]">
          Practica la vocal {letter}
        </h2>
        <p>{guide.description}</p>
        <p className="text-muted">{guide.focus}</p>
        <CameraPracticeLoader
          key={letter}
          letter={letter}
          onContinue={() => {
            const next = vowelGuides[vowelGuides.indexOf(guide) + 1];
            if (next) setLetter(next.letter);
            else {
              setLetter(null);
              onContinue?.();
            }
          }}
        />
      </div>
    );
  return (
    <article className="education-card journey-copy">
      <h2 ref={title} tabIndex={-1}>
        {step.title}
      </h2>
      <p className="journey-reading">{step.body}</p>
      <p className="text-muted">
        Observa cada vocal y lee en qué fijarte antes de practicarla. Puedes elegir un bloque o
        seguir el orden A, E, I, O y U.
      </p>
      <VowelPracticeBlocks onPractice={setLetter} />
    </article>
  );
}
