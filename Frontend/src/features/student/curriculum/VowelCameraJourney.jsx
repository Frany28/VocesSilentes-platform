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
      <header className="vowel-camera-heading">
        <div className="vowel-section-heading">
          <h2 id={`camera-${mode}`}>
            {mode === 'guided' ? 'Ahora realiza la seña' : 'Desafío de memoria'}
          </h2>
          <p>
            {mode === 'guided'
              ? 'Observa la ficha y forma cada vocal frente a la cámara, las veces que quieras.'
              : 'Forma la vocal sin mirar la ficha; consúltala solo si la necesitas.'}
          </p>
        </div>
        <nav className="vowel-camera-navigation" aria-label="Cambiar de vocal">
          <Button
            variant="secondary"
            icon={null}
            disabled={index === 0}
            onClick={() => move(index - 1)}
          >
            Vocal anterior
          </Button>
          <div className="vowel-camera-track" role="group" aria-label="Vocales de este ejercicio">
            {vowelLetters.map((item, position) => {
              const evidence = attempts[item];
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={letter === item}
                  data-visited={visited.includes(item) || undefined}
                  data-attempted={evidence ? true : undefined}
                  onClick={() => move(position)}
                >
                  <b>{item}</b>
                  <span>
                    {evidence
                      ? `${evidence.total} ${evidence.total === 1 ? 'intento' : 'intentos'}`
                      : visited.includes(item)
                        ? 'Visitada'
                        : 'Nueva'}
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            variant="secondary"
            icon={null}
            disabled={index === vowelLetters.length - 1}
            onClick={() => move(index + 1)}
          >
            Siguiente vocal
          </Button>
          <p className="sr-only" role="status">
            Vocal {index + 1} de {vowelLetters.length} · {letter}
          </p>
        </nav>
      </header>
      <CameraPracticeLoader
        key={`${mode}-${letter}`}
        letter={letter}
        memory={mode === 'memory'}
        variant="workspace"
        referenceVisible={revealed}
        onRevealReference={() => setRevealed(true)}
        onAttempt={(result) => onAttempt(mode, letter, result)}
      />
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
