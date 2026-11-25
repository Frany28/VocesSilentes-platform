import { useEffect } from 'react';
import { ManualReference } from '../recognition/ManualReference.jsx';
import { LazyVowelMicroclass } from '../microclass/LazyVowelMicroclass.jsx';
import { vowelGuides, vowelLetters } from './vowel-lesson.js';
import { VowelDemonstration } from './VowelDemonstration.jsx';
import { LessonIntroduction } from './LessonExperience.jsx';

/**
 * @param {{objectives: string[]}} props Objetivos publicados de la lección.
 * @returns {import('react').ReactElement} Bienvenida y vista previa del recorrido.
 */
export function VowelIntroduction({ objectives }) {
  return (
    <LessonIntroduction
      id="vowel-welcome-title"
      eyebrow="TU RECORRIDO GUIADO"
      title="Aprendamos las cinco vocales"
      description="Observa, compara, recuerda y practica A, E, I, O y U en el alfabeto manual de la Lengua de Señas Venezolana."
      objectives={objectives}
      route={['Microclase', 'Cinco vocales', 'Tres actividades', 'Cámara', 'Repaso']}
      variant="vowel"
      lead={
        <div className="vowel-letter-row" aria-label="Vocales de esta lección">
          {vowelLetters.map((letter) => (
            <span key={letter}>{letter}</span>
          ))}
        </div>
      }
      footer={
        <p className="text-muted">
          El alfabeto manual permite representar letras y ayuda a deletrear determinados nombres y
          términos. Es una herramienta dentro de la LSV: no sustituye su vocabulario ni su
          gramática.
        </p>
      }
    />
  );
}

/**
 * @returns {import('react').ReactElement} Microclase recuperada dentro del recorrido unificado.
 */
export function VowelMicroclassStep() {
  return (
    <div className="vowel-microclass-step">
      <LazyVowelMicroclass />
    </div>
  );
}

/**
 * Presenta una vocal con referencia, rasgos, comparación y capítulo audiovisual reutilizado.
 * @param {{guide: object, onViewed: Function}} props Contenido verificado contra los recursos existentes.
 * @returns {import('react').ReactElement} Segmento educativo completo de una vocal.
 */
export function VowelStudy({ guide, onViewed }) {
  const position = vowelLetters.indexOf(guide.letter) + 1;
  useEffect(() => onViewed(guide.letter), [guide.letter, onViewed]);
  const other = vowelGuides.find((item) => item.letter === guide.compareWith);
  return (
    <article className="education-card vowel-study" aria-labelledby={`vowel-study-${guide.letter}`}>
      <header className="vowel-study-heading">
        <div>
          <p className="journey-eyebrow text-action">VOCAL {position} DE 5</p>
          <h2 id={`vowel-study-${guide.letter}`}>Conoce la vocal {guide.letter}</h2>
        </div>
        <div className="vowel-study-track" aria-label={`Vocal ${position} de 5`}>
          {vowelLetters.map((letter, index) => (
            <span
              key={letter}
              data-state={
                index < position - 1 ? 'done' : index === position - 1 ? 'now' : undefined
              }
            >
              {letter}
            </span>
          ))}
        </div>
      </header>
      <div className="vowel-study-material">
        <div className="vowel-study-reference">
          <ManualReference letter={guide.letter} educational />
        </div>
        <div className="vowel-study-copy">
          <p className="journey-reading">{guide.description}</p>
          <section>
            <h3>En qué fijarte</h3>
            <p>{guide.focus}</p>
          </section>
          <section className="vowel-compare-copy">
            <h3>Compárala con {guide.compareWith}</h3>
            <p>{guide.comparison}</p>
          </section>
        </div>
        {other && (
          <div
            className="vowel-mini-compare"
            aria-label={`Comparación entre ${guide.letter} y ${other.letter}`}
          >
            {[guide, other].map((item) => (
              <div key={item.letter}>
                <span>Vocal {item.letter}</span>
                <ManualReference letter={item.letter} compact educational />
              </div>
            ))}
          </div>
        )}
      </div>
      <VowelDemonstration letter={guide.letter} />
    </article>
  );
}
