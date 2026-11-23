import { useState } from 'react';
import { BridgeAction, VowelSignBridge } from './VowelSignBridge.jsx';
import { VowelRound } from './VowelRound.jsx';
import { mixedReview } from './vowel-rounds.js';

const kindLabel = { visual: 'Mira', camera: 'Seña' };

/**
 * Repaso combinado: alterna reconocer una referencia y formar una vocal con la cámara, una vez por
 * vocal. Las rondas visuales exigen una respuesta correcta; las de cámara son voluntarias y su
 * resultado experimental nunca bloquea ni califica el avance.
 * @param {{progress: object, onAnswer: Function, onComplete: Function, onAttempt: Function}} props
 * Progreso formativo y acciones de registro.
 * @returns {import('react').ReactElement} Recorrido de cinco retos alternados.
 */
export function VowelMixedReview({ progress, onAnswer, onComplete, onAttempt }) {
  const done = (item) => progress.mixed.includes(item.id);
  const firstPending = mixedReview.findIndex((item) => !done(item));
  const [index, setIndex] = useState(firstPending < 0 ? 0 : firstPending);
  const item = mixedReview[index];
  const last = index === mixedReview.length - 1;
  const advance = () => {
    onComplete(item.id);
    if (!last) setIndex(index + 1);
  };
  const allDone = mixedReview.every(done);
  return (
    <section className="education-card vowel-mixed" aria-labelledby="vowel-mixed-title">
      <header className="vowel-activity-heading">
        <div className="vowel-section-heading">
          <p className="journey-eyebrow text-action">REPASO COMBINADO</p>
          <h2 id="vowel-mixed-title">Mira, reconoce y seña</h2>
          <p>Cinco retos que alternan reconocer referencias y practicar con tu mano.</p>
        </div>
        <ol className="vowel-mixed-track" aria-label={`Reto ${index + 1} de ${mixedReview.length}`}>
          {mixedReview.map((entry, position) => (
            <li
              key={entry.id}
              data-kind={entry.kind}
              data-state={done(entry) ? 'done' : position === index ? 'now' : undefined}
              aria-current={position === index ? 'step' : undefined}
            >
              <button type="button" onClick={() => setIndex(position)}>
                <span>{kindLabel[entry.kind]}</span>
                <b>{entry.kind === 'camera' || done(entry) ? entry.letter : position + 1}</b>
              </button>
            </li>
          ))}
        </ol>
      </header>
      {allDone && last && done(item) && (
        <p className="vowel-mixed-done" role="status">
          Completaste los cinco retos. Continúa para ver tu repaso de la lección.
        </p>
      )}
      {item.kind === 'visual' ? (
        <VowelRound
          key={item.id}
          activityId={item.activity}
          letter={item.letter}
          round={index}
          onAnswer={(letter, correct) => onAnswer('mixed-review', letter, correct)}
          onNext={advance}
          nextLabel={last ? 'Terminar repaso' : 'Siguiente reto'}
        />
      ) : (
        <VowelSignBridge
          key={item.id}
          letter={item.letter}
          memory
          eyebrow={`RETO ${index + 1} · DESAFÍO DE MEMORIA`}
          title={`Forma la ${item.letter} de memoria`}
          description="Intenta recordarla antes de consultar la referencia. Puedes continuar sin usar la cámara."
          onAttempt={(result) => onAttempt('memory', item.letter, result)}
          actions={
            <BridgeAction primary onClick={advance}>
              {last ? 'Terminar repaso' : 'Siguiente reto'}
            </BridgeAction>
          }
        />
      )}
    </section>
  );
}
