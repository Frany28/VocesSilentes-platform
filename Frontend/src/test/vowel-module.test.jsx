import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { expect, test } from 'vitest';
import { StudentVowelModule } from '../features/student/pages/StudentVowelModule.jsx';
import {
  isVowelLesson,
  vowelExperienceSteps,
  vowelLetters,
} from '../features/student/curriculum/vowel-lesson.js';
import {
  alphabetLessonIds,
  alphabetModuleId,
} from '../features/student/resources/lesson-videos.js';

function Destination() {
  const location = useLocation();
  return <output>{location.pathname}</output>;
}

test('el enlace histórico redirige a la lección real unificada', async () => {
  const destination = `/student/modules/${alphabetModuleId}/lessons/${alphabetLessonIds['m1-l02']}`;
  render(
    <MemoryRouter initialEntries={['/student/modules/vowels']}>
      <Routes>
        <Route path="/student/modules/vowels" element={<StudentVowelModule />} />
        <Route path="/student/modules/:moduleId/lessons/:lessonId" element={<Destination />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(await screen.findByText(destination)).toBeVisible();
});

test('la lección real contiene cinco explicaciones, tres actividades y dos prácticas de cámara', () => {
  const lesson = {
    id: alphabetLessonIds['m1-l02'],
    title: 'Las cinco vocales',
    exercises: [],
    content: {
      letterCards: vowelLetters.map((letter) => ({ letter })),
    },
  };
  expect(isVowelLesson(lesson)).toBe(true);
  const steps = vowelExperienceSteps(lesson);
  expect(steps.filter((step) => step.type === 'vowel-study').map((step) => step.letter)).toEqual(
    vowelLetters,
  );
  expect(steps.filter((step) => step.type === 'vowel-activity')).toHaveLength(3);
  expect(steps.filter((step) => step.type === 'vowel-camera').map((step) => step.mode)).toEqual([
    'guided',
    'memory',
  ]);
});
