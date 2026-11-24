import { useState } from 'react';
import { LessonActivity } from './LessonExperience.jsx';
import { introductionScenarios } from './introduction-lesson.js';

/**
 * @param {object} props Situaciones, evidencia local y acción de exploración.
 * @returns {import('react').ReactElement} Actividad cotidiana con explicaciones inmediatas.
 */
export function IntroductionApplications(props) {
  const { step, explored, onExplore } = props;
  const [open, setOpen] = useState(explored[explored.length - 1]);
  const reveal = (id) => {
    setOpen(id);
    onExplore(id);
  };
  return (
    <LessonActivity
      id="introduction-applications"
      eyebrow="ETAPA 4 · LLÉVALO A LO COTIDIANO"
      title="¿Cuándo puede ayudarnos el alfabeto manual?"
      description="Explora cada situación. Aquí no hay una nota: la meta es distinguir el recurso de la lengua completa."
    >
      <div className="introduction-scenarios">
        {introductionScenarios.map((scenario) => {
          const revealed = open === scenario.id;
          const visited = explored.includes(scenario.id);
          return (
            <article key={scenario.id} data-visited={visited || undefined}>
              <span className="introduction-scenario-cue">{scenario.cue}</span>
              <h3>{scenario.title}</h3>
              <p>{scenario.prompt}</p>
              <button
                type="button"
                aria-expanded={revealed}
                aria-controls={`scenario-${scenario.id}`}
                onClick={() => reveal(scenario.id)}
              >
                {visited ? 'Revisar explicación' : 'Descubrir explicación'}
              </button>
              {revealed && (
                <p
                  id={`scenario-${scenario.id}`}
                  className="introduction-scenario-answer"
                  role="status"
                >
                  {scenario.answer}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <div className="introduction-practice-note">
        <h3>Práctica sugerida</h3>
        <p>{step.practiceInstructions}</p>
        <p className="text-muted">{step.section?.body}</p>
      </div>
    </LessonActivity>
  );
}
