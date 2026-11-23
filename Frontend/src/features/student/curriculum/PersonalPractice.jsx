import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';
import { VowelPracticeBlocks } from './VowelPracticeBlocks.jsx';
import { alphabetLessonIds } from '../resources/lesson-videos.js';
import { vowelGuides } from './vowel-lesson.js';

/**
 * Conserva la actividad personal y recupera una referencia y una práctica explícita por vocal.
 * @param {{step: object, lessonId?: string, onContinue?: Function}} props Texto y siguiente paso opcional.
 * @returns {import('react').ReactElement} Lectura breve o práctica local, sin evaluación académica inventada.
 */
export function PersonalPractice({ step, lessonId, onContinue }) {
  const guides = step.vowels
    ? vowelGuides.filter((guide) => step.vowels.includes(guide.letter))
    : lessonId === alphabetLessonIds['m1-l01']
      ? vowelGuides
      : [];
  const [letter, setLetter] = useState(null);
  const title = useRef(null);
  useEffect(() => {
    title.current?.focus();
  }, [letter]);
  const guide = guides.find((item) => item.letter === letter);
  if (!guides.length)
    return (
      <article className="education-card journey-copy">
        <h2>{step.title}</h2>
        <p className="journey-reading">{step.body}</p>
      </article>
    );
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
            const next = guides[guides.indexOf(guide) + 1];
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
        {guides.map((item) => item.letter).join(' · ')}
      </h2>
      <p className="journey-reading">{step.body}</p>
      <p className="text-muted">
        Compara las referencias y fíjate en qué dedos cambian antes de practicar.
      </p>
      <VowelPracticeBlocks guides={guides} onPractice={setLetter} />
    </article>
  );
}
