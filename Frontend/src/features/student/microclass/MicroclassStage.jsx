import { MicroclassPoster, MicroclassOutro } from './MicroclassBookends.jsx';
import { MicroclassIntroScene } from './MicroclassIntroScenes.jsx';
import { MicroclassVowelScene } from './MicroclassVowelScene.jsx';
import { MicroclassQuiz, MicroclassReview } from './MicroclassReviewQuiz.jsx';

function Scene({ player }) {
  const { state, scene, cue, actions, timeline } = player;
  if (!state.started) return <MicroclassPoster total={timeline.total} onStart={actions.play} />;
  switch (scene.type) {
    case 'vowel':
      return (
        <MicroclassVowelScene
          letter={scene.letter}
          cue={cue.cueIndex}
          elapsed={state.elapsed}
          seconds={cue.seconds}
        />
      );
    case 'review':
      return <MicroclassReview elapsed={state.elapsed} />;
    case 'quiz':
      return (
        <MicroclassQuiz
          quiz={state.quiz}
          solved={cue.cueIndex === 1}
          onAnswer={actions.answer}
          onReveal={actions.reveal}
        />
      );
    case 'outro':
      return <MicroclassOutro cue={cue.cueIndex} onReplay={() => actions.go(0)} />;
    default:
      return <MicroclassIntroScene type={scene.type} cue={cue.cueIndex} />;
  }
}

/**
 * Área visual de la microclase. Cada escena se vuelve a montar para animar su entrada.
 * @param {{player: ReturnType<typeof import('./use-microclass-player.js').useMicroclassPlayer>}} props Reproductor.
 * @returns {import('react').ReactElement} Escena actual o portada.
 */
export function MicroclassStage({ player }) {
  return (
    <div className="mc-stage" key={player.state.started ? player.scene.id : 'poster'}>
      <Scene player={player} />
    </div>
  );
}
