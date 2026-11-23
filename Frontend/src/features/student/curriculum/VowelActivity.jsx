import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { BridgeAction, VowelSignBridge } from './VowelSignBridge.jsx';
import { VowelRound } from './VowelRound.jsx';
import { activityOrder } from './vowel-rounds.js';

function RoundTrack({ order, saved, round }) {
  return (
    <ol className="vowel-round-track" aria-label={`Ronda ${round + 1} de ${order.length}`}>
      {order.map((letter, index) => {
        const done = saved?.answers?.[letter]?.correct;
        return (
          <li
            key={letter}
            data-state={done ? 'done' : index === round ? 'now' : undefined}
            aria-current={index === round ? 'step' : undefined}
          >
            <span aria-hidden="true">{done ? letter : index + 1}</span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Actividad formativa de cinco rondas. La respuesta permanece oculta hasta elegir, cada error se
 * explica antes de reintentar y, tras reconocer una vocal, el estudiante puede practicarla con la
 * cámara sin salir de la actividad. El resultado sólo se conserva como práctica local.
 * @param {{activity: object, saved: object, onAnswer: Function, onReset: Function,
 * onPracticeAttempt?: Function}} props Estado formativo e intentos de cámara opcionales.
 * @returns {import('react').ReactElement} Reconocimiento, comparación o recuperación activa.
 */
export function VowelActivity({ activity, saved, onAnswer, onReset, onPracticeAttempt }) {
  const order = activityOrder(activity.id);
  const firstPending = order.findIndex((letter) => !saved?.answers?.[letter]?.correct);
  const [round, setRound] = useState(firstPending < 0 ? 0 : firstPending);
  const [practice, setPractice] = useState(false);
  const completed = order.every((letter) => saved?.answers?.[letter]?.correct);
  // El cierre se muestra al pulsar «Ver resultado», no en cuanto llega la última respuesta, para
  // que el estudiante pueda leer la explicación de la quinta ronda.
  const [closed, setClosed] = useState(completed);
  const letter = order[round];
  const pending = (item) => item !== letter && !saved?.answers?.[item]?.correct;
  const last = !order.some(pending);
  const next = () => {
    setPractice(false);
    if (last) return setClosed(true);
    const after = order.findIndex((item, index) => index > round && pending(item));
    setRound(after >= 0 ? after : order.findIndex(pending));
  };
  if (completed && closed)
    return (
      <section
        className="education-card vowel-activity-complete"
        aria-label={`${activity.title} completada`}
      >
        <p className="journey-eyebrow text-action">ACTIVIDAD COMPLETADA</p>
        <h2>{activity.title}</h2>
        <ul className="vowel-complete-letters" aria-label="Intentos por vocal">
          {order.map((item) => (
            <li key={item}>
              <b>{item}</b>
              <span>
                {saved.answers[item].attempts === 1
                  ? 'Al primer intento'
                  : `${saved.answers[item].attempts} intentos`}
              </span>
            </li>
          ))}
        </ul>
        <p>Respondiste las cinco vocales. Puedes repetir para reforzar la memoria.</p>
        <Button
          variant="secondary"
          icon={null}
          onClick={() => {
            onReset(activity.id);
            setRound(0);
            setClosed(false);
          }}
        >
          Repetir actividad
        </Button>
      </section>
    );
  return (
    <section className="education-card vowel-activity" aria-labelledby={`activity-${activity.id}`}>
      <header className="vowel-activity-heading">
        <div className="vowel-section-heading">
          <h2 id={`activity-${activity.id}`}>{activity.title}</h2>
          <p>{activity.description}</p>
        </div>
        <RoundTrack order={order} saved={saved} round={round} />
      </header>
      <div className="vowel-activity-body" hidden={practice}>
        <VowelRound
          key={`${activity.id}-${letter}`}
          activityId={activity.id}
          letter={letter}
          round={round}
          onAnswer={(item, correct) => onAnswer(activity.id, item, correct)}
          onNext={next}
          nextLabel={last ? 'Ver resultado' : 'Siguiente vocal'}
          onPractice={onPracticeAttempt ? () => setPractice(true) : undefined}
        />
      </div>
      {practice && (
        <VowelSignBridge
          letter={letter}
          eyebrow="DE RECONOCER A SEÑAR"
          title={`Ahora realiza la ${letter}`}
          description="Ya la reconociste. Activa la cámara si quieres formar la vocal con tu mano; el intento es voluntario."
          onAttempt={(result) => onPracticeAttempt(letter, result)}
          actions={
            <>
              <BridgeAction onClick={() => setPractice(false)}>Volver a la actividad</BridgeAction>
              <BridgeAction primary onClick={next}>
                {last ? 'Ver resultado' : 'Siguiente vocal'}
              </BridgeAction>
            </>
          }
        />
      )}
    </section>
  );
}
