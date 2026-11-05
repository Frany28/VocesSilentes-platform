import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StudentPageHeader } from '../../components/StudentPageHeader.jsx';
import { LessonTrail } from '../LessonTrail.jsx';
import { LessonReading } from '../LessonReading.jsx';
import { LessonQuestion } from '../LessonQuestion.jsx';
import { LessonFeedback } from '../LessonFeedback.jsx';
import { LessonResult } from '../LessonResult.jsx';
import { EducationDemoControls } from './EducationDemoControls.jsx';
import { useEducationDemo } from './use-education-demo.js';
import {
  demoFeedback,
  demoLesson,
  demoQuestions,
  demoResult,
  demoViews,
} from './education-demo-data.js';
import '../lesson.css';

/**
 * Compone las seis vistas de Figma en una demo de desarrollo bajo sesión/rol Student existentes.
 * @returns {import('react').ReactElement} Flujo visual aislado, sin servicios de ejercicios o resultados.
 */
export function EducationDemo() {
  const operation = useEducationDemo();
  const navigate = useNavigate();
  const view = demoViews[operation.view];
  const firstFeedback = demoFeedback[operation.view] && operation.exercise === 'choice';
  useEffect(() => {
    document.getElementById('student-content')?.focus();
  }, [operation.view]);
  return (
    <div className="education-page flex w-full flex-col gap-6" data-demo-view={operation.view}>
      <StudentPageHeader
        title={view.title}
        description={firstFeedback ? demoViews.choice.description : view.description}
        demo
      />
      <div className="flex flex-col gap-4">
        <LessonTrail step={view.step} />
        {operation.view === 'content' && (
          <LessonReading lesson={demoLesson} onContinue={() => operation.show('choice')} />
        )}
        {demoQuestions[operation.view] && (
          <LessonQuestion
            question={demoQuestions[operation.view]}
            selection={operation.selection}
            onSelect={operation.select}
            onCheck={operation.check}
          />
        )}
        {demoFeedback[operation.view] && (
          <LessonFeedback
            feedback={demoFeedback[operation.view]}
            continueLabel={
              firstFeedback && operation.view === 'correct'
                ? 'Continuar al ejercicio visual'
                : undefined
            }
            onContinue={operation.view === 'correct' ? operation.continue : operation.retry}
          />
        )}
        {operation.view === 'result' && (
          <LessonResult result={demoResult} onContinue={() => navigate('/student/modules')} />
        )}
      </div>
      <EducationDemoControls operation={operation} />
    </div>
  );
}
