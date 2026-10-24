import { useState } from 'react';
import { useLocation } from 'react-router';
import { publicConfig } from '../../../lib/config.js';
import { useStudent } from '../data/use-student.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { PracticeBrief } from '../practice/PracticeBrief.jsx';
import { PracticeCamera } from '../practice/PracticeCamera.jsx';
import { PracticeGuide } from '../practice/PracticeGuide.jsx';
import { PracticeInstructions } from '../practice/PracticeInstructions.jsx';
import { practiceStates } from '../practice/practice-demo.js';

/**
 * Implementa el prototipo Practicar desde los frames inspeccionados, sin cámara ni clasificador simulado.
 * @returns {import('react').ReactElement} Escenarios visuales manuales o aviso de integración pendiente.
 */
export function StudentPractice() {
  const [state, setState] = useState('off');
  const [instructions, setInstructions] = useState(false);
  const { snapshot } = useStudent();
  const title = useLocation().state?.moduleTitle;
  const module = snapshot?.modules.find((item) => item.title === title);
  const exercise = module?.nextLesson?.title || 'Saludos básicos';
  return (
    <div className="flex flex-col gap-6">
      <StudentPageHeader
        title="Practicar"
        description="Conecta lo que aprendes con lo que tus manos expresan."
      />
      {!publicConfig.studentDemo ? (
        <DataFeedback kind="unavailable" />
      ) : (
        <>
          <PracticeBrief />
          <aside className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-surface p-4">
            <p className="text-info">
              Demostración de práctica: selecciona un estado visual; no se activa la cámara ni se
              evalúan señas.
            </p>
            <label className="flex flex-wrap items-center gap-3">
              Estado de práctica (demostración)
              <select
                value={state}
                onChange={(event) => setState(event.target.value)}
                className="student-demo-select"
              >
                {Object.entries(practiceStates).map(([value, view]) => (
                  <option key={value} value={value}>
                    {view.label}
                  </option>
                ))}
              </select>
            </label>
          </aside>
          <div className="practice-grid grid items-start gap-6">
            <PracticeCamera
              state={state}
              exercise={exercise}
              onState={setState}
              onInstructions={() => setInstructions(true)}
            />
            <PracticeGuide />
          </div>
          <section className="flex flex-col gap-2 rounded-3xl bg-secondary p-6">
            <h2 className="[font:var(--type-subtitle)]">Tu ritmo también cuenta.</h2>
            <p className="text-muted">
              Cada intento es una oportunidad para mejorar. Revisa la referencia de tu lección y
              vuelve a probar cuando estés listo.
            </p>
          </section>
          {instructions && <PracticeInstructions onClose={() => setInstructions(false)} />}
        </>
      )}
    </div>
  );
}
