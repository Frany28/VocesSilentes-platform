import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';
import { vowelLetters } from './vowel-lesson.js';

/**
 * Recorre las cinco vocales en práctica guiada o de memoria. Visitar una vocal no se confunde con
 * intentar, y una candidata coincidente se conserva separada de los resultados inciertos.
 * @param {{mode: 'guided'|'memory', saved: object, onVisit: Function, onAttempt: Function}} props Progreso local.
 * @returns {import('react').ReactElement} Ejercicio de cámara voluntario con cinco objetivos.
 */
export function VowelCameraJourney({ mode, saved, onVisit, onAttempt }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(mode === 'guided');
  const letter = vowelLetters[index];
  useEffect(() => onVisit(mode, letter), [letter, mode, onVisit]);
  const move = (next) => {
    setIndex(next);
    setRevealed(mode === 'guided');
  };
  const visited = saved?.visited ?? [];
  const attempts = saved?.attempts ?? {};
  return (
    <section className="education-card vowel-camera-journey" aria-labelledby={`camera-${mode}`}>
      <header className="vowel-section-heading">
        <p className="journey-eyebrow text-action">
          {mode === 'guided'
            ? 'EJERCICIO 1 · PRÁCTICA GUIADA'
            : 'EJERCICIO 2 · PRÁCTICA DE MEMORIA'}
        </p>
        <h2 id={`camera-${mode}`}>
          {mode === 'guided' ? 'Practica con la referencia' : 'Recuerda antes de mirar'}
        </h2>
        <p>
          {mode === 'guided'
            ? 'Observa la ficha, activa voluntariamente la cámara y repite cada vocal cuantas veces necesites.'
            : 'Forma la vocal solicitada de memoria. Si dudas, consulta la referencia y vuelve a intentarlo.'}
        </p>
      </header>
      <div className="vowel-camera-track" role="group" aria-label="Vocales de este ejercicio">
        {vowelLetters.map((item, position) => {
          const evidence = attempts[item];
          return (
            <button
              key={item}
              type="button"
              aria-pressed={letter === item}
              data-visited={visited.includes(item) || undefined}
              onClick={() => move(position)}
            >
              <b>{item}</b>
              <span>
                {evidence
                  ? `${evidence.total} ${evidence.total === 1 ? 'intento' : 'intentos'}`
                  : visited.includes(item)
                    ? 'Pendiente de intento'
                    : 'Por visitar'}
              </span>
            </button>
          );
        })}
      </div>
      <CameraPracticeLoader
        key={`${mode}-${letter}`}
        letter={letter}
        memory={mode === 'memory'}
        referenceVisible={revealed}
        onRevealReference={() => setRevealed(true)}
        onAttempt={(result) => onAttempt(mode, letter, result)}
      />
      <div className="vowel-camera-navigation">
        <Button
          variant="secondary"
          icon={null}
          disabled={index === 0}
          onClick={() => move(index - 1)}
        >
          Vocal anterior
        </Button>
        <p role="status">
          Vocal {index + 1} de {vowelLetters.length} · {letter}
        </p>
        <Button
          variant="secondary"
          icon={null}
          disabled={index === vowelLetters.length - 1}
          onClick={() => move(index + 1)}
        >
          Siguiente vocal
        </Button>
      </div>
      <details className="vowel-camera-evidence">
        <summary>Resultados de esta práctica</summary>
        <ul>
          {vowelLetters.map((item) => {
            const evidence = attempts[item];
            return (
              <li key={item}>
                <b>{item}</b>{' '}
                {!evidence
                  ? 'Sin intentos registrados.'
                  : `${evidence.total} intentos · ${evidence.matches} predicciones coincidentes · ${evidence.uncertain} inciertas o diferentes.`}
              </li>
            );
          })}
        </ul>
        <p className="text-muted">
          Una predicción coincidente es una salida experimental del modelo; no certifica que la seña
          sea correcta ni dominio de LSV.
        </p>
      </details>
    </section>
  );
}
